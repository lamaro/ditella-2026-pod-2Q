// ================================================================
// 0. CONFIGURACION Y FUNCIONES
// ================================================================

const ESPEJO = true;
const MAX_MANOS = 2;

const VIDEO_ANCHO = 640;
const VIDEO_ALTO = 480;

const COLOR_J1 = "#45B9F0";
const COLOR_J2 = "#FA766F";

let handPose;
let video;
let hands = [];
// Seguimiento de J1 y J2 entre cuadros; no dependemos del orden de ml5.
let manosAsignadas = [null, null];
let ultimasMunecas = [null, null];
let ultimaDeteccion = [-Infinity, -Infinity];

let escala = 1;
let margenX = 0;
let margenY = 0;

let pantalla = 0;

// IMAGENES Y TIPOGRAFIA
let fuenteTitulo;
let recuadroTitulo;
let recuadroTituloJuego;
let recuadroTextoSimple;
let recuadroResultados;
let fondoMenu;
let fondoPeces;
let coralRefugio;
let fondoBurbujas;
let fondoPirata;
let monedaTesoro;
let ganchoPirata;

// JUEGO 3 - BUZOS
let capaLinternaBuzo;
let imagenesBuzos = [];
let imagenBolsaBuzo;
let imagenBolsaBuzoRoja;
const COLORES_BUZOS = ["#45B9F0", "#FA766F"];
let fondoBuzo;
let imagenesHallazgos = [];
let imagenesHallazgosDorados = [];
let objetosBuzo = [];
let bolsaBuzo = [
  [0, 0, 0],
  [0, 0, 0],
];
let objetivoBuzo = [null, null];
let inicioMiradaBuzo = [0, 0];
let metasBuzo = [];
let ganadorBuzo = -1;
const TIEMPO_RECOGER_BUZO = 1000;
const RADIO_LINTERNA = 90;

// JUEGO 1
let burbujas = [];
let burbujasPastel = [];
let puntos = [0, 0];
let inicio = 0;

// Bombas del Juego 1: aparecen por tandas y bloquean solo al jugador que las toca.
let bombasBurbujas = [];
let proximaTandaBombas = 0;
let bloqueadoPorBombaHasta = [0, 0];

// JUEGO 2
let peces = [];
let medusasRescate = [];
let burbujitasFondo = [];

let rescatados = 0;
let vidas = 3;
let pezAgarrado = null;
let pellizcandoAntes = false;

let inicioRescate = 0;
let ultimaMedusa = 0;

let avisoRescate = "";
let avisoHasta = 0;

// JUEGO 4
let puntosTesoro = [0, 0];
let pellizcoAntesTesoro = [false, false];

let objetosTesoro = [];

let inicioTesoro = 0;
let ultimoGrupoTesoro = 0;
let duracionGrupoTesoro = 2500;
let cantidadGrupoTesoro = 1;
let faseOroTesoro = 0;
const INICIO_ORO_TESORO = 18000;
const DURACION_ORO_TESORO = 3000;
const DURACION_TRAMPA_TESORO = 1000;

// SONIDOS
// Tic-tac de la fiebre de oro.
let sonidoRelojOro = new Audio("assets/tic-tac-oro.mp3");
sonidoRelojOro.loop = true;
sonidoRelojOro.volume = 0.55;
let sonidoMenu = new Audio("assets/sonido-menu.m4a");
let sonidoFondoBurbujas = new Audio(
  "assets/Burbujas_original_agua_intermedia_V4.mp3",
);
let sonidoFondoPeces = new Audio("assets/Peces_agua_intermedia_V4.mp3");
let sonidoFondoBuceo = new Audio("assets/Buceo_agua_intermedia_V4.mp3");
let sonidoExplotar = new Audio("assets/sonido-explotar-burbuja.wav");
let sonidoMiniBoom = new Audio("assets/mini-boom.mp3");
sonidoMiniBoom.volume = 0.65;
let sonidoAgarrePez = new Audio("assets/agarre-pez.mp3");
// Sonido diferente cuando el pez llega al coral (no reutilizar la burbuja).
let sonidoPezRescatado = new Audio("assets/pez-rescatado.mp3");
let sonidoChoqueMedusa = new Audio("assets/descarga-medusa.mp3");
sonidoChoqueMedusa.volume = 0.65;
let sonidoFondoPiratas = new Audio(
  "assets/Piratas_original_mar_audible_V6.mp3",
);
let sonidoMoneda = new Audio("assets/sonido-moneda.wav");
let sonidoGancho = new Audio("assets/sonido-gancho-pirata.mp3");
let sonidoObjetoNormal = new Audio("assets/sonido obj normal.wav");
let sonidoObjetoEspecial = new Audio("assets/sonido obj especial.wav");

sonidoMenu.loop = true;
sonidoFondoBurbujas.loop = true;
sonidoFondoPiratas.loop = true;
sonidoFondoPeces.loop = true;
sonidoFondoBuceo.loop = true;

sonidoMenu.volume = 1;
sonidoFondoBurbujas.volume = 0.19;
sonidoFondoPiratas.volume = 0.15;
sonidoFondoPeces.volume = 0.17;
sonidoFondoBuceo.volume = 0.97;

let pantallaAudio = 0;

// Funciones para reproducir los sonidos del juego,
// controlar su volumen y permitir silenciarlos con S.
// La música del menú se inicia al interactuar con la pantalla.
let efectosEnReproduccion = new Set();
function reproducirEfecto(sonido) {
  let efecto = sonido.cloneNode();
  efecto.volume = sonido.volume;
  efecto.muted = sonidoMenu.muted;
  efectosEnReproduccion.add(efecto);
  let limpiar = function () { efectosEnReproduccion.delete(efecto); };
  efecto.addEventListener("ended", limpiar, { once: true });
  efecto.addEventListener("error", limpiar, { once: true });
  efecto.play().catch(limpiar);
}

function iniciarSonidoMenu() {
  if (pantalla === 0 && sonidoMenu.paused) {
    sonidoMenu.play().catch(function () {});
  }
}

document.addEventListener("pointerdown", iniciarSonidoMenu);
document.addEventListener("keydown", iniciarSonidoMenu);

function reproducirMusicaPantalla() {
  let musicas = [
    sonidoMenu,
    sonidoFondoBurbujas,
    sonidoFondoPeces,
    sonidoFondoBuceo,
    sonidoFondoPiratas,
  ];
  for (let musica of musicas) {
    musica.pause();
  }
  if (pantalla !== 4) sonidoRelojOro.pause();
  let musica = musicas[pantalla];
  if (musica) {
    if (pantalla !== 0) musica.currentTime = 0;
    musica.play().catch(function () {});
  }
  pantallaAudio = pantalla;
}

// ======================================
// PRELOAD
// ======================================

function preload() {
  fondoPeces = loadImage("assets/fondo-peces-invertido.png");
  coralRefugio = loadImage("assets/coral-refugio.png");
  recuadroTituloJuego = loadImage("assets/recuadro-titulo-juego.png");
  recuadroTextoSimple = loadImage("assets/recuadro-texto-simple.png");
  recuadroTitulo = loadImage("assets/recuadro-titulo-transparente.png");
  recuadroResultados = loadImage("assets/recuadro-resultados-transparente.png");
  imagenesBuzos = [
    loadImage("assets/buzo-azul.png"),
    loadImage("assets/buzo-rojo.png"),
  ];
  imagenBolsaBuzo = loadImage("assets/bolsa-buzo.png");
  imagenBolsaBuzoRoja = loadImage("assets/bolsa-buzo-roja.png");
  imagenesHallazgosDorados = [
    loadImage("assets/estrella-dorada.png"),
    loadImage("assets/perla-dorada.png"),
    loadImage("assets/ancla-dorada.png"),
  ];
  fondoBuzo = loadImage("assets/fondo-buzo.png");
  imagenesHallazgos = [
    loadImage("assets/estrella-buzo.png"),
    loadImage("assets/perla-buzo.png"),
    loadImage("assets/ancla-buzo.png"),
  ];

  fuenteTitulo = loadFont("assets/BowlbyOneSC-Regular.ttf");

  fondoMenu = loadImage("assets/fondo-menu.jpg");

  fondoBurbujas = loadImage("assets/fondo-burbujas.png");

  fondoPirata = loadImage("assets/fondo-pirata.png");

  monedaTesoro = loadImage("assets/moneda.png");

  ganchoPirata = loadImage("assets/gancho-pirata.png");

  handPose = ml5.handPose({
    maxHands: MAX_MANOS,
    flipped: ESPEJO,
  });
}

// ======================================
// SETUP
// ======================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  iniciarSonidoMenu();
  capaLinternaBuzo = createGraphics(RADIO_LINTERNA * 2, RADIO_LINTERNA * 2);
  capaLinternaBuzo.pixelDensity(1);

  video = createCapture(VIDEO, {
    flipped: ESPEJO,
  });

  video.size(VIDEO_ANCHO, VIDEO_ALTO);
  video.hide();

  handPose.detectStart(video, gotHands);

  calcularEscala();

  crearBurbujasPastel();
}

// ======================================
// DRAW
// ======================================

function draw() {
  if (pantalla !== pantallaAudio) reproducirMusicaPantalla();

  background(0);
  textFont("Arial");

  if (pantalla === 0) {
    menu();
  }

  if (pantalla === 1) {
    juegoBurbujas();
  }

  if (pantalla === 2) {
    juegoRescate();
  }

  if (pantalla === 3) {
    juegoBuzo();
  }

  if (pantalla === 4) {
    juegoTesoro();
  }

  if (pantalla === 0) dibujarControlesJuego();
}

// ======================================
// DETECTAR MANOS
// ======================================

