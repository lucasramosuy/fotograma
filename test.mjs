import assert from 'node:assert/strict';
import {PUZZLES,puzzleFor,montevideoDay,default as worker} from './worker.js';
assert.ok(PUZZLES.length>=14,'el pool tiene al menos 14 acertijos');
assert.equal(new Set(PUZZLES.map(p=>p.answer)).size,PUZZLES.length,'respuestas sin repetir');
assert.equal(new Set(PUZZLES.map(p=>p.photoId)).size,PUZZLES.length,'fotos sin repetir');
assert.equal(puzzleFor(Date.parse('2026-09-28T02:59:59Z')).puzzle.answer,'NIEBLA');
assert.equal(puzzleFor(Date.parse('2026-09-28T03:00:00Z')).puzzle.answer,'FARO');
assert.equal(puzzleFor(Date.parse('2026-09-28T03:00:00Z')).n,1);
const ciclo=Date.parse('2026-09-27T03:00:00Z')+PUZZLES.length*86400000;
assert.equal(puzzleFor(ciclo).puzzle.answer,PUZZLES[0].answer,'el pool rota completo');
assert.equal(montevideoDay(Date.parse('2026-09-28T02:59:59Z')),Math.floor(Date.UTC(2026,8,27)/86400000));
console.log('Worker: fechas de medianoche Uruguay, ID diario, ciclo y clave ausente: OK');
for(const p of PUZZLES){assert.match(p.answer,/^[A-ZÑ]{4,8}$/);assert.match(p.photoId,/^[A-Za-z0-9_-]+$/);}
const noKey=await worker.fetch(new Request('https://test.invalid/fotograma/api/today'),{ASSETS:{fetch(){throw Error('asset')}}});
assert.equal(noKey.status,503);
const env={UNSPLASH_ACCESS_KEY:'x',ASSETS:{fetch(){throw Error('asset')}}};
for(const n of ['0','-1','abc','99999']){const res=await worker.fetch(new Request(`https://test.invalid/fotograma/api/puzzle?n=${n}`),env);assert.equal(res.status,404,`n=${n} fuera de rango`);}
const foto={urls:{regular:'https://images.unsplash.com/r',small:'https://images.unsplash.com/s'},links:{html:'https://unsplash.com/photos/x'},alt_description:'foto',user:{name:'Ana',links:{html:'https://unsplash.com/@ana'}}};
const originalFetch=globalThis.fetch;
globalThis.fetch=async()=>new Response(JSON.stringify(foto),{status:200,headers:{'content-type':'application/json'}});
try{
  const hoy=puzzleFor(Date.now()).n+1;
  const actual=await worker.fetch(new Request(`https://test.invalid/fotograma/api/puzzle?n=${hoy}`),env);
  assert.equal(actual.status,200);const datos=await actual.json();
  assert.equal(datos.today,true);assert.equal(datos.id,String(hoy).padStart(3,'0'));
  const pasado=await worker.fetch(new Request('https://test.invalid/fotograma/api/puzzle?n=1'),env);
  const datos1=await pasado.json();assert.equal(datos1.date,'2026-09-27');assert.equal(datos1.today,hoy===1);
  const archivo=await worker.fetch(new Request('https://test.invalid/fotograma/api/archive'),env);
  assert.equal(archivo.status,200);const lista=(await archivo.json()).items;
  assert.equal(lista.length,hoy,'una fila por día desde el inicio');
  assert.equal(lista[0].today,true,'hoy primero');assert.equal(lista.at(-1).id,'001');
  assert.ok(lista.every(i=>i.image.startsWith('https://images.unsplash.com/')&&/^[A-ZÑ]{4,8}$/.test(i.answer)));
  console.log('Worker: endpoints puzzle y archivo: OK');
}finally{globalThis.fetch=originalFetch;}
console.log('Todo OK');
