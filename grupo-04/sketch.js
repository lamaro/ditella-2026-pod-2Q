const ESPEJO = true;
const MAX_MANOS = 2;
const VIDEO_ANCHO = 640;
const VIDEO_ALTO = 480;
const MAX_FLORES = 60;
const ANCHO_LLUVIA = 120;
const RADIO_FLORECER = 220;
const VEL_CRECER = 0.012;
const VENTANA_GESTO = 700;
const UMBRAL_BARRIDO = 1.8;
const ESPERA_CIELO = 1500;
const MAX_ENREDADERAS = 14;
const SEG_PUNOS = 2;
const DURACION_HECHIZO = 3400;

const paletas = [
  ["#ffb6e5", "#f779c5", "#e17de9", "#ffc5cf"],
  ["#75f6ff", "#4ab9f5", "#9cddff", "#b3fff4"],
  ["#ffce72", "#ff8957", "#ffe8a2", "#ffb88c"],
  ["#b4f58c", "#57d7ac", "#d8ff9b", "#7cf3ce"],
  ["#c2a0ff", "#8d7bea", "#edb5ff", "#aaa9ff"],
];
const nombresPaletas = ["Rosa", "Celeste", "Ámbar", "Menta", "Violeta"];
const notasPaletas = [1.0, 1.122, 1.26, 1.498, 1.682];

let handPose;
let video;
let hands = [];
let conexiones;
let escala = 1;
let margenX = 0;
let margenY = 0;

let imgFlores = [];
let imgBrillo;
let imgSemilla;
let imgLuna;
let sndPlantar;
let sndFlorecer;
let sndLluvia;
let sndAmbiente;
let fTitulo;
let fCuerpo;
let fNegrita;
let silenciado = false;

let estado = "inicio";
let pausado = false;
let flores = [];
let chispas = [];
let gotas = [];
let particulas = [];
let enredaderas = [];
let rectTarjetas = [];
let estrellas = [];
let historial = [];
let paletaActual = 0;
let etapa = 0;
let etapaSuave = 0;
let verPuntos = true;
let verAyuda = true;
let u = 1;

let pellizcando = false;
let lloviendo = false;
let haciendoEnredadera = false;
let ultimaEnredadera = 0;
let victoriaDesde = 0;
let paletaCambiada = false;
let punosDesde = 0;
let ultimoSembrado = 0;
let ultimoCielo = 0;
let ultimaLluvia = 0;
let cambiosCielo = 0;

let hechizoDesde = 0;
let hechizoDestino = "final";
let hechizoX = 0;
let hechizoY = 0;
let finalDesde = 0;
let segundosJardin = 0;
let tInicio = 0;
let totalSembradas = 0;
let totalFloridas = 0;
let avisoTexto = "";
let avisoHasta = 0;
let botonX = 0;
let botonY = 0;
let botonAncho = 0;
let botonAlto = 0;
let hayBoton = false;

// Carga fuentes, imágenes, sonidos y el handPose
function preload() {
  fTitulo = loadFont("assets/fonts/PlayfairDisplay_500Medium_Italic.ttf");
  fCuerpo = loadFont("assets/fonts/DMSans_400Regular.ttf");
  fNegrita = loadFont("assets/fonts/DMSans_700Bold.ttf");

  imgFlores[0] = loadImage("assets/img/flor_a.png");
  imgFlores[1] = loadImage("assets/img/flor_b.png");
  imgFlores[2] = loadImage("assets/img/flor_c.png");
  imgBrillo = loadImage("assets/img/brillo.png");
  imgSemilla = loadImage("assets/img/semilla.png");
  imgLuna = loadImage("assets/img/luna.png");

  sndPlantar = loadSound("assets/audio/plantar.wav");
  sndFlorecer = loadSound("assets/audio/florecer.wav");
  sndLluvia = loadSound("assets/audio/lluvia.wav");
  sndAmbiente = loadSound("assets/audio/ambiente.wav");

  handPose = ml5.handPose({ maxHands: MAX_MANOS, flipped: ESPEJO });
}

// Crea el canvas, prende la cámara y arranca la detección
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  video = createCapture(VIDEO, { flipped: ESPEJO });
  video.size(VIDEO_ANCHO, VIDEO_ALTO);
  video.hide();

  handPose.detectStart(video, gotHands);
  conexiones = handPose.getConnections();

  calcularEscala();
  crearEstrellas();
}

// Llena el array de estrellas del fondo
function crearEstrellas() {
  estrellas = [];
  for (let i = 0; i < 60; i++) {
    let estrella = {
      x: random(width),
      y: random(height),
      tam: random(1.5, 3.5),
      fase: random(TWO_PI),
      vel: random(0.01, 0.04),
    };
    estrellas.push(estrella);
  }
}

// Recibe las manos de ml5 y pasa sus puntos a coordenadas de pantalla
function gotHands(results) {
  for (let i = 0; i < results.length; i++) {
    let mano = results[i];
    for (let j = 0; j < mano.keypoints.length; j++) {
      let kp = mano.keypoints[j];
      kp.x = kp.x * escala + margenX;
      kp.y = kp.y * escala + margenY;
    }
  }
  hands = results;
}

// Calcula cómo agrandar el video para cubrir la pantalla
function calcularEscala() {
  escala = max(width / VIDEO_ANCHO, height / VIDEO_ALTO);
  margenX = (width - VIDEO_ANCHO * escala) / 2;
  margenY = (height - VIDEO_ALTO * escala) / 2;
}

// Dibuja el fondo y la pantalla que corresponde según el estado
function draw() {
  u = constrain(min(width / 1280, height / 760), 0.6, 1.4);
  hayBoton = false;
  actualizarEtapa();
  dibujarFondo();

  if (estado === "inicio") {
    dibujarInicio();
  } else if (estado === "jardin") {
    dibujarJardin();
  } else if (estado === "hechizo") {
    if (hechizoDestino === "final") {
      dibujarJardin();
    } else {
      dibujarFinal();
    }
    dibujarHechizo();
  } else if (estado === "final") {
    dibujarFinal();
  }
}

// Cuenta cuántas flores están abiertas
function contarAbiertas() {
  let n = 0;
  for (let i = 0; i < flores.length; i++) {
    if (flores[i].abierta > 0.5) n++;
  }
  return n;
}

// Acerca de a poco el cielo a día o noche y ajusta el sonido ambiente
function actualizarEtapa() {
  etapaSuave = lerp(etapaSuave, etapa, 0.02);

  if (sndAmbiente.isPlaying() && !silenciado && estado === "jardin") {
    sndAmbiente.setVolume(0.18 + 0.2 * etapaSuave, 0.3);
  }
}

// Devuelve el nombre del momento del día que se ve
function nombreMomento() {
  if (abs(etapaSuave - etapa) < 0.15) {
    if (etapa === 0) {
      return "Día";
    } else {
      return "Noche";
    }
  }
  if (etapa === 2) {
    return "Atardecer";
  } else {
    return "Amanecer";
  }
}