function gotHands(results) {
  // Detecta las manos con la cámara y adapta sus posiciones
  hands = results.map(function (mano) {
    let nuevaMano = { keypoints: [] };
    for (let kp of mano.keypoints) {
      nuevaMano.keypoints.push({
        x: kp.x * escala + margenX,
        y: kp.y * escala + margenY,
      });
    }
    return nuevaMano;
  });
  actualizarManosAsignadas();
}


// Identifica a cada jugador y sigue el movimiento de su mano
// para evitar que se intercambien los colores y puntajes.
function actualizarManosAsignadas() {
  let ahora = millis();
  let disponibles = hands.filter(function (mano) {
    return mano && mano.keypoints && mano.keypoints[0];
  }).slice(0, 2);
  let actuales = [null, null];
  let reciente = [0, 1].map(function (j) {
    return ultimasMunecas[j] !== null && ahora - ultimaDeteccion[j] < 1500;
  });
  function distanciaAnterior(mano, j) {
    let p = mano.keypoints[0];
    return dist(p.x, p.y, ultimasMunecas[j].x, ultimasMunecas[j].y);
  }
  if (disponibles.length === 2) {
    let a = disponibles[0];
    let b = disponibles[1];
    if (reciente[0] && reciente[1]) {
      let directo = distanciaAnterior(a, 0) + distanciaAnterior(b, 1);
      let cruzado = distanciaAnterior(a, 1) + distanciaAnterior(b, 0);
      actuales = directo <= cruzado ? [a, b] : [b, a];
    } else if (reciente[0] || reciente[1]) {
      let j = reciente[0] ? 0 : 1;
      let masCerca = distanciaAnterior(a, j) <= distanciaAnterior(b, j);
      actuales[j] = masCerca ? a : b;
      actuales[1 - j] = masCerca ? b : a;
    } else {
      actuales = a.keypoints[0].x <= b.keypoints[0].x ? [a, b] : [b, a];
    }
  } else if (disponibles.length === 1) {
    let mano = disponibles[0];
    let j;
    if (reciente[0] && reciente[1]) {
      j = distanciaAnterior(mano, 0) <= distanciaAnterior(mano, 1) ? 0 : 1;
    } else if (reciente[0] || reciente[1]) {
      let conocido = reciente[0] ? 0 : 1;
      let suficientementeCerca = distanciaAnterior(mano, conocido) < max(130, width * 0.2);
      j = suficientementeCerca ? conocido : (mano.keypoints[0].x < width / 2 ? 0 : 1);
    } else {
      j = mano.keypoints[0].x < width / 2 ? 0 : 1;
    }
    actuales[j] = mano;
  }
  manosAsignadas = actuales;
  for (let j = 0; j < 2; j++) {
    if (actuales[j]) {
      let muneca = actuales[j].keypoints[0];
      ultimasMunecas[j] = { x: muneca.x, y: muneca.y };
      ultimaDeteccion[j] = ahora;
    }
  }
}

function obtenerManosPorJugador() {
  return manosAsignadas;
}

// ======================================
// ESCALA DE CAMARA
// ======================================

function calcularEscala() {
  escala = max(width / VIDEO_ANCHO, height / VIDEO_ALTO);

  margenX = (width - VIDEO_ANCHO * escala) / 2;

  margenY = (height - VIDEO_ALTO * escala) / 2;
}

// ======================================
// FONDOS
// ======================================

function dibujarFondoMarino(negro = false) {
  if (video && video.elt.readyState >= 2) {
    image(video, margenX, margenY, VIDEO_ANCHO * escala, VIDEO_ALTO * escala);
  } else {
    if (negro) background(0);
    else background(12, 75, 115);
  }

  noStroke();
  if (negro) fill(0, 0, 0, 145);
  else fill(12, 75, 115, 145);
  rect(0, 0, width, height);
}

function dibujarFondoConImagen(imagen, opacidad) {
  dibujarFondoMarino();

  push();

  tint(255, opacidad);
  image(imagen, 0, 0, width, height);

  noTint();

  pop();

  dibujarRayosDeLuz();
}

function dibujarRayosDeLuz() {
  push();

  noStroke();

  for (let i = 0; i < 5; i++) {
    let x = width * (0.1 + i * 0.2);

    fill(240, 250, 255, 12);

    triangle(x, 0, x + 75, 0, x + 110, height);
  }

  pop();
}

// ======================================
// ESTELAS DE AGUA - JUEGO 4
// ======================================

function dibujarEstelasMarinas() {
  push();

  noFill();

  // Corrientes anchas y muy transparentes
  // Se mueven lentamente detras del juego.

  for (let i = 0; i < 8; i++) {
    let y = height * (0.2 + i * 0.1);

    let movimiento = sin(frameCount * 0.012 + i) * 35;

    // Estela ancha y difuminada
    stroke(200, 240, 255, 18);
    strokeWeight(24);

    beginShape();

    for (let x = -100; x < width + 100; x += 35) {
      let onda = sin(x * 0.009 + frameCount * 0.018 + i) * 20;

      curveVertex(x + movimiento, y + onda);
    }

    endShape();

    // Un brillo mas fino
    stroke(235, 250, 255, 16);
    strokeWeight(5);

    beginShape();

    for (let x = -100; x < width + 100; x += 35) {
      let onda = sin(x * 0.009 + frameCount * 0.018 + i) * 20;

      curveVertex(x + movimiento, y + onda);
    }

    endShape();
  }

  pop();
}

// ======================================
// CARTELES DE MADERA
// ======================================

function dibujarTablaCartel(x, y, ancho, alto) {
  push();
  tint(255, pantalla === 3 ? 130 : 170);
  image(recuadroTextoSimple, x, y, ancho, alto);
  pop();
}

function textoConMargen(texto, x, y, anchoDisponible) {
  push();
  let anchoTexto = textWidth(texto);
  if (anchoTexto > anchoDisponible) {
    textSize((textSize() * anchoDisponible) / anchoTexto);
  }
  text(texto, x, y);
  pop();
}

function dibujarDatoMadera(x, y, ancho, textoDato, tamTexto = 18) {
  dibujarTablaCartel(x, y, ancho, 48);

  push();

  fill(43, 27, 18);
  noStroke();

  textFont("Arial");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(tamTexto);

  textoConMargen(textoDato, x + ancho / 2, y + 24, ancho - 56);

  pop();
}

function dibujarTituloJuego(titulo, centro = width / 2) {
  let ancho = min(520, width - 48, centro * 2 - 40);
  push();
  image(
    recuadroTituloJuego,
    centro - ancho / 2,
    8,
    ancho,
    68,
    0,
    recuadroTituloJuego.height * 0.26,
    recuadroTituloJuego.width,
    recuadroTituloJuego.height * 0.4,
  );
  noStroke();
  fill(43, 27, 18);
  textFont(fuenteTitulo);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(min(18, ancho * 0.04));
  textoConMargen(titulo, centro, 44, ancho * 0.54);
  pop();
}

// Organiza los textos y calcula el espacio necesario
// para que entren dentro del cartel.
function prepararInstruccionesMadera(ancho, pasos, objetivo) {
  push();
  textFont("Arial");
  textStyle(NORMAL);
  textSize(14);
  let grupos = [];
  for (let textos of [pasos, objetivo]) {
    let lineas = [];
    for (let texto of textos) {
      let linea = "";
      for (let palabra of texto.split(" ")) {
        let prueba = linea ? linea + " " + palabra : palabra;
        if (linea && textWidth(prueba) > ancho - 48) {
          lineas.push(linea);
          linea = palabra;
        } else {
          linea = prueba;
        }
      }
      lineas.push(linea);
    }
    grupos.push(lineas);
  }
  pop();
  return {
    pasos: grupos[0],
    objetivo: grupos[1],
    alto: 104 + (grupos[0].length + grupos[1].length) * 20,
  };
}

// Dibuja el cartel de madera con las instrucciones
// y el objetivo de cada juego.
function dibujarInstruccionesMadera(x, y, ancho, pasos, objetivo) {
  let info = prepararInstruccionesMadera(ancho, pasos, objetivo);
  dibujarTablaCartel(x, y, ancho, info.alto);
  push();
  textFont("Arial");
  noStroke();
  fill(43, 27, 18);
  textAlign(LEFT, BASELINE);
  textFont(fuenteTitulo);
  textStyle(NORMAL);
  textSize(16);
  textoConMargen("CÓMO JUGAR", x + 24, y + 36, ancho - 48);
  textFont("Arial");
  textStyle(NORMAL);
  textSize(14);
  for (let i = 0; i < info.pasos.length; i++) {
    text(info.pasos[i], x + 24, y + 62 + i * 20);
  }
  let yObjetivo = y + 74 + info.pasos.length * 20;
  textFont(fuenteTitulo);
  textStyle(NORMAL);
  textSize(16);
  textoConMargen("OBJETIVO", x + 24, yObjetivo, ancho - 48);
  textFont("Arial");
  textStyle(NORMAL);
  textSize(14);
  for (let i = 0; i < info.objetivo.length; i++) {
    text(info.objetivo[i], x + 24, yObjetivo + 26 + i * 20);
  }
  pop();
  return info.alto;
}

function dibujarControlesJuego() {
  let ancho = min(560, width - 48);
  dibujarDatoMadera(
    (width - ancho) / 2,
    height - 88,
    ancho,
    "M: menú · R: reiniciar · S: sonido",
  );
}

// ======================================
// PERGAMINO DE RESULTADOS
// ======================================

