const ESPEJO = true;
const MAX_MANOS = 2;
let verPuntos = true;
const TAM_PUNTO = 14;
const COLORES_MANOS = ["#48BBBA", "#48BBBA"];

const VIDEO_ANCHO = 640;
const VIDEO_ALTO = 480;

let handPose;
let faceMesh;
let video;
let hands = [];
let faces = [];
let conexiones;
let detectando = false;

let escala = 1;
let margenX = 0;
let margenY = 0;


let imgComienzo
let imgInicio
let imgRegistro
let imgLara
let imgIvan
let imgMilo

let laraEvidencia
let laraEvidencia2
let laraEvidencia3
let ivanEvidencia
let ivanEvidencia2
let ivanEvidencia3
let miloEvidencia
let  miloEvidencia2
let miloEvidencia3



let gifRadar;
let gifCodigo;
let fontPixel;

let imgCumplida
let imgFallida
let exito = false

let imgCapturas = [];

// fotitos de cada sospechoso para la pantalla final
let laraMini
let ivanMini
let miloMini
let imgMinis = []

let sonidoSeleccion
let musicaFondo
let sonidoFin


let estado = "comienzo"; 

let imgX = 0;
let imgY = 0;
let imgW = 0;
let imgH = 0;

let umbralBoca = 0.07;
let umbralPinch = 0.25;


const CODIGO_X = 0.039;
const CODIGO_Y = 0.775;
const CODIGO_W = 0.107;
const CODIGO_H = 0.150;

const RADAR_X = 0.858;
const RADAR_Y = 0.772;
const RADAR_W = 0.108;
const RADAR_H = 0.150;

const AVISO_Y = 0.82;
const ZONA_REGISTRO = { x: 0.030, y: 0.335, w: 0.120, h: 0.105 };
const PANEL = { x: 0.20, y: 0.20, w: 0.60, h: 0.62 };
const ZONA_BLOQUEO = { x: 0.35, y: 0.80, w: 0.30, h: 0.20 };

// donde va la fotito abajo en cada pantalla final
const FOTO_CUMPLIDA = { x: 0.4245, y: 0.8495, w: 0.0371, h: 0.066 };
const FOTO_FALLIDA = { x: 0.4134, y: 0.8536, w: 0.0371, h: 0.066 };

const FRAMES_GRACIA = 6;
let framesRegistro = 0;

const SOSPECHOSOS = [
  { nombre: "LARA", zona: { x: 0.855, y: 0.145, w: 0.115, h: 0.160 } },
  { nombre: "IVAN", zona: { x: 0.855, y: 0.350, w: 0.115, h: 0.160 } },
  { nombre: "MILO", zona: { x: 0.855, y: 0.557, w: 0.115, h: 0.160 } }
];


const CORRECTA = { sospechoso: 0, evidencia: 0 };


const CARD_W = 0.14;
const INFO_FRAC = 0.24; 
const SUAVIZADO_POS = 0.35;
const SUAVIZADO_TAM = 0.2;
const ZOOM_MAX = 3;

let seleccionado = -1;
let cards = [];
let agarrada = null;
let manoX = 0;
let manoY = 0;
let offX = 0;
let offY = 0;
let framesSinMano = 0
let baseDist = 0
let baseTam = 1

let ganadora = null;
let finFrames = 0
let modo = "";          
let flashFrames = 0  
let flashOk = false