// Dibuja la cámara, el cielo, el sol, la luna y las estrellas
function dibujarFondo() {
  background(6, 11, 21);

  tint(200, 215, 240, 170);
  image(video, margenX, margenY, VIDEO_ANCHO * escala, VIDEO_ALTO * escala);
  noTint();

  let dia = color(70, 120, 180, 120);
  let atardecer = color(190, 90, 100, 125);
  let noche = color(3, 7, 18, 160);
  let capa;
  if (etapaSuave < 1) {
    capa = lerpColor(dia, atardecer, etapaSuave);
  } else {
    capa = lerpColor(atardecer, noche, etapaSuave - 1);
  }
  noStroke();
  fill(capa);
  rect(0, 0, width, height);

  imageMode(CENTER);
  let alturaSol = lerp(0.17, 0.8, constrain(etapaSuave, 0, 1));
  let brilloSol = constrain(1.3 - etapaSuave, 0, 1);
  blendMode(ADD);
  tint(255, 220, 150, 200 * brilloSol);
  image(imgBrillo, width * 0.14, height * alturaSol, 260, 260);
  blendMode(BLEND);
  noTint();
  fill(255, 240, 190, 255 * brilloSol);
  circle(width * 0.14, height * alturaSol, 64);

  let intensidad = max(0, 1 - abs(etapaSuave - 1));
  blendMode(ADD);
  tint(255, 150, 100, 130 * intensidad);
  image(imgBrillo, width / 2, height * 1.05, width * 1.4, height * 0.9);
  blendMode(BLEND);

  tint(210, 220, 255, 220 * constrain(etapaSuave - 0.9, 0, 1));
  image(imgLuna, width * 0.86, height * 0.17, 130, 130);
  noTint();
  imageMode(CORNER);

  noStroke();
  let visibilidad = constrain(etapaSuave - 0.8, 0, 1);
  for (let i = 0; i < estrellas.length; i++) {
    let e = estrellas[i];
    e.fase = e.fase + e.vel;
    fill(190, 210, 250, (60 + sin(e.fase) * 45) * visibilidad);
    circle(e.x, e.y, e.tam);
  }
}

// Pantalla de inicio: título, instrucciones, sensores y botón
function dibujarInicio() {
  noStroke();
  fill(4, 8, 16, 150);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textFont(fNegrita);
  fill(170, 190, 215);
  textSize(12 * u);
  text("J A R D Í N   I N T E R A C T I V O", width / 2, height * 0.06);

  textFont(fNegrita);
  fill(245, 243, 255);
  textSize(80 * u);
  text("Cultivar", width / 2, height * 0.14);
  textFont(fTitulo);
  fill(216, 167, 238);
  text("la luz.", width / 2, height * 0.14 + 74 * u);

  textFont(fCuerpo);
  fill(200, 208, 220);
  textSize(16 * u);
  text("Tu cámara es el terreno. Tus manos hacen crecer un jardín, mueven el cielo y lanzan hechizos.", width / 2, height * 0.14 + 140 * u);

  let titulos = ["SEMBRAR", "LLUVIA", "ENREDADERAS", "PALETAS", "DÍA Y NOCHE", "HECHIZO"];
  let textos = [
    "Pellizcá con pulgar e índice para plantar una semilla.",
    "Las dos manos abiertas, con las palmas hacia abajo, como bendiciendo el jardín: llueve y las plantas crecen.",
    "Poné un puño sobre el otro: nacen enredaderas que trepan hasta tus manos.",
    "Hacé la V de la paz (índice y medio) un instante para cambiar de paleta.",
    "Con una sola mano abierta: subila como el sol que sale y es de día; bajala y es de noche.",
    "Los dos puños lado a lado durante 2 segundos: un hechizo borra el jardín y lo reinicia.",
  ];
  let separacion = 12 * u;
  let ancho = min(width - 60, 1140 * u);
  let anchoTarjeta = (ancho - separacion * 2) / 3;
  let altoTarjeta = 132 * u;
  let x0 = (width - ancho) / 2;
  let y0 = height * 0.14 + 186 * u;
  rectTarjetas = [];
  for (let i = 0; i < 6; i++) {
    let x = x0 + (i % 3) * (anchoTarjeta + separacion);
    let y = y0 + floor(i / 3) * (altoTarjeta + separacion);
    dibujarTarjeta(x, y, anchoTarjeta, altoTarjeta, titulos[i], textos[i], i);
    rectTarjetas.push({ x: x, y: y, w: anchoTarjeta, h: altoTarjeta });
  }
  let yBoton = y0 + 2 * (altoTarjeta + separacion) + 8 * u;

  dibujarBoton(width / 2, yBoton, 300 * u, 50 * u, "ENTRAR AL JARDÍN  (ENTER)");

  let camaraLista = video.elt.readyState >= 2;
  let nombres = ["cámara", "mano"];
  let detectado = [camaraLista, hands.length > 0];
  let ySensores = yBoton + 50 * u + 24 * u;
  textFont(fCuerpo);
  textSize(13 * u);
  for (let i = 0; i < 2; i++) {
    let x = width / 2 + (i - 0.5) * 190 * u;
    if (detectado[i]) {
      fill(150, 245, 180);
    } else {
      fill(120, 130, 150);
    }
    circle(x - 40 * u, ySensores, 9 * u);
    textAlign(LEFT, CENTER);
    if (detectado[i]) {
      text(nombres[i] + " detectada", x - 30 * u, ySensores);
    } else {
      text(nombres[i] + " sin detectar", x - 30 * u, ySensores);
    }
  }
  textAlign(CENTER, CENTER);
  fill(130, 145, 160);
  textSize(12 * u);
  text("Permití el acceso a la cámara · Mejor con buena luz · También se puede probar con el teclado", width / 2, ySensores + 24 * u);

  if (verPuntos) {
    dibujarManos(120);
  }
}

// Dibuja una tarjeta de instrucción con su ilustración y texto
function dibujarTarjeta(x, y, ancho, alto, titulo, texto, indice) {
  fill(255, 255, 255, 16);
  stroke(255, 255, 255, 40);
  strokeWeight(1);
  rect(x, y, ancho, alto, 14 * u);

  let anchoIlu = 150 * u;
  noStroke();
  fill(4, 8, 16, 120);
  rect(x + 8 * u, y + 8 * u, anchoIlu, alto - 16 * u, 10 * u);
  dibujarIlustracion(indice, x + 8 * u, y + 8 * u, anchoIlu, alto - 16 * u);

  let xTexto = x + anchoIlu + 22 * u;
  let anchoTexto = ancho - anchoIlu - 34 * u;
  noStroke();
  textAlign(LEFT, TOP);
  textFont(fNegrita);
  fill(207, 169, 236);
  textSize(11 * u);
  text(titulo, xTexto, y + 16 * u);
  textFont(fCuerpo);
  fill(215, 216, 225);
  textSize(12.5 * u);
  text(texto, xTexto, y + 38 * u, anchoTexto, alto - 44 * u);
}

