import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
const testRoute=server=>{server.middlewares.use((req,res,next)=>{
 if(req.url?.split('?')[0]==='/test')req.url='/test/index.html'+(req.url.includes('?')?'?'+req.url.split('?').slice(1).join('?'):'');
 next();
});};
export default defineConfig({
 plugins:[{name:'developer-test-route',configureServer:testRoute,configurePreviewServer:testRoute}],
 build:{rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),test:fileURLToPath(new URL('./test/index.html',import.meta.url))}}}
});
