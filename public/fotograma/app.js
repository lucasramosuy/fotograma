const $ = id => document.getElementById(id);
const alphabet='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const keys=['QWERTYUIOP','ASDFGHJKLÑ','ZXCVBNM'];
const MAX=5;
let puzzle,guesses=[],draft='',hint=false,archiveMode=false;
const key=()=>`fotograma:${puzzle.id}`;
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
function scores(word,answer){const target=[...answer],result=Array(answer.length).fill('miss');for(let i=0;i<word.length;i++)if(word[i]===target[i]){result[i]='correct';target[i]='';}for(let i=0;i<word.length;i++)if(result[i]==='miss'){const j=target.indexOf(word[i]);if(j>=0){result[i]='near';target[j]='';}}return result;}
function saved(){try{const data=JSON.parse(localStorage.getItem(key())||'{}');guesses=Array.isArray(data.guesses)?data.guesses.filter(g=>typeof g==='string'&&g.length===puzzle.answer.length&&[...g].every(c=>alphabet.includes(c))).slice(0,MAX):[];hint=!!data.hint;}catch{guesses=[];hint=false;}}
function save(){try{localStorage.setItem(key(),JSON.stringify({guesses,hint}));}catch{}}
const utcDay=date=>Math.floor(Date.parse(`${date}T00:00:00Z`)/86400000);
function streak(){try{const data=JSON.parse(localStorage.getItem('fotograma:streak')||'{}');return typeof data.count==='number'&&data.count>=0&&typeof data.last==='string'?data:{count:0,last:''};}catch{return {count:0,last:''};}}
function currentStreak(){if(guesses.length===MAX&&!guesses.includes(puzzle.answer))return 0;const data=streak(),gap=utcDay(puzzle.date)-utcDay(data.last);return gap===0||gap===1?data.count:0;}
function winStreak(){const data=streak(),gap=utcDay(puzzle.date)-utcDay(data.last);if(gap===0)return;const count=gap===1?data.count+1:1;try{localStorage.setItem('fotograma:streak',JSON.stringify({count,last:puzzle.date}));}catch{}}
function shareText(){const won=guesses.includes(puzzle.answer);return `Fotograma Nº ${puzzle.id} · ${won?guesses.length:'X'}/${MAX}\n${guesses.map(g=>scores(g,puzzle.answer).map(v=>({correct:'🟩',near:'🟨',miss:'⬜'})[v]).join('')).join('\n')}\nhttps://lucasramos.uy/fotograma/`;}
async function copyText(){const text=shareText();try{await navigator.clipboard.writeText(text);$('share-note').textContent='Resultado copiado. Pegalo donde quieras.';}catch{$('share-note').textContent='No se pudo copiar automáticamente. Seleccioná el texto que aparece abajo.';const pre=document.createElement('pre');pre.className='share-fallback';pre.textContent=text;$('share-note').replaceChildren('Seleccioná y copiá este resultado:',pre);}}
// Lienzo local. La foto de Unsplash permite CORS; nunca se envía el resultado a un servidor.
const STORY_WIDTH=1080,STORY_HEIGHT=1920;
let storyBlob,storyUrl;
function fillRound(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function storyImage(photo){
  const canvas=document.createElement('canvas');canvas.width=STORY_WIDTH;canvas.height=STORY_HEIGHT;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Este navegador no puede crear la imagen.');
  const ink='#24332b',green='#367263',paper='#f7f6f2',muted='#68776b';
  ctx.fillStyle=paper;ctx.fillRect(0,0,STORY_WIDTH,STORY_HEIGHT);
  ctx.fillStyle=green;ctx.fillRect(0,0,STORY_WIDTH,18);
  ctx.textBaseline='alphabetic';ctx.fillStyle=ink;ctx.font='700 68px Space, sans-serif';ctx.fillText('foto',72,135);
  const offset=ctx.measureText('foto').width;ctx.font='400 68px Space, sans-serif';ctx.fillText('grama',72+offset,135);
  const dot=ctx.measureText('grama').width;ctx.fillStyle=green;ctx.fillText('.',72+offset+dot,135);
  ctx.font='23px Mono, monospace';ctx.fillStyle=muted;ctx.textAlign='right';ctx.fillText('UNA FOTO · UNA PALABRA',1008,129);ctx.textAlign='left';
  ctx.fillStyle=ink;ctx.fillRect(72,175,936,2);
  ctx.font='24px Mono, monospace';ctx.fillStyle=green;ctx.fillText(`FOTOGRAMA Nº ${puzzle.id}${archiveMode?' · ARCHIVO':''}`,72,236);
  ctx.textAlign='right';ctx.fillStyle=muted;ctx.fillText(archiveMode?'RESULTADO DE ARCHIVO':'RESULTADO DIARIO',1008,236);ctx.textAlign='left';
  // Recorte central del acertijo real, conservando la proporción y sin distorsión.
  const x=72,y=278,w=936,h=960;
  const ratio=Math.max(w/photo.width,h/photo.height),sw=w/ratio,sh=h/ratio;
  ctx.drawImage(photo,(photo.width-sw)/2,(photo.height-sh)/2,sw,sh,x,y,w,h);
  ctx.fillStyle=ink;ctx.fillRect(72,1270,936,2);
  ctx.fillStyle=green;ctx.font='400 67px Serif, Georgia, serif';ctx.fillText(guesses.includes(puzzle.answer)?'Bien visto.':'Hasta mañana.',72,1360);
  ctx.textAlign='right';ctx.font='700 54px Space, sans-serif';ctx.fillStyle=ink;ctx.fillText(`${guesses.includes(puzzle.answer)?guesses.length:'X'} / ${MAX}`,1008,1360);ctx.textAlign='left';
  const gap=12,rows=guesses.length,cell=Math.min(108,(476-gap*(puzzle.answer.length-1))/puzzle.answer.length,(340-gap*(rows-1))/rows);
  const gridW=cell*puzzle.answer.length+gap*(puzzle.answer.length-1);
  const gridH=cell*rows+gap*(rows-1);
  const left=(STORY_WIDTH-gridW)/2,top=1430+(340-gridH)/2;
  const colors={correct:green,near:'#a98045',miss:'#79877d'};
  guesses.forEach((guess,row)=>scores(guess,puzzle.answer).forEach((mark,col)=>fillRound(ctx,left+col*(cell+gap),top+row*(cell+gap),cell,cell,5,colors[mark])));
  ctx.fillStyle=ink;ctx.fillRect(72,1815,936,2);
  ctx.font='21px Mono, monospace';ctx.fillStyle=muted;
  const credit=`FOTO: ${puzzle.photographer.name.toLocaleUpperCase('es-UY')} / UNSPLASH`;
  ctx.fillText(credit,72,1858,650);
  ctx.textAlign='right';ctx.fillText('UNA FOTO · UNA PALABRA',1008,1858);
  return canvas;
}
async function createStory(){
  await document.fonts.ready;
  const photo=new Image();photo.crossOrigin='anonymous';photo.src=puzzle.image;
  await photo.decode();
  const canvas=storyImage(photo);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No pudimos crear el archivo.')),'image/png'));
}
async function openStory(){
  const button=$('share');button.disabled=true;button.textContent='PREPARANDO IMAGEN…';$('share-note').textContent='';
  try{
    storyBlob=await createStory();if(storyUrl)URL.revokeObjectURL(storyUrl);
    storyUrl=URL.createObjectURL(storyBlob);$('story-preview').src=storyUrl;
    const file=new File([storyBlob],`fotograma-${puzzle.id}.png`,{type:'image/png'});
    $('story-native').hidden=!(navigator.share&&navigator.canShare?.({files:[file]}));
    $('story-note').textContent='Formato vertical 1080 × 1920 para historias. La imagen se crea en este dispositivo.';
    $('story-dialog').showModal();$('story-close').focus();
  }catch(error){$('share-note').textContent='No pudimos generar la imagen en este navegador. Podés copiar el resultado como texto.';console.error('Imagen compartible:',error);}
  finally{button.disabled=false;button.textContent='VER IMAGEN PARA COMPARTIR ↗';}
}
$('story-download').onclick=()=>{if(!storyUrl)return;const link=document.createElement('a');link.href=storyUrl;link.download=`fotograma-${puzzle.id}.png`;link.click();$('story-note').textContent='Imagen descargada. Ya podés subirla a tus historias.';};
$('story-native').onclick=async()=>{if(!storyBlob)return;try{const file=new File([storyBlob],`fotograma-${puzzle.id}.png`,{type:'image/png'});await navigator.share({files:[file],title:`Fotograma Nº ${puzzle.id}`});$('story-note').textContent='Imagen compartida.';}catch(error){if(error.name!=='AbortError')$('story-note').textContent='No se pudo compartir desde el navegador. Descargá la imagen para subirla.';}};
function render(){const won=guesses.includes(puzzle.answer),finished=won||guesses.length===MAX;const used=guesses.length;$('attempts').textContent=used?`${used} / ${MAX} INTENTOS USADOS`:`${MAX} INTENTOS`;$('tiles').replaceChildren();$('tiles').style.setProperty('--letters',puzzle.answer.length);const marks={};for(let row=0;row<(finished?used:MAX);row++){const wrap=document.createElement('div');wrap.className='tile-row'+(row===used&&!finished?' current':'');const number=document.createElement('span');number.className='row-number';number.textContent=String(row+1).padStart(2,'0');wrap.append(number);const word=guesses[row]||(!finished&&row===used?draft:'');const evaluation=guesses[row]?scores(word,puzzle.answer):[];for(let i=0;i<puzzle.answer.length;i++){const tile=document.createElement('span');tile.className='tile '+(evaluation[i]||'');tile.textContent=word[i]||'';wrap.append(tile);if(evaluation[i]){const rank={miss:1,near:2,correct:3};if(!marks[word[i]]||rank[evaluation[i]]>rank[marks[word[i]]])marks[word[i]]=evaluation[i];}}$('tiles').append(wrap);}document.querySelectorAll('.key-row button[data-letter]').forEach(button=>button.className=marks[button.dataset.letter]||'');$('feedback').textContent=finished?'':hint?puzzle.hint:'Una letra en el lugar correcto se pinta de verde.';$('feedback').hidden=finished;$('keyboard').hidden=finished;document.querySelector('.actions').hidden=finished;$('hint').disabled=hint||finished;$('hint').textContent=hint?'✳  PISTA REVELADA':'✳  PEDIR UNA PISTA';$('result').hidden=!finished;if(finished){$('result-label').textContent=won?'✳ RESUELTO':'✳ SIN RESOLVER';$('result-score').textContent=`${used} / ${MAX}`;$('result-title').textContent=won?'Bien visto.':'Hasta mañana.';$('result-copy').textContent=archiveMode?`La palabra era ${puzzle.answer}. Tu racha diaria sigue intacta.`:`La palabra era ${puzzle.answer}. Volvé mañana por otra foto.`;}if(!archiveMode){const count=currentStreak();$('streak-count').textContent=`${count} ${count===1?'día seguido':'días seguidos'}`;}}
function input(letter){if(!puzzle||guesses.includes(puzzle.answer)||guesses.length===MAX)return;if(letter==='BORRAR')draft=draft.slice(0,-1);else if(letter==='OK'){if(draft.length!==puzzle.answer.length){$('feedback').textContent=`Faltan ${puzzle.answer.length-draft.length} letras.`;return;}guesses.push(draft);draft='';save();if(!archiveMode&&guesses.at(-1)===puzzle.answer)winStreak();}else if(alphabet.includes(letter)&&draft.length<puzzle.answer.length)draft+=letter;render();}
for(const row of keys){const div=document.createElement('div');div.className='key-row';for(const letter of row){const button=document.createElement('button');button.type='button';button.dataset.letter=letter;button.textContent=letter;button.onclick=()=>input(letter);div.append(button);}if(row==='ZXCVBNM'){for(const [letter,text,label,first] of [['BORRAR','⌫','Borrar',true],['OK','↵','Enviar',false]]){const button=document.createElement('button');button.className='key-special';button.type='button';button.textContent=text;button.setAttribute('aria-label',label);button.onclick=()=>input(letter);if(first)div.prepend(button);else div.append(button);}}$('keyboard').append(div);}
document.addEventListener('keydown',event=>{if($('story-dialog').open)return;if(event.altKey||event.ctrlKey||event.metaKey)return;const k=normalize(event.key);if(k==='BACKSPACE'){event.preventDefault();input('BORRAR');}else if(k==='ENTER'){event.preventDefault();input('OK');}else if(k.length===1&&alphabet.includes(k)){event.preventDefault();input(k);}});
$('hint').onclick=()=>{hint=true;save();render();};$('copy-text').onclick=copyText;
$('share').onclick=openStory;
$('story-close').onclick=()=>$('story-dialog').close();
$('story-dialog').addEventListener('click',event=>{if(event.target===$('story-dialog'))$('story-dialog').close();});
const fmtDate=date=>new Intl.DateTimeFormat('es-UY',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00Z`)).toUpperCase();
function savedGuesses(id){try{const data=JSON.parse(localStorage.getItem(`fotograma:${id}`)||'{}');return Array.isArray(data.guesses)?data.guesses:[];}catch{return [];}}
function showPuzzle(data){
  puzzle=data;puzzle.answer=normalize(puzzle.answer);
  $('photo').src=puzzle.image;$('photo').alt=puzzle.alt||'Fotografía del acertijo';
  $('photographer').textContent=puzzle.photographer.name+' ↗';$('photographer').href=puzzle.photographer.url;
  $('unsplash').href=puzzle.unsplashUrl;$('date').textContent=fmtDate(puzzle.date);
  $('photo-number').textContent=puzzle.id;$('credit-number').textContent=puzzle.id;
  $('puzzle-number').textContent=`FOTOGRAMA Nº ${puzzle.id}${archiveMode?' · ARCHIVO':''}`;
  $('mode-tag').textContent=archiveMode?'/ ARCHIVO':'/ DIARIO';
  $('eyebrow-label').textContent=archiveMode?'ACERTIJO DE ARCHIVO':'EL ACERTIJO DE HOY';
  $('length').textContent=`${puzzle.answer.length} letras.`;
  $('streak').hidden=archiveMode;$('archive-note').hidden=!archiveMode;$('back-archive').hidden=!archiveMode;
  saved();if(!archiveMode&&guesses.includes(puzzle.answer))winStreak();render();
  $('status').textContent='';$('game').hidden=false;
  if(!archiveMode){const rollover=Date.parse(`${puzzle.date}T03:00:00Z`)+86400000-Date.now();if(rollover>0)setTimeout(()=>location.reload(),rollover+1000);}
}
async function loadDaily(){const res=await fetch('/fotograma/api/today',{headers:{accept:'application/json'},cache:'no-store'});if(!res.ok)throw new Error(res.status===503?'Todavía falta configurar la clave de Unsplash.':'No pudimos cargar la foto. Probá de nuevo en un rato.');const data=await res.json();if(!data?.image?.startsWith('https://images.unsplash.com/')||!data?.answer||!data?.photographer?.url||!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error('La foto no está disponible.');showPuzzle(data);}
async function loadNumber(n){const res=await fetch(`/fotograma/api/puzzle?n=${n}`,{headers:{accept:'application/json'},cache:'no-store'});if(res.status===404)throw new Error('Ese acertijo todavía no existe.');if(!res.ok)throw new Error('No pudimos cargar el acertijo. Probá de nuevo en un rato.');const data=await res.json();if(!data?.image?.startsWith('https://images.unsplash.com/')||!data?.answer||!data?.photographer?.url||!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error('La foto no está disponible.');archiveMode=!data.today;showPuzzle(data);}
async function loadArchive(){
  const res=await fetch('/fotograma/api/archive',{headers:{accept:'application/json'},cache:'no-store'});
  if(!res.ok)throw new Error(res.status===503?'Todavía falta configurar la clave de Unsplash.':'No pudimos cargar el archivo. Probá de nuevo en un rato.');
  const data=await res.json();const items=Array.isArray(data?.items)?data.items:[];
  if(!items.length)throw new Error('Todavía no hay acertijos anteriores.');
  document.title='Fotograma · Archivo';$('issue').textContent='ARCHIVO · UNA FOTO · UNA PALABRA';
  const past=items.filter(i=>!i.today);
  $('archive-range').textContent=`DEL Nº ${items[items.length-1].id} AL Nº ${items[0].id}`;
  let solved=0;
  $('archive-list').replaceChildren(...items.map(item=>{
    const tries=savedGuesses(item.id),won=tries.includes(normalize(item.answer));
    if(won)solved++;
    let chip,cls;
    if(item.today){chip=won?'HOY · RESUELTO':tries.length?'HOY · EN JUEGO':'HOY';cls='today';}
    else if(won){chip='RESUELTO';cls='done';}
    else if(tries.length){chip=`EN JUEGO · ${tries.length}/${MAX}`;cls='progress';}
    else{chip='SIN JUGAR';cls='';}
    const li=document.createElement('li');
    const a=document.createElement('a');a.className='archive-item';a.href=item.today?'/fotograma/':`/fotograma/?n=${item.id}`;
    const num=document.createElement('span');num.className='ai-num';num.textContent=item.id;
    const img=document.createElement('img');img.src=item.image;img.alt=item.alt||'';img.loading='lazy';img.width=56;img.height=56;
    const main=document.createElement('span');main.className='ai-main';
    const title=document.createElement('span');title.className='ai-title';title.textContent=`FOTOGRAMA Nº ${item.id}`;
    const meta=document.createElement('span');meta.className='ai-meta';meta.textContent=`${fmtDate(item.date)} · ${normalize(item.answer).length} LETRAS`;
    main.append(title,meta);
    const chipEl=document.createElement('span');chipEl.className=`ai-chip ${cls}`;chipEl.textContent=chip;
    const go=document.createElement('span');go.className='ai-go';go.textContent='JUGAR ↗';
    a.append(num,img,main,chipEl,go);li.append(a);return li;
  }));
  $('archive-solved').textContent=`${solved} de ${items.length} resueltos`;
  $('status').textContent='';$('archive').hidden=false;
}
async function loadBand(){try{const res=await fetch('/fotograma/api/archive',{headers:{accept:'application/json'}});if(!res.ok)return;const data=await res.json();const past=(data?.items||[]).filter(i=>!i.today).length;if(!past)return;$('archive-count').textContent=`· ${past+1} ACERTIJOS`;$('archive-band').hidden=false;}catch{}}
(async()=>{try{
  const params=new URLSearchParams(location.search);
  const n=Number.parseInt(params.get('n')||'',10);
  if(params.has('archivo')){await loadArchive();}
  else if(Number.isInteger(n)&&n>0){await loadNumber(n);loadBand();}
  else{await loadDaily();loadBand();}
}catch(error){$('status').textContent=error.message||'No pudimos cargar el acertijo.';}})();