// Suaviza un valor de 0 a 1 para que arranque y frene despacio
function suavizar(t) {
  return t * t * (3 - 2 * t);
}

// Dibuja una flecha entre dos puntos
function dibujarFlecha(x1, y1, x2, y2, alfa) {
  stroke(255, 255, 255, alfa);
  strokeWeight(max(1.5, 2 * u));
  line(x1, y1, x2, y2);
  let ang = atan2(y2 - y1, x2 - x1);
  let punta = 6 * u;
  line(x2, y2, x2 - cos(ang - 0.5) * punta, y2 - sin(ang - 0.5) * punta);
  line(x2, y2, x2 - cos(ang + 0.5) * punta, y2 - sin(ang + 0.5) * punta);
}

// Dibuja una mano esquemática para las ilustraciones
function dibujarManoIcono(x, y, tam, modo, ang, alfa, abertura) {
  push();
  translate(x, y);
  rotate(ang);
  stroke(241, 223, 61, alfa);
  strokeWeight(max(1.5, tam * 0.06));
  fill(241, 223, 61, alfa * 0.2);
  circle(0, 0, tam * 0.8);

  if (modo === "puno") {
    fill(241, 223, 61, alfa);
    for (let i = 0; i < 4; i++) {
      circle((i - 1.5) * tam * 0.2, -tam * 0.36, tam * 0.17);
    }
  } else if (modo === "pinza") {
    line(-tam * 0.15, -tam * 0.3, -abertura / 2, -tam * 0.95);
    line(tam * 0.2, -tam * 0.2, abertura / 2, -tam * 0.88);
    fill(241, 223, 61, alfa);
    circle(-abertura / 2, -tam * 0.95, tam * 0.12);
    circle(abertura / 2, -tam * 0.88, tam * 0.12);
    for (let i = 0; i < 3; i++) {
      line(i * tam * 0.13 - 0.02 * tam, -tam * 0.38, i * tam * 0.13 + 0.05 * tam, -tam * 0.55);
    }
  } else {
    let dedos = [[-65, 0.6], [-22, 0.95], [0, 1.05], [22, 0.95], [42, 0.75]];
    if (modo === "victoria") {
      dedos = [[-65, 0.3], [-10, 1.0], [10, 1.05], [28, 0.35], [44, 0.3]];
    }
    fill(241, 223, 61, alfa);
    for (let i = 0; i < dedos.length; i++) {
      let a = radians(dedos[i][0]);
      let l = dedos[i][1];
      line(sin(a) * tam * 0.35, -cos(a) * tam * 0.35, sin(a) * tam * (0.35 + 0.65 * l), -cos(a) * tam * (0.35 + 0.65 * l));
      circle(sin(a) * tam * (0.35 + 0.65 * l), -cos(a) * tam * (0.35 + 0.65 * l), tam * 0.1);
    }
  }
  pop();
}

// Dibuja la animación del gesto número i
function dibujarIlustracion(i, x, y, w, h) {
  let t = (millis() % 2400) / 2400;
  let cx = x + w / 2;
  let tam = h * 0.36;
  noStroke();

  if (i === 0) {
    let p = suavizar(constrain(t / 0.5, 0, 1));
    let sepInicial = tam * 0.9;
    let sep = lerp(sepInicial, tam * 0.06, p);
    let yMano = y + h * 0.72;
    dibujarManoIcono(cx, yMano, tam, "pinza", 0, 70, sepInicial);
    dibujarManoIcono(cx, yMano, tam, "pinza", 0, 255, sep);
    if (t < 0.5) {
      dibujarFlecha(cx - sepInicial / 2 - 12 * u, yMano - tam * 0.95, cx - sep / 2 - 3 * u, yMano - tam * 0.95, 200);
      dibujarFlecha(cx + sepInicial / 2 + 12 * u, yMano - tam * 0.9, cx + sep / 2 + 3 * u, yMano - tam * 0.9, 200);
    } else {
      let crece = suavizar(constrain((t - 0.5) / 0.25, 0, 1));
      noStroke();
      fill(216, 167, 238, 255 * crece);
      circle(cx, yMano - tam * 1.25, 11 * u * crece);
    }
  } else if (i === 1) {
    let yManos = y + h * 0.28;
    dibujarManoIcono(x + w * 0.2, yManos, tam * 0.9, "abierta", HALF_PI, 255, 0);
    dibujarManoIcono(x + w * 0.8, yManos, tam * 0.9, "abierta", -HALF_PI, 255, 0);
    stroke(165, 210, 255, 230);
    strokeWeight(max(1.5, 2 * u));
    for (let k = 0; k < 7; k++) {
      let px = lerp(x + w * 0.3, x + w * 0.7, (k + 0.5) / 7);
      let py = yManos + 10 * u + ((t * 1.6 + k * 0.19) % 1) * h * 0.5;
      line(px, py, px - 1 * u, py + 7 * u);
    }
    noStroke();
    let crece = suavizar(constrain((t - 0.2) / 0.6, 0, 1));
    stroke(150, 245, 180, 200);
    strokeWeight(max(1.5, 2 * u));
    line(cx, y + h * 0.97, cx, y + h * 0.97 - h * 0.18 * crece);
    noStroke();
    fill(247, 121, 197, 255);
    circle(cx, y + h * 0.97 - h * 0.18 * crece, h * 0.16 * crece);
  } else if (i === 2) {
    let xPunos = x + w * 0.3;
    dibujarManoIcono(xPunos, y + h * 0.3, tam * 0.8, "puno", 0, 255, 0);
    dibujarManoIcono(xPunos, y + h * 0.74, tam * 0.8, "puno", 0, 255, 0);
    let p = suavizar(constrain(t / 0.8, 0, 1));
    let pasos = 30;
    let xBase = x + w * 0.7;
    stroke(150, 245, 180, 230);
    strokeWeight(max(1.5, 2 * u));
    noFill();
    beginShape();
    for (let k = 0; k <= pasos * p; k++) {
      vertex(xBase + sin(k * 0.45) * h * 0.1, y + h * 0.95 - (k / pasos) * h * 0.8);
    }
    endShape();
    noStroke();
    fill(150, 245, 180, 230);
    for (let k = 3; k <= pasos * p; k += 4) {
      let lado = 1;
      if ((k / 4) % 2 < 1) {
        lado = -1;
      }
      ellipse(xBase + sin(k * 0.45) * h * 0.1 + lado * 6 * u, y + h * 0.95 - (k / pasos) * h * 0.8, 9 * u, 5 * u);
    }
    if (p > 0.97) {
      fill(247, 121, 197);
      circle(xBase + sin(pasos * 0.45) * h * 0.1, y + h * 0.95 - h * 0.8, 10 * u);
    }
  } else if (i === 3) {
    dibujarManoIcono(x + w * 0.3, y + h * 0.7, tam, "victoria", 0, 255, 0);
    let activa = floor(t * 5);
    for (let k = 0; k < 5; k++) {
      let px = x + w * 0.62 + (k % 2) * 17 * u;
      let py = y + h * 0.2 + k * 17 * u;
      noStroke();
      fill(paletas[k][1]);
      circle(px, py, 11 * u);
      if (k === activa) {
        noFill();
        stroke(255);
        strokeWeight(max(1.5, 2 * u));
        circle(px, py, 18 * u);
      }
    }
  } else if (i === 4) {
    let subiendo = t < 0.5;
    let p;
    if (subiendo) {
      p = suavizar(t / 0.5);
    } else {
      p = 1 - suavizar((t - 0.5) / 0.5);
    }
    let yBajo = y + h * 0.82;
    let yAlto = y + h * 0.58;
    dibujarManoIcono(x + w * 0.35, yBajo, tam * 0.9, "abierta", 0, 60, 0);
    dibujarManoIcono(x + w * 0.35, yAlto, tam * 0.9, "abierta", 0, 60, 0);
    dibujarManoIcono(x + w * 0.35, lerp(yBajo, yAlto, p), tam * 0.9, "abierta", 0, 255, 0);
    let alfaSube = 70;
    let alfaBaja = 70;
    if (subiendo) {
      alfaSube = 255;
    } else {
      alfaBaja = 255;
    }
    dibujarFlecha(x + w * 0.07, y + h * 0.5, x + w * 0.07, y + h * 0.18, alfaSube);
    dibujarFlecha(x + w * 0.07, y + h * 0.55, x + w * 0.07, y + h * 0.87, alfaBaja);
    noStroke();
    let yAstro = lerp(y + h * 0.8, y + h * 0.25, p);
    fill(255, 232, 150, 255 * p);
    circle(x + w * 0.82, yAstro, 18 * u);
    fill(215, 225, 255, 255 * (1 - p));
    circle(x + w * 0.82, y + h * 0.25, 16 * u);
    fill(18, 28, 44, 255 * (1 - p));
    circle(x + w * 0.82 + 5 * u, y + h * 0.25 - 3 * u, 14 * u);
  } else if (i === 5) {
    let yPunos = y + h * 0.5;
    dibujarManoIcono(x + w * 0.2, yPunos, tam * 0.75, "puno", 0, 255, 0);
    dibujarManoIcono(x + w * 0.8, yPunos, tam * 0.75, "puno", 0, 255, 0);
    let p = suavizar(t);
    noFill();
    stroke(240, 235, 255, 200 * (1 - p));
    strokeWeight(max(1.5, 2 * u));
    circle(cx, yPunos, p * w * 0.9);
    noStroke();
    for (let k = 0; k < 18; k++) {
      let ang = k * TWO_PI / 18 + t * 3;
      let radio = p * w * 0.36 * (0.5 + 0.5 * ((k * 7) % 5) / 5);
      let col = paletas[paletaActual][k % 4];
      let c = color(col);
      fill(red(c), green(c), blue(c), 255 * (1 - p));
      circle(cx + cos(ang) * radio, yPunos + sin(ang) * radio, 5 * u);
    }
  }
}

