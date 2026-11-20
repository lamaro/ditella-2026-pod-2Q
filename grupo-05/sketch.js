const MODO_PRUEBA = false;

const ESPEJO = true;
const VIDEO_ANCHO = 640;
const VIDEO_ALTO = 480;

const FPS = 60;

const ALTO_MARCADOR = 88;
const RADIO_PELOTA = 25;
const FUERZA_REBOTE = 16;
const FUERZA_LENTA = 13;
const GROSOR_TABLA = 15;
const ANCHO_MIN_PALMA = 210;
const ANCHO_MAX_PALMA = 360;
const ESPERA_PALMA = 8;

const ANCHO_BLOQUE = 114;
const ALTO_BLOQUE = 38;
const RAPIDEZ_ARENA = 3;
const INTERVALO_ARENA = 7 * FPS;
const RADIO_PUNO = 42;

const VIDAS_INICIALES = 5;
const FALLOS_POR_VIDA = 3;
const DURACION_NIVEL_1 = 30 * FPS;

const INTERVALO_ARENA_CASTILLO = 10 * FPS;

const INTERVALO_ARENA_MAREA = 7 * FPS;
const PASADAS_CANGREJO = [4 * FPS, 16 * FPS];
const DURACION_PASADA = 7 * FPS;
const SUBIDA_MAREA = 0.045;
const BAJADA_POR_ARENA = 60;
const SUBIDA_POR_ESCAPE = 18;
const DURACION_AVISO = 2 * FPS;
const DURACION_CUENTA = 3 * FPS;

const FONDO = "#192025";
const CREMA = "#F4ECDC";
const AMARILLO = "#F1C963";
const CELESTE = "#7ACBC5";
const ROJO = "#D96C60";
const AZUL = "#103F4D";

let video;
let modeloManos;
let manos = [];
let escala = 1;
let margenX = 0;
let margenY = 0;

let fuente;
let imagenPelota, imagenArena, imagenLadrillo, imagenLadrilloAmarillo, imagenPlaya, imagenBarra;
let imagenMarOla, imagenMarEspuma;
let imagenCopa, imagenCangrejo;
let sonidoRebote, sonidoRomper, sonidoVida, sonidoGanar, sonidoCuenta;

let estado = "inicio";
let nivel = 1;
let vidas = VIDAS_INICIALES;
let puntos = 0;
let puntosPorSet = ["—", "—", "—", "—"];
let fallos = 0;
let cuadrosNivel = 0;
let proximaArena = 0;
let intervaloArena = INTERVALO_ARENA;
let marea = 0;
let fondoLadrillos = 0;
let cuenta = 0;
let aviso = 0;
let motivoAviso = "";
let textoYa = 0;
let pausado = false;
let verPuntos = false;
let gravedad = 0.3;
let fuerza = FUERZA_REBOTE;
let animacion = 0;

let tabla = { x: 0, y: 0, ancho: 250, anteriorX: 0, anteriorY: 0, visible: false, sinPalma: 0 };
let puno = { x: 0, y: 0, visible: false };
let tarjeta = { x: 0, y: 0, escala: 1 };
let tutorial = { pelotaX: 200, pelotaY: 40, velX: 1, velY: 0, tablaX: 200, arenaY: 6, golpe: 0 };

let niveles = [
  {
    titulo: "Rebote y puño",
    objetivo: "Aguantá 30 segundos",

    reglas: [
      { clave: "PALMA DERECHA", texto: "mantené la pelota en el aire" },
      { clave: "PUÑO IZQUIERDO", texto: "rompé la arena que cae" },
      { clave: "-1 VIDA", texto: "si se cae la pelota" },
      { clave: "-1 VIDA", texto: "si se escapan 3 bloques de arena" }
    ],
    consejo: "Buscá buena luz y que la cámara vea tus dos manos",
    castillo: [],
    desbloqueado: true,
    completado: false,
    existe: true
  },
  {
    titulo: "Rompé ladrillos",
    objetivo: "Rompé los 21 ladrillos",
    reglas: [
      { clave: "PELOTA", texto: "pegale a los ladrillos" },
      { clave: "DORADO", texto: "suelta 2 pelotas extra" },
      { clave: "-1 VIDA", texto: "solo si se caen TODAS las pelotas" },
      { clave: "PUÑO", texto: "la arena sigue cayendo" }
    ],
    consejo: "Pegale con el borde de la tabla para apuntar",

    castillo: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 9, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ],
    desbloqueado: false,
    completado: false,
    existe: true
  },
  {
    titulo: "El castillo",
    objetivo: "Rompé el castillo de arena",
    reglas: [
      { clave: "¡OJO!", texto: "la arena que se escapa ARREGLA el castillo" },
      { clave: "PUÑO", texto: "rompé la arena para que no lo repare" },
      { clave: "OSCUROS", texto: "necesitan 2 golpes (mirá los puntitos)" },
      { clave: "DORADO", texto: "suelta 2 pelotas extra" }
    ],
    consejo: "Usá las dos manos a la vez: una rompe, la otra defiende",
    castillo: [
      [2, 0, 0, 2, 0, 0, 2],
      [2, 0, 0, 1, 0, 0, 2],
      [1, 1, 1, 9, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ],
    desbloqueado: false,
    completado: false,
    existe: true
  },
  {
    titulo: "Set final: Tormenta",
    objetivo: "Rompé todos los ladrillos",
    reglas: [
      { clave: "¡EL MAR SUBE!", texto: "la pelota que toca el agua se pierde" },
      { clave: "PUÑO", texto: "cada arena rota BAJA el mar" },
      { clave: "¡OJO!", texto: "la arena que llega al agua lo SUBE" },
      { clave: "CANGREJO", texto: "deja 2 ladrillos de dos golpes por pasada" }
    ],
    consejo: "Rompé los ladrillos del castillo y los que deja el cangrejo.",
    castillo: [
      [2, 0, 0, 2, 0, 0, 2],
      [2, 0, 9, 2, 9, 0, 2],
      [2, 1, 1, 2, 1, 1, 2],
      [1, 1, 1, 1, 1, 1, 1]
    ],
    desbloqueado: false,
    completado: false,
    existe: true
  }
];
let pelotas = [];
let arenas = [];
let ladrillos = [];
let pedazos = [];
let mensajes = [];
let botones = [];

// Carga de imágenes y sonidos
function preload() {
  modeloManos = ml5.handPose({ maxHands: 2, flipped: ESPEJO });

  imagenPelota = loadImage("assets/imagenes/pelota.png");
  imagenArena = loadImage("assets/imagenes/arena.png");
  imagenLadrillo = loadImage("assets/imagenes/ladrillo.png");
  imagenLadrilloAmarillo = loadImage("assets/imagenes/ladrillo_amarillo.png");
  imagenPlaya = loadImage("assets/imagenes/playa.png");
  imagenCopa = loadImage("assets/imagenes/copa.png");
  imagenCangrejo = loadImage("assets/imagenes/cangrejo.png");
  imagenBarra = loadImage("assets/imagenes/barra.png");
  imagenMarOla = loadImage("assets/imagenes/mar_ola.png");
  imagenMarEspuma = loadImage("assets/imagenes/mar_espuma.png");

  sonidoRebote = loadSound("assets/sonidos/rebote.wav");
  sonidoRomper = loadSound("assets/sonidos/romper.wav");
  sonidoVida = loadSound("assets/sonidos/perder_vida.wav");
  sonidoGanar = loadSound("assets/sonidos/ganar.wav");
  sonidoCuenta = loadSound("assets/sonidos/cuenta.wav");

  fuente = loadFont("assets/fuentes/LilitaOne.ttf");
}

