// شبیه‌ساز GitHub برای آزمایش — با همان قانون‌های CORS که GitHub مستند کرده است
const http=require('http'), crypto=require('crypto');
function make(){
  const S={tags:{},tags2:{},dataToken:'github_pat_DATA',blobs:{},trees:{},commits:{},goodToken:'github_pat_GOOD',readOnlyToken:'github_pat_RO',rateLimit:false,down:false,log:[],preflights:[]};
  const sha=()=>crypto.randomBytes(20).toString('hex');
  const CORS={'Access-Control-Allow-Origin':'*',
    'Access-Control-Expose-Headers':'ETag, Link, x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval'};
  const ALLOWED=['authorization','content-type','if-match','if-modified-since','if-none-match','if-unmodified-since','x-requested-with'];
  const srv=http.createServer((req,res)=>{
    const u=new URL(req.url,'http://x');
    let body=''; req.on('data',d=>body+=d); req.on('end',()=>{
      const send=(code,obj,extra)=>{ const h=Object.assign({},CORS,{'Content-Type':'application/json; charset=utf-8'},extra||{});
        res.writeHead(code,h); res.end(obj===undefined?'':(typeof obj==='string'?obj:JSON.stringify(obj))); };
      if(S.down){ req.socket.destroy(); return; }
      if(req.method==='OPTIONS'){
        const want=(req.headers['access-control-request-headers']||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
        S.preflights.push({path:u.pathname,method:req.headers['access-control-request-method'],headers:want});
        const badH=want.filter(x=>!ALLOWED.includes(x));
        if(badH.length){ S.log.push('PREFLIGHT-REJECT '+badH.join(',')); res.writeHead(403); res.end(); return; }   // بدون سرآیند CORS → مرورگر جلو را می‌گیرد
        res.writeHead(204,Object.assign({},CORS,{'Access-Control-Allow-Headers':'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With',
          'Access-Control-Allow-Methods':'GET, POST, PATCH, PUT, DELETE','Access-Control-Max-Age':'0'})); res.end(); return;
      }
      const auth=(req.headers['authorization']||'').replace(/^Bearer\s+/,'');
      S.log.push(req.method+' '+u.pathname+(auth?' [auth]':''));
      if(auth && auth!==S.goodToken && auth!==S.readOnlyToken && auth!==S.dataToken) return send(401,{message:'Bad credentials'});
      const mm=/^\/repos\/javad23195-lang\/(nt|nt-data)(\/.*)?$/.exec(u.pathname);
      if(!mm) return send(404,{message:'Not Found'});
      const repo=mm[1], p=mm[2]||'', T=repo==='nt'?S.tags:S.tags2;      // مخزن دوم (nt-data) خصوصی است
      if(repo==='nt-data' && !auth) return send(404,{message:'Not Found'});
      if(auth===S.dataToken && repo!=='nt-data') return send(404,{message:'Not Found'});
      const write=req.method!=='GET';
      if(write && auth!==S.goodToken && !(auth===S.dataToken && repo==='nt-data')) return send(auth?403:404,{message:auth?'Resource not accessible by personal access token':'Not Found'});
      if(!auth && S.rateLimit) return send(403,{message:'API rate limit exceeded for 1.2.3.4.'},{'x-ratelimit-remaining':'0'});
      let j={}; try{ j=body?JSON.parse(body):{}; }catch(e){}
      if(p==='' && req.method==='GET') return send(200,{full_name:'javad23195-lang/'+repo,private:repo==='nt-data',permissions:{push:true}});
      let tm=/^\/git\/refs\/tags\/(.+)$/.exec(p);
      if(tm && req.method==='DELETE'){ const n=decodeURIComponent(tm[1]); if(!T[n]) return send(422,{message:'Reference does not exist'}); delete T[n]; return send(204); }
      tm=/^\/git\/ref\/tags\/(.+)$/.exec(p);
      if(tm && req.method==='GET'){ const n=decodeURIComponent(tm[1]);
        return T[n] ? send(200,{ref:'refs/tags/'+n,object:{sha:T[n],type:'commit'}}) : send(404,{message:'Not Found'});
      }
      tm=/^\/git\/matching-refs\/tags\/(.*)$/.exec(p);
      if(tm && req.method==='GET'){ const pre=decodeURIComponent(tm[1]); return send(200,Object.keys(T).filter(n=>n.startsWith(pre)).map(n=>({ref:'refs/tags/'+n,object:{sha:T[n],type:'commit'}}))); }
      if(p==='/git/blobs' && req.method==='POST'){ const s=sha(); S.blobs[s]=j.encoding==='base64'?Buffer.from(j.content,'base64').toString('utf8'):j.content; return send(201,{sha:s}); }
      if(p==='/git/trees' && req.method==='POST'){ const s=sha(); S.trees[s]=j.tree; return send(201,{sha:s}); }
      if(p==='/git/commits' && req.method==='POST'){ if(!S.trees[j.tree]) return send(422,{message:'Tree SHA does not exist'});
        if((j.parents||[]).some(x=>!S.commits[x])) return send(422,{message:'Parent SHA does not exist'}); const s=sha(); S.commits[s]={tree:j.tree,parents:j.parents||[]}; return send(201,{sha:s}); }
      if(p==='/git/refs/tags/nt-data' && req.method==='PATCH'){
        if(!T['nt-data']) return send(422,{message:'Reference does not exist'});
        if(!S.commits[j.sha]) return send(422,{message:'Object does not exist'});
        if(!j.force && !(S.commits[j.sha].parents||[]).includes(T['nt-data'])) return send(422,{message:'Update is not a fast forward'});
        if(j.force) S.forced=(S.forced||0)+1;
        S.prev=T['nt-data']; T['nt-data']=j.sha; return send(200,{ref:'refs/tags/nt-data',object:{sha:j.sha}});
      }
      if(p==='/git/refs' && req.method==='POST'){
        const rn=/^refs\/tags\/(.+)$/.exec(j.ref||''); if(!rn) return send(422,{message:'bad ref'});
        if(T[rn[1]]) return send(422,{message:'Reference already exists'});
        if(rn[1]!=='nt-data' && !S.commits[j.sha]) return send(422,{message:'Object does not exist'});
        T[rn[1]]=j.sha; return send(201,{ref:j.ref,object:{sha:j.sha}});
      }
      if(p==='/contents/nt-data.json' && req.method==='GET'){
        const rq=u.searchParams.get('ref'); let c=T[rq] || (S.commits[rq]?rq:null); if(!c) return send(404,{message:'No commit found for the ref'});
        if(T[rq] && S.staleTag && S.prev) c=S.prev;      // GitHub گاهی با نام برچسب، نسخه قبلی را می‌دهد
        const t=S.trees[S.commits[c].tree].find(x=>x.path==='nt-data.json'); if(!t) return send(404,{message:'Not Found'});
        const etag='W/"'+t.sha+'"';
        if(req.headers['if-none-match']===etag){ res.writeHead(304,Object.assign({},CORS,{ETag:etag})); res.end(); return; }
        if(!/vnd\.github\.raw/.test(req.headers['accept']||'')) return send(200,{content:Buffer.from(S.blobs[t.sha]).toString('base64'),encoding:'base64'});
        return send(200,S.blobs[t.sha],{ETag:etag,'Content-Type':'application/vnd.github.raw+json; charset=utf-8'});
      }
      // مسیر raw (پشتیبان هنگام محدودیت)
      send(404,{message:'Not Found'});
    });
  });
  S.file=()=>{ const c=S.tags['nt-data']; if(!c) return null; const t=S.trees[S.commits[c].tree][0]; return S.blobs[t.sha]; };
  S.file2=()=>{ const c=S.tags2['nt-data']; if(!c) return null; const t=S.trees[S.commits[c].tree][0]; return S.blobs[t.sha]; };
  return {S,srv};
}
module.exports={make};