// Dibuja un botón y guarda su posición para el clic
function dibujarBoton(cx, y, ancho, alto, etiqueta) {
  let x = cx - ancho / 2;
  let encima = mouseX > x && mouseX < x + ancho && mouseY > y && mouseY < y + alto;
  noStroke();
  if (encima) {
    fill(244, 213, 255);
  } else {
    fill(228, 180, 250);
  }
  rect(x, y, ancho, alto, alto / 2);
  fill(21, 16, 32);
  textFont(fNegrita);
  textAlign(CENTER, CENTER);
  textSize(13 * u);
  text(etiqueta, cx, y + alto / 2 + 1);

  botonX = x;
  botonY = y;
  botonAncho = ancho;
  botonAlto = alto;
  hayBoton = true;
}

// Pantalla del jardín: lee gestos y dibuja plantas, lluvia y chispas
function dibujarJardin() {
  if (estado === "jardin" && !pausado) {
    leerGestos();
    probarLluviaConTeclado();
    manejarSonidoAgua();
  }

  if (!pausado) {
    actualizarEnredaderas();
  }
  dibujarEnredaderas();

  for (let i = 0; i < flores.length; i++) {
    if (!pausado) {
      actualizarFlor(flores[i]);
    }
    dibujarFlor(flores[i]);
  }

  stroke(165, 210, 255, 190);
  strokeWeight(2);
  for (let i = gotas.length - 1; i >= 0; i--) {
    let g = gotas[i];
    if (!pausado) {
      g.y = g.y + g.vel;
    }
    line(g.x, g.y, g.x - 2, g.y + g.largo);
    if (g.y > height) {
      gotas.splice(i, 1);
    }
  }

  for (let i = chispas.length - 1; i >= 0; i--) {
    let c = chispas[i];
    if (!pausado) {
      c.x = c.x + c.vx;
      c.y = c.y + c.vy;
      c.vida = c.vida - 0.018;
    }
    noStroke();
    fill(225, 225, 255, c.vida * 180);
    circle(c.x, c.y, 4 * c.vida + 1);
    if (c.vida <= 0) {
      chispas.splice(i, 1);
    }
  }

  if (verPuntos) {
    dibujarManos(150);
  }
  dibujarInterfaz();

  if (pausado) {
    dibujarPausa();
  }
}

// Revisa qué hacen las manos y dispara las acciones
function leerGestos() {
  haciendoEnredadera = false;
  if (hands.length >= 2) {
    gestoLluvia();
    gestoPunos();
  } else {
    lloviendo = false;
    punosDesde = 0;
  }

  if (hands.length > 0) {
    let mano = hands[0];
    if (lloviendo) {
      pellizcando = false;
    } else {
      gestoSembrar(mano);
    }
    gestoPaleta(mano);
  } else {
    pellizcando = false;
    victoriaDesde = 0;
    paletaCambiada = false;
  }

  if (hands.length === 1) {
    gestoCielo(hands[0]);
  } else {
    historial = [];
  }
}

// Pellizco: si pulgar e índice se juntan, siembra una semilla
function gestoSembrar(mano) {
  let pulgar = mano.keypoints[4];
  let indice = mano.keypoints[8];
  let d = dist(pulgar.x, pulgar.y, indice.x, indice.y);
  let tam = tamanoMano(mano);

  let cerrado;
  if (pellizcando) {
    cerrado = d < tam * 0.5;
  } else {
    cerrado = d < tam * 0.3;
  }

  if (cerrado && !pellizcando && millis() - ultimoSembrado > 350) {
    sembrar(indice.x, indice.y);
  }
  pellizcando = cerrado;
}

// V de la paz mantenida medio segundo: cambia de paleta
function gestoPaleta(mano) {
  let victoria = dedoExtendido(mano, 1) && dedoExtendido(mano, 2) && !dedoExtendido(mano, 3) && !dedoExtendido(mano, 4);
  if (victoria) {
    if (victoriaDesde === 0) {
      victoriaDesde = millis();
    }
    if (millis() - victoriaDesde > 500 && !paletaCambiada) {
      cambiarPaleta((paletaActual + 1) % paletas.length);
      paletaCambiada = true;
    }
  } else {
    victoriaDesde = 0;
    paletaCambiada = false;
  }
}