// Cámara y detección de manos
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(FPS);
  textFont(fuente);

  sonidoRebote.playMode("restart");
  sonidoRomper.playMode("restart");

  video = createCapture(VIDEO, { flipped: ESPEJO });
  video.size(VIDEO_ANCHO, VIDEO_ALTO);
  video.hide();
  modeloManos.detectStart(video, recibirManos);

  calcularEscala();

  if (MODO_PRUEBA) {
    for (let i = 0; i < niveles.length; i++) {
      niveles[i].desbloqueado = true;
    }
  }
}

// Pantallas del juego
function draw() {
  botones = [];
  animacion++;
  background(FONDO);
  image(video, margenX, margenY, VIDEO_ANCHO * escala, VIDEO_ALTO * escala);

  noStroke();
  if (estado === "jugando") {
    fill(17, 23, 27, 110);
  } else {
    fill(14, 43, 67, 175);
  }
  rect(0, 0, width, height);

  if (estado === "inicio") {
    dibujarInicio();
  } else if (estado === "niveles") {
    dibujarNiveles();
  } else if (estado === "objetivo") {
    dibujarObjetivo();
  } else if (estado === "jugando") {
    jugar();
  } else if (estado === "ganaste") {
    dibujarVictoria();
  } else {
    dibujarResultado();
  }
}

// Tarjeta de los menús
function prepararTarjeta(ancho, alto) {
  let e = width / (ancho + 60);
  if (height / (alto + 60) < e) e = height / (alto + 60);
  if (e > 1) e = 1;
  tarjeta.x = width / 2;
  tarjeta.y = height / 2;
  tarjeta.escala = e;

  image(imagenPlaya, 0, 0, width, height);
  push();
  translate(tarjeta.x, tarjeta.y);
  scale(tarjeta.escala);
  noStroke();
  fill(5, 45, 59, 235);
  rect(-ancho / 2, -alto / 2, ancho, alto, 12);
  image(imagenBarra, -ancho / 2, -alto / 2, ancho, 90);

}

// Pantalla de inicio
function dibujarInicio() {
  prepararTarjeta(800, 480);

  textAlign(CENTER, CENTER);
  fill(AMARILLO);
  textSize(52);
  text("BRICKFLICK", 0, -197);

  textAlign(LEFT, CENTER);
  fill(AMARILLO);
  textSize(24);
  text("Sos el guardián de la playa.", -370, -122);

  fill(CREMA);
  textSize(15);
  text("La marea trae arena y una pelota que nunca puede tocar el agua.", -370, -92);

  fill(CELESTE);
  textSize(24);
  text("PALMA DERECHA", -370, -48);
  text("PUÑO IZQUIERDO", -370, 18);
  fill(CREMA);
  textSize(16);
  text("hacé rebotar la pelota", -370, -22);
  text("rompé la arena antes de que llegue", -370, 44);

  fill(CREMA);
  textSize(13);
  text(VIDAS_INICIALES + " VIDAS · 3 BLOQUES QUE SE ESCAPAN = 1 VIDA", -370, 86);

  fill(AMARILLO);
  textSize(30);
  text("¿Estás listo para el desafío?", -370, 128);

  fill(CREMA);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("ASÍ SE JUEGA", 220, -128);
  push();
  translate(70, -110);
  fill(14, 43, 67);
  rect(0, 0, 300, 250, 10);
  moverTutorial(300, 250);
  dibujarTutorial(300, 250);
  pop();

  boton("¡ACEPTO EL DESAFÍO!", -200, 168, 400, 50, "niveles", true);
  pop();

  textAlign(CENTER, CENTER);
  fill(CREMA);
  textSize(14);
  text("Buscá buena luz y que la cámara vea tus dos manos · o tocá la tecla E", width / 2, tarjeta.y + 252 * tarjeta.escala);
}

// Animación del rebote y del golpe a la arena
function moverTutorial(ancho, alto) {
  let t = tutorial;
  let tablaY = alto * 0.6;

  t.velY = t.velY + 0.25;
  t.pelotaX = t.pelotaX + t.velX;
  t.pelotaY = t.pelotaY + t.velY;
  if (t.pelotaX < ancho * 0.6 && t.velX < 0) t.velX = t.velX * -1;
  if (t.pelotaX > ancho - 20 && t.velX > 0) t.velX = t.velX * -1;
  if (t.pelotaY + 9 >= tablaY && t.velY > 0) {
    t.pelotaY = tablaY - 9;
    t.velY = -7;
    t.velX = random(-1.5, 1.5);
  }

  t.tablaX = constrain(lerp(t.tablaX, t.pelotaX, 0.12), ancho * 0.6, ancho - 34);

  t.arenaY = t.arenaY + 1.1;
  if (t.golpe > 0) t.golpe--;
  if (t.arenaY > alto * 0.42) {
    t.golpe = 16;
    t.arenaY = 6;
  }
}

function dibujarTutorial(ancho, alto) {
  let t = tutorial;
  let tablaY = alto * 0.6;
  let centroX = ancho * 0.5;

  let colorCuerpo = "#F4ECDC";
  let colorTabla = "#7ACBC5";
  let colorPuno = "#D96C60";
  let colorPelota = "#F1C963";

  let cabezaY = alto * 0.46;
  let hombroY = alto * 0.57;
  let caderaY = alto * 0.76;
  let pieY = alto * 0.94;
  let hombroIzqX = centroX - 9;
  let hombroDerX = centroX + 9;

  let punoX = ancho * 0.3;
  let punoY = alto * 0.68;
  if (t.golpe > 0) {
    punoX = ancho * 0.28;
    punoY = alto * 0.5;
  }

  let manoX = t.tablaX;
  let manoY = tablaY + 9;

  stroke(226, 190, 130);
  strokeWeight(3);
  line(centroX - 55, pieY + 6, centroX + 55, pieY + 6);

  noStroke();
  fill(226, 190, 130);
  if (t.golpe > 0) {
    for (let i = 0; i < 7; i++) {
      rect(punoX - 26 + i * 8, alto * 0.44 - (16 - t.golpe) * 1.5 + (i % 2) * 8, 5, 5);
    }
    fill(colorPuno);
    textSize(13);
    textAlign(CENTER, CENTER);
    text("¡PUM!", punoX, alto * 0.3);
  } else {
    rect(punoX - 26, t.arenaY, 52, 17, 3);
  }

  stroke(colorCuerpo);
  strokeWeight(8);
  line(centroX - 4, caderaY, centroX - 9, pieY);
  line(centroX + 4, caderaY, centroX + 9, pieY);
  strokeWeight(7);

  let codoIzqX = (hombroIzqX + punoX) / 2;
  let codoIzqY = (hombroY + punoY) / 2 + 10;
  line(hombroIzqX, hombroY, codoIzqX, codoIzqY);
  line(codoIzqX, codoIzqY, punoX, punoY);

  let codoDerX = (hombroDerX + manoX) / 2;
  let codoDerY = (hombroY + manoY) / 2 + 10;
  line(hombroDerX, hombroY, codoDerX, codoDerY);
  line(codoDerX, codoDerY, manoX, manoY);
  strokeWeight(18);
  line(centroX, hombroY, centroX, caderaY);
  noStroke();
  fill(colorCuerpo);
  circle(centroX, cabezaY, 24);
  circle(punoX, punoY, 12);
  ellipse(manoX, manoY, 16, 9);

  noFill();
  stroke(colorPuno);
  strokeWeight(2);
  circle(punoX, punoY, 24);
  noStroke();

  fill(colorTabla);
  rect(t.tablaX - 30, tablaY, 60, 6, 3);
  fill(colorPelota);
  stroke(25, 32, 37);
  strokeWeight(1.5);
  circle(t.pelotaX, t.pelotaY, 18);
  noStroke();

  fill(colorTabla);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("PUÑO IZQUIERDO", ancho * 0.24, alto * 0.86);
  text("PALMA DERECHA", ancho * 0.78, alto * 0.86);
}

