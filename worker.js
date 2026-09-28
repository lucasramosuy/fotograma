/** Fotograma diario. La clave de Unsplash queda solo en el Worker. */
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
  {answer:'CAFE',photoId:'BYYvJl3tIqY',hint:'Pista: bebida que muchos toman al despertar.'}
];
const START_DAY=Math.floor(Date.UTC(2026,8,27)/86400000);
const DAY_MS=86400000;
const cache=new Map();
function montevideoDay(now){return Math.floor((now-3*3600000)/DAY_MS);}
function dayLabel(day){return new Date(day*DAY_MS).toISOString().slice(0,10);}
function puzzleFor(now){const day=Math.max(START_DAY,montevideoDay(now));const n=day-START_DAY;return {day,n,puzzle:PUZZLES[n%PUZZLES.length]};}
function response(value,seconds){return Response.json(value,{headers:{'Cache-Control':`public, max-age=${seconds}`}});}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/fotograma')return Response.redirect(url.origin+'/fotograma/',308);
  if(url.pathname!=='/fotograma/api/today')return env.ASSETS.fetch(request);
  if(!env.UNSPLASH_ACCESS_KEY)return Response.json({error:'Falta configurar la clave de Unsplash.'},{status:503});
  const {day,n,puzzle}=puzzleFor(Date.now());
  const seconds=Math.min(3600,Math.max(1,Math.ceil(((day+1)*DAY_MS+3*3600000-Date.now())/1000)));
  const cached=cache.get(puzzle.photoId);
  if(cached&&cached.expires>Date.now())return response({...cached.value,id:String(n+1).padStart(3,'0'),date:dayLabel(day)},seconds);
  try{
    const upstream=await fetch(`https://api.unsplash.com/photos/${encodeURIComponent(puzzle.photoId)}`,{headers:{Authorization:`Client-ID ${env.UNSPLASH_ACCESS_KEY}`,'Accept-Version':'v1'}});
    if(!upstream.ok)return Response.json({error:'Foto no disponible.'},{status:502});
    const photo=await upstream.json();const image=photo.urls?.regular,photoUrl=photo.links?.html,userUrl=photo.user?.links?.html;
    if(!image?.startsWith('https://images.unsplash.com/')||!photoUrl?.startsWith('https://unsplash.com/')||!userUrl?.startsWith('https://unsplash.com/'))return Response.json({error:'Respuesta inválida del proveedor.'},{status:502});
    const tracking='utm_source=fotograma&utm_medium=referral';
    const value={answer:puzzle.answer,hint:puzzle.hint,image,alt:photo.alt_description||'Fotografía del acertijo',photographer:{name:photo.user.name,url:userUrl+(userUrl.includes('?')?'&':'?')+tracking},unsplashUrl:photoUrl+(photoUrl.includes('?')?'&':'?')+tracking};
    cache.set(puzzle.photoId,{value,expires:Date.now()+3600000});
    return response({...value,id:String(n+1).padStart(3,'0'),date:dayLabel(day)},seconds);
  }catch{return Response.json({error:'No pudimos cargar la foto.'},{status:502});}
}};
export {PUZZLES,puzzleFor,montevideoDay};