// Barrido vertical de una mano abierta: arriba es día, abajo es noche
function gestoCielo(mano) {
  if (contarDedos(mano, false) < 3) {
    historial = [];
    return;
  }

  let tam = tamanoMano(mano);
  let palma = mano.keypoints[9];
  historial.push({ x: palma.x, y: palma.y, t: millis() });

  while (historial.length > 0 && millis() - historial[0].t > VENTANA_GESTO) {
    historial.shift();
  }
  if (historial.length < 5 || millis() - historial[0].t < 450) {
    return;
  }

  let camino = 0;
  for (let i = 1; i < historial.length; i++) {
    camino = camino + dist(historial[i].x, historial[i].y, historial[i - 1].x, historial[i - 1].y);
  }
  let primero = historial[0];
  let ultimo = historial[historial.length - 1];
  let neto = dist(primero.x, primero.y, ultimo.x, ultimo.y);
  let dy = ultimo.y - primero.y;
  let direccion = 0;
  if (camino > 0) {
    direccion = neto / camino;
  }

  if (neto > UMBRAL_BARRIDO * tam && direccion > 0.8 && abs(dy) > neto * 0.8 && millis() - ultimoCielo > ESPERA_CIELO) {
    if (dy < 0) {
      cambiarCielo(0);
    } else {
      cambiarCielo(2);
    }
    historial = [];
  }
}

// Dice si la mano está abierta y con los dedos sin apuntar hacia arriba
function manoPlana(mano) {
  if (contarDedos(mano, true) < 3) {
    return false;
  }
  let muneca = mano.keypoints[0];
  let puntaMedio = mano.keypoints[12];
  let alturaDedos = muneca.y - puntaMedio.y;
  return alturaDedos < tamanoMano(mano) * 0.6;
}

// Dos manos planas: llueve entre ellas
function gestoLluvia() {
  lloviendo = manoPlana(hands[0]) && manoPlana(hands[1]);
  if (lloviendo) {
    let x1 = hands[0].keypoints[9].x;
    let x2 = hands[1].keypoints[9].x;
    llover(min(x1, x2) - ANCHO_LLUVIA, max(x1, x2) + ANCHO_LLUVIA);
  }
}

// Crea gotas entre xMin y xMax y hace crecer las plantas de esa franja
function llover(xMin, xMax) {
  ultimaLluvia = millis();
  for (let i = 0; i < 6; i++) {
    let gota = { x: random(xMin, xMax), y: random(-30, 0), vel: random(9, 16), largo: random(10, 22) };
    gotas.push(gota);
  }
  for (let i = 0; i < flores.length; i++) {
    let f = flores[i];
    if (f.x > xMin && f.x < xMax && f.abierta < 1) {
      f.abierta = min(1, f.abierta + VEL_CRECER);
      f.luz = min(1, f.luz + 0.03);
      if (f.abierta >= 1) {
        florecio(f);
      }
    }
  }
}

// Prende o corta el sonido de la lluvia
function manejarSonidoAgua() {
  if (lloviendo) {
    if (!silenciado && !sndLluvia.isPlaying()) {
      sndLluvia.setVolume(0.45, 0.3);
      sndLluvia.loop();
    }
  } else if (millis() - ultimaLluvia > 600 && sndLluvia.isPlaying()) {
    sndLluvia.stop();
  }
}

// Dice si los dos puños están uno sobre el otro
function punosApilados() {
  let a = hands[0].keypoints[9];
  let b = hands[1].keypoints[9];
  return abs(a.y - b.y) > abs(a.x - b.x);
}

// Dos puños: apilados crean enredaderas, lado a lado lanzan el hechizo
function gestoPunos() {
  let dosPunos = contarDedos(hands[0], true) === 0 && contarDedos(hands[1], true) === 0;
  if (dosPunos && punosApilados()) {
    punosDesde = 0;
    haciendoEnredadera = true;
    crearEnredadera();
  } else if (dosPunos) {
    if (punosDesde === 0) {
      punosDesde = millis();
    }
    let t = (millis() - punosDesde) / (SEG_PUNOS * 1000);
    dibujarAnillo(width / 2, height / 2, 90, t);
    if (t >= 1) {
      iniciarHechizo("final");
    }
  } else {
    punosDesde = 0;
  }
}

// Crea una enredadera nueva que nace desde abajo
function crearEnredadera() {
  if (millis() - ultimaEnredadera < 350 || enredaderas.length >= MAX_ENREDADERAS) {
    return;
  }
  ultimaEnredadera = millis();
  let medioX = (hands[0].keypoints[9].x + hands[1].keypoints[9].x) / 2;
  let medioY = (hands[0].keypoints[9].y + hands[1].keypoints[9].y) / 2;
  let x0 = constrain(medioX + random(-250, 250), 30, width - 30);
  let idx = floor(random(4));
  let c = color(paletas[paletaActual][idx]);
  enredaderas.push({
    x0: x0,
    y0: height + 10,
    puntos: [],
    yMeta: min(medioY, height * 0.7),
    fase: random(TWO_PI),
    amp: random(18, 34),
    idxColor: idx,
    r: red(c), g: green(c), b: blue(c),
    hojas: [],
    completa: false,
    alfa: 255,
  });
  reproducir(sndPlantar, 0.7, 0.35);
}

// Hace crecer las enredaderas y las borra durante el hechizo
function actualizarEnredaderas() {
  for (let i = enredaderas.length - 1; i >= 0; i--) {
    let e = enredaderas[i];
    let c = color(paletas[paletaActual][e.idxColor]);
    e.r = lerp(e.r, red(c), 0.05);
    e.g = lerp(e.g, green(c), 0.05);
    e.b = lerp(e.b, blue(c), 0.05);

    if (estado === "hechizo") {
      e.alfa = e.alfa - 5;
      if (e.alfa <= 0) {
        enredaderas.splice(i, 1);
      }
      continue;
    }

    if (!e.completa) {
      let y = e.y0 - e.puntos.length * 4;
      let x = e.x0 + sin((e.y0 - y) * 0.03 + e.fase) * e.amp;
      e.puntos.push({ x: x, y: y });
      if (e.puntos.length % 3 === 0) {
        e.hojas.push({ x: x, y: y, lado: random([-1, 1]) });
      }
      if (y <= e.yMeta) {
        e.completa = true;
      }
    }
  }
}