// Mapa de sets
function dibujarNiveles() {
  prepararTarjeta(780, 420);

  textAlign(CENTER, CENTER);
  fill(AMARILLO);
  textSize(34);
  text("ELEGÍ UN SET", 0, -165);

  noStroke();
  fill(CELESTE);
  for (let x = -270; x <= 270; x = x + 20) {
    circle(x, -20, 6);
  }

  for (let i = 0; i < niveles.length; i++) {
    dibujarNodoNivel(i, -270 + i * 180, -20);
  }

  fill(CREMA);
  textSize(14);
  text("Hacé click en un set o tocá su número en el teclado", 0, 170);
  if (MODO_PRUEBA) {
    fill(ROJO);
    text("MODO PRUEBA: todos los sets abiertos (cambiar a false antes de entregar)", 0, 145);
  }
  pop();
}

function dibujarNodoNivel(i, x, y) {
  let datos = niveles[i];
  let radio = 58;
  let disponible = datos.desbloqueado && datos.existe;

  let pantallaX = tarjeta.x + x * tarjeta.escala;
  let pantallaY = tarjeta.y + y * tarjeta.escala;
  let encima = disponible && dist(mouseX, mouseY, pantallaX, pantallaY) < radio * tarjeta.escala;

  if (disponible) {

    noFill();
    stroke(AMARILLO);
    strokeWeight(3);
    circle(x, y, radio * 2 + 8 + (animacion % 40) / 2);
    noStroke();
    if (datos.completado) {
      fill(AMARILLO);
    } else {
      fill(CELESTE);
    }
    if (encima) fill(CREMA);
    circle(x, y, radio * 2);
    fill(FONDO);
    textSize(54);
    text(i + 1, x, y - 4);
  } else {
    fill("#354047");
    circle(x, y, radio * 2);
    dibujarCandado(x, y);
  }

  textSize(16);
  if (disponible) {
    fill(AMARILLO);
  } else {
    fill(120, 140, 150);
  }
  text("SET " + (i + 1), x, y + 82);
  fill(CREMA);
  textSize(15);
  text(datos.titulo, x, y + 104);
  textSize(12);
  if (!datos.existe) {
    text("PRÓXIMAMENTE", x, y + 124);
  } else if (!datos.desbloqueado) {
    text("Completá el set " + i, x, y + 124);
  } else if (datos.completado) {
    text("COMPLETO · JUGAR DE NUEVO", x, y + 124);
  } else {
    text(datos.objetivo, x, y + 124);
  }

  if (disponible) {
    botones.push({
      x: pantallaX - radio * tarjeta.escala,
      y: pantallaY - radio * tarjeta.escala,
      ancho: radio * 2 * tarjeta.escala,
      alto: radio * 2 * tarjeta.escala,
      accion: "nivel" + (i + 1)
    });
  }
}

function dibujarCandado(x, y) {
  noFill();
  stroke(CREMA);
  strokeWeight(6);
  arc(x, y - 6, 34, 40, PI, TWO_PI);
  noStroke();
  fill(CREMA);
  rect(x - 24, y - 6, 48, 36, 6);
  fill("#354047");
  circle(x, y + 8, 9);
}

// Objetivo y reglas antes de cada set
function dibujarObjetivo() {
  let datos = niveles[nivel - 1];
  prepararTarjeta(640, 430);

  textAlign(CENTER, CENTER);
  fill(CREMA);
  textSize(28);
  text("SET " + nivel + " · " + datos.titulo, 0, -170);

  fill(CELESTE);
  textSize(15);
  text("TU OBJETIVO", 0, -112);
  fill(AMARILLO);
  textSize(38);
  text(datos.objetivo, 0, -78);

  for (let i = 0; i < datos.reglas.length; i++) {
    let y = -24 + i * 32;
    textAlign(RIGHT, CENTER);
    fill(AMARILLO);
    textSize(21);
    text(datos.reglas[i].clave, -90, y);
    textAlign(LEFT, CENTER);
    fill(CREMA);
    textSize(16);
    text(datos.reglas[i].texto, -74, y);
  }

  textAlign(CENTER, CENTER);
  fill(CELESTE);
  textSize(14);
  text("CONSEJO: " + datos.consejo, 0, 112);

  boton("¡A JUGAR!", -150, 140, 300, 50, "jugar", true);
  pop();

  textAlign(CENTER, CENTER);
  fill(CREMA);
  textSize(14);
  text("o tocá la tecla E · arranca con una cuenta 3, 2, 1 · ¡sé rápido!", width / 2, tarjeta.y + 240 * tarjeta.escala);
}

// Pantallas finales (victoria y resultado)
function dibujarVictoria() {
  image(imagenCopa, 0, 0, width, height);
  tarjeta.x = width / 2;
  tarjeta.y = height * 0.225;
  tarjeta.escala = width / 580;
  if (height / 660 < tarjeta.escala) tarjeta.escala = height / 660;
  if (tarjeta.escala > 1) tarjeta.escala = 1;

  push();
  translate(tarjeta.x, tarjeta.y);
  scale(tarjeta.escala);
  noStroke();
  fill(5, 45, 59, 235);
  rect(-270, -130, 540, 260, 12);
  image(imagenBarra, -270, -130, 540, 86);

  textAlign(CENTER, CENTER);
  fill(CELESTE);
  textSize(16);
  text("¡FELICITACIONES!", 0, -109);
  fill(AMARILLO);
  textSize(36);
  text("¡PUNTO, SET Y PARTIDO!", 0, -76);

  fill(CREMA);
  textSize(18);
  text("¡Campeona de la playa!", 0, -20);

  for (let i = 0; i < puntosPorSet.length; i++) {
    let x = -162 + i * 108;
    fill(AZUL);
    rect(x - 49, 1, 98, 53, 8);
    fill(CELESTE);
    textSize(14);
    text("SET " + (i + 1), x, 14);
    fill(AMARILLO);
    textSize(24);
    text(puntosPorSet[i], x, 37);
  }

  boton("VOLVER AL INICIO", -146, 67, 292, 46, "inicio", true);
  pop();
  moverEfectos();
  dibujarPedazos();
}

function dibujarResultado() {
  let titulo = "¡SET " + nivel + " COMPLETO!";
  let detalle = "Desbloqueaste el set " + (nivel + 1) + ".";
  let acento = AMARILLO;

  if (estado === "perdiste") {
    titulo = "SIN VIDAS";
    detalle = "La marea ganó esta vez. ¿Lo intentás de nuevo?";
    acento = ROJO;
  }

  prepararTarjeta(460, 400);
  textAlign(CENTER, CENTER);
  textSize(34);
  fill(acento);
  text(titulo, 0, -155);

  fill(AZUL);
  rect(-155, -88, 310, 84, 8);
  fill(CELESTE);
  textSize(15);
  text("PUNTAJE FINAL", 0, -68);
  fill(AMARILLO);
  textSize(38);
  text(puntos, 0, -36);

  fill(CREMA);
  textSize(16);
  text(detalle, 0, 22);

  if (estado === "nivelSuperado") {
    boton("SIGUIENTE SET (E)", -155, 60, 310, 46, "siguiente", true);
    boton("VER SETS (M)", -155, 118, 310, 46, "niveles", false);
  } else {
    boton("REINTENTAR (R)", -155, 60, 310, 46, "reintentar", true);
    boton("VER SETS (M)", -155, 118, 310, 46, "niveles", false);
  }
  pop();
}

// Empezar un set
function elegirNivel(numero) {
  let datos = niveles[numero - 1];
  if (datos.desbloqueado && datos.existe) {
    nivel = numero;
    estado = "objetivo";
  }
}