function preload() {
  handPose = ml5.handPose({ maxHands: MAX_MANOS, flipped: ESPEJO });
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: ESPEJO });

  imgComienzo = loadImage("assets/images/comenzar.png");
  imgInicio = loadImage("assets/images/inicio.png");
  imgRegistro = loadImage("assets/images/registro.png");
  imgLara = loadImage("assets/images/lara.png");
  imgIvan = loadImage("assets/images/ivan.png");
  imgMilo = loadImage("assets/images/milo.png");

  laraEvidencia = loadImage("assets/images/laraEvidencia.png")
  laraEvidencia2 = loadImage("assets/images/laraEvidencia2.png")
  laraEvidencia3 = loadImage("assets/images/laraEvidencia3.png")

  ivanEvidencia = loadImage("assets/images/ivanEvidencia.png")
  ivanEvidencia2 = loadImage("assets/images/ivanEvidencia2.png")
  ivanEvidencia3 = loadImage("assets/images/ivanEvidencia3.png")

  miloEvidencia = loadImage("assets/images/miloEvidencia.png")
  miloEvidencia2 = loadImage("assets/images/miloEvidencia2.png")
  miloEvidencia3 = loadImage("assets/images/miloEvidencia3.png")

  imgCumplida = loadImage("assets/images/misionCumplida.png")
  imgFallida = loadImage("assets/images/misionFallida.png")

  laraMini = loadImage("assets/images/laraMini.png")
  ivanMini = loadImage("assets/images/ivanMini.png")
  miloMini = loadImage("assets/images/miloMini.png")

  sonidoSeleccion = loadSound("assets/sounds/seleccion2.mp3")
  musicaFondo = loadSound("assets/sounds/data.syntax.mp3")
  sonidoFin = loadSound("assets/sounds/tecnologia.mp3")

  gifRadar = loadImage("assets/images/radar.gif");
  gifCodigo = loadImage("assets/images/codigo.gif");

  fontPixel = loadFont("assets/font/GeistPixel-Regular-VariableFont_ELSH.ttf");
}

function setup() {
  textFont(fontPixel);
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: ESPEJO });
  video.size(VIDEO_ANCHO, VIDEO_ALTO);
  video.hide();
  conexiones = handPose.getConnections();
  cargarCapturas();
  calcularImagen();
  calcularEscala();
}

function cargarCapturas() {
  imgCapturas = [
    [laraEvidencia, laraEvidencia2, laraEvidencia3],
    [ivanEvidencia, ivanEvidencia2, ivanEvidencia3],
    [miloEvidencia, miloEvidencia2, miloEvidencia3]
  ];
  // mismo orden que SOSPECHOSOS (lara, ivan, milo)
  imgMinis = [laraMini, ivanMini, miloMini]
}


function draw() {
  background(0);

  if (estado === "comienzo") {
    mostrarPantalla(imgComienzo);
    return;
  }


  recortarAImagen();
  image(video, margenX, margenY, VIDEO_ANCHO * escala, VIDEO_ALTO * escala);
  quitarRecorte();

  
  // en el final la pantalla del juego se va apagando asi no se ve atras
  if (estado === "fin") tint(255, 255 * (1 - min(finFrames / 30, 1)))
  image(imgInicio, imgX, imgY, imgW, imgH);
  noTint()
  dibujarGif(gifRadar, RADAR_X, RADAR_Y, RADAR_W, RADAR_H);
  dibujarGif(gifCodigo, CODIGO_X, CODIGO_Y, CODIGO_W, CODIGO_H);


  if (estado === "inicio") {
    elegirSospechoso();
    actualizarCards();
  }

  dibujarBordeSospechoso();

  
  if (apuntandoA(ZONA_REGISTRO)) {
    framesRegistro = FRAMES_GRACIA;
  } else if (framesRegistro > 0) {
    framesRegistro--;
  }

  if (estado === "inicio") {
    dibujarInfo();
    dibujarCards();
 if (framesRegistro > 0) dibujarPanel(imgRegistro)
  }

  recortarAImagen();
  if (verPuntos) {
    dibujarManos();
    dibujarCara();
    dibujarBoca();
  }
  quitarRecorte();

  mostrarAviso();
  dibujarFlashBloqueo();

  if (estado === "fin") mostrarFin();
}


function elegirSospechoso() {
  if (agarrada) return;
  for (let i = 0; i < SOSPECHOSOS.length; i++) {
    if (i !== seleccionado && apuntandoA(SOSPECHOSOS[i].zona)) {
      seleccionado = i;
      crearCards();
      sonidoSeleccion.play()
    }
  }
}

function crearCards() {
  cards = [];
  agarrada = null;
  modo = "";
  let imgs = imgCapturas[seleccionado];
  for (let j = 0; j < imgs.length; j++) {
    let img = imgs[j];
    let w = imgW * CARD_W;
    let h = w * img.height / img.width;
    let cx = imgX + imgW * (PANEL.x + PANEL.w * (INFO_FRAC + (1 - INFO_FRAC) * (j + 0.5) / 3));
    let cy = imgY + imgH * (PANEL.y + PANEL.h / 2);
    cards.push({
      img: img,
      indice: j,
      homeX: cx,
      homeY: cy,
      x: cx,
      y: cy,
      tam: 1,
      tamObj: 1,
      baseW: w,
      baseH: h,
      error: 0
    });
  }
}