function dibujarPergaminoResultado(titulo, subtitulo) {
  push();

  let x = width / 2;
  let y = height / 2;
  let ancho = min(570, width - 40, ((height - 100) * 4) / 3);
  let alto = (ancho * 3) / 4;

 
  image(recuadroResultados, x - ancho / 2, y - alto / 2, ancho, alto);

  noStroke();
  fill(78, 47, 26);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textFont(fuenteTitulo);
  textSize(min(28, ancho * 0.049));
  textoConMargen(titulo, x, y - alto * 0.065, ancho * 0.66);

  textFont("Arial");
  textStyle(NORMAL);
  textSize(min(18, ancho * 0.032));
  textoConMargen(subtitulo, x, y + alto * 0.085, ancho * 0.66);

  textSize(14);
  textoConMargen(
    "M: menú · R: reiniciar · S: sonido",
    x,
    y + alto * 0.27,
    ancho * 0.66,
  );
  pop();
}

// ======================================
// CURSORES
// ======================================

function dibujarCirculoJugador(x, y, jugador) {
  push();

  let colorJugador = jugador === 0 ? COLOR_J1 : COLOR_J2;

  noFill();
  stroke(colorJugador);
  strokeWeight(4);

  circle(x, y, 34);

  noStroke();
  fill(colorJugador);

  circle(x, y, 10);

  textAlign(CENTER);
  textStyle(BOLD);
  textSize(16);

  text("J" + (jugador + 1), x, y - 29);

  pop();
}

// Cursor de indice para burbujas
function dibujarCursorIndice() {
  let manos = obtenerManosPorJugador();
  for (let i = 0; i < 2; i++) {
    if (!manos[i]) continue;
    let indice = manos[i].keypoints[8];
    if (indice) dibujarCirculoJugador(indice.x, indice.y, i);
  }
}

// Cursor con indice y pulgar
function dibujarCursorPellizco(mano, jugador, agarrando) {
  let indice = mano.keypoints[8];
  let pulgar = mano.keypoints[4];

  if (!indice || !pulgar) {
    return;
  }

  let colorJugador = jugador === 0 ? COLOR_J1 : COLOR_J2;

  push();

  stroke(colorJugador);
  strokeWeight(2);

  // Linea entre los dedos
  line(indice.x, indice.y, pulgar.x, pulgar.y);

  // Dos circulos
  noFill();
  strokeWeight(3);

  circle(indice.x, indice.y, 27);

  circle(pulgar.x, pulgar.y, 27);

  // Puntos centrales
  noStroke();
  fill(colorJugador);

  circle(indice.x, indice.y, 7);
  circle(pulgar.x, pulgar.y, 7);

  textAlign(CENTER);
  textStyle(BOLD);
  textSize(16);

  text("J" + (jugador + 1), indice.x, indice.y - 26);

  if (agarrando) {
    text("AGARRADO", indice.x, indice.y - 47);
  }

  pop();
}

// Referencia de colores
function dibujarReferenciaJugadores(x, y) {
  push();

  // Jugador 1
  noFill();
  stroke(COLOR_J1);
  strokeWeight(3);

  circle(x, y, 23);

  noStroke();
  fill(COLOR_J1);
  circle(x, y, 7);

  fill(43, 27, 18);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  textSize(14);

  text("Jugador 1", x + 22, y);

  // Jugador 2
  noFill();
  stroke(COLOR_J2);
  strokeWeight(3);

  circle(x, y + 31, 23);

  noStroke();
  fill(COLOR_J2);

  circle(x, y + 31, 7);

  fill(43, 27, 18);

  text("Jugador 2", x + 22, y + 31);

  pop();
}

// ======================================
// TECLAS
// ======================================