function iniciarNivel(numero) {
  nivel = numero;
  vidas = VIDAS_INICIALES;
  puntos = 0;
  fallos = 0;
  cuadrosNivel = 0;
  marea = 0;
  intervaloArena = INTERVALO_ARENA;
  if (nivel === 3) intervaloArena = INTERVALO_ARENA_CASTILLO;
  if (nivel === 4) intervaloArena = INTERVALO_ARENA_MAREA;
  proximaArena = intervaloArena;
  arenas = [];
  ladrillos = [];
  pedazos = [];
  mensajes = [];
  pausado = false;
  aviso = 0;
  textoYa = 0;
  tabla.visible = false;

  calcularGravedad();
  fondoLadrillos = 0;
  if (nivel >= 2) crearLadrillos();
  reiniciarPelota();

  estado = "jugando";
  cuenta = DURACION_CUENTA;
}

function calcularGravedad() {
  let altura = height * 0.55;
  fuerza = FUERZA_REBOTE;
  if (nivel >= 2) {
    altura = height * 0.7;
  }
  if (nivel >= 3) {
    fuerza = FUERZA_LENTA;
  }
  if (hayMar()) {
    altura = height * 0.55;
  }
  gravedad = (fuerza * fuerza) / (2 * altura);
}

// Actualización de la partida
function jugar() {
  actualizarTabla();
  actualizarPuno();

  let enMovimiento = !pausado && aviso === 0 && cuenta === 0;
  if (enMovimiento) {
    cuadrosNivel++;
    if (hayMar()) {
      subirMarea();
      dejarLadrillosCangrejo();
    }
    moverArenas();
    moverPelotas();
    revisarFinDelNivel();
  } else if (!pausado) {
    avanzarAvisoYCuenta();
  }
  if (!pausado) moverEfectos();

  dibujarZonaPuno();
  if (nivel >= 2) dibujarLadrillos();
  dibujarArenas();
  dibujarPedazos();
  if (tabla.visible) dibujarTabla();
  dibujarPelotas();
  if (hayMar()) {
    dibujarMar();
    dibujarCangrejo();
  }
  if (puno.visible) dibujarPuno();
  dibujarMensajes();
  if (verPuntos) dibujarPuntosMano();
  dibujarMarcador();

  if (aviso > 0) {
    dibujarAvisoVida();
  } else if (cuenta > 0) {
    dibujarCuenta();
  }
  if (textoYa > 0) dibujarYa();
  if (pausado) dibujarPausa();
}

function avanzarAvisoYCuenta() {
  if (aviso > 0) {
    aviso--;
    if (aviso === 0) {
      if (vidas <= 0) {
        estado = "perdiste";
      } else {
        cuenta = DURACION_CUENTA;
      }
    }
  } else if (cuenta > 0) {
    if (cuenta % FPS === 0) {
      sonidoCuenta.play();
    }
    cuenta--;
    if (cuenta === 0) textoYa = 40;
  }
}

// Fin de set
function revisarFinDelNivel() {
  if (nivel === 1) {
    if (cuadrosNivel >= duracionNivel()) completarNivel();
  } else {
    let terminoElCangrejo = true;
    let finUltimaPasada = PASADAS_CANGREJO[PASADAS_CANGREJO.length - 1] + DURACION_PASADA;
    if (nivel === 4 && cuadrosNivel < finUltimaPasada) terminoElCangrejo = false;
    if (terminoElCangrejo && contarLadrillos() === 0) completarNivel();
  }
}

function completarNivel() {
  niveles[nivel - 1].completado = true;
  puntosPorSet[nivel - 1] = puntos;
  sonidoGanar.play();
  if (nivel < niveles.length && niveles[nivel].existe) {
    niveles[nivel].desbloqueado = true;
    estado = "nivelSuperado";
  } else {
    estado = "ganaste";
    pedazos = [];
    mensajes = [];
    crearPedazos(width * 0.1, height * 0.16, width * 0.8, height * 0.35, 255, 210, 83);
    crearPedazos(width * 0.1, height * 0.14, width * 0.8, height * 0.35, 67, 224, 223);
    crearPedazos(width * 0.1, height * 0.12, width * 0.8, height * 0.35, 255, 104, 137);
  }
}

function duracionNivel() {
  return DURACION_NIVEL_1;
}

function perderVida(motivo) {
  if (aviso === 0) {
    vidas--;
    motivoAviso = motivo;
    if (hayMar()) {
      marea = marea / 2;
    }
    aviso = DURACION_AVISO;
    sonidoVida.play();
  }
}

// Control con la palma derecha
function actualizarTabla() {
  let encontrada = false;
  for (let i = 0; i < manos.length; i++) {
    if (manos[i].handedness === "Right") {
      ubicarTabla(manos[i]);
      encontrada = true;
    }
  }

  if (encontrada) {
    tabla.visible = true;
    tabla.sinPalma = 0;
  } else {

    tabla.sinPalma++;
    tabla.anteriorX = tabla.x;
    tabla.anteriorY = tabla.y;
    if (tabla.sinPalma > ESPERA_PALMA) tabla.visible = false;
  }
}

function ubicarTabla(mano) {
  let p = mano.keypoints;
  let extremos = [0, 4, 5, 8, 9, 12, 16, 20];
  let izquierda = p[0].x;
  let derecha = p[0].x;

  for (let i = 0; i < extremos.length; i++) {
    let punto = p[extremos[i]];
    if (punto.x < izquierda) izquierda = punto.x;
    if (punto.x > derecha) derecha = punto.x;
  }

  let x = (izquierda + derecha) / 2 * escala + margenX;
  let y = (p[0].y + p[9].y) / 2 * escala + margenY;
  let ancho = constrain((derecha - izquierda) * escala + 24, ANCHO_MIN_PALMA, ANCHO_MAX_PALMA);

  if (tabla.visible) {

    tabla.anteriorX = tabla.x;
    tabla.anteriorY = tabla.y;
    tabla.x = lerp(tabla.x, x, 0.75);
    tabla.y = lerp(tabla.y, y, 0.75);
    tabla.ancho = lerp(tabla.ancho, ancho, 0.5);
  } else {
    tabla.x = x;
    tabla.y = y;
    tabla.ancho = ancho;
    tabla.anteriorX = x;
    tabla.anteriorY = y;
  }
}

function dibujarTabla() {
  noStroke();
  fill(CELESTE);
  rect(tabla.x - tabla.ancho / 2, tabla.y, tabla.ancho, GROSOR_TABLA, 4);
}

// Detección del puño izquierdo
function actualizarPuno() {
  puno.visible = false;
  for (let i = 0; i < manos.length; i++) {
    if (manos[i].handedness === "Left" && esPunoCerrado(manos[i])) {
      let muneca = manos[i].keypoints[0];
      let nudillo = manos[i].keypoints[9];
      puno.x = (muneca.x + nudillo.x) / 2 * escala + margenX;
      puno.y = (muneca.y + nudillo.y) / 2 * escala + margenY;
      puno.visible = true;
    }
  }
}

function esPunoCerrado(mano) {
  let p = mano.keypoints;
  let muneca = p[0];
  let puntas = [8, 12, 16, 20];
  let articulaciones = [6, 10, 14, 18];
  let doblados = 0;

  for (let i = 0; i < puntas.length; i++) {
    let distanciaPunta = dist(muneca.x, muneca.y, p[puntas[i]].x, p[puntas[i]].y);
    let distanciaArticulacion = dist(muneca.x, muneca.y, p[articulaciones[i]].x, p[articulaciones[i]].y);
    if (distanciaPunta < distanciaArticulacion * 1.1) doblados++;
  }
  return doblados >= 3;
}

function dibujarPuno() {
  noFill();
  stroke(CREMA);
  strokeWeight(3);
  circle(puno.x, puno.y, RADIO_PUNO * 2);
  noStroke();
}

// Movimiento de las pelotas
function reiniciarPelota() {
  let y = height * 0.35;
  if (y < fondoLadrillos + 50) {
    y = fondoLadrillos + 50;
  }
  pelotas = [{ x: width / 2, y: y, radio: RADIO_PELOTA, velocidadX: 0, velocidadY: 0, vivo: true }];
}