function dentroDeCard(c, px, py) {
  let w = c.baseW * c.tam;
  let h = c.baseH * c.tam;
  return abs(px - c.x) < w / 2 && abs(py - c.y) < h / 2;
}


function esquinas(c) {
  let w = c.baseW * c.tam / 2;
  let h = c.baseH * c.tam / 2;
  return [
    { x: c.x - w, y: c.y - h },
    { x: c.x + w, y: c.y - h },
    { x: c.x + w, y: c.y + h },
    { x: c.x - w, y: c.y + h }
  ];
}

function radioEsquina(c) {
  return constrain(min(c.baseW, c.baseH) * c.tam * 0.3, 35, 90);
}


function esquinaCerca(c, px, py) {
  let es = esquinas(c);
  let r = radioEsquina(c);
  let mejor = -1;
  let mejorD = r;
  for (let i = 0; i < 4; i++) {
    let d = dist(px, py, es[i].x, es[i].y);
    if (d < mejorD) {
      mejorD = d;
      mejor = i;
    }
  }
  return mejor;
}

function ambasEnEsquinasOpuestas(c, a, b) {
  let ia = esquinaCerca(c, a.x, a.y);
  let ib = esquinaCerca(c, b.x, b.y);
  return ia >= 0 && ib >= 0 && (ia + 2) % 4 === ib;
}

function pinzas() {
  let lista = [];
  for (let mano of hands) {
    let p = datosPinch(mano);
    if (p.ratio < umbralPinch) lista.push(p);
  }
  return lista;
}


function zoomear(c, a, b) {
  let diag = sqrt(c.baseW * c.baseW + c.baseH * c.baseH);
  let d = dist(a.x, a.y, b.x, b.y);
  c.tamObj = constrain(d / diag, 1, ZOOM_MAX);
  c.x = lerp(c.x, (a.x + b.x) / 2, 0.5);
  c.y = lerp(c.y, (a.y + b.y) / 2, 0.5);
}

function actualizarCards() {
  if (cards.length === 0) return;

  
  for (let c of cards) {
    if (c.error > 0) {
      c.error--;
      if (c.error === 0) {
        c.x = c.homeX;
        c.y = c.homeY;
        c.tamObj = 1;
      }
    }
  }

  let ps = pinzas();

  if (!agarrada) {

    for (let p of ps) {
      for (let i = cards.length - 1; i >= 0; i--) {
        let c = cards[i];
        if (c.error > 0) continue;
        if (dentroDeCard(c, p.x, p.y) || esquinaCerca(c, p.x, p.y) >= 0) {
          agarrada = c;
          modo = "mover";
          manoX = p.x;
          manoY = p.y;
          offX = c.x - p.x;
          offY = c.y - p.y;
          framesSinMano = 0;
          cards.splice(i, 1);
          cards.push(c);
          sonidoSeleccion.play()
          break;
        }
      }
      if (agarrada) break;
    }
  } else {
    if (ps.length === 0) {
      framesSinMano++;
      if (framesSinMano > FRAMES_GRACIA) soltarCard();
    } else {
      framesSinMano = 0;

   
      ps.sort((a, b) => dist(a.x, a.y, manoX, manoY) - dist(b.x, b.y, manoX, manoY));
      let prim = ps[0];
      let sec = ps.length >= 2 ? ps[1] : null;
      manoX = prim.x;
      manoY = prim.y;

      if (modo === "zoom") {
        if (sec) {
          zoomear(agarrada, prim, sec);
        } else {
         
          modo = "mover";
          offX = agarrada.x - prim.x;
          offY = agarrada.y - prim.y;
        }
      } else if (sec && ambasEnEsquinasOpuestas(agarrada, prim, sec)) {
        modo = "zoom";
        zoomear(agarrada, prim, sec);
      } else {
        agarrada.x = lerp(agarrada.x, prim.x + offX, SUAVIZADO_POS);
        agarrada.y = lerp(agarrada.y, prim.y + offY, SUAVIZADO_POS);
      }
    }
  }

  for (let c of cards) {
    let k = (c === agarrada && modo === "zoom") ? 0.5 : SUAVIZADO_TAM;
    c.tam = lerp(c.tam, c.tamObj, k);
  }
}

