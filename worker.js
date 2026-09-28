/** Fotograma: assets estáticos y proxy mínimo de metadata. Nunca expone UNSPLASH_ACCESS_KEY. */
const PHOTO_ID='MaeshPdBGV4';
const PUZZLE={id:'001',answer:'NIEBLA',hint:'Pista: aparece cuando el aire se enfría y la vista se acorta.'};
const dataCache=new Map();
export default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/fotograma')return Response.redirect(url.origin+'/fotograma/',308);if(url.pathname==='/fotograma/api/today'){
  if(!env.UNSPLASH_ACCESS_KEY)return Response.json({error:'Falta configurar la clave de Unsplash.'},{status:503});
  const cached=dataCache.get(PHOTO_ID);if(cached&&cached.expires>Date.now())return Response.json(cached.value,{headers:{'Cache-Control':'public, max-age=3600'}});
  const response=await fetch(`https://api.unsplash.com/photos/${PHOTO_ID}`,{headers:{Authorization:`Client-ID ${env.UNSPLASH_ACCESS_KEY}`,'Accept-Version':'v1'}});
  if(!response.ok)return Response.json({error:'Foto no disponible.'},{status:502});
  const photo=await response.json();const image=photo.urls?.regular,photoUrl=photo.links?.html,userUrl=photo.user?.links?.html;
  if(!image?.startsWith('https://images.unsplash.com/')||!photoUrl?.startsWith('https://unsplash.com/')||!userUrl?.startsWith('https://unsplash.com/'))return Response.json({error:'Respuesta inválida del proveedor.'},{status:502});
  const tracking='utm_source=fotograma&utm_medium=referral';const value={...PUZZLE,image,alt:photo.alt_description||'Fotografía del acertijo',photographer:{name:photo.user.name,url:userUrl+(userUrl.includes('?')?'&':'?')+tracking},unsplashUrl:photoUrl+(photoUrl.includes('?')?'&':'?')+tracking};dataCache.set(PHOTO_ID,{value,expires:Date.now()+3600000});return Response.json(value,{headers:{'Cache-Control':'public, max-age=3600'}});
}return env.ASSETS.fetch(request);}};