function moverPelotas() {
  for (let i = 0; i < pelotas.length; i++) {
    let pelota = pelotas[i];
    if (pelota.vivo) {
      moverPelota(pelota);
      if (nivel >= 2) comprobarLadrillos(pelota);
      if (pelota.y - pelota.radio > height || tocaElMar(pelota)) {
        pelota.vivo = false;
        if (hayMar()) crearPedazos(pelota.x - 30, lineaAgua() - 10, 60, 10, 122, 203, 197);
        if (contarPelotas() > 0) agregarMensaje("¡UNA PELOTA MENOS!", pelota.x, height - 80, ROJO);
      }
    }
  }

  if (contarPelotas() === 0) {
    let motivo = "Se te cayó la pelota";
    if (pelotas.length > 1) motivo = "Se cayeron todas las pelotas";
    if (hayMar()) motivo = motivo + " al mar";
    perderVida(motivo);
    reiniciarPelota();
  }
}

function moverPelota(pelota) {
  pelota.velocidadY = pelota.velocidadY + gravedad;
  pelota.x = pelota.x + pelota.velocidadX;
  pelota.y = pelota.y + pelota.velocidadY;

  if (pelota.x - pelota.radio < 0 && pelota.velocidadX < 0) {
    pelota.x = pelota.radio;
    pelota.velocidadX = pelota.velocidadX * -1;
  }
  if (pelota.x + pelota.radio > width && pelota.velocidadX > 0) {
    pelota.x = width - pelota.radio;
    pelota.velocidadX = pelota.velocidadX * -1;
  }

  if (pelota.y - pelota.radio < ALTO_MARCADOR && pelota.velocidadY < 0) {
    pelota.y = ALTO_MARCADOR + pelota.radio;
    pelota.velocidadY = pelota.velocidadY * -1;
  }

  if (tabla.visible && pelota.velocidadY > 0) comprobarTabla(pelota);
}

// Choque de la pelota con la tabla
function comprobarTabla(pelota) {
  let abajo = pelota.y + pelota.radio;
  let mitad = tabla.ancho / 2 + pelota.radio / 2;
  let dentroX = pelota.x > tabla.x - mitad && pelota.x < tabla.x + mitad;

  let margen = pelota.velocidadY + GROSOR_TABLA;
  if (tabla.anteriorY > tabla.y) margen = margen + (tabla.anteriorY - tabla.y);
  let dentroY = abajo >= tabla.y && abajo <= tabla.y + margen;

  if (dentroX && dentroY) {
    pelota.y = tabla.y - pelota.radio;
    rebotarEnTabla(pelota);
  }
}

function rebotarEnTabla(pelota) {

  let lugar = constrain((pelota.x - tabla.x) / (tabla.ancho / 2), -1, 1);

  let empuje = constrain(tabla.x - tabla.anteriorX, -15, 15) * 0.3;

  pelota.velocidadX = constrain(lugar * 6 + empuje, -8, 8);
  if (lugar > -0.15 && lugar < 0.15) {
    pelota.velocidadX = pelota.velocidadX + random(-1.5, 1.5);
  }
  pelota.velocidadY = -fuerza;

  puntos = puntos + 10;
  sonidoRebote.play();
}

function contarPelotas() {
  let enJuego = 0;
  for (let i = 0; i < pelotas.length; i++) {
    if (pelotas[i].vivo) enJuego++;
  }
  return enJuego;
}

function dibujarPelotas() {
  for (let i = 0; i < pelotas.length; i++) {
    let pelota = pelotas[i];
    if (pelota.vivo) {
      image(imagenPelota, pelota.x - pelota.radio, pelota.y - pelota.radio, pelota.radio * 2, pelota.radio * 2);
    }
  }
}

// Caída y rotura de la arena
function moverArenas() {
  proximaArena--;
  if (proximaArena <= 0) {
    let limite = width * 0.35 - ANCHO_BLOQUE;
    if (limite < 25) limite = 25;
    arenas.push({ x: random(16, limite), y: ALTO_MARCADOR - ALTO_BLOQUE, vivo: true });
    proximaArena = intervaloArena;
  }

  for (let i = 0; i < arenas.length; i++) {
    let a = arenas[i];
    if (a.vivo) {
      a.y = a.y + RAPIDEZ_ARENA;

      if (puno.visible && tocaRectangulo(puno.x, puno.y, RADIO_PUNO, a.x, a.y, ANCHO_BLOQUE, ALTO_BLOQUE)) {

        a.vivo = false;
        puntos = puntos + 25;
        crearPedazos(a.x, a.y, ANCHO_BLOQUE, ALTO_BLOQUE, 226, 190, 130);
        if (nivel === 4) {
          agregarMensaje("¡BLOQUEO! +25", a.x + ANCHO_BLOQUE / 2, a.y, AMARILLO);
        } else {
          agregarMensaje("+25", a.x + ANCHO_BLOQUE / 2, a.y, AMARILLO);
        }
        sonidoRomper.play();
        if (hayMar()) {
          marea = constrain(marea - BAJADA_POR_ARENA, 0, maximoMarea());
          agregarMensaje("¡BAJA EL MAR!", a.x + ANCHO_BLOQUE / 2, a.y + 34, CELESTE);
        }
      } else if (hayMar() && a.y + ALTO_BLOQUE > lineaAgua()) {

        a.vivo = false;
        marea = constrain(marea + SUBIDA_POR_ESCAPE, 0, maximoMarea());
        crearPedazos(a.x, a.y, ANCHO_BLOQUE, ALTO_BLOQUE, 226, 190, 130);
        agregarMensaje("¡SUBE EL MAR!", a.x + ANCHO_BLOQUE / 2, lineaAgua() - 40, ROJO);
      } else if (nivel === 3 && a.y > height) {

        a.vivo = false;
        repararCastillo(a.x + ANCHO_BLOQUE / 2);
      } else if (a.y > height) {

        a.vivo = false;
        fallos++;
        agregarMensaje("¡SE ESCAPÓ!", a.x + ANCHO_BLOQUE / 2, height - 60, ROJO);
        if (fallos >= FALLOS_POR_VIDA) {
          fallos = 0;
          perderVida("3 bloques de arena llegaron a la orilla");
        }
      }
    }
  }
}

function dibujarArenas() {
  for (let i = 0; i < arenas.length; i++) {
    if (arenas[i].vivo) image(imagenArena, arenas[i].x, arenas[i].y, ANCHO_BLOQUE, ALTO_BLOQUE);
  }
}

function dibujarZonaPuno() {
  noStroke();
  fill(217, 108, 96, 20);
  rect(0, ALTO_MARCADOR, width * 0.39, height - ALTO_MARCADOR);

  fill(CREMA);
  textAlign(LEFT, CENTER);
  textSize(14);
  if (hayMar()) {

    text("ZONA DE PUÑO · CADA ARENA ROTA BAJA EL MAR", 18, ALTO_MARCADOR + 20);
  } else if (nivel === 3) {

    text("ZONA DE PUÑO · LA ARENA QUE PASA ARREGLA EL CASTILLO", 18, ALTO_MARCADOR + 20);
  } else {
    text("ZONA DE PUÑO · SE ESCAPARON:", 18, ALTO_MARCADOR + 20);
    for (let i = 0; i < FALLOS_POR_VIDA; i++) {
      if (i < fallos) {
        fill(ROJO);
      } else {
        fill(255, 255, 255, 40);
      }
      rect(240 + i * 26, ALTO_MARCADOR + 12, 20, 16, 3);
    }
  }
}

function tocaRectangulo(x, y, radio, rectX, rectY, ancho, alto) {
  let cercaX = constrain(x, rectX, rectX + ancho);
  let cercaY = constrain(y, rectY, rectY + alto);
  return dist(x, y, cercaX, cercaY) <= radio;
}