function keyPressed() {
  // M = menu
  if (key === "m" || key === "M") {
    pantalla = 0;

    pezAgarrado = null;
    pellizcandoAntes = false;

    reproducirMusicaPantalla();
  }

  // R = reiniciar
  if (key === "r" || key === "R") {
    if (pantalla === 1) {
      crearBurbujas();
      puntos = [0, 0];
      inicio = millis();
    }

    if (pantalla === 2) {
      crearPeces();
    }

    if (pantalla === 3) {
      crearObjetosBuzo();
    }

    if (pantalla === 4) {
      crearTesoro();
    }
    if (pantalla !== 0) reproducirMusicaPantalla();
  }

  // S = sonido
  if (key === "s" || key === "S") {
    let silenciar = !sonidoMenu.muted;

    sonidoMenu.muted = silenciar;
    sonidoFondoBurbujas.muted = silenciar;
    sonidoFondoPiratas.muted = silenciar;
    sonidoFondoPeces.muted = silenciar;
    sonidoFondoBuceo.muted = silenciar;

    sonidoExplotar.muted = silenciar;
    sonidoMiniBoom.muted = silenciar;
    sonidoAgarrePez.muted = silenciar;
    sonidoPezRescatado.muted = silenciar;
    sonidoChoqueMedusa.muted = silenciar;
    sonidoMoneda.muted = silenciar;
    sonidoGancho.muted = silenciar;
    sonidoObjetoNormal.muted = silenciar;
    sonidoObjetoEspecial.muted = silenciar;
    sonidoRelojOro.muted = silenciar;

    // Se actualizan los efectos clonados que ya estaban sonando.
    for (let efecto of efectosEnReproduccion) efecto.muted = silenciar;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  calcularEscala();
  crearBurbujasPastel();
}

// ================================================================
// 1. PANTALLA MENU
// ================================================================

// ======================================
// MENU PRINCIPAL
// ======================================

function menu() {
  dibujarFondoConImagen(fondoMenu, 170);

  // Burbujitas decorativas
  push();

  noFill();
  stroke(210, 245, 255, 70);
  strokeWeight(2);

  for (let i = 0; i < 22; i++) {
    let x = (i * 173) % width;

    let y = height - ((i * 97 + frameCount * 1.2) % height);

    circle(x, y, 8 + (i % 4) * 5);
  }

  pop();

  // Tipografia original
  push();

  fill(43, 27, 18);
  textAlign(CENTER);
  textFont(fuenteTitulo);
  textStyle(NORMAL);
  textSize(min(60, width * 0.055));

  text("BAJO EL MAR", width / 2, height * 0.17);

  pop();

  // Botones
  let ancho = width * 0.36;
  let alto = height * 0.18;

  let izquierda = width * 0.1;
  let derecha = width * 0.54;

  let arriba = height * 0.3;
  let abajo = height * 0.53;

  dibujarBoton(
    izquierda,
    arriba,
    ancho,
    alto,
    "1 - EXPLOTÁ LAS BURBUJAS",
    "Sumá puntos y esquivá las bombas.",
  );

  dibujarBoton(
    derecha,
    arriba,
    ancho,
    alto,
    "2 - RESCATÁ A LOS PECES",
    "Llevalos a los corales.",
  );

  dibujarBoton(
    izquierda,
    abajo,
    ancho,
    alto,
    "3 - MISIÓN SUBMARINA",
    "Encontrá los objetos perdidos.",
  );

  dibujarBoton(
    derecha,
    abajo,
    ancho,
    alto,
    "4 - RECOLECTÁ MONEDAS",
    "Juntá monedas y evitá los garfios.",
  );
}

// Botones del menu
function dibujarBoton(x, y, ancho, alto, titulo, descripcion) {
  push();

  image(recuadroTitulo, x, y, ancho, alto);

  noStroke();
  fill(43, 27, 18);
  textAlign(CENTER);
  textFont(fuenteTitulo);
  textStyle(NORMAL);
  textSize(min(21, ancho * 0.048));

  textoConMargen(titulo, x + ancho / 2, y + alto * 0.46, ancho * 0.6);

  textFont("Arial");
  textStyle(NORMAL);
  textSize(min(16, ancho * 0.037));

  textoConMargen(descripcion, x + ancho / 2, y + alto * 0.7, ancho * 0.6);

  pop();
}

// ======================================
// SELECCIONAR JUEGOS
// ======================================

function mousePressed() {
  if (pantalla !== 0) {
    return;
  }

  let ancho = width * 0.36;
  let alto = height * 0.18;

  let izquierda = width * 0.1;
  let derecha = width * 0.54;

  let arriba = height * 0.3;
  let abajo = height * 0.53;

  // Juego 1
  if (
    mouseX > izquierda &&
    mouseX < izquierda + ancho &&
    mouseY > arriba &&
    mouseY < arriba + alto
  ) {
    pantalla = 1;

    crearBurbujas();

    puntos = [0, 0];
    inicio = millis();
  }

  // Juego 2
  else if (
    mouseX > derecha &&
    mouseX < derecha + ancho &&
    mouseY > arriba &&
    mouseY < arriba + alto
  ) {
    pantalla = 2;

    crearPeces();
  }

  // Juego 3
  else if (
    mouseX > izquierda &&
    mouseX < izquierda + ancho &&
    mouseY > abajo &&
    mouseY < abajo + alto
  ) {
    pantalla = 3;
    crearObjetosBuzo();
  }

  // Juego 4
  else if (
    mouseX > derecha &&
    mouseX < derecha + ancho &&
    mouseY > abajo &&
    mouseY < abajo + alto
  ) {
    pantalla = 4;

    crearTesoro();
  }
  if (pantalla !== 0) reproducirMusicaPantalla();
}

// ================================================================
// 2. JUEGO 1 - EXPLOTA LAS BURBUJAS
// ================================================================


function crearBurbujas() {
  burbujas = [];

  for (let i = 0; i < 20; i++) {
    let tam = random([30, 50, 75]);

    let b = {
      x: random(width * 0.25, width - 55),

      y: random(170, height - 50),

      tam: tam,

      velocidad: random(1, 3),

      puntos: 1,
    };

    if (tam === 75) {
      b.puntos = 1;
    } else if (tam === 50) {
      b.puntos = 2;
    } else {
      b.puntos = 3;
    }

    burbujas.push(b);
  }

  // Al entrar o reiniciar el Juego 1 se limpian las bombas y los bloqueos.
  reiniciarBombasBurbujas();
}

// Dibujar burbuja
function dibujarBurbuja(b) {
  push();

  if (b.puntos === 1) {
    // Grande naranja
    fill(248, 183, 90, 170);
    stroke(255, 225, 161);
  } else if (b.puntos === 2) {
    // Mediana lila
    fill(226, 154, 232, 170);
    stroke(248, 198, 255);
  } else {
    // Chica verde agua
    fill(114, 220, 202, 170);
    stroke(189, 255, 242);
  }

  strokeWeight(3);

  circle(b.x, b.y, b.tam);

  // Reflejo
  noFill();
  stroke(255, 255, 255, 180);
  strokeWeight(2);

  arc(b.x, b.y, b.tam * 0.7, b.tam * 0.7, PI * 1.1, PI * 1.5);

  pop();
}

// Mover burbujas
function moverBurbujas() {
  for (let b of burbujas) {
    b.y -= b.velocidad;

    if (b.y < -b.tam) {
      b.y = height + b.tam;

      b.x = random(width * 0.25, width - 55);
    }

    dibujarBurbuja(b);
  }
}

// ======================================
// BOMBAS DEL JUEGO 1
// ======================================

function reiniciarBombasBurbujas() {
  bombasBurbujas = [];
  bloqueadoPorBombaHasta = [0, 0];
  proximaTandaBombas = millis() + random(1400, 2900);
}

function crearTandaBombasBurbujas() {
  // A veces una, otras veces dos o tres: nunca hay una cantidad fija.
  let cantidad = floor(random(1, 4));
  let centroX = random(width * 0.36, width * 0.83);

  for (let i = 0; i < cantidad; i++) {
    bombasBurbujas.push({
      // Usamos constrain() para limitar la posición de las bombas
      x: constrain(centroX + random(-115, 115), width * 0.24, width - 45),
      y: height + random(45, 115) + i * random(12, 36),
      tam: random(38, 54),
      vx: random(-1.7, 1.7),
      vy: random(4.0, 7.0),
      fase: random(TWO_PI),
    });
  }
}

function dibujarBombaBurbuja(b) {
  push();
  let x = b.x;
  let y = b.y;
  let t = b.tam;

  // Esfera negra, tapa y brillo.
  noStroke();
  fill(23, 24, 29);
  circle(x, y, t);
  fill(75, 77, 84, 120);
  ellipse(x - t * 0.17, y - t * 0.18, t * 0.24, t * 0.18);
  fill(48, 43, 40);
  rect(x - t * 0.15, y - t * 0.55, t * 0.3, t * 0.19, 4);

  // Mecha curvada.
  noFill();
  stroke(189, 161, 109);
  strokeWeight(3);
  bezier(
    x,
    y - t * 0.5,
    x + 5,
    y - t * 0.8,
    x + t * 0.29,
    y - t * 0.89,
    x + t * 0.42,
    y - t * 0.98,
  );

  // Chispas amarillas animadas.
  let sx = x + t * 0.42;
  let sy = y - t * 0.98;
  stroke(255, 216, 72, 225);
  strokeWeight(2);
  for (let i = 0; i < 12; i++) {
    let a = (TWO_PI * i) / 12;
    let largo = 9 + sin(frameCount * 0.55 + i) * 5;
    line(sx, sy, sx + cos(a) * largo, sy + sin(a) * largo);
  }
  noStroke();
  fill(255, 242, 146);
  circle(sx, sy, 7);
  pop();
}

// Hace aparecer bombas en momentos aleatorios y las mueve.
// Usa for para recorrerlas, sin() para su movimiento lateral
// y dist() para detectar si un jugador las toca.
// Si la toca, queda bloqueado 5 segundos y suena el BOOM.
function actualizarBombasBurbujas() {
  let ahora = millis();

  if (ahora >= proximaTandaBombas) {
    crearTandaBombasBurbujas();
    proximaTandaBombas = ahora + random(3100, 5400);
  }

  for (let k = bombasBurbujas.length - 1; k >= 0; k--) {
    let b = bombasBurbujas[k];
    b.y -= b.vy;
    b.x += b.vx + sin(frameCount * 0.12 + b.fase) * 1.1;

    // Sacar las bombas que ya abandonaron la pantalla.
    if (b.y < -90 || b.x < -80 || b.x > width + 80) {
      bombasBurbujas.splice(k, 1);
      continue;
    }

    // Colisión con el índice. Solo se bloquea el jugador que la tocó.
    let toco = false;
    let manos = obtenerManosPorJugador();
    for (let j = 0; j < 2; j++) {
      if (!manos[j] || ahora < bloqueadoPorBombaHasta[j]) continue;
      let dedo = manos[j].keypoints[8];
      if (!dedo) continue;

      if (dist(dedo.x, dedo.y, b.x, b.y) < b.tam * 0.58) {
        bloqueadoPorBombaHasta[j] = ahora + 5000;
        reproducirEfecto(sonidoMiniBoom);
        toco = true;
        break;
      }
    }

    if (toco) {
      bombasBurbujas.splice(k, 1);
      continue;
    }

    dibujarBombaBurbuja(b);
  }
}

function dibujarAvisoBoomBurbujas() {
  let manos = obtenerManosPorJugador();
  for (let j = 0; j < 2; j++) {
    let ahora = millis();
    if (!manos[j] || ahora >= bloqueadoPorBombaHasta[j]) continue;
    let dedo = manos[j].keypoints[8];
    if (!dedo) continue;

    // El cartel sigue al dedo índice y muestra los segundos restantes.
    let segundos = ceil((bloqueadoPorBombaHasta[j] - ahora) / 1000);
    let cx = constrain(dedo.x, 78, width - 78);
    let cy = constrain(dedo.y - 85, 72, height - 72);

    push();
    translate(cx, cy);
    fill(248, 229, 177);
    stroke(122, 76, 43);
    strokeWeight(3);
    beginShape();
    for (let i = 0; i < 28; i++) {
      let a = (TWO_PI * i) / 28;
      let radio = i % 2 === 0 ? 66 : 47;
      vertex(cos(a) * radio, sin(a) * radio);
    }
    endShape(CLOSE);

    noStroke();
    fill(85, 49, 27);
    textFont("Arial");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(20);
    text("¡BOOM!", 0, -21);
    textSize(25);
    text(segundos + " s", 0, 8);
    textSize(11);
    text("BLOQUEADO", 0, 35);
    pop();
  }
}

// Explotar con indice
function explotarBurbujas() {
  let manos = obtenerManosPorJugador();
  for (let i = 0; i < 2; i++) {
    if (!manos[i]) continue;
    let indice = manos[i].keypoints[8];

    if (!indice) {
      continue;
    }

    // Durante los cinco segundos de BOOM este jugador no suma puntos.
    if (millis() < bloqueadoPorBombaHasta[i]) {
      continue;
    }

    for (let b of burbujas) {
      let distancia = dist(indice.x, indice.y, b.x, b.y);

      if (distancia < b.tam / 2) {
        puntos[i] += b.puntos;

        reproducirEfecto(sonidoExplotar);

        // La burbuja reaparece abajo
        b.x = random(width * 0.25, width - 55);

        b.y = height + b.tam;
      }
    }
  }
}

// Crear burbujitas del fondo
function crearBurbujasPastel() {
  burbujasPastel = [];

  for (let i = 0; i < 45; i++) {
    burbujasPastel.push({
      x: random(width),
      y: random(height),

      tam: random(4, 15),

      velocidad: random(0.7, 2),

      tipo: floor(random(3)),
    });
  }
}

// Burbujitas decorativas
function dibujarBurbujasPastel() {
  push();

  for (let b of burbujasPastel) {
    b.y -= b.velocidad;

    if (b.y < -20) {
      b.y = height + 20;
      b.x = random(width);
    }

    noStroke();

    if (b.tipo === 0) {
      fill(248, 183, 90, 50);
    } else if (b.tipo === 1) {
      fill(226, 154, 232, 50);
    } else {
      fill(114, 220, 202, 50);
    }

    circle(b.x, b.y, b.tam);
  }

  pop();
}

// Cartel pequeño del juego 1
function dibujarCartelBurbujas() {
  let x = 20;
  let ancho = 300;
  let y = min(210, height - 460);
  let altoInfo = dibujarInstruccionesMadera(
    x,
    y,
    ancho,
    ["Tocá las burbujas con el índice.", "Las pequeñas valen más."],
    ["Sumá más puntos que tu rival.", "Tenés 30 segundos."],
  );

  dibujarTablaCartel(x, y + altoInfo + 12, ancho, 132);
  push();
  noStroke();
  fill(43, 27, 18);
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(14);
  let valores = [1, 2, 3];
  let tamanos = [75, 50, 30];
  for (let i = 0; i < 3; i++) {
    let filaY = y + altoInfo + 48 + i * 34;
    dibujarBurbuja({
      x: x + 42,
      y: filaY,
      tam: tamanos[i] * 0.5,
      puntos: valores[i],
    });
    text(valores[i] + (valores[i] === 1 ? " punto" : " puntos"), x + 85, filaY);
  }
  pop();

  dibujarTablaCartel(x, y + altoInfo + 156, ancho, 84);
  dibujarReferenciaJugadores(x + 30, y + altoInfo + 180);
}

// Pantalla juego 1
function juegoBurbujas() {
  dibujarFondoConImagen(fondoBurbujas, 155);

  dibujarBurbujasPastel();

  let restante = max(0, 30 - floor((millis() - inicio) / 1000));

  if (restante > 0) {
    moverBurbujas();
    actualizarBombasBurbujas(); // primero detectar la bomba
    explotarBurbujas(); // después comprobar las burbujas
  } else {
    sonidoFondoBurbujas.pause();

    for (let b of burbujas) {
      dibujarBurbuja(b);
    }
  }

  dibujarCartelBurbujas();

  // Titulo
  dibujarTituloJuego("EXPLOTÁ LAS BURBUJAS");

  let anchoDato = min(220, (width - 80) / 3);

  // Jugador 1
  dibujarDatoMadera(
    width * 0.2 - anchoDato / 2,
    88,
    anchoDato,
    "J1: " + puntos[0],
  );

  // Jugador 2
  dibujarDatoMadera(
    width * 0.8 - anchoDato / 2,
    88,
    anchoDato,
    "J2: " + puntos[1],
  );

  // Tiempo
  dibujarDatoMadera(
    width / 2 - anchoDato / 2,
    88,
    anchoDato,
    "Tiempo: " + restante,
  );

  // Resultado
  if (restante === 0) {
    if (puntos[0] > puntos[1]) {
      dibujarPergaminoResultado("¡GANÓ EL JUGADOR 1!", puntos[0] + " puntos");
    } else if (puntos[1] > puntos[0]) {
      dibujarPergaminoResultado("¡GANÓ EL JUGADOR 2!", puntos[1] + " puntos");
    } else {
      dibujarPergaminoResultado("¡EMPATE!", puntos[0] + " puntos cada uno");
    }
  } else {
    dibujarCursorIndice();
    dibujarAvisoBoomBurbujas(); // sobre el dedo del jugador bloqueado
  }
}

// ================================================================
// 3. JUEGO 2 - RESCATA A LOS PECES
// ================================================================


function crearPeces() {
  peces = [];

  inicioRescate = millis();

  rescatados = 0;
  vidas = 3;

  pezAgarrado = null;
  pellizcandoAntes = false;

  avisoRescate = "";
  avisoHasta = 0;

  // Peces en zona segura
  // Abajo del cartel para que no se tapen
  for (let i = 0; i < 5; i++) {
    let x = width * (0.08 + (i % 2) * 0.1);

    let y = height * (0.58 + floor(i / 2) * 0.12);

    peces.push({
      x: x,
      y: y,

      inicioX: x,
      inicioY: y,

      tam: 35,

      velocidad: random(0.5, 1),

      rescatado: false,
    });
  }

  // Medusas
  medusasRescate = [];

  ultimaMedusa = millis();

  for (let i = 0; i < 5; i++) {
    medusasRescate.push({
      x: random(width * 0.38, width * 0.73),

      y: random(230, height - 80),

      velocidad: random(0.4, 1.1),

      fase: random(TWO_PI),
    });
  }

  // Burbujitas del fondo
  burbujitasFondo = [];

  for (let i = 0; i < 55; i++) {
    burbujitasFondo.push({
      x: random(width),
      y: random(height),

      tam: random(5, 18),

      velocidad: random(2.5, 5.5),
    });
  }

  // Algunas burbujas grandes
  for (let i = 0; i < 12; i++) {
    burbujitasFondo.push({
      x: random(width),
      y: random(height),

      tam: random(18, 34),

      velocidad: random(1.5, 3.2),
    });
  }
}

// Dibujar pez
function dibujarPez(x, y, tam) {
  push();

  noStroke();

  // Cola
  fill(242, 170, 64);

  triangle(
    x - tam * 0.48,
    y,

    x - tam * 1.12,
    y - tam * 0.38,

    x - tam * 1.12,
    y + tam * 0.38,
  );

  // Cuerpo
  fill(248, 201, 82);

  ellipse(x, y, tam * 1.45, tam);

  // Ojo
  fill(15, 29, 40);

  circle(x + tam * 0.43, y - tam * 0.1, 5);

  pop();
}

// Pez atrapado en burbuja
function dibujarPezAtrapado(p) {
  push();

  fill(100, 200, 255, 55);
  stroke(185, 240, 255);
  strokeWeight(2);

  circle(p.x, p.y, 90);

  noFill();
  stroke(255, 255, 255, 140);

  arc(p.x - 2, p.y - 2, 70, 70, PI * 1.08, PI * 1.48);

  pop();

  dibujarPez(p.x, p.y, p.tam);
}

// Movimiento suave de peces
function moverPeces() {
  for (let p of peces) {
    if (!p.rescatado && p !== pezAgarrado) {
      p.x = p.inicioX + sin(frameCount * 0.02 * p.velocidad) * 12;

      p.y = p.inicioY + cos(frameCount * 0.025 * p.velocidad) * 10;
    }
  }
}

// Dibujar medusa
function dibujarMedusa(x, y) {
  push();

  noStroke();
  fill(190, 115, 225, 220);

  arc(x, y, 64, 64, PI, TWO_PI, CHORD);

  fill(225, 170, 250, 190);

  ellipse(x, y, 64, 12);

  stroke(220, 155, 255);
  strokeWeight(3);

  for (let i = -2; i <= 2; i++) {
    let dx = i * 10;

    line(
      x + dx,
      y + 7,

      x + dx + sin(frameCount * 0.06 + i) * 8,

      y + 37,
    );
  }

  pop();
}

// Medusas como obstaculos
function dibujarObstaculos(jugando) {
  // Aparece otra medusa cada 6 segundos
  if (jugando && millis() - ultimaMedusa > 6000) {
    if (medusasRescate.length < 11) {
      medusasRescate.push({
        x: random(width * 0.38, width * 0.73),

        y: height + 45,

        velocidad: random(0.5, 1.3),

        fase: random(TWO_PI),
      });
    }

    ultimaMedusa = millis();
  }

  for (let medusa of medusasRescate) {
    if (jugando) {
      medusa.y -= medusa.velocidad;
    }

    if (medusa.y < -50) {
      medusa.y = height + 50;

      medusa.x = random(width * 0.38, width * 0.73);
    }

    // Movimiento lateral de corriente
    let x = medusa.x + sin(frameCount * 0.012 + medusa.fase) * 65;

    x = constrain(x, width * 0.3, width * 0.82);

    dibujarMedusa(x, medusa.y);

    // Quita vida solo si llevamos un pez
    if (jugando && pezAgarrado !== null) {
      let distancia = dist(pezAgarrado.x, pezAgarrado.y, x, medusa.y);

      if (distancia < 59) {
        pezAgarrado.x = pezAgarrado.inicioX;

        pezAgarrado.y = pezAgarrado.inicioY;

        vidas = max(0, vidas - 1);

        // Descarga corta: un solo sonido por choque; respeta S.
        reproducirEfecto(sonidoChoqueMedusa);

        pezAgarrado = null;

        avisoRescate = "¡Una medusa te quitó una vida!";

        avisoHasta = millis() + 1500;

        break;
      }
    }
  }
}

// Controlar pellizco para rescatar
function controlarRescate() {
  if (hands.length === 0) {
    pellizcandoAntes = false;
    return;
  }

  let mano = hands[0];

  let indice = mano.keypoints[8];
  let pulgar = mano.keypoints[4];

  if (!indice || !pulgar) {
    return;
  }

  let distancia = dist(indice.x, indice.y, pulgar.x, pulgar.y);

  let x = (indice.x + pulgar.x) / 2;

  let y = (indice.y + pulgar.y) / 2;

  let pellizcando;

  // Más tolerancia si ya tiene el pez
  if (pezAgarrado !== null) {
    pellizcando = distancia < 75;
  } else {
    pellizcando = distancia < 45;
  }

  // AGARRAR
  if (pellizcando && !pellizcandoAntes) {
    for (let p of peces) {
      if (!p.rescatado && dist(x, y, p.x, p.y) < 60) {
        pezAgarrado = p;
        reproducirEfecto(sonidoAgarrePez);
        break;
      }
    }
  }

  // MOVER
  if (pellizcando && pezAgarrado !== null) {
    pezAgarrado.x = x;
    pezAgarrado.y = y;
  }

  // SOLTAR
  if (!pellizcando && pezAgarrado !== null) {
    if (enZonaCorales(x, y)) {
      pezAgarrado.rescatado = true;

      rescatados++;

      // Al rescatar se escucha un efecto propio, distinto del estallido.
      reproducirEfecto(sonidoPezRescatado);

      avisoRescate = "¡Pez rescatado!";

      avisoHasta = millis() + 1500;
    } else {
      // Si no llega a los corales, vuelve
      pezAgarrado.x = pezAgarrado.inicioX;

      pezAgarrado.y = pezAgarrado.inicioY;
    }

    pezAgarrado = null;
  }

  pellizcandoAntes = pellizcando;
}

// Zona de corales
function enZonaCorales(x, y) {
  return (
    x > width - 320 && x < width - 15 && y > height - 405 && y < height - 100
  );
}

// Cursor del rescate
function mostrarCursorRescate() {
  if (hands.length === 0) {
    return;
  }

  dibujarCursorPellizco(hands[0], 0, pezAgarrado !== null);
}

// Burbujas visibles del fondo
function dibujarBurbujitasFondo() {
  push();

  for (let b of burbujitasFondo) {
    b.y -= b.velocidad;

    if (b.y < -40) {
      b.y = height + 40;
      b.x = random(width);
    }

    noFill();
    stroke(200, 240, 255, 125);
    strokeWeight(1.5);

    circle(b.x, b.y, b.tam);

    noStroke();
    fill(255, 255, 255, 35);

    circle(b.x - b.tam * 0.18, b.y - b.tam * 0.18, b.tam * 0.22);
  }

  pop();
}

// Cartel de rescate
function dibujarCartelRescate() {
  dibujarInstruccionesMadera(
    20,
    210,
    300,
    ["Pellizcá para agarrar un pez.", "Soltalo dentro de los corales."],
    ["Rescatá 5 peces en 75 segundos.", "Evitá medusas: tenés 3 vidas."],
  );
}

// Pantalla del rescate
function juegoRescate() {
  dibujarFondoConImagen(fondoPeces, 105);

  dibujarBurbujitasFondo();

  dibujarCorales();

  let restante = max(0, 75 - floor((millis() - inicioRescate) / 1000));

  let jugando = vidas > 0 && rescatados < 5 && restante > 0;

  if (jugando) {
    moverPeces();
    controlarRescate();
  }

  // Peces atrapados
  for (let p of peces) {
    if (!p.rescatado) {
      dibujarPezAtrapado(p);
    }
  }

  // Medusas
  dibujarObstaculos(jugando);

  // Peces que llegaron a los corales
  dibujarPecesRescatados();

  // Titulo
  dibujarTituloJuego("RESCATÁ A LOS PECES");

  let anchoDato = min(220, (width - 80) / 3);

  // Peces
  dibujarDatoMadera(
    width * 0.2 - anchoDato / 2,
    88,
    anchoDato,
    "Peces: " + rescatados + "/5",
  );

  // Vidas
  dibujarDatoMadera(
    width * 0.8 - anchoDato / 2,
    88,
    anchoDato,
    "Vidas: " + vidas,
  );

  // Tiempo
  dibujarDatoMadera(
    width / 2 - anchoDato / 2,
    88,
    anchoDato,
    "Tiempo: " + restante,
  );

  // Cartel
  dibujarCartelRescate();

  push();

  dibujarDatoMadera(width - 290, height - 479, 270, "REFUGIO DE CORALES", 16);

  if (millis() < avisoHasta && jugando) {
    let anchoAviso = min(440, width - 360);
    let xAviso = max(336, (width - anchoAviso) / 2);
    dibujarDatoMadera(xAviso, height - 100, anchoAviso, avisoRescate);
  }

  pop();

  // Resultado
  if (!jugando) {
    sonidoFondoPeces.pause();

    if (rescatados === 5) {
      dibujarPergaminoResultado(
        "¡RESCATASTE LOS 5 PECES!",
        "Todos llegaron al refugio",
      );
    } else if (vidas === 0) {
      dibujarPergaminoResultado("¡PERDISTE!", "Te quedaste sin vidas");
    } else {
      dibujarPergaminoResultado(
        "¡TIEMPO TERMINADO!",
        "Rescataste " + rescatados + " de 5 peces",
      );
    }
  } else {
    mostrarCursorRescate();
  }
}

// ======================================
// CORALES
// ======================================

function dibujarCorales() {
  // Se utiliza la imagen PNG del refugio, no el dibujo provisional.
  push();
  noTint();
  image(coralRefugio, width - 340, height - 395, 330, 330);
  pop();
}



// Peces libres entre los corales
function dibujarPecesRescatados() {
  let cantidad = 0;

  for (let p of peces) {
    if (p.rescatado) {
      let x = width - 160 + (cantidad % 2) * 65;

      let y = height - 215 - floor(cantidad / 2) * 50;

      let movimiento = sin(frameCount * 0.04 + cantidad) * 6;

      dibujarPez(x + movimiento, y, 25);

      cantidad++;
    }
  }
}

// ================================================================
// 4. JUEGO 3 - MISION SUBMARINA
// ================================================================


// EXPLORACIÓN CON LINTERNA
function crearObjetosBuzo() {
  objetosBuzo = [];
  bolsaBuzo = [
    [0, 0, 0],
    [0, 0, 0],
  ];
  objetivoBuzo = [null, null];
  inicioMiradaBuzo = [0, 0];
  ganadorBuzo = -1;
  metasBuzo = [
    [1, 1, 1],
    [1, 1, 1],
  ];

  // Cada lista suma 5, con una combinación nueva en cada partida.
  for (let jugador = 0; jugador < 2; jugador++) {
    for (let extra = 0; extra < 2; extra++) {
      metasBuzo[jugador][floor(random(0, 3))]++;
    }
  }
  if (metasBuzo[0].join() === metasBuzo[1].join()) {
    metasBuzo[1] = [metasBuzo[0][1], metasBuzo[0][2], metasBuzo[0][0]];
    if (metasBuzo[0].join() === metasBuzo[1].join()) metasBuzo[1] = [2, 2, 1];
  }

  // Hay suficientes objetos de cada tipo para completar las dos listas.
  // Solo aparecen seis a la vez; al recoger uno se repone en otro lugar.
  for (let i = 0; i < 6; i++) {
    objetosBuzo.push(crearObjetoBuzo());
  }

  // Al menos un hallazgo dorado al comenzar cada partida.
  // Elegimos un tipo que algún jugador necesite dos veces.
  let tiposDorados = [0, 1, 2].filter(function (tipo) {
    return metasBuzo[0][tipo] >= 2 || metasBuzo[1][tipo] >= 2;
  });
  let elegido = floor(random(objetosBuzo.length));
  objetosBuzo[elegido].tipo = tiposDorados[floor(random(tiposDorados.length))];
  objetosBuzo[elegido].valor = 2;
}

function crearObjetoBuzo(anterior = null) {
  let tipos = [];
  for (let tipo = 0; tipo < 3; tipo++) {
    if (
      bolsaBuzo[0][tipo] < metasBuzo[0][tipo] ||
      bolsaBuzo[1][tipo] < metasBuzo[1][tipo]
    ) {
      tipos.push(tipo);
    }
  }
  let objeto = {
    x: 0,
    y: 0,
    tipo: tipos[floor(random(0, tipos.length))],
    valor: random(0, 1) < 0.1 ? 2 : 1,
    encontrado: false,
  };
  let anchoJuego = anchoEscenarioBuzo();
  let margen = min(160, anchoJuego * 0.24, height * 0.26);
  let anchoZona = anchoJuego - margen * 2;
  let altoZona = max(1, height - 300);
  for (let intento = 0; intento < 100; intento++) {
    objeto.x = random(0.05, 0.95);
    objeto.y = random(0.05, 0.95);
    let separado = true;
    if (
      anterior &&
      dist(
        objeto.x * anchoZona,
        objeto.y * altoZona,
        anterior.x * anchoZona,
        anterior.y * altoZona,
      ) <
        RADIO_LINTERNA * 2
    ) {
      separado = false;
    }
    for (let otro of objetosBuzo) {
      if (
        !otro.encontrado &&
        dist(
          objeto.x * anchoZona,
          objeto.y * altoZona,
          otro.x * anchoZona,
          otro.y * altoZona,
        ) < 90
      ) {
        separado = false;
      }
    }
    if (separado) break;
  }
  return objeto;
}

// Divide el juego para los dos buzos y controla sus linternas.
// Usa for para recorrer a los jugadores y los objetos.
// Con dist() e if detecta si la luz ilumina un objeto.
// Con millis() comprueba cuánto tiempo lo iluminamos.
// Si se cumple el tiempo, recoge el objeto, suma puntos
// y reproduce un sonido. Los dorados se recogen más rápido.
function juegoBuzo() {
  let anchoJuego = anchoEscenarioBuzo();
  let margen = min(160, anchoJuego * 0.24, height * 0.26);
  let totales = [
    bolsaBuzo[0][0] + bolsaBuzo[0][1] + bolsaBuzo[0][2],
    bolsaBuzo[1][0] + bolsaBuzo[1][1] + bolsaBuzo[1][2],
  ];
  let manosPorJugador = obtenerManosPorJugador();

  dibujarFondoMarino(true);
  push();
  noStroke();
  fill(0, 0, 0, 105);
  rect(0, 0, width, height);
  pop();

  for (let jugador = 0; jugador < 2; jugador++) {
    let manoLuz = manosPorJugador[jugador];

    if (manoLuz && ganadorBuzo === -1) {
      let luzX = constrain(
        (manoLuz.keypoints[8].x - (jugador * width) / 2) *
          (anchoJuego / (width / 2)),
        0,
        anchoJuego,
      );
      let luzY = manoLuz.keypoints[8].y;

      let mirando = null;
      let distanciaCercana = RADIO_LINTERNA * 0.8;
      for (let objeto of objetosBuzo) {
        let x = margen + objeto.x * (anchoJuego - margen * 2);
        let y = 135 + objeto.y * max(1, height - 300);
        let distancia = dist(luzX, luzY, x, y);
        if (
          !objeto.encontrado &&
          bolsaBuzo[jugador][objeto.tipo] < metasBuzo[jugador][objeto.tipo] &&
          distancia < distanciaCercana
        ) {
          mirando = objeto;
          distanciaCercana = distancia;
        }
      }

      // Hay que iluminar el mismo objeto: 1 segundo, o 0,5 si es dorado.
      if (mirando !== objetivoBuzo[jugador]) {
        objetivoBuzo[jugador] = mirando;
        inicioMiradaBuzo[jugador] = millis();
      }
      let tiempoRecoger =
        mirando && mirando.valor === 2 ? 500 : TIEMPO_RECOGER_BUZO;
      if (mirando && millis() - inicioMiradaBuzo[jugador] >= tiempoRecoger) {
        mirando.encontrado = true;
        let sonido = sonidoObjetoNormal;
        if (mirando.valor === 2) sonido = sonidoObjetoEspecial;
        reproducirEfecto(sonido);
        let suma = min(
          mirando.valor,
          metasBuzo[jugador][mirando.tipo] - bolsaBuzo[jugador][mirando.tipo],
        );
        bolsaBuzo[jugador][mirando.tipo] += suma;
        totales[jugador] += suma;
        if (totales[jugador] === 5) ganadorBuzo = jugador;
        if (ganadorBuzo === -1) {
          let nuevoObjeto = crearObjetoBuzo(mirando);
          objetosBuzo[objetosBuzo.indexOf(mirando)] = nuevoObjeto;
        }
        objetivoBuzo[jugador] = null;
      }

      dibujarLuzBuzo(jugador, luzX, luzY, anchoJuego, margen);
    } else {
      objetivoBuzo[jugador] = null;
    }
  }

  // Borde celeste que muestra cuánto falta para recoger.
  for (let jugador = 0; jugador < 2; jugador++) {
    let objeto = objetivoBuzo[jugador];
    if (objeto && !objeto.encontrado && ganadorBuzo === -1) {
      let x = margen + objeto.x * (anchoJuego - margen * 2);
      let y = 135 + objeto.y * max(1, height - 300);
      let tiempoRecoger = objeto.valor === 2 ? 500 : TIEMPO_RECOGER_BUZO;
      let progreso = min(
        1,
        (millis() - inicioMiradaBuzo[jugador]) / tiempoRecoger,
      );
      drawingContext.save();
      drawingContext.lineWidth = 3;
      drawingContext.globalAlpha = 0.25;
      drawingContext.strokeStyle = COLORES_BUZOS[jugador];
      drawingContext.beginPath();
      drawingContext.arc(x, y, 25 + jugador * 4, 0, Math.PI * 2);
      drawingContext.stroke();
      drawingContext.globalAlpha = 1;
      drawingContext.strokeStyle = COLORES_BUZOS[jugador];
      drawingContext.beginPath();
      drawingContext.arc(
        x,
        y,
        25 + jugador * 4,
        -Math.PI / 2,
        -Math.PI / 2 + progreso * Math.PI * 2,
      );
      drawingContext.stroke();
      drawingContext.restore();
    }
  }

  push();
  noStroke();
  textAlign(CENTER);

  let xPanel = anchoJuego + 12;
  let anchoPanel = width - anchoJuego - 24;
  let pasosBuzo = ["Mantené la luz sobre un objeto.", "Los dorados suman hasta 2."];
  let objetivoBuzoTexto = ["Completá tu lista de 5 primero."];
  let altoInfo = prepararInstruccionesMadera(
    anchoPanel,
    pasosBuzo,
    objetivoBuzoTexto,
  ).alto;
  let altoBolsa = min(144, (height - altoInfo - 60) / 2);
  let altoGrupo = altoInfo + 24 + altoBolsa * 2;
  let arribaGrupo = max(18, min(130, (height - altoGrupo) / 2));
  dibujarInstruccionesMadera(
    xPanel,
    arribaGrupo,
    anchoPanel,
    pasosBuzo,
    objetivoBuzoTexto,
  );

  for (let jugador = 0; jugador < 2; jugador++) {
    let arriba = arribaGrupo + altoInfo + 12 + jugador * (altoBolsa + 12);
    dibujarTablaCartel(xPanel, arriba, anchoPanel, altoBolsa);
    textFont("Arial");
    textAlign(LEFT, CENTER);
    fill(43, 27, 18);
    textFont(fuenteTitulo);
    textStyle(NORMAL);
    textSize(18);
    textoConMargen(
      "Jugador " + (jugador + 1),
      xPanel + 104,
      arriba + 30,
      anchoPanel - 128,
    );
    image(
      jugador === 0 ? imagenBolsaBuzo : imagenBolsaBuzoRoja,
      xPanel + 24,
      arriba + 10,
      64,
      64,
    );
    textFont("Arial");
    textStyle(BOLD);
    textoConMargen(
      totales[jugador] + "/5",
      xPanel + 104,
      arriba + 56,
      anchoPanel - 128,
    );

    textAlign(CENTER, CENTER);
    for (let tipo = 0; tipo < 3; tipo++) {
      let x = xPanel + 24 + ((tipo + 0.5) * (anchoPanel - 48)) / 3;
      let y = arriba + altoBolsa - 46;
      image(imagenesHallazgos[tipo], x - 14, y - 14, 28, 28);
      textStyle(NORMAL);
      textSize(14);
      textoConMargen(
        bolsaBuzo[jugador][tipo] + "/" + metasBuzo[jugador][tipo],
        x,
        arriba + altoBolsa - 20,
        (anchoPanel - 48) / 3 - 12,
      );
    }
  }

  dibujarTituloJuego("MISIÓN SUBMARINA");

  if (ganadorBuzo !== -1) {
    sonidoFondoBuceo.pause();
    dibujarPergaminoResultado(
      "¡GANÓ EL JUGADOR " + (ganadorBuzo + 1) + "!",
      "",
    );
  }
  pop();
}

// La cámara ocupa la base. Los objetos solo se dibujan dentro de esta luz.
function anchoEscenarioBuzo() {
  return width - min(340, max(280, width * 0.2));
}

function dibujarLuzBuzo(jugador, luzX, luzY, anchoJuego, margen) {
  let capa = capaLinternaBuzo;
  let radio = RADIO_LINTERNA;
  capa.clear();
  capa.push();
  capa.translate(radio - luzX, radio - luzY);
  capa.image(fondoBuzo, 0, 0, anchoJuego, height);

  let contexto = capa.drawingContext;
  let colorLuz = jugador === 0 ? "69,185,240" : "250,118,111";
  contexto.fillStyle = "rgba(" + colorLuz + ",0.16)";
  contexto.fillRect(luzX - radio, luzY - radio, radio * 2, radio * 2);

  for (let objeto of objetosBuzo) {
    if (!objeto.encontrado) {
      let x = margen + objeto.x * (anchoJuego - margen * 2);
      let y = 135 + objeto.y * max(1, height - 300);
      let imagenObjeto = imagenesHallazgos[objeto.tipo];
      contexto.save();
      if (objeto.valor === 2) {
        imagenObjeto = imagenesHallazgosDorados[objeto.tipo];
        contexto.shadowColor = "#FFD45A";
        contexto.shadowBlur = 14;
      }
      capa.image(imagenObjeto, x - 20, y - 20, 40, 40);
      contexto.restore();
      if (objeto.valor === 2) {
        capa.stroke("#FFF8DA");
        capa.strokeWeight(1.5);
        let destello = 3 + 2 * sin(millis() / 200);
        capa.line(x + 11 - destello, y - 11, x + 11 + destello, y - 11);
        capa.line(x + 11, y - 11 - destello, x + 11, y - 11 + destello);
      }
    }
  }
  capa.pop();

  // La transparencia del borde mezcla la escena con la cámara que hay debajo.
  contexto.save();
  contexto.globalCompositeOperation = "destination-in";
  let mascara = contexto.createRadialGradient(
    radio,
    radio,
    radio * 0.5,
    radio,
    radio,
    radio,
  );
  mascara.addColorStop(0, "rgba(255,255,255,1)");
  mascara.addColorStop(1, "rgba(255,255,255,0)");
  contexto.fillStyle = mascara;
  contexto.fillRect(0, 0, radio * 2, radio * 2);
  contexto.restore();

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 85, anchoJuego, height - 135);
  drawingContext.clip();
  image(capa, luzX - radio, luzY - radio);
  image(imagenesBuzos[jugador], luzX - 145, luzY - 30, 120, 60);
  drawingContext.restore();
  pop();
}

