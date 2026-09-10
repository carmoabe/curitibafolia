const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'site');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)){res.writeHead(403).end();return;}
  fs.stat(f,(e,st)=>{
    if(e||!st.isFile()){res.writeHead(404,{'Content-Type':'text/plain'}).end('404');return;}
    const type=MIME[path.extname(f)]||'application/octet-stream';
    const range=req.headers.range;
    if(range){
      const m=/bytes=(\d*)-(\d*)/.exec(range)||[];
      const start=m[1]?parseInt(m[1]):0;
      const end=m[2]?parseInt(m[2]):st.size-1;
      res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1,'Cache-Control':'no-cache'});
      fs.createReadStream(f,{start,end}).pipe(res);
    }else{
      res.writeHead(200,{'Content-Type':type,'Content-Length':st.size,'Accept-Ranges':'bytes','Cache-Control':'no-cache'});
      fs.createReadStream(f).pipe(res);
    }
  });
}).listen(5173,()=>console.log('LP em http://localhost:5173'));