// Ladrillos del castillo (se arman con una matriz)
function crearLadrillos() {
  let castillo = niveles[nivel - 1].castillo;
  let columnas = castillo[0].length;
  let filas = castillo.length;
  let espacio = 7;
  let ancho = constrain((width - 48 - (columnas - 1) * espacio) / columnas, 40, 100);
  let alto = 27;
  let total = columnas * ancho + (columnas - 1) * espacio;
  let xInicial = (width - total) / 2;

  ladrillos = [];
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      let tipo = castillo[fila][col];
      if (tipo > 0) {
        let golpes = tipo;
        if (tipo === 9) golpes = 1;
        ladrillos.push({
          x: xInicial + col * (ancho + espacio),
          y: 120 + fila * (alto + espacio),
          ancho: ancho,
          alto: alto,
          amarillo: tipo === 9,
          golpes: golpes,
          golpesTotales: golpes,
          vivo: true
        });
      }
    }
  }
  fondoLadrillos = 120 + filas * (alto + espacio);
  if (nivel === 4) prepararLadrillosCangrejo();

}

// Recorrido del cangrejo y sus ladrillos
function prepararLadrillosCangrejo() {
  let ancho = constrain(width * 0.18, 0, 90);
  for (let pasada = 0; pasada < PASADAS_CANGREJO.length; pasada++) {
    for (let i = 1; i <= 2; i++) {
      let cuadroPasada = round(DURACION_PASADA * i / 3);
      let avance = cuadroPasada / DURACION_PASADA;
      let posicion = posicionCangrejo(pasada, avance);
      ladrillos.push({
        x: posicion.x - ancho / 2,
        y: posicion.y,
        ancho: ancho,
        alto: 24,
        cangrejo: true,
        cuadroAparicion: PASADAS_CANGREJO[pasada] + cuadroPasada,
        golpes: 2,
        golpesTotales: 2,
        vivo: false
      });
    }
  }
}

function dejarLadrillosCangrejo() {
  for (let i = 0; i < ladrillos.length; i++) {
    let ladrillo = ladrillos[i];
    if (ladrillo.cangrejo && cuadrosNivel === ladrillo.cuadroAparicion) {
      ladrillo.vivo = true;
    }
  }
}

function posicionCangrejo(pasada, avance) {
  let posicion = avance;
  if (pasada === 1) posicion = 1 - avance;

  let zona = max(0, height * 0.75 - maximoMarea() - fondoLadrillos);
  return {
    x: width * posicion,
    y: fondoLadrillos + zona * (0.27 + pasada * 0.30)
  };
}

function dibujarCangrejo() {
  let ancho = constrain(width * 0.37, 0, 225);
  let alto = ancho * imagenCangrejo.height / imagenCangrejo.width;

  for (let i = 0; i < PASADAS_CANGREJO.length; i++) {
    let avance = (cuadrosNivel - PASADAS_CANGREJO[i]) / DURACION_PASADA;
    if (avance >= 0 && avance < 1) {
      let posicion = posicionCangrejo(i, avance);
      image(imagenCangrejo, posicion.x - ancho / 2, posicion.y - alto, ancho, alto);
    }
  }
}

function dibujarLadrillos() {
  for (let i = 0; i < ladrillos.length; i++) {
    let b = ladrillos[i];
    if (b.vivo) {
      if (b.cangrejo) {
        noStroke();
        fill("#A92E24");
        rect(b.x, b.y, b.ancho, b.alto, 5);
        fill("#F15A29");
        rect(b.x + 2, b.y + 2, b.ancho - 4, b.alto - 6, 4);
        fill("#FFAA53");
        rect(b.x + 6, b.y + 5, b.ancho - 12, 3, 2);
      } else if (b.amarillo) {
        image(imagenLadrilloAmarillo, b.x, b.y, b.ancho, b.alto);
      } else if (nivel >= 3) {
        image(imagenArena, b.x, b.y, b.ancho, b.alto);
      } else {
        image(imagenLadrillo, b.x, b.y, b.ancho, b.alto);
      }

      if (b.golpesTotales > 1) {
        noStroke();
        fill(0, 0, 0, (b.golpesTotales - 1) * 45);
        rect(b.x, b.y, b.ancho, b.alto, 3);
        if (nivel >= 3) {
          fill(AZUL);
        } else {
          fill(AMARILLO);
        }
        for (let k = 0; k < b.golpes; k++) {
          circle(b.x + b.ancho / 2 + (k - (b.golpes - 1) / 2) * 14, b.y + b.alto / 2, 8);
        }
      }
      dibujarRajaduras(b);
    }
  }
}

function dibujarRajaduras(b) {
  let recibidos = b.golpesTotales - b.golpes;
  if (nivel >= 3) {
    stroke(90, 60, 30);
  } else {
    stroke(CREMA);
  }
  strokeWeight(2);
  if (recibidos >= 1) {
    line(b.x + b.ancho * 0.3, b.y, b.x + b.ancho * 0.4, b.y + b.alto * 0.5);
    line(b.x + b.ancho * 0.4, b.y + b.alto * 0.5, b.x + b.ancho * 0.32, b.y + b.alto);
  }
  if (recibidos >= 2) {
    line(b.x + b.ancho * 0.75, b.y, b.x + b.ancho * 0.62, b.y + b.alto * 0.55);
    line(b.x + b.ancho * 0.62, b.y + b.alto * 0.55, b.x + b.ancho * 0.7, b.y + b.alto);
  }
  noStroke();
}

// Choque de la pelota con los ladrillos
function comprobarLadrillos(pelota) {
  let rompio = false;
  for (let i = 0; i < ladrillos.length; i++) {
    let b = ladrillos[i];
    if (b.vivo && !rompio && tocaRectangulo(pelota.x, pelota.y, pelota.radio, b.x, b.y, b.ancho, b.alto)) {
      rompio = true;
      b.golpes--;

      if (b.golpes > 0) {

        puntos = puntos + 10;
        sonidoRebote.play();
        if (nivel >= 3) {
          crearPedazos(b.x + b.ancho * 0.3, b.y + b.alto * 0.4, b.ancho * 0.4, 6, 226, 190, 130);
        } else {
          crearPedazos(b.x + b.ancho * 0.3, b.y + b.alto * 0.4, b.ancho * 0.4, 6, 90, 92, 98);
        }
        agregarMensaje("¡CRACK!", b.x + b.ancho / 2, b.y + 40, CREMA);
      } else if (b.amarillo) {
        b.vivo = false;
        puntos = puntos + 50;
        sonidoRomper.play();
        crearPedazos(b.x, b.y, b.ancho, b.alto, 241, 201, 99);
        if (nivel === 4) {
          agregarMensaje("¡REMATE! +2 PELOTAS", b.x + b.ancho / 2, b.y + 40, AMARILLO);
        } else {
          agregarMensaje("¡+2 PELOTAS!", b.x + b.ancho / 2, b.y + 40, AMARILLO);
        }
        soltarPelotasExtra(b);
      } else {
        b.vivo = false;
        puntos = puntos + 50 * b.golpesTotales;
        sonidoRomper.play();
        if (b.cangrejo) {
          crearPedazos(b.x, b.y, b.ancho, b.alto, 241, 90, 41);
        } else if (nivel >= 3) {
          crearPedazos(b.x, b.y, b.ancho, b.alto, 226, 190, 130);
        } else {
          crearPedazos(b.x, b.y, b.ancho, b.alto, 90, 92, 98);
        }
        let textoPuntos = "+" + 50 * b.golpesTotales;
        if (nivel === 4) textoPuntos = "¡REMATE! " + textoPuntos;
        agregarMensaje(textoPuntos, b.x + b.ancho / 2, b.y + 40, AMARILLO);
      }

      let anteriorX = pelota.x - pelota.velocidadX;
      if (anteriorX + pelota.radio <= b.x || anteriorX - pelota.radio >= b.x + b.ancho) {
        pelota.velocidadX = pelota.velocidadX * -1;
        if (b.cangrejo && b.vivo) {
          if (pelota.velocidadX < 0) {
            pelota.x = b.x - pelota.radio - 1;
          } else {
            pelota.x = b.x + b.ancho + pelota.radio + 1;
          }
        }
      } else {
        pelota.velocidadY = pelota.velocidadY * -1;
        if (b.cangrejo && b.vivo) {

          if (pelota.velocidadY < 0) {
            pelota.y = b.y - pelota.radio - 1;
          } else {
            pelota.y = b.y + b.alto + pelota.radio + 1;
          }
        }
      }
    }
  }
}