// ================================================================
// 5. JUEGO 4 - RECOLECTA MONEDAS
// ================================================================


// REINICIAR JUEGO 4
function crearTesoro() {
  faseOroTesoro = 0;
  sonidoRelojOro.pause();
  sonidoRelojOro.currentTime = 0;

  puntosTesoro = [0, 0];

  pellizcoAntesTesoro = [false, false];

  inicioTesoro = millis();

  objetosTesoro = [];

  // Empieza con 1, 2 o 3 objetos
  // elegidos al azar
  cantidadGrupoTesoro = floor(random(1, 4));

  crearGrupoTesoro();
}

// ======================================
// CREAR GRUPOS DE MONEDAS
// ======================================

function crearGrupoTesoro() {
  objetosTesoro = [];

  ultimoGrupoTesoro = millis();

  // Los grupos duran entre 2 y 3,5 s
  duracionGrupoTesoro = random(2000, 3500);

  for (let i = 0; i < cantidadGrupoTesoro; i++) {
    let x = random(width * 0.36, width * 0.9);

    let y = random(height * 0.3, height * 0.87);

    // Evitar superponer los objetos
    // Probamos distintas posiciones.
    for (let intento = 0; intento < 20; intento++) {
      let muyCerca = false;

      for (let otro of objetosTesoro) {
        if (dist(x, y, otro.x, otro.y) < 145) {
          muyCerca = true;
        }
      }

      if (!muyCerca) {
        break;
      }

      x = random(width * 0.36, width * 0.9);

      y = random(height * 0.3, height * 0.87);
    }

    objetosTesoro.push({
      x: x,
      y: y,

      tam: random(65, 85),

      // 0 = moneda
      // 1 = garfio
      // 2 = desaparecido
      tipo: 0,

          // Moneda dura entre 0,4 y 1,4 s
      cambio: millis() + random(400, 1400),
    });
  }
}

