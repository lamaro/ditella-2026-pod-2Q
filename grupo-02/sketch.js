
// STAR WARS — juego con p5.js y ml5.handPose
// Controles: índice = sable; mouse/teclado = menús; R = reiniciar; ESC = menú.
// Los puntos 5, 6, 7 y 8 son las articulaciones y la punta del índice.
let estado='inicio',bando='',colorHoja='azul',modelo,camara,manos=[];
let estrellas=[],particulas=[],objetivos=[],botones=[];
const DURACION_MS=60000, MAX_ESCAPES=3;
let escapes=0, interceptados=0, tiempoRestante=DURACION_MS;
let ultimoInstante=null, esperaAtaque=0, avisoHasta=0;
let sable={x:0,y:0,angulo:0,largo:45,activo:false};
let audioChoque,audioImpacto;
let imagenes=[],simboloRojo,fuente;
let finalVictoria=false,destellos=[];
let errorCamara='',camaraLista=false,modeloIniciado=false;
const PAL={azul:[57,167,255],verde:[52,255,147],rojo:[255,55,72]};
// El ritmo aumenta a los 20 y a los 40 segundos de juego activo.
function nivelActual(){return tiempoRestante>40000?1:tiempoRestante>20000?2:3;}
// Intervalo entre apariciones (segundos) y tiempo medio para cruzar la pantalla.
const RITMOS = [
  {intervalo: .65, recorrido: 2.65},
  {intervalo: .50, recorrido: 2.16},
  {intervalo: .40, recorrido: 1.82}
];
function preload(){
  modelo=ml5.handPose({maxHands:2,modelType:'lite',flipped:true});
  cargarEfectos();
  fuente=loadFont('assets/starjedi.ttf');
  for(let i=0;i<4;i++)imagenes.push(loadImage('assets/img/imagen'+i+'.png'));
  audioChoque=loadSound('assets/audio/choque.wav');
  audioImpacto=loadSound('assets/audio/impacto.wav');
}
// Conserva el trazo claro del emblema y colorea su parte verde con el rojo del sable.
function crearSimboloRojo(original){
  const copia=original.get();
  copia.loadPixels();
  for(let i=0;i<copia.pixels.length;i+=4){
    if(copia.pixels[i+3] && copia.pixels[i+1]-copia.pixels[i]>100){
      copia.pixels.set(PAL.rojo,i);
    }
  }
  copia.updatePixels();
  return copia;
}
function setup(){
  const area=document.getElementById('juego');
  createCanvas(area.clientWidth,area.clientHeight).parent(area);
  textFont(fuente);imageMode(CENTER);
  document.addEventListener('visibilitychange',()=>{ultimoInstante=null;});
  simboloRojo=crearSimboloRojo(imagenes[3]);
  for(let i=0;i<170;i++)estrellas.push({x:random(width),y:random(height),r:random(.5,2.5),v:random(.1,.7),fase:random(TWO_PI)});
}
function draw(){
  background(2,5,16);botones=[];
  if(estado==='jugando'||estado==='final'){
    dibujarCamara();
    dibujarEstrellas(true);
    if(estado==='jugando'){
      const ahora=millis();
      dibujarVuelo(ahora);
      dibujarDisfraz(ahora);
    }
    dibujarMarcoGalactico();
    if(estado==='jugando'){actualizarSable();actualizarObjetivos();}
    else if(sable.activo)dibujarSable();
    if(estado==='jugando')dibujarHUD();
  }else dibujarEstrellas();
  if(estado==='inicio'){
    texto('Star Wars',height*.34,min(112,width*.16,height*.21),[255,218,119]);
    texto('Juego interactivo',height*.52,min(28,width*.055,height*.06),[230,236,255]);
    boton('Comenzar',width/2,height*.72,'comenzar',[248,210,102]);
    texto('Hacé clic en Comenzar o presioná Enter.',height*.87,14);
  }else if(estado==='bando'){
    titulo('Elegí tu bando','Jedi: bloqueá disparos. Sith: destruí drones.');
    texto('Defendé durante 60 segundos. Al cuarto escape, perdés.',height*.88,min(16,width*.039));
    image(imagenes[0],width*.28,height*.49,110,110);
    image(imagenes[1],width*.72,height*.49,110,110);
    boton('1 - Jedi',width*.28,height*.72,'jedi',PAL.azul);
    boton('2 - Sith',width*.72,height*.72,'sith',PAL.rojo);
  }else if(estado==='color'){
    titulo('Elegí tu sable','Activá la cámara y mostrá la mano derecha.');
    if(bando==='Jedi'){
      image(imagenes[2],width*.35,height*.48,100,100);
      image(imagenes[3],width*.65,height*.48,100,100);
      boton('1 - Azul',width*.35,height*.72,'azul',PAL.azul);
      boton('2 - Verde',width*.65,height*.72,'verde',PAL.verde);
    }else{
      image(simboloRojo,width/2,height*.48,100,100);
      boton('1 - Rojo',width/2,height*.72,'rojo',PAL.rojo);
    }
  }else if(estado==='final'){
    noStroke();fill(0,0,0,190);rect(0,0,width,height);
    const motivo=bando==='Jedi'?'Se escapó el cuarto disparo.':'Se escapó el cuarto dron.';
    titulo(finalVictoria?'Ganaste':'Perdiste',finalVictoria?'Defendiste durante 60 segundos.':motivo);
    texto('Interceptados: '+interceptados+'  -  Escapados: '+escapes,height*.54,20);
    boton('Volver al inicio - R',width/2,height*.75,'reiniciar',[255,218,120]);
  }
  actualizarParticulas();
  actualizarDestellos();
}
// Menús: eventos de mouse y teclado no controlan el sable.
function titulo(a,b){
  push();texto(a,height*.27,min(43,width*.065),[255,218,119]);
  texto(b,height*.35,min(18,width*.032),[230,236,255]);pop();
}
function texto(s,y,t,c=[255,255,255]){s=s.toLowerCase();push();fill(...c);noStroke();textAlign(CENTER,CENTER);textSize(t);ajustarTexto(s,width-24);text(s,width/2,y);pop();}
function ajustarTexto(s,ancho){
  const medido=textWidth(s);
  if(medido>ancho)textSize(textSize()*ancho/medido);
}
function boton(etiqueta,x,y,accion,c){
  etiqueta=etiqueta.toLowerCase();
  let w=min(240,width*(estado==='color'&&bando==='Jedi' ? .28 : .38)),h=55;
  botones.push({x,y,w,h,accion});
  push();rectMode(CENTER);stroke(...c);strokeWeight(2);fill(5,13,28,230);rect(x,y,w,h,9);
  noStroke();fill(...c);textAlign(CENTER,CENTER);textSize(min(18,w/11));ajustarTexto(etiqueta,w-18);text(etiqueta,x,y);pop();
}
// El campo estelar también se ve sobre la webcam, pero con menor densidad en el centro.
function dibujarEstrellas(sobreCamara=false){
  push();noStroke();
  for(let e of estrellas){
    let borde=min(e.x,width-e.x,e.y,height-e.y);
    if(!sobreCamara||borde<min(width,height)*.30){
      let a=(sobreCamara?75:155)+55*sin(frameCount*.022+e.fase);
      fill(205,225,255,a);circle(e.x,e.y,e.r*(sobreCamara?.8:1));
    }
    e.y+=e.v*(sobreCamara?.45:1);if(e.y>height){e.y=0;e.x=random(width);}
  }
  pop();
}
// HUD galáctico: colores distintos según el bando, sin tapar la mano.
function dibujarMarcoGalactico(){
  let c=bando==='Jedi'?PAL.azul:PAL.rojo;
  push();noFill();stroke(c[0],c[1],c[2],95);strokeWeight(2);
  let m=18,d=46;
  line(m,m+d,m,m);line(m,m,m+d,m);
  line(width-m-d,m,width-m,m);line(width-m,m,width-m,m+d);
  line(m,height-m-d,m,height-m);line(m,height-m,m+d,height-m);
  line(width-m-d,height-m,width-m,height-m);line(width-m,height-m-d,width-m,height-m);
  pop();
}