function soltarPelotasExtra(ladrillo) {
  for (let lado = -1; lado <= 1; lado = lado + 2) {
    pelotas.push({
      x: constrain(ladrillo.x + ladrillo.ancho / 2 + lado * RADIO_PELOTA, RADIO_PELOTA, width - RADIO_PELOTA),
      y: ladrillo.y + ladrillo.alto + RADIO_PELOTA + 2,
      radio: RADIO_PELOTA,
      velocidadX: lado * 4,
      velocidadY: 2,
      vivo: true
    });
  }
}

function repararCastillo(xArena) {
  xArena = constrain(xArena, 160, width - 160);

  let rotos = [];
  for (let i = 0; i < ladrillos.length; i++) {
    if (!ladrillos[i].vivo && !ladrillos[i].amarillo) {
      rotos.push(i);
    }
  }

  if (rotos.length > 0) {
    let b = ladrillos[rotos[int(random(rotos.length))]];
    b.vivo = true;
    b.golpes = 1;
    crearPedazos(b.x, b.y, b.ancho, b.alto, 226, 190, 130);
    agregarMensaje("¡SE ARREGLÓ!", b.x + b.ancho / 2, b.y + 40, ROJO);
    agregarMensaje("¡SE ESCAPÓ LA ARENA!", xArena, height - 60, ROJO);
  } else {
    agregarMensaje("¡SE ESCAPÓ!", xArena, height - 60, ROJO);
  }
}

function contarLadrillos() {
  let quedan = 0;
  for (let i = 0; i < ladrillos.length; i++) {
    if (ladrillos[i].vivo) quedan++;
  }
  return quedan;
}

function hayMar() {
  return nivel === 4;
}

function lineaAgua() {
  return height * 0.75 - marea;
}

function maximoMarea() {
  return constrain(height * 0.75 - (fondoLadrillos + 160), 0, height * 0.25);
}

// Subida del mar
function subirMarea() {
  marea = constrain(marea + SUBIDA_MAREA, 0, maximoMarea());
}

function tocaElMar(pelota) {
  return hayMar() && pelota.velocidadY > 0 && pelota.y + pelota.radio * 0.5 > lineaAgua();
}

// Dibujo del mar
function dibujarMar() {
  let y = lineaAgua();

  let t = animacion % 240;
  let vaiven = t;
  if (t > 120) vaiven = 240 - t;

  let anchoOla = width + 120;
  let altoOla = anchoOla * imagenMarOla.height / imagenMarOla.width;
  let yOla = y - altoOla * 0.25;
  image(imagenMarOla, -vaiven, yOla, anchoOla, altoOla);

  noStroke();
  fill(5, 210, 210);
  rect(0, yOla + altoOla - 2, width, height);

  let altoEspuma = anchoOla * imagenMarEspuma.height / imagenMarEspuma.width;
  image(imagenMarEspuma, vaiven - 120, height - altoEspuma, anchoOla, altoEspuma);

  stroke(ROJO);
  strokeWeight(2);
  let yMaximo = height * 0.75 - maximoMarea();
  for (let x = 0; x < width; x = x + 30) {
    line(x, yMaximo, x + 15, yMaximo);
  }
  noStroke();
}

// Efectos al romper bloques
function crearPedazos(x, y, ancho, alto, r, g, b) {
  for (let i = 0; i < 14; i++) {
    pedazos.push({
      x: x + random(ancho),
      y: y + random(alto),
      velocidadX: random(-4, 4),
      velocidadY: random(-6, -1),
      tam: random(6, 14),
      vida: 45,
      r: r,
      g: g,
      b: b
    });
  }
}

function agregarMensaje(texto, x, y, color) {
  mensajes.push({ texto: texto, x: x, y: y, color: color, vida: 50 });
}

function moverEfectos() {
  for (let i = 0; i < pedazos.length; i++) {
    let p = pedazos[i];
    if (p.vida > 0) {
      p.velocidadY = p.velocidadY + 0.4;
      p.x = p.x + p.velocidadX;
      p.y = p.y + p.velocidadY;
      p.vida--;
    }
  }
  for (let i = 0; i < mensajes.length; i++) {
    if (mensajes[i].vida > 0) {
      mensajes[i].y = mensajes[i].y - 1;
      mensajes[i].vida--;
    }
  }
}

function dibujarPedazos() {
  noStroke();
  for (let i = 0; i < pedazos.length; i++) {
    let p = pedazos[i];
    if (p.vida > 0) {
      fill(p.r, p.g, p.b, map(p.vida, 0, 45, 0, 255));
      rect(p.x, p.y, p.tam, p.tam, 2);
    }
  }
}

function dibujarMensajes() {
  textAlign(CENTER, CENTER);
  textSize(26);
  stroke(FONDO);
  strokeWeight(5);
  for (let i = 0; i < mensajes.length; i++) {
    if (mensajes[i].vida > 0) {
      fill(mensajes[i].color);
      text(mensajes[i].texto, mensajes[i].x, mensajes[i].y);
    }
  }
  noStroke();
}

// Puntos y vidas
function dibujarMarcador() {
  image(imagenBarra, 0, 0, width, ALTO_MARCADOR);

  let e = width / 900;
  if (e > 1) e = 1;
  push();
  scale(e);
  let ancho = width / e;
  noStroke();

  textAlign(LEFT, CENTER);
  textSize(20);
  fill(CREMA);
  text("SET", 40, 26);
  text("PUNTOS", 40, 58);
  fill(AMARILLO);
  text(nivel, 130, 26);
  text(puntos, 130, 58);

  textAlign(CENTER, CENTER);
  textSize(32);
  text("BRICKFLICK", ancho / 2, 26);
  textSize(16);
  if (nivel === 1) {

    let segundos = int((duracionNivel() - cuadrosNivel + FPS - 1) / FPS);
    if (segundos < 0) segundos = 0;
    fill(CREMA);
    text("AGUANTÁ " + segundos + " SEGUNDOS", ancho / 2, 56);

    fill(255, 255, 255, 40);
    rect(ancho / 2 - 100, 68, 200, 6, 3);
    fill(AMARILLO);
    rect(ancho / 2 - 100, 68, map(cuadrosNivel, 0, duracionNivel(), 0, 200, true), 6, 3);
  } else {
    fill(CREMA);
    text("LADRILLOS: " + contarLadrillos() + " · PELOTAS EN JUEGO: " + contarPelotas(), ancho / 2, 58);
  }

  textAlign(RIGHT, CENTER);
  textSize(20);
  fill(CREMA);
  text("VIDAS", ancho - 40 - VIDAS_INICIALES * 36, 30);
  for (let i = 0; i < VIDAS_INICIALES; i++) {
    let x = ancho - 40 - (VIDAS_INICIALES - i) * 36;
    image(imagenPelota, x, 14, 32, 32);
    if (i >= vidas) {
      fill(0, 0, 0, 170);
      circle(x + 16, 30, 34);
      stroke(ROJO);
      strokeWeight(3);
      line(x + 6, 20, x + 26, 40);
      noStroke();
    }
  }
  fill(AMARILLO);
  textSize(16);
  text("TE QUEDAN " + vidas, ancho - 40, 62);
  pop();
}