// ======================================
// CAMBIOS ALEATORIOS MONEDA / GARFIO
// ======================================

function actualizarObjetosTesoro() {
  // Cuando se cumple el tiempo del grupo
  // aparece otro grupo diferente.
  if (millis() - ultimoGrupoTesoro > duracionGrupoTesoro) {
    // Cada grupo tiene entre 1 y 3 objetos
    cantidadGrupoTesoro = floor(random(1, 4));

    crearGrupoTesoro();
  }

  // Cada objeto cambia por separado
  for (let obj of objetosTesoro) {
    // Si desaparecio, no se actualiza
    if (obj.tipo === 2) {
      continue;
    }

    if (millis() >= obj.cambio) {
      // SI ES MONEDA:
      // pasa a garfio en el mismo lugar
      if (obj.tipo === 0) {
        obj.tipo = 1;

              // Garfio dura 0,5 a 1,2 s
        obj.cambio = millis() + random(500, 1200);
      }

      // SI ES GARFIO:
      // elige una de tres posibilidades
      else {
        let opcion = random(3);

        // OPCION 1:
        // vuelve a ser moneda
        // en la misma posicion
        if (opcion < 1) {
          obj.tipo = 0;

                  // Moneda dura 0,4 a 1,4 s
          obj.cambio = millis() + random(400, 1400);
        }

        // OPCION 2:
        // sigue siendo garfio un rato mas
        else if (opcion < 2) {
          obj.tipo = 1;

                  // Suma un tiempo aleatorio
          obj.cambio = millis() + random(500, 1200);
        }

        // OPCION 3:
        // desaparece hasta el proximo grupo
        else {
          obj.tipo = 2;
        }
      }
    }
  }
}