// Dibuja tallo, hojas y flor de cada enredadera
function dibujarEnredaderas() {
  for (let i = 0; i < enredaderas.length; i++) {
    let e = enredaderas[i];
    noFill();
    stroke(e.r, e.g, e.b, e.alfa);
    strokeWeight(3);
    beginShape();
    for (let k = 0; k < e.puntos.length; k++) {
      vertex(e.puntos[k].x, e.puntos[k].y);
    }
    endShape();
    noStroke();
    fill(e.r, e.g, e.b, e.alfa * 0.85);
    for (let k = 0; k < e.hojas.length; k++) {
      let h = e.hojas[k];
      ellipse(h.x + h.lado * 7, h.y, 12, 6);
    }
    if (e.completa) {
      let punta = e.puntos[e.puntos.length - 1];
      push();
      tint(255, e.alfa);
      imageMode(CENTER);
      image(imgFlores[e.idxColor % imgFlores.length], punta.x, punta.y, 46, 46);
      pop();
    }
  }
}

// Dibuja un anillo que se completa según t (0 a 1)
function dibujarAnillo(x, y, diametro, t) {
  noFill();
  stroke(240, 245, 255, 210);
  strokeWeight(4);
  arc(x, y, diametro, diametro, -HALF_PI, -HALF_PI + TWO_PI * constrain(t, 0, 1));
}

// Dibuja el esqueleto de las manos detectadas
function dibujarManos(opacidad) {
  strokeJoin(ROUND);
  for (let i = 0; i < hands.length; i++) {
    let mano = hands[i];
    let col;
    if (i === 0) {
      col = color(241, 223, 61, opacidad);
    } else {
      col = color(61, 214, 241, opacidad);
    }

    stroke(col);
    strokeWeight(2);
    for (let j = 0; j < conexiones.length; j++) {
      let a = mano.keypoints[conexiones[j][0]];
      let b = mano.keypoints[conexiones[j][1]];
      line(a.x, a.y, b.x, b.y);
    }

    noStroke();
    fill(col);
    for (let j = 0; j < mano.keypoints.length; j++) {
      circle(mano.keypoints[j].x, mano.keypoints[j].y, 7);
    }

    let punta = mano.keypoints[8];
    noFill();
    stroke(255, 255, 255, opacidad);
    strokeWeight(2);
    circle(punta.x, punta.y, 26);
  }
}

// Dibuja la interfaz del jardín: marca, contadores, paletas y ayudas
function dibujarInterfaz() {
  noStroke();
  textAlign(LEFT, CENTER);
  textFont(fNegrita);
  fill(245, 243, 255);
  textSize(14 * u);
  text("CULTIVAR", 30, 34);
  let anchoMarca = textWidth("CULTIVAR");
  textFont(fTitulo);
  fill(194, 164, 232);
  textSize(19 * u);
  text("la luz", 30 + anchoMarca + 8, 34);

  let etiqueta = nombreMomento() + "  ·  " + flores.length + " plantas  ·  " + contarAbiertas() + " flores";
  textFont(fCuerpo);
  textSize(13 * u);
  let anchoEtiqueta = textWidth(etiqueta) + 36 * u;
  fill(8, 13, 23, 170);
  stroke(255, 255, 255, 40);
  rect(width - 30 - anchoEtiqueta, 18, anchoEtiqueta, 34 * u, 20);
  noStroke();
  fill(216, 228, 236);
  textAlign(CENTER, CENTER);
  text(etiqueta, width - 30 - anchoEtiqueta / 2, 18 + 17 * u);

  for (let i = 0; i < paletas.length; i++) {
    let x = width / 2 + (i - 2) * 34 * u;
    let y = height - 78 * u;
    fill(paletas[i][1]);
    circle(x, y, 17 * u);
    if (i === paletaActual) {
      noFill();
      stroke(255);
      strokeWeight(2);
      circle(x, y, 28 * u);
      noStroke();
    }
  }
  fill(200, 210, 225, 190);
  textSize(12 * u);
  text("Paleta: " + nombresPaletas[paletaActual], width / 2, height - 52 * u);

  textFont(fNegrita);
  textSize(20 * u);
  fill(255);
  if (flores.length === 0) {
    if (hands.length === 0) {
      text("Mostrá una mano a la cámara", width / 2, height - 118 * u);
    } else {
      text("Pellizcá con pulgar e índice para sembrar", width / 2, height - 118 * u);
    }
  } else if (contarAbiertas() === 0) {
    text("Poné las dos manos abiertas con las palmas hacia abajo para que llueva", width / 2, height - 118 * u);
  } else if (cambiosCielo === 0) {
    text("Con una sola mano abierta, subila o bajala para cambiar entre día y noche", width / 2, height - 118 * u);
  }

  if (millis() < avisoHasta) {
    let a = constrain((avisoHasta - millis()) / 500, 0, 1) * 255;
    textFont(fTitulo);
    fill(255, 240, 255, a);
    textSize(54 * u);
    text(avisoTexto, width / 2, height * 0.22);
  }

  if (verAyuda) {
    textFont(fCuerpo);
    textSize(11.5 * u);
    fill(224, 229, 240, 170);
    text("S sembrar · B abrir · W lluvia · D día · N noche · 1–5 paleta · R hechizo · ESPACIO pausa · M sonido · V puntos · F pantalla completa · H ayuda", width / 2, height - 22 * u);
  }
}

// Dibuja el cartel de pausa
function dibujarPausa() {
  noStroke();
  fill(0, 0, 0, 120);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textFont(fTitulo);
  textSize(70 * u);
  text("En pausa", width / 2, height / 2);
  textFont(fCuerpo);
  textSize(15 * u);
  text("ESPACIO para continuar", width / 2, height / 2 + 56 * u);
}

// Crea una planta como objeto con sus propiedades
function crearFlor(x, y) {
  let indiceColor = floor(random(4));
  let col = color(paletas[paletaActual][indiceColor]);
  let flor = {
    x: x,
    y: y,
    edad: 0,
    tam: random(70, 130),
    tipo: floor(random(imgFlores.length)),
    abierta: 0,
    luz: 0.25,
    giro: random(1000),
    inclinacion: random(-0.4, 0.4),
    indiceColor: indiceColor,
    r: red(col),
    g: green(col),
    b: blue(col),
  };
  return flor;
}

// Actualiza tamaño, luz y color de una planta
function actualizarFlor(f) {
  f.edad = min(1, f.edad + 0.018);
  f.luz = max(0.25, f.luz - 0.0015);

  if (estado === "hechizo" || estado === "final") {
    f.luz = max(0, f.luz - 0.008);
    f.abierta = max(0, f.abierta - 0.006);
  }

  let objetivo = color(paletas[paletaActual][f.indiceColor]);
  f.r = lerp(f.r, red(objetivo), 0.06);
  f.g = lerp(f.g, green(objetivo), 0.06);
  f.b = lerp(f.b, blue(objetivo), 0.06);
}