function soltarCard() {
  let c = agarrada;
  agarrada = null;
  modo = "";
  if (!c) return;

  if (dentroDeZona(c.x, c.y, ZONA_BLOQUEO)) {
  exito = (seleccionado === CORRECTA.sospechoso && c.indice === CORRECTA.evidencia) 
      estado = "fin";
      finFrames = 0;
      // corta la musica y suena el cierre
      musicaFondo.stop()
      sonidoFin.play()
    }
}


function dibujarCards() {
  push();
  imageMode(CENTER);
  rectMode(CENTER);
  for (let c of cards) {
    let w = c.baseW * c.tam;
    let h = c.baseH * c.tam;
    let sx = 0;
    if (c.error > 0) {
      sx = sin(frameCount * 1.8) * 10 * (c.error / 40);
      tint(255, 90, 90);
    }
    image(c.img, c.x + sx, c.y, w, h);
    noTint();
    if (c.error > 0) {
      noFill();
      stroke("#ff3030");
      strokeWeight(5);
      rect(c.x + sx, c.y, w, h);
    }
  }
  pop();

  dibujarVertices();
}


function dibujarVertices() {
  let ps = pinzas();
  push();
  rectMode(CENTER);
  for (let c of cards) {
    if (c.error > 0) continue;
    let es = esquinas(c);
    let r = radioEsquina(c);
    for (let i = 0; i < 4; i++) {
      let activo = false;
      for (let p of ps) {
        if (dist(p.x, p.y, es[i].x, es[i].y) < r) activo = true;
      }
      if (c === agarrada && modo === "zoom") activo = true;
      if (activo) {
        noStroke();
        fill("#2df526");
        rect(es[i].x, es[i].y, 22, 22);
      } else {
        noFill();
        stroke("#48BBBA");
        strokeWeight(2);
        rect(es[i].x, es[i].y, 12, 12);
      }
    }
  }
  pop();
}

function dibujarBordeSospechoso() {
  if (seleccionado < 0) return;
  let z = SOSPECHOSOS[seleccionado].zona;
  push();
  noFill();
  stroke("#2df526");
  strokeWeight(4);
  rect(imgX + imgW * z.x, imgY + imgH * z.y, imgW * z.w, imgH * z.h);
  pop();
}

function dibujarFlashBloqueo() {
  let z = ZONA_BLOQUEO;
  let x = imgX + imgW * z.x;
  let y = imgY + imgH * z.y;
  let w = imgW * z.w;
  let h = imgH * z.h;

  push();
  
  if (agarrada && dentroDeZona(agarrada.x, agarrada.y, ZONA_BLOQUEO)) {
    noFill();
    stroke("#2df526");
    strokeWeight(3);
    rect(x, y, w, h);
  }
  // Destello rojo al fallar
  if (flashFrames > 0) {
    noStroke();
    let a = map(flashFrames, 0, 40, 0, 170);
    if (flashOk) fill(45, 245, 38, a);
    else fill(255, 48, 48, a);
    rect(x, y, w, h);
    flashFrames--;
  }
  pop();
}

