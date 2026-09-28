/** Fotograma diario + archivo. La clave de Unsplash queda solo en el Worker. */
const PUZZLES = [
  {answer:'NIEBLA',photoId:'MaeshPdBGV4',hint:'Pista: aparece cuando el aire se enfría y la vista se acorta.'},
  {answer:'FARO',photoId:'oEz-2ZZV3Wc',hint:'Pista: guía a los barcos desde la costa.'},
  {answer:'PARAGUAS',photoId:'LnB0YEh6gZc',hint:'Pista: se abre cuando llueve.'},
  {answer:'CASCADA',photoId:'J6Fdqeb0Vcs',hint:'Pista: el agua cae desde lo alto.'},
  {answer:'PUENTE',photoId:'fFWionzZ8Qk',hint:'Pista: sirve para cruzar de un lado al otro.'},
  {answer:'DESIERTO',photoId:'UJA3E-3pmwI',hint:'Pista: paisaje seco de arena y dunas.'},
  {answer:'LUNA',photoId:'N52HfHHjDGw',hint:'Pista: ilumina muchas noches.'},
  {answer:'BOSQUE',photoId:'wx-MLYHH7J0',hint:'Pista: muchos árboles crecen juntos.'},
  {answer:'VELERO',photoId:'qoYwwt88yGE',hint:'Pista: navega impulsado por el viento.'},
  {answer:'GIRASOL',photoId:'pLduUDZQ6-Q',hint:'Pista: flor amarilla que sigue la luz.'},
  {answer:'MONTAÑA',photoId:'Q__9jIJBDN0',hint:'Pista: elevación natural de gran altura.'},
  {answer:'PLAYA',photoId:'9wVHyp90lgI',hint:'Pista: arena a orillas del agua.'},
  {answer:'TREN',photoId:'VRWkxTuWEkw',hint:'Pista: transporte que viaja sobre rieles.'},
  {answer:'CAFE',photoId:'BYYvJl3tIqY',hint:'Pista: bebida que muchos toman al despertar.'},
    {answer:'VENTANA',photoId:'QtQcOs2IFnc',hint:'Pista: deja pasar la luz y separa el adentro del afuera.'},
  {answer:'ESCALERA',photoId:'WHPsxhB4mWQ',hint:'Pista: conecta un piso con otro, escalón por escalón.'},
  {answer:'ESPEJO',photoId:'UhQMdwmKeV4',hint:'Pista: te devuelve tu propia imagen.'},
  {answer:'RELOJ',photoId:'FlHdnPO6dlw',hint:'Pista: marca las horas del día.'},
  {answer:'GLOBO',photoId:'PbpxXgqoCxE',hint:'Pista: vuela despacio, inflado con aire caliente.'},
  {answer:'PUERTA',photoId:'f7pTMJ1ekqI',hint:'Pista: se abre y se cierra para entrar o salir.'},
  {answer:'CAMINO',photoId:'sHq15rZgo1g',hint:'Pista: sendero que lleva de un lugar a otro.'},
  {answer:'ANCLA',photoId:'21ztbENjzeI',hint:'Pista: mantiene firme al barco contra el fondo del mar.'},
  {answer:'MUELLE',photoId:'ZueEQBEPQ6M',hint:'Pista: plataforma que se adentra en el agua.'},
  {answer:'TUNEL',photoId:'RXWgx93tz8w',hint:'Pista: pasaje oscuro que atraviesa de un lado al otro.'},
  {answer:'AVION',photoId:'FwdZYz0yc9g',hint:'Pista: cruza el cielo con alas y motores.'},
  {answer:'SOMBRA',photoId:'QKHmi6ENAmk',hint:'Pista: silueta oscura que aparece cuando algo tapa la luz.'},
  {answer:'HUELLAS',photoId:'9QjbejABFn8',hint:'Pista: marcas que dejan los pies al caminar.'},
  {answer:'FAROL',photoId:'GeIjvWCbrlk',hint:'Pista: alumbra la calle cuando cae la noche.'}

];
const START_DAY=Math.floor(Date.UTC(2026,8,27)/86400000);
const DAY_MS=86400000;
const PHOTO_CACHE_MS=86400000;
const cache=new Map();
function montevideoDay(now){return Math.floor((now-3*3600000)/DAY_MS);}
function dayLabel(day){return new Date(day*DAY_MS).toISOString().slice(0,10);}
function puzzleFor(now){const day=Math.max(START_DAY,montevideoDay(now));const n=day-START_DAY;return {day,n,puzzle:PUZZLES[n%PUZZLES.length]};}
function response(value,seconds){return Response.json(value,{headers:{'Cache-Control':`public, max-age=${seconds}`}});}
async function photoMeta(env,photoId){
  const hit=cache.get(photoId);
  if(hit&&hit.expires>Date.now())return hit.value;
  try{
    const upstream=await fetch(`https://api.unsplash.com/photos/${encodeURIComponent(photoId)}`,{headers:{Authorization:`Client-ID ${env.UNSPLASH_ACCESS_KEY}`,'Accept-Version':'v1'}});
    if(!upstream.ok)return null;
    const photo=await upstream.json();
    const image=photo.urls?.regular,thumb=photo.urls?.small,photoUrl=photo.links?.html,userUrl=photo.user?.links?.html;
    if(!image?.startsWith('https://images.unsplash.com/')||!thumb?.startsWith('https://images.unsplash.com/')||!photoUrl?.startsWith('https://unsplash.com/')||!userUrl?.startsWith('https://unsplash.com/'))return null;
    const tracking='utm_source=fotograma&utm_medium=referral';
    const value={image,thumb,alt:photo.alt_description||'Fotografía del acertijo',photographer:{name:photo.user.name,url:userUrl+(userUrl.includes('?')?'&':'?')+tracking},unsplashUrl:photoUrl+(photoUrl.includes('?')?'&':'?')+tracking};
    cache.set(photoId,{value,expires:Date.now()+PHOTO_CACHE_MS});
    return value;
  }catch{return null;}
}
function puzzleData(n){const day=START_DAY+n-1;return {day,puzzle:PUZZLES[(n-1)%PUZZLES.length]};}
async function handleToday(env){
  const {day,n,puzzle}=puzzleFor(Date.now());
  const seconds=Math.min(3600,Math.max(1,Math.ceil(((day+1)*DAY_MS+3*3600000-Date.now())/1000)));
  const meta=await photoMeta(env,puzzle.photoId);
  if(!meta)return Response.json({error:'Foto no disponible.'},{status:502});
  return response({answer:puzzle.answer,hint:puzzle.hint,image:meta.image,alt:meta.alt,photographer:meta.photographer,unsplashUrl:meta.unsplashUrl,id:String(n+1).padStart(3,'0'),date:dayLabel(day)},seconds);
}
async function handlePuzzle(env,url){
  const n=Number.parseInt(url.searchParams.get('n')||'',10);
  const current=puzzleFor(Date.now()).n+1;
  if(!Number.isInteger(n)||n<1||n>current)return Response.json({error:'Acertijo no disponible.'},{status:404});
  const {day,puzzle}=puzzleData(n);
  const meta=await photoMeta(env,puzzle.photoId);
  if(!meta)return Response.json({error:'Foto no disponible.'},{status:502});
  return response({answer:puzzle.answer,hint:puzzle.hint,image:meta.image,alt:meta.alt,photographer:meta.photographer,unsplashUrl:meta.unsplashUrl,id:String(n).padStart(3,'0'),date:dayLabel(day),today:n===current},3600);
}
async function handleArchive(env){
  const current=puzzleFor(Date.now()).n+1;
  const items=[];
  const metas=await Promise.all(Array.from({length:current},(_,i)=>photoMeta(env,PUZZLES[i%PUZZLES.length].photoId)));
  for(let n=current;n>=1;n--){
    const meta=metas[n-1];
    if(!meta)continue;
    const {day,puzzle}=puzzleData(n);
    items.push({id:String(n).padStart(3,'0'),date:dayLabel(day),answer:puzzle.answer,image:meta.thumb,alt:meta.alt,photographer:meta.photographer,unsplashUrl:meta.unsplashUrl,today:n===current});
  }
  return response({items},600);
}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/fotograma')return Response.redirect(url.origin+'/fotograma/',308);
  if(!url.pathname.startsWith('/fotograma/api/'))return env.ASSETS.fetch(request);
  if(!env.UNSPLASH_ACCESS_KEY)return Response.json({error:'Falta configurar la clave de Unsplash.'},{status:503});
  if(url.pathname==='/fotograma/api/today')return handleToday(env);
  if(url.pathname==='/fotograma/api/puzzle')return handlePuzzle(env,url);
  if(url.pathname==='/fotograma/api/archive')return handleArchive(env);
  return Response.json({error:'Ruta desconocida.'},{status:404});
}};
export {PUZZLES,puzzleFor,montevideoDay};