// Dibuja el tallo, el halo y la flor o semilla
function dibujarFlor(f) {
  let brillo = f.luz * (0.35 + 0.65 * f.abierta);
  let t = f.tam * f.edad;
  let balanceo = sin(frameCount * 0.012 + f.giro) * 0.045;

  push();
  translate(f.x, f.y);
  rotate(f.inclinacion + balanceo);

  noFill();
  stroke(f.r, f.g, f.b, 160 * brillo);
  strokeWeight(2);
  bezier(0, 0, -t * 0.1, t * 0.9, t * 0.15, t * 1.8, 0, t * 2.4);

  imageMode(CENTER);
  blendMode(ADD);
  tint(f.r, f.g, f.b, 110 * brillo);
  let halo = t * (1.5 + f.abierta * 1.5) * (1 + f.luz * 0.4);
  image(imgBrillo, 0, 0, halo, halo);
  blendMode(BLEND);

  if (f.abierta > 0.05) {
    let tamFlor = t * (0.3 + 0.9 * f.abierta);
    tint(f.r, f.g, f.b, 90 + 165 * brillo);
    rotate(f.giro + frameCount * 0.002);
    image(imgFlores[f.tipo], 0, 0, tamFlor, tamFlor);
  } else {
    tint(f.r, f.g, f.b, 230);
    image(imgSemilla, 0, 0, t * 0.45, t * 0.45);
  }
  noTint();
  pop();
}

// Crea una chispa de luz y la agrega al array
function crearChispa(x, y, vx, vy) {
  let chispa = { x: x, y: y, vx: vx, vy: vy, vida: 1 };
  chispas.push(chispa);
}

// Partícula del hechizo que sale girando en espiral y se apaga
class Particula {
  // Define posición, velocidad, giro, tamaño y color
  constructor(x, y, r, g, b) {
    this.x = x;
    this.y = y;
    let angulo = random(TWO_PI);
    let velocidad = random(1, 5);
    this.velX = cos(angulo) * velocidad;
    this.velY = sin(angulo) * velocidad;
    this.giro = random(0.03, 0.07) * random([-1, 1]);
    this.tam = random(4, 10);
    this.r = r;
    this.g = g;
    this.b = b;
    this.alpha = 255;
  }

  // Mueve la partícula, gira su velocidad y baja la opacidad
  move() {
    let vx = this.velX;
    this.velX = vx * cos(this.giro) - this.velY * sin(this.giro);
    this.velY = vx * sin(this.giro) + this.velY * cos(this.giro);
    this.x += this.velX;
    this.y += this.velY;
    this.alpha -= 3;
  }

  // Dibuja la partícula
  show() {
    noStroke();
    fill(this.r, this.g, this.b, this.alpha);
    circle(this.x, this.y, this.tam);
  }

  // Dice si la partícula ya desapareció
  finished() {
    return this.alpha < 0;
  }
}

// Empieza el hechizo desde el punto medio entre las manos
function iniciarHechizo(destino) {
  if (estado !== "jardin" && estado !== "final") {
    return;
  }
  hechizoDestino = destino;
  estado = "hechizo";
  hechizoDesde = millis();
  punosDesde = 0;
  lloviendo = false;
  haciendoEnredadera = false;
  gotas = [];
  particulas = [];
  if (hands.length >= 2) {
    hechizoX = (hands[0].keypoints[9].x + hands[1].keypoints[9].x) / 2;
    hechizoY = (hands[0].keypoints[9].y + hands[1].keypoints[9].y) / 2;
  } else {
    hechizoX = width / 2;
    hechizoY = height / 2;
  }
  if (sndLluvia.isPlaying()) {
    sndLluvia.stop();
  }
  reproducir(sndFlorecer, 0.5, 0.8);
}

// Dibuja el hechizo y al terminar cambia de pantalla
function dibujarHechizo() {
  let avance = constrain((millis() - hechizoDesde) / DURACION_HECHIZO, 0, 1);

  noStroke();
  fill(2, 5, 12, avance * 140);
  rect(0, 0, width, height);

  if (avance < 0.7) {
    for (let i = 0; i < 14; i++) {
      let col = color(paletas[paletaActual][floor(random(4))]);
      particulas.push(new Particula(hechizoX, hechizoY, red(col), green(col), blue(col)));
    }
  }

  noFill();
  stroke(240, 235, 255, 200 * (1 - avance));
  strokeWeight(3);
  circle(hechizoX, hechizoY, avance * max(width, height) * 1.4);

  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].move();
    particulas[i].show();
    if (particulas[i].finished()) {
      particulas.splice(i, 1);
    }
  }

  if (avance >= 1) {
    particulas = [];
    if (hechizoDestino === "final") {
      irAlFinal();
    } else {
      empezarJardin();
    }
  }
}

// Pasa a la pantalla final y borra el jardín
function irAlFinal() {
  estado = "final";
  finalDesde = millis();
  segundosJardin = floor((hechizoDesde - tInicio) / 1000);
  punosDesde = 0;
  flores = [];
  chispas = [];
  enredaderas = [];
}

// Pantalla final: estadísticas y reinicio
function dibujarFinal() {
  noStroke();
  fill(2, 5, 12, 190);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textFont(fNegrita);
  fill(163, 185, 198);
  textSize(12 * u);
  text("F I N   D E L   R E C O R R I D O", width / 2, height * 0.16);

  fill(245, 243, 255);
  textSize(78 * u);
  text("Después", width / 2, height * 0.3);
  textFont(fTitulo);
  fill(216, 167, 238);
  text("del hechizo.", width / 2, height * 0.3 + 76 * u);

  textFont(fCuerpo);
  fill(200, 208, 220);
  textSize(17 * u);
  text("Tu jardín se transformó y desapareció. Podés volver a sembrar uno completamente nuevo.", width / 2, height * 0.3 + 150 * u);

  let numeros = [totalSembradas, totalFloridas, formatoTiempo(segundosJardin)];
  let nombres = ["plantas sembradas", "flores abiertas", "de jardín"];
  let y = height * 0.3 + 225 * u;
  for (let i = 0; i < 3; i++) {
    let x = width / 2 + (i - 1) * 210 * u;
    textFont(fNegrita);
    fill(228, 180, 250);
    textSize(40 * u);
    text(numeros[i], x, y);
    textFont(fCuerpo);
    fill(160, 175, 190);
    textSize(13 * u);
    text(nombres[i], x, y + 36 * u);
  }

  dibujarBoton(width / 2, y + 80 * u, 300 * u, 54 * u, "VOLVER A SEMBRAR  (ENTER)");
  fill(130, 145, 160);
  textFont(fCuerpo);
  textSize(12 * u);
  text("También podés poner los dos puños lado a lado para lanzar un hechizo que reinicia todo, o apretar ESPACIO", width / 2, y + 160 * u);

  if (estado === "final" && hands.length >= 2 && millis() - finalDesde > 1500) {
    let dosPunos = contarDedos(hands[0], true) === 0 && contarDedos(hands[1], true) === 0;
    if (dosPunos && !punosApilados()) {
      if (punosDesde === 0) {
        punosDesde = millis();
      }
      let t = (millis() - punosDesde) / (SEG_PUNOS * 1000);
      dibujarAnillo(width / 2, height - 70, 60, t);
      if (t >= 1) {
        iniciarHechizo("jardin");
      }
    } else {
      punosDesde = 0;
    }
  }
}