// Cuenta regresiva, avisos y pausa
function dibujarCuenta() {
  let numero = int((cuenta - 1) / FPS) + 1;
  noStroke();
  fill(14, 43, 67, 140);
  rect(0, ALTO_MARCADOR, width, height - ALTO_MARCADOR);

  let frases = ["¡RÁPIDO!", "¡ATENTO!", "¿LISTO PARA EL DESAFÍO?"];
  textAlign(CENTER, CENTER);
  stroke(FONDO);
  strokeWeight(6);
  fill(CELESTE);
  textSize(46);
  text(frases[numero - 1], width / 2, height / 2 - 150);

  fill(AMARILLO);
  textSize(150 + (cuenta % FPS));
  text(numero, width / 2, height / 2 - 20);
  noStroke();

  fill(CREMA);
  textSize(20);
  text("Poné la palma derecha abajo de la pelota", width / 2, height / 2 + 100);
  textSize(16);
  if (hayMar()) {
    text("¡y mantenela ARRIBA del mar! El puño baja la marea", width / 2, height / 2 + 132);
  } else {
    text("y tené el puño izquierdo listo para la arena", width / 2, height / 2 + 132);
  }
  if (!tabla.visible) {
    fill(ROJO);
    text("No veo tu palma derecha: mostrala a la cámara", width / 2, height / 2 + 170);
  }
}

function dibujarYa() {
  textoYa--;
  textAlign(CENTER, CENTER);
  fill(AMARILLO);
  stroke(FONDO);
  strokeWeight(8);
  textSize(120);
  if (nivel === 4) {
    text("¡SAQUE!", width / 2, height / 2);
  } else {
    text("¡YA!", width / 2, height / 2);
  }
  noStroke();
}

function dibujarAvisoVida() {
  noStroke();
  fill(217, 108, 96, 110);
  rect(0, ALTO_MARCADOR, width, height - ALTO_MARCADOR);

  push();
  translate(width / 2, height / 2);
  fill(5, 45, 59, 240);
  rect(-280, -130, 560, 260, 14);

  textAlign(CENTER, CENTER);
  fill(ROJO);
  textSize(40);
  if (vidas > 0) {
    text("¡PERDISTE UNA VIDA!", 0, -88);
  } else {
    text("¡TE QUEDASTE SIN VIDAS!", 0, -88);
  }
  fill(CREMA);
  textSize(18);
  text(motivoAviso, 0, -48);

  let inicioX = -(VIDAS_INICIALES * 60) / 2 + 30;
  for (let i = 0; i < VIDAS_INICIALES; i++) {
    let x = inicioX + i * 60;
    image(imagenPelota, x - 24, -4, 48, 48);
    if (i > vidas || (i === vidas && aviso % 20 < 10)) {
      fill(0, 0, 0, 170);
      circle(x, 20, 50);
    }
  }

  fill(AMARILLO);
  textSize(26);
  if (vidas === 1) {
    text("TE QUEDA 1 VIDA", 0, 88);
  } else {
    text("TE QUEDAN " + vidas + " VIDAS", 0, 88);
  }
  pop();
}

function dibujarPausa() {
  noStroke();
  fill(14, 43, 67, 190);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(AMARILLO);
  textSize(70);
  text("PAUSA", width / 2, height / 2 - 30);
  fill(CREMA);
  textSize(20);
  text("P para seguir · R para reiniciar · M para ir a los sets", width / 2, height / 2 + 40);
}

function dibujarPuntosMano() {
  noStroke();
  fill(CREMA);
  for (let i = 0; i < manos.length; i++) {
    for (let j = 0; j < manos[i].keypoints.length; j++) {
      let p = manos[i].keypoints[j];
      circle(p.x * escala + margenX, p.y * escala + margenY, 7);
    }
  }
}

function boton(texto, x, y, ancho, alto, accion, destacado) {

  let pantallaX = tarjeta.x + x * tarjeta.escala;
  let pantallaY = tarjeta.y + y * tarjeta.escala;
  let encima = mouseX > pantallaX && mouseX < pantallaX + ancho * tarjeta.escala &&
    mouseY > pantallaY && mouseY < pantallaY + alto * tarjeta.escala;

  noStroke();
  if (encima) {
    fill(CREMA);
  } else if (destacado) {
    fill(AMARILLO);
  } else {
    fill("#354047");
  }
  rect(x, y, ancho, alto, 6);

  if (destacado || encima) {
    fill(FONDO);
  } else {
    fill(CREMA);
  }
  textAlign(CENTER, CENTER);
  textSize(20);
  text(texto, x + ancho / 2, y + alto / 2 - 2);

  botones.push({
    x: pantallaX,
    y: pantallaY,
    ancho: ancho * tarjeta.escala,
    alto: alto * tarjeta.escala,
    accion: accion
  });
}

// Botones y teclado
function activarAccion(accion) {
  if (accion === "inicio") {
    estado = "inicio";
    nivel = 1;
    animacion = 0;
    botones = [];
  } else if (accion === "niveles") {
    pausado = false;
    estado = "niveles";
  } else if (accion === "nivel1") {
    elegirNivel(1);
  } else if (accion === "nivel2") {
    elegirNivel(2);
  } else if (accion === "nivel3") {
    elegirNivel(3);
  } else if (accion === "nivel4") {
    elegirNivel(4);
  } else if (accion === "jugar" || accion === "reintentar") {
    iniciarNivel(nivel);
  } else if (accion === "siguiente") {
    elegirNivel(nivel + 1);
  }
}

function mousePressed() {
  if (estado !== "jugando") {
    let elegida = "";
    for (let i = 0; i < botones.length; i++) {
      let b = botones[i];
      if (mouseX > b.x && mouseX < b.x + b.ancho && mouseY > b.y && mouseY < b.y + b.alto) {
        elegida = b.accion;
      }
    }
    if (elegida !== "") activarAccion(elegida);
  }
}

function keyPressed() {
  if (key === "e" || key === "E") {
    if (estado === "inicio") {
      activarAccion("niveles");
    } else if (estado === "objetivo") {
      activarAccion("jugar");
    } else if (estado === "nivelSuperado") {
      activarAccion("siguiente");
    }
  }

  if (estado === "niveles") {
    if (key === "1") {
      elegirNivel(1);
    } else if (key === "2") {
      elegirNivel(2);
    } else if (key === "3") {
      elegirNivel(3);
    } else if (key === "4") {
      elegirNivel(4);
    }
  }

  if ((key === "p" || key === "P") && estado === "jugando") pausado = !pausado;
  if ((key === "r" || key === "R") && estado !== "inicio" && estado !== "niveles") {
    if (estado === "ganaste") {
      activarAccion("inicio");
    } else {
      activarAccion("reintentar");
    }
  }
  if ((key === "m" || key === "M") && estado !== "inicio") activarAccion("niveles");
  if (key === "n" || key === "N") verPuntos = !verPuntos;
  if (key === "f" || key === "F") fullscreen(!fullscreen());
}

function recibirManos(resultados) {
  manos = resultados;
}

// Ajuste de la cámara a la pantalla
function calcularEscala() {
  escala = max(width / VIDEO_ANCHO, height / VIDEO_ALTO);
  margenX = (width - VIDEO_ANCHO * escala) / 2;
  margenY = (height - VIDEO_ALTO * escala) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcularEscala();
  calcularGravedad();
  tabla.visible = false;

  for (let i = 0; i < pelotas.length; i++) {
    pelotas[i].x = constrain(pelotas[i].x, RADIO_PELOTA, width - RADIO_PELOTA);
  }

  if (nivel >= 2 && ladrillos.length > 0) {

    let anteriores = ladrillos;
    crearLadrillos();
    for (let i = 0; i < ladrillos.length; i++) {
      ladrillos[i].vivo = anteriores[i].vivo;
      ladrillos[i].golpes = anteriores[i].golpes;
    }
  }
}
