// Los efectos se dibujan sobre la misma cámara que usa el sable.
let detectorRostro, orejaYoda, cascoVader, xWing, cazaTIE;
let poseRostro=null, deteccionPendiente=false, siguienteDeteccion=0;
let sesionEfectos=0, ultimoRostro=0, vuelo=null, siguienteVuelo=0;

function cargarEfectos(){
  detectorRostro=ml5.faceMesh({maxFaces:1,refineLandmarks:false,flipped:true});
  orejaYoda=loadImage('assets/img/oreja-yoda.png');
  cascoVader=loadImage('assets/img/casco-vader.png');
  xWing=loadImage('assets/img/x-wing.png');
  cazaTIE=loadImage('assets/img/caza-tie.png');
}

function iniciarEfectos(){
  sesionEfectos++;
  poseRostro=null;
  siguienteDeteccion=0;
  vuelo=null;
  siguienteVuelo=millis()+3200;
}

function medirRostro(p){
  // Extremos del rostro, frente, mentón y extremos de los dos ojos.
  const indices=[234,454,10,152,33,133,362,263];
  if(!indices.every(i=>Number.isFinite(p?.[i]?.x)&&Number.isFinite(p[i].y)))return null;
  const ojoA={x:(p[33].x+p[133].x)/2,y:(p[33].y+p[133].y)/2};
  const ojoB={x:(p[362].x+p[263].x)/2,y:(p[362].y+p[263].y)/2};
  const [izq,der]=ojoA.x<=ojoB.x?[ojoA,ojoB]:[ojoB,ojoA];
  const ancho=Math.hypot(p[454].x-p[234].x,p[454].y-p[234].y);
  const alto=Math.hypot(p[152].x-p[10].x,p[152].y-p[10].y);
  if(ancho<8 || alto<12)return null;
  return {x:(izq.x+der.x)/2,y:(izq.y+der.y)/2,ancho,alto,
    angulo:Math.atan2(der.y-izq.y,der.x-izq.x)};
}

function actualizarRostro(ahora){
  if(deteccionPendiente || ahora<siguienteDeteccion || !camara?.elt || camara.elt.readyState<2)return;
  const sesion=sesionEfectos;
  deteccionPendiente=true;
  siguienteDeteccion=ahora+115;
  function fallo(){
    deteccionPendiente=false;
    poseRostro=null;
    siguienteDeteccion=millis()+1200;
  }
  try{
    const tarea=detectorRostro.detect(camara,caras=>{
      deteccionPendiente=false;
      if(sesion!==sesionEfectos || estado!=='jugando')return;
      const nueva=medirRostro(caras?.[0]?.keypoints);
      if(nueva && poseRostro && millis()-ultimoRostro<480){
        for(const campo of ['x','y','ancho','alto','angulo']){
          nueva[campo]=lerp(poseRostro[campo],nueva[campo],.72);
        }
      }
      poseRostro=nueva;
      ultimoRostro=millis();
    });
    if(tarea && typeof tarea.catch==='function')tarea.catch(fallo);
  }catch(error){fallo();}
}

function dibujarDisfraz(ahora){
  actualizarRostro(ahora);
  if(!poseRostro || ahora-ultimoRostro>650)return;
  const {x,y,ancho,alto,angulo}=poseRostro;
  // Misma escala y mismo recorte centrado que dibujarCamara().
  const k=max(width/640,height/480);
  push();
  translate((width-640*k)/2+x*k,(height-480*k)/2+y*k);
  rotate(angulo);
  scale(k);
  imageMode(CORNER);
  if(bando==='Jedi'){
    const largo=ancho*.85,altoOreja=alto*.35;
    for(const lado of [-1,1]){
      push();
      scale(lado,1);
      image(orejaYoda,ancho*.44,-altoOreja*.33,largo,altoOreja);
      pop();
    }
  }else{
    const w=ancho*1.52,h=alto*1.40;
    image(cascoVader,-w/2,-h*.485,w,h);
  }
  pop();
}

function dibujarVuelo(ahora){
  if(!vuelo){
    if(ahora<siguienteVuelo)return;
    vuelo={inicio:ahora,duracion:random(3200,4600),sentido:random()<.5?-1:1,
      altura:random(.22,.42),desnivel:random(-.07,.07)};
  }
  const t=(ahora-vuelo.inicio)/vuelo.duracion;
  if(t>=1){
    vuelo=null;
    siguienteVuelo=ahora+random(5500,9500);
    return;
  }
  const rebelde=bando==='Jedi';
  const sprite=rebelde?xWing:cazaTIE;
  const w=constrain(width*(rebelde ? .12 : .085),48,rebelde?145:105);
  const h=w*sprite.height/sprite.width;
  const avance=vuelo.sentido===1?t:1-t;
  const x=lerp(-w,width+w,avance);
  const y=height*(vuelo.altura+t*vuelo.desnivel-.045*sin(Math.PI*t));
  push();
  translate(x,y);
  scale(vuelo.sentido,1);
  rotate(.09*sin(2*Math.PI*t));
  imageMode(CENTER);
  image(sprite,0,0,w,h);
  pop();
}
