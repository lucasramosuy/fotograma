import assert from 'node:assert/strict';
import {PUZZLES,puzzleFor,montevideoDay,default as worker} from './worker.js';
assert.equal(PUZZLES.length,14);
assert.equal(new Set(PUZZLES.map(p=>p.answer)).size,14);
assert.equal(puzzleFor(Date.parse('2026-09-28T02:59:59Z')).puzzle.answer,'NIEBLA');
assert.equal(puzzleFor(Date.parse('2026-09-28T03:00:00Z')).puzzle.answer,'FARO');
assert.equal(puzzleFor(Date.parse('2026-10-11T03:00:00Z')).puzzle.answer,'NIEBLA');
assert.equal(montevideoDay(Date.parse('2026-09-28T02:59:59Z')),Math.floor(Date.UTC(2026,8,27)/86400000));
assert.equal(puzzleFor(Date.parse('2026-09-28T03:00:00Z')).n,1);
const noKey=await worker.fetch(new Request('https://test.invalid/fotograma/api/today'),{ASSETS:{fetch(){throw Error('asset')}}});
assert.equal(noKey.status,503);
console.log('Worker: fechas de medianoche Uruguay, ID diario, ciclo y clave ausente: OK');
for(const p of PUZZLES){assert.match(p.answer,/^[A-ZÑ]{4,8}$/);assert.match(p.photoId,/^[A-Za-z0-9_-]+$/);}