function dibujarInfo() {
  if (seleccionado < 0) return;
  let img = [imgLara, imgIvan, imgMilo][seleccionado];
  let bx = imgX + imgW * PANEL.x;
  let by = imgY + imgH * PANEL.y;
  let bw = imgW * PANEL.w * INFO_FRAC;
  let bh = imgH * PANEL.h;

  let e = min(bw / img.width, bh / img.height);
  let w = img.width * e;
  let h = img.height * e;
  image(img, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
}


function animarGanadora() {
  if (!ganadora) return;
  finFrames++;
  let z = ZONA_BLOQUEO;
  let zx = imgX + imgW * (z.x + z.w / 2);
  let zy = imgY + imgH * (z.y + z.h / 2);
  let fit = min(imgW * z.w * 0.9 / ganadora.baseW, imgH * z.h * 0.9 / ganadora.baseH);
  ganadora.x = lerp(ganadora.x, zx, 0.2);
  ganadora.y = lerp(ganadora.y, zy, 0.2);
  ganadora.tam = lerp(ganadora.tam, fit, 0.2);
}

function dibujarGanadora() {
  if (!ganadora) return;
  let c = ganadora;
  let w = c.baseW * c.tam;
  let h = c.baseH * c.tam;
  push();
  imageMode(CENTER);
  rectMode(CENTER);
  image(c.img, c.x, c.y, w, h);
  noFill();
  stroke(45, 245, 38, 140 + 115 * sin(frameCount * 0.15));
  strokeWeight(5);
  rect(c.x, c.y, w, h);
  pop();
}

function mostrarFin() {
  finFrames++
  let t = min(finFrames / 30, 1)
  let ease = 1 - pow(1 - t, 3)

  let img = exito ? imgCumplida : imgFallida

  push()
  tint(255, 255 * ease)
  image(img, imgX, imgY, imgW, imgH)
  dibujarFotoFin()
  noTint();
  pop()
}

// dibuja abajo la fotito del sospechoso que elegiste (bien o mal)
function dibujarFotoFin() {
  if (seleccionado < 0) return
  let z = exito ? FOTO_CUMPLIDA : FOTO_FALLIDA
  let foto = imgMinis[seleccionado]
  image(foto, imgX + imgW * z.x, imgY + imgH * z.y, imgW * z.w, imgH * z.h)
}


function reiniciarJuego() {
  seleccionado = -1;
  cards = [];
  agarrada = null;
  baseDist = 0;
  flashFrames = 0;
  modo = "";
  ganadora = null;
  finFrames = 0;
  framesRegistro = 0;
  exito = false
  sonidoFin.stop()
}


function datosPinch(mano) {
  let k = mano.keypoints;
  let tam = dist(k[0].x, k[0].y, k[9].x, k[9].y);
  let d = dist(k[4].x, k[4].y, k[8].x, k[8].y);
  return {
    x: (k[4].x + k[8].x) / 2,
    y: (k[4].y + k[8].y) / 2,
    ratio: d / tam
  };
}

function estaApuntando(mano) {
  let k = mano.keypoints;
  let muneca = k[0];

  let indiceExtendido =
    dist(k[8].x, k[8].y, muneca.x, muneca.y) > dist(k[6].x, k[6].y, muneca.x, muneca.y);
  if (!indiceExtendido) return false;

  let otros = [[12, 10], [16, 14], [20, 18]];
  for (let d of otros) {
    let punta = dist(k[d[0]].x, k[d[0]].y, muneca.x, muneca.y);
    let medio = dist(k[d[1]].x, k[d[1]].y, muneca.x, muneca.y);
    if (punta > medio) return false;
  }

  return datosPinch(mano).ratio > 0.5;
}

function dentroDeZona(px, py, zona) {
  let x = imgX + imgW * zona.x;
  let y = imgY + imgH * zona.y;
  let w = imgW * zona.w;
  let h = imgH * zona.h;
  return px > x && px < x + w && py > y && py < y + h;
}

function apuntandoA(zona) {
  for (let mano of hands) {
    if (!estaApuntando(mano)) continue;
    let punta = mano.keypoints[8];
    if (dentroDeZona(punta.x, punta.y, zona)) return true;
  }
  return false;
}

function bocaAbierta() {
  if (faces.length === 0) return false;
  let k = faces[0].keypoints;
  let apertura = dist(k[13].x, k[13].y, k[14].x, k[14].y);
  let altoCara = dist(k[10].x, k[10].y, k[152].x, k[152].y);
  return apertura / altoCara > umbralBoca;
}

function hayPuno() {
  let dedos = [[8, 6], [12, 10], [16, 14], [20, 18]];
  for (let mano of hands) {
    let k = mano.keypoints;
    let cerrado = true;
    for (let d of dedos) {
      let punta = dist(k[d[0]].x, k[d[0]].y, k[0].x, k[0].y);
      let medio = dist(k[d[1]].x, k[d[1]].y, k[0].x, k[0].y);
      if (punta > medio) cerrado = false;
    }
    if (cerrado) return true;
  }
  return false;
}


function gotHands(results) {
  calcularManos(results);
}

function gotFaces(results) {
  calcularCara(results);
}

function calcularManos(results) {
  for (let mano of results) {
    for (let kp of mano.keypoints) {
      kp.x = kp.x * escala + margenX;
      kp.y = kp.y * escala + margenY;
      mano[kp.name] = { x: kp.x, y: kp.y };
    }
  }
  hands = results;
}

function calcularCara(results) {
  for (let cara of results) {
    for (let kp of cara.keypoints) {
      kp.x = kp.x * escala + margenX;
      kp.y = kp.y * escala + margenY;
    }
  }
  faces = results;
}


function calcularEscala() {
  escala = max(imgW / VIDEO_ANCHO, imgH / VIDEO_ALTO);
  margenX = imgX + (imgW - VIDEO_ANCHO * escala) / 2;
  margenY = imgY + (imgH - VIDEO_ALTO * escala) / 2;
}

function calcularImagen() {
  let e = max(width / imgInicio.width, height / imgInicio.height);
  imgW = imgInicio.width * e;
  imgH = imgInicio.height * e;
  imgX = (width - imgW) / 2;
  imgY = (height - imgH) / 2;
}

function recortarAImagen() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(imgX, imgY, imgW, imgH);
  drawingContext.clip();
}