function activarAudio(){userStartAudio();habilitarMusica();}

function accion(a){
  activarAudio();
  if(a==='comenzar'){estado='bando';cambiarTema('inicio');}
  if(a==='jedi'||a==='sith'){bando=a==='jedi'?'Jedi':'Sith';estado='color';cambiarTema(a);}
  if(['azul','verde','rojo'].includes(a)){colorHoja=a;iniciarPartida();}
  if(a==='reiniciar'){estado='inicio';manos=[];sable.activo=false;objetivos=[];particulas=[];destellos=[];cambiarTema('inicio');}
}
function mousePressed(){if(estado==='inicio'){activarAudio();cambiarTema('inicio');}for(let b of botones)if(abs(mouseX-b.x)<b.w/2&&abs(mouseY-b.y)<b.h/2){accion(b.accion);break;}}
function keyPressed(){
  activarAudio();
  if(estado==='inicio')cambiarTema('inicio');
  if(keyCode===ESCAPE){estado='inicio';objetivos=[];sable.activo=false;cambiarTema('inicio');return false;}
  if((key==='r'||key==='R')&&(estado==='final'||estado==='jugando'))accion('reiniciar');
  else if(estado==='inicio'&&keyCode===ENTER)accion('comenzar');
  else if(estado==='bando'&&key==='1')accion('jedi');
  else if(estado==='bando'&&key==='2')accion('sith');
  else if(estado==='color'&&key==='1')accion(bando==='Jedi'?'azul':'rojo');
  else if(estado==='color'&&key==='2'&&bando==='Jedi')accion('verde');
}
function iniciarPartida(){
  iniciarEfectos();
  escapes=0;interceptados=0;tiempoRestante=DURACION_MS;
  ultimoInstante=null;esperaAtaque=.95;avisoHasta=0;
  objetivos=[];particulas=[];destellos=[];
  estado='jugando';sable.activo=false;
  if(!camaraLista){
    try{
      camara=createCapture(VIDEO,()=>{try{if(!modeloIniciado){modelo.detectStart(camara,recibirManos);modeloIniciado=true;}}catch(e){errorCamara='Error de ml5: '+e.message;}});
      camara.size(640,480);camara.hide();camaraLista=true;
    }catch(e){errorCamara='No se pudo iniciar la cámara: '+e.message;}
  }
}
function recibirManos(resultados){manos=resultados;}
// Dibuja el video en espejo para que mover el índice a la derecha lo mueva a la derecha.
function dibujarCamara(){
  if(camara&&camara.elt&&camara.elt.readyState>=2){
    let k=max(width/640,height/480),w=640*k,h=480*k,x=(width-w)/2,y=(height-h)/2;
    push();translate(width,0);scale(-1,1);imageMode(CORNER);image(camara,x,y,w,h);pop();
    // Filtro leve sobre el VIDEO dibujado; ml5 recibe el video sin filtro y devuelve los puntos en espejo.
    noStroke();if(bando==='Jedi')fill(3,18,48,76);else fill(48,3,15,78);rect(0,0,width,height);
  }else{background(bando==='Jedi'?color(5,16,37):color(32,5,16));}
}
// Usa SOLO las articulaciones del índice: base (5), articulación (6) y punta (8).
// El sable se apoya en el dedo índice y tiene longitud parecida al propio dedo.
function actualizarSable(){
  const derecha=manos.find(m=>m.handedness==='Right');
  if(!derecha || !derecha.keypoints || derecha.keypoints.length<9){sable.activo=false;return;}
  let p=derecha.keypoints,base=p[5],medio=p[6],punta=p[8];
  if(![base.x,base.y,medio.x,medio.y,punta.x,punta.y].every(Number.isFinite)){sable.activo=false;return;}
  let k=max(width/640,height/480),w=640*k,h=480*k,x=(width-w)/2,y=(height-h)/2;
  let bx=x+base.x*k,by=y+base.y*k;
  let tx=x+punta.x*k,ty=y+punta.y*k;
  if(tx<0||tx>width||ty<0||ty>height){sable.activo=false;return;}
  let largoDedo=dist(base.x,base.y,punta.x,punta.y)*k;
  let ang=atan2(ty-by,tx-bx);
  if(!sable.activo){sable.x=bx;sable.y=by;sable.angulo=ang;sable.largo=constrain(largoDedo,20,130);}
  else{
    sable.x=lerp(sable.x,bx,.42);sable.y=lerp(sable.y,by,.42);
    sable.angulo+=atan2(sin(ang-sable.angulo),cos(ang-sable.angulo))*.42;
    sable.largo=lerp(sable.largo,constrain(largoDedo,20,130),.4);
  }
  sable.activo=true;
  dibujarSable();
}
function dibujarSable(){
  let c=PAL[colorHoja],l=sable.largo;
  push();translate(sable.x,sable.y);rotate(sable.angulo);strokeCap(ROUND);
  // La hoja no es un sable gigante: sigue el tamaño aparente del índice.
  for(let a=0;a<3;a++){stroke(c[0],c[1],c[2],26-a*6);strokeWeight(15-a*4);line(l*.2,0,l,0);}
  stroke(...c);strokeWeight(6);line(l*.2,0,l,0);
  stroke(255);strokeWeight(2.5);line(l*.2,0,l,0);
  stroke(140,150,170);strokeWeight(9);line(0,0,l*.22,0);
  stroke(25,30,42);strokeWeight(5);line(0,0,l*.22,0);
  pop();
}
// Las trayectorias se fijan al aparecer: algunas apuntan hacia el índice,
// pero nunca persiguen al jugador después de entrar en pantalla.
function crearObjetivo(ritmo){
  const tipo=bando==='Sith'?'dron':'laser';
  const r=tipo==='dron'?22:10;
  const margen=r+3;
  const alcance=min(width*.26,height*.38);
  const x=constrain(sable.x+random(-alcance,alcance),margen,width-margen);
  objetivos.push({x,y:-r,r,tipo,v:random(.90,1.10)/ritmo.recorrido});
}
function dibujarObjetivo(o){
  push();noStroke();
  if(o.tipo==='laser'){fill(255,65,80);rect(o.x-3,o.y-13,6,26,4);}
  if(o.tipo==='dron'){fill(70,125,220);circle(o.x,o.y,o.r*2);fill(15,30,80);circle(o.x,o.y,o.r);stroke(120,220,255);line(o.x-15,o.y,o.x+15,o.y);}
  pop();
}
function tocaSable(o){
  const dx=cos(sable.angulo)*sable.largo,dy=sin(sable.angulo)*sable.largo;
  const t=constrain(((o.x-sable.x)*dx+(o.y-sable.y)*dy)/(dx*dx+dy*dy),.2,1);
  return dist(o.x,o.y,sable.x+t*dx,sable.y+t*dy)<o.r+7;
}
function actualizarObjetivos(){
  if(!sable.activo || document.hidden){
    ultimoInstante=null;
    objetivos.forEach(dibujarObjetivo);
    return;
  }
  const ahora=Math.floor(millis());
  const transcurrido=ultimoInstante===null?0:min(ahora-ultimoInstante,tiempoRestante);
  ultimoInstante=ahora;
  const dt=min(transcurrido/1000,.05);
  tiempoRestante-=transcurrido;
  const ritmo=RITMOS[nivelActual()-1];
  esperaAtaque-=dt;
  if(esperaAtaque<=0){crearObjetivo(ritmo);esperaAtaque+=ritmo.intervalo;}
  for(let i=objetivos.length-1;i>=0;i--){
    const o=objetivos[i];
    o.y+=o.v*height*dt;
    if(tocaSable(o)){
      interceptados++;
      crearParticulas(o.x,o.y);
      destellos.push({x:o.x,y:o.y,vida:12,c:PAL[colorHoja]});
      const sonido=bando==='Jedi'?audioChoque:audioImpacto;
      if(sonido.isLoaded())sonido.play();
    }else if(o.y>height+o.r){
      escapes++;
      avisoHasta=ahora+1200;
    }else{
      dibujarObjetivo(o);
      continue;
    }
    objetivos.splice(i,1);
    if(escapes>MAX_ESCAPES){terminarPartida(false);return;}
  }
  if(tiempoRestante===0)terminarPartida(true);
}
function crearParticulas(x,y){
  for(let i=0;i<14;i++)particulas.push({x,y,vx:random(-5,5),vy:random(-5,5),vida:35,c:PAL[colorHoja]});
}
// Anillos breves de impacto para reforzar el feedback visual.
function actualizarDestellos(){
  push();noFill();
  for(let d of destellos){
    stroke(d.c[0],d.c[1],d.c[2],d.vida*18);strokeWeight(2.5);
    circle(d.x,d.y,(13-d.vida)*9+12);d.vida--;
  }
  pop();destellos=destellos.filter(d=>d.vida>0);
}
function actualizarParticulas(){
  noStroke();
  for(let p of particulas){fill(p.c[0],p.c[1],p.c[2],p.vida*7);circle(p.x,p.y,4);p.x+=p.vx;p.y+=p.vy;p.vida--;}
  particulas=particulas.filter(p=>p.vida>0);
}
function dibujarHUD(){
  noStroke();fill(0,0,0,150);rect(0,0,width,68);fill(255);textFont(fuente);textAlign(LEFT,CENTER);textSize(17);
  const segundos=Math.ceil(tiempoRestante/1000);
  const reloj=Math.floor(segundos/60)+':'+String(segundos%60).padStart(2,'0');
  const estadoPartida=(bando+'  -  Tiempo '+reloj+'  -  Escapados '+escapes+'/'+MAX_ESCAPES).toLowerCase();
  if(escapes===MAX_ESCAPES || millis()<avisoHasta)fill(255,164,114);
  ajustarTexto(estadoPartida,width-36);text(estadoPartida,18,22);
  let ayuda=bando==='Jedi'?'Bloqueá los disparos con el sable':'Destruí los drones con el sable';
  if(escapes===MAX_ESCAPES)ayuda='Última oportunidad: un escape más y perdés';
  else if(millis()<avisoHasta)ayuda=bando==='Jedi'?'Se escapó un disparo':'Se escapó un dron';
  if(!sable.activo)ayuda='En pausa: mostrá la mano derecha';
  ayuda=ayuda.toLowerCase();
  fill(255);textSize(14);ajustarTexto(ayuda,width-36);text(ayuda,18,47);
  if(errorCamara){fill(255,100,100);textAlign(CENTER);text(errorCamara.toLowerCase(),width/2,height-40);}
}
// En derrota vuelve inmediatamente la música de inicio, incluso en GAME OVER.
function terminarPartida(victoria){
  if(estado!=='jugando')return;
  finalVictoria=victoria;estado='final';objetivos=[];sable.activo=false;
  cambiarTema('inicio');
}

function windowResized(){
  let anteriorW=width,anteriorH=height;
  const area=document.getElementById('juego');
  resizeCanvas(area.clientWidth,area.clientHeight);
  for(let e of estrellas){e.x=e.x/anteriorW*width;e.y=e.y/anteriorH*height;}
}