// ======================================
// DIBUJAR MONEDAS Y GARFIOS
// ======================================

function dibujarObjetosTesoro() {
  for (let obj of objetosTesoro) {
    // Moneda
    if (obj.tipo === 0) {
      image(
        monedaTesoro,
        obj.x - obj.tam / 2,
        obj.y - obj.tam / 2,
        obj.tam,
        obj.tam,
      );
    }

    // Garfio
    else if (obj.tipo === 1) {
      image(
        ganchoPirata,
        obj.x - obj.tam / 2,
        obj.y - obj.tam / 2,
        obj.tam,
        obj.tam,
      );
    }

    // Tipo 2 no se dibuja
  }
}

// ======================================
// PELLIZCOS DE DOS JUGADORES
// ======================================

function controlarTesoro() {
  let manos = obtenerManosPorJugador();
  for (let i = 0; i < 2; i++) {
    if (!manos[i]) {
      pellizcoAntesTesoro[i] = false;
      continue;
    }

    let mano = manos[i];

    let indice = mano.keypoints[8];
    let pulgar = mano.keypoints[4];

    if (!indice || !pulgar) {
      continue;
    }

    let distancia = dist(indice.x, indice.y, pulgar.x, pulgar.y);

    // Pellizco
    let pellizcando = distancia < 45;

    // Centro entre indice y pulgar
    let x = (indice.x + pulgar.x) / 2;

    let y = (indice.y + pulgar.y) / 2;

    // Cuenta solo cuando se juntan
    // los dedos por primera vez
    if (pellizcando && !pellizcoAntesTesoro[i]) {
      for (let obj of objetosTesoro) {
        // Ignorar objetos desaparecidos
        if (obj.tipo === 2) {
          continue;
        }

        let d = dist(x, y, obj.x, obj.y);

        if (d < obj.tam / 2 + 12) {
          // MONEDA = +1
          if (obj.tipo === 0) {
            puntosTesoro[i] += 1;

            reproducirEfecto(sonidoMoneda);
          }

          // GARFIO = PIERDE TODO
          else {
            puntosTesoro[i] = 0;

            reproducirEfecto(sonidoGancho);
          }

          // Objeto desaparece
          // No reaparece enseguida
          obj.tipo = 2;

          // Un solo objeto por pellizco
          break;
        }
      }
    }

    pellizcoAntesTesoro[i] = pellizcando;
  }
}