function quitarRecorte() {
  drawingContext.restore();
}


function dibujarGif(gif, nx, ny, nw, nh) {
  let bx = imgX + imgW * nx;
  let by = imgY + imgH * ny;
  let bw = imgW * nw;
  let bh = imgH * nh;

  let e = min(bw / gif.width, bh / gif.height);
  let w = gif.width * e;
  let h = gif.height * e;

  push();
  blendMode(SCREEN);
  image(gif, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
  blendMode(BLEND);
  pop();
}

function dibujarPanel(img) {
  let bx = imgX + imgW * PANEL.x;
  let by = imgY + imgH * PANEL.y;
  let bw = imgW * PANEL.w;
  let bh = imgH * PANEL.h;

  let e = min(bw / img.width, bh / img.height);
  let w = img.width * e;
  let h = img.height * e;

  image(img, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
}

function dibujarCara() {
  if (faces.length === 0) return;
  let cara = faces[0];

  push();
  stroke("#48BBBA");
  strokeWeight(3);
  beginShape(POINTS);
  for (let i = 0; i < cara.keypoints.length; i++) {
    let kp = cara.keypoints[i];
    vertex(kp.x, kp.y);
  }
  endShape();
  pop();
}

function dibujarManos() {
  for (let i = 0; i < hands.length; i++) {
    let mano = hands[i];
    let col = COLORES_MANOS[i % COLORES_MANOS.length];

    push();
    strokeJoin(ROUND);

    stroke(col);
    strokeWeight(3);
    for (let c of conexiones) {
      let a = mano.keypoints[c[0]];
      let b = mano.keypoints[c[1]];
      line(a.x, a.y, b.x, b.y);
    }

    noStroke();
    fill(col);
    for (let j = 0; j < mano.keypoints.length; j++) {
      let kp = mano.keypoints[j];
      circle(kp.x, kp.y, TAM_PUNTO);
    }

    pop();
  }
}

function dibujarBoca() {
  if (faces.length === 0) return;
  let k = faces[0].keypoints;
  let abierta = bocaAbierta();
  push();
  stroke(abierta ? "#2df526" : "#48BBBA");
  strokeWeight(3);
  line(k[13].x, k[13].y, k[14].x, k[14].y);
  noStroke();
  fill(abierta ? "#2df526" : "#48BBBA");
  circle(k[13].x, k[13].y, 8);
  circle(k[14].x, k[14].y, 8);
  pop();
}

function mostrarAviso() {
  if (hands.length === 0) {
    push();
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("Mostrá una mano a la cámara", width / 2, imgY + imgH * AVISO_Y);
    pop();
  }
}

function mostrarPantalla(img) {
  let e = min(width / img.width, height / img.height);
  push();
  imageMode(CENTER);
  image(img, width / 2, height / 2, img.width * e, img.height * e);
  pop();
}


function keyPressed() {
  if (estado === "comienzo") {
    if (key === "n" || key === "N") {
      estado = "inicio";
      if (!detectando) {
        handPose.detectStart(video, gotHands);
        faceMesh.detectStart(video, gotFaces);
        detectando = true;
      }
      // la musica arranca cuando empieza el juego
      musicaFondo.setVolume(0.3)
      if (!musicaFondo.isPlaying()) musicaFondo.loop()
    }
    return;
  }

  if (estado === "fin" && (key === "r" || key === "R")) {
    reiniciarJuego();
    estado = "comienzo";
    return;
  }

  if (key === "p" || key === "P") verPuntos = !verPuntos;
  if (key === "f" || key === "F") fullscreen(!fullscreen());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcularImagen();
  calcularEscala();
  if (seleccionado >= 0) crearCards();
}