// Empieza o reinicia el jardín con todo en cero
function empezarJardin() {
  userStartAudio();
  flores = [];
  chispas = [];
  particulas = [];
  gotas = [];
  enredaderas = [];
  haciendoEnredadera = false;
  historial = [];
  etapa = 0;
  totalSembradas = 0;
  totalFloridas = 0;
  cambiosCielo = 0;
  pellizcando = false;
  lloviendo = false;
  victoriaDesde = 0;
  paletaCambiada = false;
  punosDesde = 0;
  pausado = false;
  tInicio = millis();
  estado = "jardin";
  sndLluvia.stop();
  if (!silenciado) {
    sndAmbiente.setVolume(0.18, 1);
    if (!sndAmbiente.isPlaying()) {
      sndAmbiente.loop();
    }
  }
}

// Planta una semilla en (x, y)
function sembrar(x, y) {
  if (flores.length >= MAX_FLORES) {
    flores.shift();
  }
  flores.push(crearFlor(x, y));
  totalSembradas++;
  ultimoSembrado = millis();
  for (let i = 0; i < 12; i++) {
    crearChispa(x, y, random(-2, 2), random(-3, 0));
  }
  reproducir(sndPlantar, 1, 0.7);
}

// Abre la planta cerrada más cercana (tecla B)
function florecerCercana(x, y) {
  let elegida = null;
  let mejor = RADIO_FLORECER;
  for (let i = 0; i < flores.length; i++) {
    let d = dist(flores[i].x, flores[i].y, x, y);
    if (flores[i].abierta < 1 && d < mejor) {
      elegida = flores[i];
      mejor = d;
    }
  }
  if (elegida === null) {
    for (let i = 0; i < flores.length; i++) {
      if (flores[i].abierta < 1) {
        elegida = flores[i];
        break;
      }
    }
  }
  if (elegida !== null) {
    elegida.abierta = 1;
    florecio(elegida);
  }
}

// Cuenta la flor abierta, hace chispas y suena
function florecio(f) {
  f.luz = 0.75;
  totalFloridas++;
  for (let i = 0; i < 18; i++) {
    crearChispa(f.x, f.y, random(-2, 2), random(-2, 2));
  }
  reproducir(sndFlorecer, notasPaletas[paletaActual], 0.6);
}

// Cambia el cielo: 0 es día y 2 es noche
function cambiarCielo(nuevo) {
  ultimoCielo = millis();
  if (etapa === nuevo) {
    return;
  }
  etapa = nuevo;
  cambiosCielo++;
  if (nuevo === 0) {
    mostrarAviso("Día");
    reproducir(sndFlorecer, 1.5, 0.4);
  } else {
    mostrarAviso("Noche");
    reproducir(sndFlorecer, 0.75, 0.4);
  }
}

// Cambia la paleta de colores y la nota del sonido
function cambiarPaleta(i) {
  paletaActual = i;
  for (let j = 0; j < flores.length; j++) {
    flores[j].luz = max(flores[j].luz, 0.55);
  }
  mostrarAviso(nombresPaletas[i]);
  reproducir(sndFlorecer, notasPaletas[i], 0.25);
}

// Reproduce un sonido con velocidad y volumen
function reproducir(sonido, velocidad, volumen) {
  if (silenciado) {
    return;
  }
  sonido.rate(velocidad);
  sonido.setVolume(volumen);
  sonido.play();
}

// Muestra un texto grande durante un rato
function mostrarAviso(texto) {
  avisoTexto = texto;
  avisoHasta = millis() + 2200;
}

// Mide la mano: distancia de la muñeca a la base del dedo medio
function tamanoMano(mano) {
  let muneca = mano.keypoints[0];
  let base = mano.keypoints[9];
  return dist(muneca.x, muneca.y, base.x, base.y);
}

// Dice si un dedo está estirado
function dedoExtendido(mano, dedo) {
  let puntas = [4, 8, 12, 16, 20];
  let articulaciones = [3, 6, 10, 14, 18];
  let muneca = mano.keypoints[0];
  let punta = mano.keypoints[puntas[dedo]];
  let articulacion = mano.keypoints[articulaciones[dedo]];
  let distPunta = dist(punta.x, punta.y, muneca.x, muneca.y);
  let distArticulacion = dist(articulacion.x, articulacion.y, muneca.x, muneca.y);
  return distPunta > distArticulacion * 1.15;
}

// Cuenta los dedos estirados (con o sin pulgar)
function contarDedos(mano, sinPulgar) {
  let n = 0;
  let primero = 0;
  if (sinPulgar) {
    primero = 1;
  }
  for (let i = primero; i < 5; i++) {
    if (dedoExtendido(mano, i)) {
      n++;
    }
  }
  return n;
}

// Convierte segundos en m:ss
function formatoTiempo(segundos) {
  return floor(segundos / 60) + ":" + nf(segundos % 60, 2);
}

// Teclas: empezar, pausar, sonido, ayudas y pruebas sin cámara
function keyPressed() {
  if (keyCode === ENTER) {
    if (estado === "inicio" || estado === "final") {
      empezarJardin();
    }
    return false;
  }
  if (key === " ") {
    if (estado === "inicio" || estado === "final") {
      empezarJardin();
    } else if (estado === "jardin") {
      pausado = !pausado;
    }
    return false;
  }

  if (key === "m" || key === "M") {
    silenciado = !silenciado;
    masterVolume(silenciado ? 0 : 1);
  }
  if (key === "v" || key === "V") {
    verPuntos = !verPuntos;
  }
  if (key === "h" || key === "H") {
    verAyuda = !verAyuda;
  }
  if (key === "f" || key === "F") {
    fullscreen(!fullscreen());
  }

  if (estado !== "jardin" || pausado) {
    return;
  }
  if (key === "s" || key === "S") {
    sembrar(random(width * 0.2, width * 0.8), random(height * 0.25, height * 0.7));
  }
  if (key === "b" || key === "B") {
    florecerCercana(width / 2, height / 2);
  }
  if (key === "d" || key === "D") {
    cambiarCielo(0);
  }
  if (key === "n" || key === "N") {
    cambiarCielo(2);
  }
  if (key === "r" || key === "R") {
    iniciarHechizo("final");
  }
  if (key >= "1" && key <= "5") {
    cambiarPaleta(int(key) - 1);
  }
}

// Tecla W mantenida: llueve en toda la pantalla
function probarLluviaConTeclado() {
  if (keyIsDown(87)) {
    lloviendo = true;
    llover(0, width);
  } else if (hands.length < 2) {
    lloviendo = false;
  }
}

// Click: aprieta el botón o siembra en el jardín
function mousePressed() {
  if ((estado === "inicio" || estado === "final") && hayBoton && mouseX > botonX && mouseX < botonX + botonAncho && mouseY > botonY && mouseY < botonY + botonAlto) {
    empezarJardin();
    return;
  }
  if (estado === "jardin" && !pausado) {
    sembrar(mouseX, mouseY);
  }
}

// Adapta el canvas cuando cambia el tamaño de la ventana
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcularEscala();
  crearEstrellas();
}