// ======================================
// CARTEL PIRATA DEL JUEGO 4
// ======================================

function dibujarCartelTesoro() {
  let x = 20;
  let y = min(210, height - 460);
  let ancho = 300;
  let altoInfo = dibujarInstruccionesMadera(
    x,
    y,
    ancho,
    ["Pellizcá las monedas para sumar.", "Los garfios quitan todo tu puntaje."],
    ["Juntá más monedas que tu rival.", "Tenés 40 segundos."],
  );

  dibujarTablaCartel(x, y + altoInfo + 12, ancho, 128);
  push();
  noStroke();
  fill(43, 27, 18);
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(14);
  image(monedaTesoro, x + 20, y + altoInfo + 36, 34, 34);
  textoConMargen("Sumás 1 moneda", x + 68, y + altoInfo + 53, ancho - 96);
  image(ganchoPirata, x + 20, y + altoInfo + 80, 34, 34);
  textoConMargen(
    "Perdés todas las monedas",
    x + 68,
    y + altoInfo + 97,
    ancho - 96,
  );
  pop();

  dibujarTablaCartel(x, y + altoInfo + 152, ancho, 84);
  dibujarReferenciaJugadores(x + 30, y + altoInfo + 176);
}

// ======================================
// PANTALLA JUEGO 4
// ======================================

function juegoTesoro() {
  // Fondo del naufragio
  dibujarFondoConImagen(fondoPirata, 175);

  // Estelas de agua
  // Muy suaves y sin burbujitas
  dibujarEstelasMarinas();

  let restante = max(0, 40 - floor((millis() - inicioTesoro) / 1000));

  if (restante > 0) {
    actualizarFiebreOroTesoro();
    if (faseOroTesoro === 0 || faseOroTesoro === 3) {
      actualizarObjetosTesoro();
    }

    if (faseOroTesoro === 1 || faseOroTesoro === 2) {
      push();
      noStroke();
      fill(255, 197, 55, faseOroTesoro === 1 ? 55 : 80);
      rect(0, 0, width, height);
      pop();
    }

    // Mostrar monedas y garfios
    dibujarObjetosTesoro();

    // Controlar a los dos jugadores
    controlarTesoro();
  } else {
    sonidoFondoPiratas.pause();
    sonidoRelojOro.pause();
  }

  // Titulo
  dibujarTituloJuego("RECOLECTÁ MONEDAS");

  let anchoDato = min(220, (width - 80) / 3);

  // Jugador 1
  dibujarDatoMadera(
    width * 0.2 - anchoDato / 2,
    88,
    anchoDato,
    "J1: " + puntosTesoro[0],
  );

  // Jugador 2
  dibujarDatoMadera(
    width * 0.8 - anchoDato / 2,
    88,
    anchoDato,
    "J2: " + puntosTesoro[1],
  );

  // Tiempo
  dibujarDatoMadera(
    width / 2 - anchoDato / 2,
    88,
    anchoDato,
    "Tiempo: " + restante,
  );

  // Instrucciones
  dibujarCartelTesoro();
  dibujarAvisoFiebreOro();

  // Cursores de ambos jugadores
  if (restante > 0) {
    let manos = obtenerManosPorJugador();
    for (let i = 0; i < 2; i++) {
      if (manos[i]) dibujarCursorPellizco(manos[i], i, false);
    }
  }

  // Resultado en pergamino
  if (restante === 0) {
    if (puntosTesoro[0] > puntosTesoro[1]) {
      dibujarPergaminoResultado(
        "¡GANÓ EL JUGADOR 1!",
        puntosTesoro[0] + " monedas",
      );
    } else if (puntosTesoro[1] > puntosTesoro[0]) {
      dibujarPergaminoResultado(
        "¡GANÓ EL JUGADOR 2!",
        puntosTesoro[1] + " monedas",
      );
    } else {
      dibujarPergaminoResultado(
        "¡EMPATE!",
        puntosTesoro[0] + " monedas cada uno",
      );
    }
  }
}

function actualizarFiebreOroTesoro() {
  let transcurrido = millis() - inicioTesoro;
  if (transcurrido < INICIO_ORO_TESORO) return;

  if (transcurrido < INICIO_ORO_TESORO + DURACION_ORO_TESORO) {
    if (faseOroTesoro !== 1) {
      faseOroTesoro = 1;
      objetosTesoro = [];
      let izquierda = max(350, width * 0.36);
      let ancho = width - 45 - izquierda;
      let alto = max(150, height - 360);
      let tam = min(60, (ancho / 6) * 0.65, (alto / 5) * 0.65);
      for (let fila = 0; fila < 5; fila++) {
        for (let columna = 0; columna < 6; columna++) {
          objetosTesoro.push({
            x: izquierda + ((columna + 0.5) * ancho) / 6,
            y: 260 + ((fila + 0.5) * alto) / 5,
            tam: tam,
            tipo: 0,
          });
        }
      }
      sonidoRelojOro.currentTime = 0;
      sonidoRelojOro.play().catch(function () {});
    }
  } else if (
    transcurrido <
    INICIO_ORO_TESORO + DURACION_ORO_TESORO + DURACION_TRAMPA_TESORO
  ) {
    if (faseOroTesoro !== 2) {
      faseOroTesoro = 2;
      for (let objeto of objetosTesoro) {
        if (objeto.tipo === 0) objeto.tipo = 1;
      }
      sonidoRelojOro.pause();
    }
  } else if (faseOroTesoro !== 3) {
    faseOroTesoro = 3;
    sonidoRelojOro.pause();
    cantidadGrupoTesoro = floor(random(1, 4));
    crearGrupoTesoro();
  }
}

function dibujarAvisoFiebreOro() {
  if (faseOroTesoro !== 1 && faseOroTesoro !== 2) return;
  let ancho = min(440, width - 360);
  let x = max(336, (width - ancho) / 2);
  let y = 190;
  let restante = max(
    0,
    ceil(
      (INICIO_ORO_TESORO + DURACION_ORO_TESORO - (millis() - inicioTesoro)) /
        1000,
    ),
  );
  let titulo =
    faseOroTesoro === 1
      ? "FIEBRE DE ORO · " + restante + " s"
      : "¡CUIDADO CON LOS GARFIOS!";
  dibujarDatoMadera(x, y, ancho, titulo);
  push();
  noFill();
  stroke(43, 27, 18);
  strokeWeight(2);
  circle(x + 24, y + 24, 22);
  line(x + 24, y + 24, x + 24, y + 17);
  line(x + 24, y + 24, x + 29, y + 27);
  pop();
}
