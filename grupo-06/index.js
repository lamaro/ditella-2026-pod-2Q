// POKÉMON PINK ADVENTURE

let pixelify, logoPokemon, entrenador, faceMesh, video;
let musicaInicio, musicaMapa, sonidoVictoria;
let musicaActual = "";

let pantalla = "inicio";
let camaraLista = false;
let hayCara = false;

let narizX = 0, narizY = 0;
let anchoCara = 0, aperturaBoca = 0;
let centroX = 0, centroY = 0;
let anchoInicial = 0, bocaInicial = 0;

let sumaX = 0, sumaY = 0;
let sumaAncho = 0, sumaBoca = 0;
let muestras = 0, inicioCalibracion = 0;
let ultimaDeteccion = 0;

let jugadorX = 500, jugadorY = 240;
let bocaAbierta = true;
let inicioAccion = -2000;
let accionX = 0, accionY = 0;

let mensajes = [];
let mensajeActual = 0;
let alturaCejas = 0, cejasInicial = 0, sumaCejas = 0;
let inicioCeja = -1;
let gestoListo = false;
let ultimaMuestraCejas = 0;

let llegoLaboratorio = false;
let oak, entrenadorEspalda, entrenadorCostado;
let cleffa, jigglypuff, togepi, pokebola;
let direccion = "frente";

let hatenna, pokebolaAbierta;
let hatennaCapturada = false;
let etapaCaptura = "espera";
let inicioCaptura = 0;
let inicioGestoBoca = -1;
let lanzamientoListo = false;
let equipo = [];

let avisoRestaurante = false;
let bayasComidas = 0;
let comidaCompleta = false;
let bayaAgarrada = false;
let pinzaLista = false;
let bayaX = 190, bayaY = 325;
let ultimaComida = -2000;

let handPose;
let hayMano = false;
let ultimaMano = 0;
let manoX = 0, manoY = 0;
let manoAnteriorX = 0, manoAnteriorY = 0;
let ultimaCaricia = -1000;
let caricias = 0;
let jardinCompleto = false;
let inicioVolver = -1;
let avisoJardin = false;

let nombres = ["Cleffa", "Jigglypuff", "Togepi"];
let companero = -1;
let candidato = -1;
let gestoEleccion = -1;
let inicioEleccion = -1;
let eleccionLista = false;

let anchoBeso = 0;
let bocaAnchoInicial = 0;
let sumaBocaAncho = 0;
let ojo1 = 1, ojo2 = 1;
let ojosInicial = 0, sumaOjos = 0;

let mueblesLab = [
  [80, 130, 215, 65],
  [650, 245, 270, 105]
];

let edificiosMapa = [
  [740, 55],
  [700, 290]
];

let cierrePendiente = false;
let mapaGuardado;


// CARGA DE RECURSOS

function preload() {
  pixelify = loadFont("assets/tipografias/PixelifySans-Bold.ttf");

  logoPokemon = loadImage("assets/images/pokemontm.png");
  entrenador = loadImage("assets/images/entrenador.png");
  entrenadorEspalda = loadImage("assets/images/entrenador_atras.png");
  entrenadorCostado = loadImage("assets/images/entrenador_perfil.png");
  oak = loadImage("assets/images/profeoak.png");

  cleffa = loadImage("assets/images/cleffa.gif");
  jigglypuff = loadImage("assets/images/jigglypuff.gif");
  togepi = loadImage("assets/images/togepi.gif");
  hatenna = loadImage("assets/images/hatenna.gif");

  pokebola = loadImage("assets/images/pokebola.png");
  pokebolaAbierta = loadImage("assets/images/pokebola.gif");

  musicaInicio = loadSound("assets/sounds/inicioycalibre.opus");
  musicaMapa = loadSound("assets/sounds/mapa.opus");
  sonidoVictoria = loadSound("assets/sounds/soundeffect_victoria.opus");

  handPose = ml5.handPose({
    maxHands: 1,
    flipped: false,
    modelType: "lite"
  });

  faceMesh = ml5.faceMesh({
    maxFaces: 1,
    flipped: false
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  noSmooth();
}

function windowResized() {
  if (mapaGuardado) mapaGuardado.remove();

  resizeCanvas(windowWidth, windowHeight);
  mapaGuardado = undefined;
}


// PANTALLAS

function draw() {
  if (
    pantalla === "juego" &&
    jardinCompleto &&
    comidaCompleta &&
    mensajes.length === 0 &&
    !cierrePendiente
  ) {
    cierrePendiente = true;

    abrirDialogo([
      "¡Todos están felices!\nLevantá las cejas para terminar tu aventura."
    ]);
  }

  background("#b5dee4");
  actualizarMusica();

  if (millis() - ultimaDeteccion > 500) {
    hayCara = false;
    inicioCeja = -1;
    gestoListo = false;
    lanzamientoListo = false;
    inicioGestoBoca = -1;
  }

  push();

  scale(width / 1000, height / 600);
  textFont(pixelify);
  textAlign(CENTER, CENTER);
  noStroke();

  if (
    (pantalla === "jardin" || pantalla === "restaurante") &&
    millis() - ultimaMano > 400
  ) {
    hayMano = false;
    inicioVolver = -1;
    soltarBaya();
  }

  if (pantalla === "inicio") {
    fondo();
    nube(-25, 75);
    nube(735, 95);

    image(logoPokemon, 340, 65, 320, 125);

    fill("#c83f6c");
    textSize(42);
    text("PINK ADVENTURE", 500, 245);

    textSize(23);
    text("¡TU CARA ES EL CONTROL!", 500, 290);

    boton(390, 355, "JUGAR");

    fill("#c83f6c");
    textSize(16);
    text("Hacé clic para activar el sonido", 500, 480);

  } else if (pantalla === "calibrar") {
    dibujarCalibracion();

  } else if (pantalla === "reglas") {
    reglas();

  } else if (pantalla === "elegir") {
    pantallaEleccion();

  } else if (pantalla === "restaurante") {
    restaurante();

  } else if (pantalla === "jardin") {
    jardin();

  } else if (pantalla === "encuentro") {
    encuentroHatenna();

    if (mensajes.length > 0) dialogo();

  } else if (pantalla === "juego" || pantalla === "laboratorio") {
    dibujarJuego();

    if (mensajes.length > 0) dialogo();

  } else if (pantalla === "fin") {
    dibujarCierre();
  }

  pop();

  // La cámara queda fuera del escalado para conservar su proporción.
  if (pantalla !== "inicio" && pantalla !== "fin") {
    dibujarCamara();
  }
}

function mousePressed() {
  userStartAudio();

  let x = mouseX * 1000 / width;
  let y = mouseY * 600 / height;

  if (
    pantalla === "inicio" &&
    x > 390 && x < 610 &&
    y > 355 && y < 455
  ) {
    pantalla = "calibrar";
    video = createCapture(VIDEO, camaraPreparada);
    video.size(640, 480);
    video.hide();
  }
}

function camaraPreparada() {
  camaraLista = true;
  faceMesh.detectStart(video, recibirCaras);
}


// DETECCIÓN FACIAL

function recibirCaras(caras) {
  if (
    pantalla === "fin" ||
    pantalla === "jardin" ||
    pantalla === "restaurante"
  ) {
    return;
  }

  if (
    millis() - ultimaDeteccion > 500 &&
    pantalla === "calibrar"
  ) {
    reiniciarCalibracion();
  }

  hayCara = false;

  if (caras.length > 0) {
    let p = caras[0].keypoints;

    if (p.length > 386) {
      narizX = 640 - p[1].x;
      narizY = p[1].y;

      anchoCara = dist(
        p[33].x, p[33].y,
        p[263].x, p[263].y
      );

      let altoBoca = dist(
        p[13].x, p[13].y,
        p[14].x, p[14].y
      );

      let anchoBoca = dist(
        p[61].x, p[61].y,
        p[291].x, p[291].y
      );

      if (anchoCara > 20 && anchoBoca > 0) {
        aperturaBoca = altoBoca / anchoBoca;
        anchoBeso = anchoBoca / anchoCara;

        ojo1 = dist(
          p[159].x, p[159].y,
          p[145].x, p[145].y
        ) / dist(
          p[33].x, p[33].y,
          p[133].x, p[133].y
        );

        ojo2 = dist(
          p[386].x, p[386].y,
          p[374].x, p[374].y
        ) / dist(
          p[362].x, p[362].y,
          p[263].x, p[263].y
        );

        let ceja1 = dist(
          p[105].x,
          p[105].y,
          (p[159].x + p[145].x) / 2,
          (p[159].y + p[145].y) / 2
        );

        let ceja2 = dist(
          p[334].x,
          p[334].y,
          (p[386].x + p[374].x) / 2,
          (p[386].y + p[374].y) / 2
        );

        alturaCejas = (ceja1 + ceja2) / (2 * anchoCara);

        hayCara = true;
        ultimaDeteccion = millis();
      }
    }
  }

  if (!hayCara || millis() - ultimaMuestraCejas > 500) {
    inicioCeja = -1;
    gestoListo = false;
    lanzamientoListo = false;
    inicioGestoBoca = -1;
    inicioEleccion = -1;
    eleccionLista = false;
  }

  ultimaMuestraCejas = millis();

  if (pantalla === "calibrar") {
    calibrar();

  } else if (pantalla === "reglas") {
    confirmarReglas();

  } else if (pantalla === "elegir") {
    elegirPokemon();

  } else if (pantalla === "encuentro") {
    detectarLanzamiento();
    actualizarDialogo();

  } else if (pantalla === "juego" || pantalla === "laboratorio") {
    actualizarDialogo();
  }
}


// CALIBRACIÓN

function reiniciarCalibracion() {
  sumaX = 0;
  sumaY = 0;
  sumaAncho = 0;
  sumaBoca = 0;
  sumaCejas = 0;
  sumaBocaAncho = 0;
  sumaOjos = 0;
  muestras = 0;
  inicioCalibracion = 0;
}

function calibrar() {
  if (!hayCara || aperturaBoca > 0.18) {
    reiniciarCalibracion();
    return;
  }

  if (muestras > 0) {
    let movimiento = dist(
      narizX,
      narizY,
      sumaX / muestras,
      sumaY / muestras
    );

    if (movimiento > anchoCara * 0.12) {
      reiniciarCalibracion();
    }
  }

  if (muestras === 0) inicioCalibracion = millis();

  sumaX += narizX;
  sumaY += narizY;
  sumaAncho += anchoCara;
  sumaBoca += aperturaBoca;
  sumaCejas += alturaCejas;
  sumaBocaAncho += anchoBeso;
  sumaOjos += (ojo1 + ojo2) / 2;
  muestras++;

  if (millis() - inicioCalibracion >= 3000 && muestras >= 15) {
    centroX = sumaX / muestras;
    centroY = sumaY / muestras;
    anchoInicial = sumaAncho / muestras;
    bocaInicial = sumaBoca / muestras;
    cejasInicial = sumaCejas / muestras;
    bocaAnchoInicial = sumaBocaAncho / muestras;
    ojosInicial = sumaOjos / muestras;

    pantalla = "reglas";
    gestoListo = false;
    inicioCeja = -1;
  }
}

function dibujarCalibracion() {
  fill("#c83f6c");
  textSize(36);
  text("PREPAREMOS TU CÁMARA", 500, 110);

  textSize(23);
  text("Mirá al frente con los ojos abiertos.", 500, 195);
  text("Boca cerrada y cejas relajadas.", 500, 230);

  textSize(18);
  text("Después vas a poder leer cómo jugar, sin apuro.", 500, 290);

  textSize(22);

  if (!camaraLista) {
    text("Permití el acceso a la cámara para empezar.", 500, 350);
  } else if (!hayCara) {
    text("Ubicá tu cara en la cámara.", 500, 350);
  } else {
    text("Quedate quietitx durante 3 segundos.", 500, 350);
  }

  fill("#ebf2d8");
  rect(350, 390, 300, 16);

  if (muestras > 0 && hayCara) {
    let progreso = constrain(
      (millis() - inicioCalibracion) / 3000,
      0,
      1
    );

    fill("#f08aa4");
    rect(350, 390, 300 * progreso, 16);
  }
}


// REGLAS

function reglas() {
  fill("#c83f6c");
  textSize(36);
  text("¡TODO LISTO! ¿CÓMO SE JUEGA?", 500, 55);

  textSize(19);
  text("Leé tranquila. Esta pantalla no se cierra sola.", 500, 100);

  tarjetaRegla(
    45,
    "01",
    "CAMINÁ",
    "Mové la cabeza.\nVolvé al centro\npara frenar."
  );

  tarjetaRegla(
    355,
    "02",
    "ACTUÁ",
    "Abrí la boca\npara lanzar la Pokébola\ncuando encuentres a Hatenna."
  );

  tarjetaRegla(
    665,
    "03",
    "CONTINUÁ",
    "Levantá las cejas\npara pasar un diálogo.\nRelajalas antes de repetir."
  );

  fill("#c83f6c");
  textSize(18);
  text(
    "Elegí tu compañero, buscá a Hatenna y llevala a merendar. ¡También hay caricias!",
    500,
    345
  );

  fill("#c83f6c");
  rect(330, 375, 340, 50);

  fill("#ebf2d8");
  textSize(26);
  text("¡ENTENDIDO, A JUGAR!", 500, 400);

  fill("#c83f6c");
  textSize(16);

  let indicacion = "Levantá las cejas para empezar";

  if (!gestoListo) {
    indicacion = "Relajá las cejas y después levantalas para empezar";
  }

  if (!hayCara) {
    indicacion = "Mostrá tu cara para confirmar cuando estés lista";
  }

  text(indicacion, 500, 448);
}

function tarjetaRegla(x, numero, titulo, detalle) {
  fill("#c83f6c");
  rect(x, 140, 290, 175);

  fill("#ebf2d8");
  rect(x + 5, 145, 280, 165);

  fill("#f08aa4");
  rect(x + 15, 155, 42, 32);

  fill("#c83f6c");
  textSize(20);
  text(numero, x + 36, 171);

  textSize(25);
  text(titulo, x + 164, 174);

  textSize(18);
  textLeading(27);
  text(detalle, x + 145, 249);
}

function confirmarReglas() {
  if (!hayCara) return;

  if (alturaCejas < cejasInicial + 0.015) {
    gestoListo = true;
    inicioCeja = -1;
  }

  if (gestoListo && alturaCejas > cejasInicial + 0.035) {
    if (inicioCeja === -1) inicioCeja = millis();

    if (millis() - inicioCeja >= 400) {
      pantalla = "juego";

      abrirDialogo([
        "¡Bienvenida a Pink Adventure!\nAcercate al laboratorio, arriba a la derecha."
      ]);
    }
  } else {
    inicioCeja = -1;
  }
}


// MOVIMIENTO Y ENTRADAS

function dibujarJuego() {
  if (pantalla === "juego") mapa();
  else laboratorio();

  if (hayCara && mensajes.length === 0 && gestoListo) {
    let margen = anchoInicial * 0.15;

    // La velocidad depende del tiempo, no de los cuadros por segundo.
    let paso = 120 * min(deltaTime, 50) / 1000;
    let x = jugadorX;
    let y = jugadorY;

    if (narizX > centroX + margen) {
      x += paso;
      direccion = "derecha";
    }

    if (narizX < centroX - margen) {
      x -= paso;
      direccion = "izquierda";
    }

    if (narizY > centroY + margen) {
      y += paso;
      direccion = "frente";
    }

    if (narizY < centroY - margen) {
      y -= paso;
      direccion = "espalda";
    }

    // Evita caminar más rápido en diagonal.
    if (x !== jugadorX && y !== jugadorY) {
      x = jugadorX + (x - jugadorX) / sqrt(2);
      y = jugadorY + (y - jugadorY) / sqrt(2);
    }

    let limiteArriba = 48;

    if (pantalla === "laboratorio") limiteArriba = 210;

    if (x >= 53 && x <= 947 && !choca(x, jugadorY)) {
      jugadorX = x;
    }

    if (y >= limiteArriba && y <= 450 && !choca(jugadorX, y)) {
      jugadorY = y;
    }

    if (aperturaBoca < bocaInicial + 0.08) {
      bocaAbierta = false;
    }

    if (aperturaBoca > bocaInicial + 0.2 && !bocaAbierta) {
      inicioAccion = millis();
      accionX = jugadorX;
      accionY = jugadorY;
      bocaAbierta = true;
    }

  } else if (!hayCara) {
    bocaAbierta = true;
    fill("#c83f6c");
    textSize(20);
    text("Volvé a mostrar tu cara", 500, 35);
  }

  if (
    pantalla === "juego" &&
    companero !== -1 &&
    !hatennaCapturada &&
    mensajes.length === 0 &&
    hayCara &&
    gestoListo &&
    enFlores()
  ) {
    pantalla = "encuentro";
    etapaCaptura = "espera";
    lanzamientoListo = false;
    inicioGestoBoca = -1;
    inicioAccion = -2000;
    bocaAbierta = true;
    hatenna.reset();
    return;
  }

  // Entrada al jardín.
  if (
    pantalla === "juego" &&
    mensajes.length === 0 &&
    hayCara &&
    gestoListo
  ) {
    let cercaJardin = dist(jugadorX, jugadorY, 165, 230) < 32;

    if (!cercaJardin) avisoJardin = false;

    if (cercaJardin && !avisoJardin) {
      avisoJardin = true;

      if (companero === -1) {
        abrirDialogo([
          "Primero elegí un compañero en el laboratorio.\nDespués pueden venir al jardín juntos."
        ]);
      } else {
        entrarJardin();
        return;
      }
    }
  }

  // Entrada al restaurante.
  if (
    pantalla === "juego" &&
    mensajes.length === 0 &&
    hayCara &&
    gestoListo
  ) {
    let cercaRestaurante = dist(jugadorX, jugadorY, 790, 438) < 25;

    if (!cercaRestaurante) avisoRestaurante = false;

    if (cercaRestaurante && !avisoRestaurante) {
      avisoRestaurante = true;

      if (!hatennaCapturada) {
        abrirDialogo([
          "¡Esta merienda es para Hatenna!\nPrimero encontrala en las flores y capturala."
        ]);
      } else {
        entrarRestaurante();
        return;
      }
    }
  }

  // Entrada y salida del laboratorio.
  if (mensajes.length === 0 && hayCara && gestoListo) {
    if (
      pantalla === "juego" &&
      dist(jugadorX, jugadorY, 830, 205) < 30
    ) {
      pantalla = "laboratorio";
      jugadorX = 500;
      jugadorY = 385;
      direccion = "espalda";

      if (!llegoLaboratorio) {
        llegoLaboratorio = true;

        abrirDialogo([
          "OAK: ¡Bienvenida a mi laboratorio!\nTe estaba esperando.",
          "Elegí a tu compañero con un gesto.\nAhora te muestro cómo."
        ]);
      }

      return;
    }

    if (
      pantalla === "laboratorio" &&
      jugadorX > 450 && jugadorX < 550 &&
      jugadorY > 435
    ) {
      pantalla = "juego";
      jugadorX = 830;
      jugadorY = 245;
      direccion = "frente";
      return;
    }
  }

  if (pantalla === "laboratorio" && jugadorY < 300) {
    dibujarEntrenador();
    personajesLab();
  } else {
    if (pantalla === "laboratorio") personajesLab();
    dibujarEntrenador();
  }

  let tiempo = millis() - inicioAccion;

  if (tiempo < 1000) {
    push();
    translate(accionX - 20, accionY - 55 - tiempo / 40);

    fill("#f08aa4");
    rect(4, 0, 12, 4);
    rect(24, 0, 12, 4);
    rect(0, 4, 40, 8);

    for (let i = 0; i < 5; i++) {
      rect(i * 4, 12 + i * 4, 40 - i * 8, 4);
    }

    pop();
  }
}

function dibujarEntrenador() {
  push();
  translate(jugadorX, jugadorY);

  let dibujo = entrenador;

  if (direccion === "espalda") {
    dibujo = entrenadorEspalda;
  }

  if (direccion === "derecha" || direccion === "izquierda") {
    dibujo = entrenadorCostado;
  }

  if (direccion === "izquierda") scale(-1, 1);

  image(dibujo, -32, -46, 64, 64);
  pop();
}

function dibujarCamara() {
  if (!camaraLista) return;

  let proporcion = 4 / 3;

  if (video.elt.videoWidth > 0 && video.elt.videoHeight > 0) {
    proporcion = video.elt.videoWidth / video.elt.videoHeight;
  }

  let alto = min(height * 0.20, width * 0.40 / proporcion);
  let ancho = alto * proporcion;

  push();
  translate((width + ancho) / 2, height * 0.79);
  scale(-1, 1);
  image(video, 0, 0, ancho, alto);
  pop();
}


// LABORATORIO

function laboratorio() {
  push();
  noStroke();

  fill("#ebf2d8");
  rect(0, 0, 1000, 465);

  fill("#f08aa4");

  for (let x = 0; x < 1000; x += 80) {
    rect(x, 185, 2, 280);
  }

  fill("#b5dee4");
  rect(0, 0, 1000, 185);

  fill("#c83f6c");
  rect(0, 180, 1000, 8);

  for (let x = 50; x < 950; x += 225) {
    fill("#c83f6c");
    rect(x, 20, 200, 55);

    fill("#ebf2d8");
    rect(x + 5, 25, 190, 45);

    fill("#b5dee4");
    rect(x + 10, 30, 180, 30);
  }

  mesaLab(80, 130, 215, 65);
  computadora(110, 88);

  for (let i = 0; i < 3; i++) {
    armario(560 + i * 125, 88);
  }

  mesaLab(650, 245, 270, 105);

  let pokemones = [cleffa, jigglypuff, togepi];

  for (let i = 0; i < 3; i++) {
    image(pokemones[i], 660 + i * 85, 220, 70, 70);
    image(pokebola, 680 + i * 85, 302, 28, 28);
  }

  fill("#c83f6c");
  rect(450, 423, 100, 42);

  fill("#f08aa4");
  rect(455, 428, 90, 32);

  fill("#ebf2d8");
  textSize(15);
  text("SALIDA", 500, 445);

  pop();
}

function mesaLab(x, y, ancho, alto) {
  fill("#c83f6c");
  rect(x + 8, y + alto, 10, 18);
  rect(x + ancho - 18, y + alto, 10, 18);
  rect(x, y, ancho, alto);

  fill("#f08aa4");
  rect(x + 5, y + 5, ancho - 10, alto - 10);

  fill("#ebf2d8");
  rect(x + 5, y + 5, ancho - 10, 5);
}

function computadora(x, y) {
  fill("#c83f6c");
  rect(x, y, 90, 50);
  rect(x + 35, y + 50, 20, 8);

  fill("#b5dee4");
  rect(x + 5, y + 5, 80, 40);

  fill("#ebf2d8");
  rect(x - 5, y + 62, 100, 12);
}

function armario(x, y) {
  fill("#c83f6c");
  rect(x, y, 110, 90);

  fill("#ebf2d8");
  rect(x + 5, y + 5, 100, 80);

  fill("#b5dee4");
  rect(x + 10, y + 10, 90, 65);

  fill("#c83f6c");
  rect(x + 53, y + 5, 4, 80);

  fill("#f08aa4");
  rect(x + 44, y + 40, 5, 15);
  rect(x + 61, y + 40, 5, 15);
}

function personajesLab() {
  image(oak, 365, 235, 75, 75);
}

function choca(x, y) {
  if (pantalla === "juego") return chocaEdificio(x, y);

  for (let i = 0; i < mueblesLab.length; i++) {
    let m = mueblesLab[i];

    if (
      x > m[0] - 15 &&
      x < m[0] + m[2] + 15 &&
      y > m[1] - 15 &&
      y < m[1] + m[3] + 18
    ) {
      return true;
    }
  }

  if (dist(x, y, 402, 300) < 25) return true;

  return false;
}


// FONDO DE INICIO

function fondo() {
  noStroke();

  fill("#ebf2d8");
  rect(0, 0, 1000, 95);

  for (let x = 0; x < 1000; x += 60) {
    fill("#b5dee4");
    rect(x, 30, 40, 15);
    rect(x, 45, 20, 15);
    rect(x + 40, 60, 20, 15);

    fill("#ebf2d8");
    rect(x + 20, 95, 20, 15);
    rect(x, 120, 20, 15);
  }

  fill("#cfd951");
  rect(0, 500, 1000, 100);

  cerro(0, 360);

  push();
  translate(1000, 0);
  scale(-1, 1);
  cerro(0, 360);
  pop();
}

function cerro(x, y) {
  push();
  translate(x, y);
  noStroke();

  let alturas = [20, 40, 65, 100, 120, 160, 110, 110, 90, 60];

  for (let i = 0; i < alturas.length; i++) {
    fill("#ebf2d8");
    rect(i * 30, 160 - alturas[i], 30, alturas[i]);

    fill("#aba517");
    rect(i * 30, 168 - alturas[i], 30, alturas[i] - 8);
  }

  fill("#cfd951");

  for (let i = 0; i < 10; i++) {
    rect(i * 30, 145, 15, 15);
    rect(i * 30 + 15, 160, 15, 10);
  }

  pop();
}

function nube(x, y) {
  push();
  translate(x, y);
  noStroke();

  for (let i = 0; i < 3; i++) {
    let px = i * 75;
    let py = 65;

    if (i === 1) py = 0;

    fill("#c83f6c");
    rect(px + 15, py, 100, 120);
    rect(px, py + 20, 130, 80);
    rect(px + 30, py - 10, 65, 140);

    fill("#ebf2d8");
    rect(px + 15, py, 65, 10);

    fill("#f08aa4");
    rect(px + 15, py + 10, 85, 10);
    rect(px, py + 20, 45, 10);
    rect(px, py + 30, 15, 20);
  }

  pop();
}

function boton(x, y, palabra) {
  push();
  translate(x, y);
  noStroke();

  let colores = ["#c83f6c", "#ebf2d8", "#f08aa4"];

  for (let i = 0; i < 3; i++) {
    let margen = i * 6;
    fill(colores[i]);

    rect(25, margen, 170, 100 - margen * 2);
    rect(10 + margen, 10 + margen, 200 - margen * 2, 80 - margen * 2);
    rect(margen, 25, 220 - margen * 2, 50);
  }

  fill("#ebf2d8");
  textFont(pixelify);
  textAlign(CENTER, CENTER);
  textSize(38);
  text(palabra, 95, 48);

  for (let i = 0; i < 5; i++) {
    rect(170 + i * 4, 33 + i * 3, 4, 30 - i * 6);
  }

  pop();
}


// MAPA

function mapa() {
  // Reutilizamos el paisaje fijo sin volver a dibujar cada rectángulo.
  if (mapaGuardado) {
    image(mapaGuardado, 0, 0, 1000, 600);
    return;
  }

  push();
  noStroke();

  fill("#cfd951");
  rect(0, 0, 1000, 465);

  fill("#aba517");

  for (let x = 55; x < 960; x += 42) {
    for (let y = 35; y < 455; y += 38) {
      rect(x, y, 3, 3);
      rect(x + 6, y + 4, 3, 3);
    }
  }

  fill("#ebf2d8");
  rect(40, 210, 920, 55);
  rect(475, 210, 50, 255);
  rect(805, 175, 50, 65);

  cantero(300, 55, 7, 4);
  cantero(80, 300, 9, 4);

  edificio(740, 55, "LABORATORIO", "#f08aa4");
  entradaJardin();

  fill("#ebf2d8");
  rect(500, 425, 310, 30);

  edificio(700, 290, "RESTAURANTE", "#f08aa4");

  for (let x = 0; x < 1000; x += 40) {
    arbusto(x, 0);
  }

  for (let y = 35; y < 430; y += 40) {
    arbusto(0, y);
    arbusto(960, y);
  }

  pop();

  // Copia del fondo con la misma resolución que el canvas.
  // Todavía no se dibujaron el personaje, los diálogos ni la cámara.
  mapaGuardado = createGraphics(width, height);
  mapaGuardado.pixelDensity(pixelDensity());
  mapaGuardado.drawingContext.drawImage(
    drawingContext.canvas,
    0,
    0,
    width,
    height
  );
}

function edificio(x, y, nombre, techo) {
  push();
  translate(x, y);
  noStroke();

  fill("#aba517");
  rect(8, 10, 178, 119);

  fill("#c83f6c");
  rect(0, 50, 180, 75);

  fill("#ebf2d8");
  rect(4, 55, 172, 66);

  fill("#f08aa4");

  for (let fila = 70; fila < 115; fila += 16) {
    rect(4, fila, 172, 3);
  }

  fill("#c83f6c");
  rect(0, 10, 180, 48);
  rect(8, 0, 164, 58);

  fill(techo);
  rect(5, 14, 170, 39);
  rect(12, 5, 156, 48);

  fill("#ebf2d8");

  for (let fila = 12; fila < 50; fila += 12) {
    rect(14, fila, 152, 2);
  }

  for (let columna = 24; columna < 160; columna += 24) {
    rect(columna, 7, 2, 43);
  }

  for (let i = 0; i < 2; i++) {
    let vx = 15 + i * 120;

    fill("#c83f6c");
    rect(vx, 78, 30, 28);

    fill("#b5dee4");
    rect(vx + 3, 81, 24, 22);

    fill("#ebf2d8");
    rect(vx + 14, 81, 3, 22);
  }

  fill("#ebf2d8");
  rect(8, 56, 164, 20);

  fill("#c83f6c");
  textFont(pixelify);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(nombre, 90, 65);

  rect(65, 78, 50, 47);

  fill("#b5dee4");
  rect(69, 82, 42, 39);

  fill("#ebf2d8");
  rect(88, 82, 4, 39);
  rect(61, 121, 58, 4);

  pop();
}

function cantero(x, y, columnas, filas) {
  push();
  noStroke();

  fill("#aba517");
  rect(x - 8, y - 6, columnas * 30 + 12, filas * 32 + 10);

  fill("#cfd951");
  rect(x - 4, y - 2, columnas * 30 + 4, filas * 32 + 2);

  let colores = ["#f08aa4", "#ebf2d8", "#b5dee4"];

  for (let fila = 0; fila < filas; fila++) {
    for (let columna = 0; columna < columnas; columna++) {
      flor(
        x + columna * 30,
        y + fila * 32,
        colores[columna % 3]
      );
    }
  }

  pop();
}

function flor(x, y, colorPetalos) {
  push();
  translate(x, y);
  noStroke();

  fill("#aba517");
  rect(11, 13, 4, 15);
  rect(4, 18, 8, 4);
  rect(15, 21, 8, 4);

  fill("#c83f6c");
  rect(7, 1, 12, 19);
  rect(3, 5, 20, 11);

  fill(colorPetalos);
  rect(9, 0, 8, 8);
  rect(9, 12, 8, 8);
  rect(3, 6, 8, 8);
  rect(15, 6, 8, 8);

  fill("#ebf2d8");
  rect(10, 7, 6, 6);

  fill("#aba517");
  rect(12, 9, 2, 2);

  pop();
}

function arbusto(x, y) {
  push();
  translate(x, y);
  noStroke();

  fill("#aba517");
  rect(4, 7, 32, 26);
  rect(10, 2, 20, 34);

  fill("#cfd951");
  rect(8, 7, 24, 19);
  rect(13, 3, 14, 25);

  fill("#ebf2d8");
  rect(12, 7, 12, 4);
  rect(9, 11, 4, 7);

  pop();
}

function chocaEdificio(x, y) {
  for (let i = 0; i < edificiosMapa.length; i++) {
    let ex = edificiosMapa[i][0];
    let ey = edificiosMapa[i][1];

    if (
      x > ex - 13 && x < ex + 193 &&
      y > ey - 13 && y < ey + 138
    ) {
      return true;
    }
  }

  return false;
}


// SONIDOS

function actualizarMusica() {
  if (getAudioContext().state !== "running") return;

  let nueva = "mapa";

  if (
    pantalla === "inicio" ||
    pantalla === "calibrar" ||
    pantalla === "reglas"
  ) {
    nueva = "inicio";
  }

  if (nueva === musicaActual) return;

  musicaActual = nueva;

  if (nueva === "inicio") {
    if (musicaMapa.isPlaying()) musicaMapa.stop();

    if (!musicaInicio.isPlaying()) {
      musicaInicio.setVolume(0.4);
      musicaInicio.loop();
    }
  } else {
    if (musicaInicio.isPlaying()) musicaInicio.stop();

    if (!musicaMapa.isPlaying()) {
      musicaMapa.setVolume(0.4);
      musicaMapa.loop();
    }
  }
}

function celebrar() {
  if (getAudioContext().state === "running") {
    sonidoVictoria.setVolume(0.5);
    sonidoVictoria.play();
  }
}


// DIÁLOGOS

function abrirDialogo(textos) {
  mensajes = textos;
  mensajeActual = 0;
  inicioCeja = -1;
  gestoListo = false;
  bocaAbierta = true;
  inicioAccion = -2000;
}

function actualizarDialogo() {
  if (!hayCara) return;

  if (alturaCejas < cejasInicial + 0.015) {
    gestoListo = true;
    inicioCeja = -1;
  }

  if (mensajes.length === 0 || !gestoListo) return;

  if (alturaCejas > cejasInicial + 0.035) {
    if (inicioCeja === -1) inicioCeja = millis();

    if (millis() - inicioCeja >= 400) {
      mensajeActual++;
      inicioCeja = -1;
      gestoListo = false;
      bocaAbierta = true;

      if (mensajeActual >= mensajes.length) {
        mensajes = [];

        if (cierrePendiente && pantalla === "juego") {
          pantalla = "fin";
          faceMesh.detectStop();

          // Apagamos la cámara al terminar.
          if (video.elt.srcObject) {
            let pistas = video.elt.srcObject.getTracks();

            for (let i = 0; i < pistas.length; i++) {
              pistas[i].stop();
            }
          }

          video.remove();
          camaraLista = false;
          return;
        }

        if (pantalla === "laboratorio" && companero === -1) {
          pantalla = "elegir";
          candidato = -1;
          inicioEleccion = -1;
          eleccionLista = false;
        }

        if (pantalla === "encuentro" && hatennaCapturada) {
          pantalla = "juego";
          bocaAbierta = true;
        }
      }
    }
  } else {
    inicioCeja = -1;
  }
}

function dialogo() {
  push();
  noStroke();

  let colores = [
    "#c83f6c",
    "#ebf2d8",
    "#c83f6c",
    "#ebf2d8"
  ];

  for (let i = 0; i < colores.length; i++) {
    let margen = i * 3;
    fill(colores[i]);

    rect(
      70 + margen,
      322 + margen,
      860 - margen * 2,
      126 - margen * 2
    );

    rect(
      64 + margen,
      328 + margen,
      872 - margen * 2,
      114 - margen * 2
    );
  }

  fill("#c83f6c");
  textFont(pixelify);
  textAlign(CENTER, CENTER);
  textSize(23);
  textLeading(29);
  text(mensajes[mensajeActual], 500, 369);

  textSize(16);

  let ayuda = "Levantá las cejas un instante para continuar";

  if (!gestoListo) {
    ayuda = "Relajá las cejas para preparar el siguiente gesto";
  }

  if (!hayCara) {
    ayuda = "Volvé a mostrar tu cara a la cámara";
  }

  text(ayuda, 500, 423);
  pop();
}


// ELECCIÓN DEL COMPAÑERO

function pokemonDibujo(numero) {
  if (numero === 0) return cleffa;
  if (numero === 1) return jigglypuff;
  return togepi;
}

function pantallaEleccion() {
  fill("#c83f6c");
  textSize(32);
  text("OAK: ¡ELEGÍ A TU COMPAÑERO!", 500, 55);

  textSize(19);
  text(
    "Mantené su gesto un segundo. Después confirmá con las cejas.",
    500,
    100
  );

  let gestos = [
    "Mandá un besito",
    "Sonreí",
    "Cerrá ambos ojos"
  ];

  for (let i = 0; i < 3; i++) {
    let x = 65 + i * 300;

    fill("#ebf2d8");
    rect(x, 140, 270, 215);

    if (candidato === i) {
      fill("#f08aa4");
      rect(x, 140, 270, 8);
      rect(x, 347, 270, 8);
    }

    image(pokemonDibujo(i), x + 70, 155, 130, 130);

    fill("#c83f6c");
    textSize(25);
    text(nombres[i], x + 135, 300);

    textSize(19);
    text(gestos[i], x + 135, 333);
  }

  fill("#c83f6c");
  textSize(22);

  if (candidato === -1) {
    text("¿Quién va a acompañarte?", 500, 390);
  } else {
    text(
      "¿Elegís a " + nombres[candidato] + "? Levantá las cejas para confirmar.",
      500,
      390
    );
  }

  textSize(17);

  if (!hayCara) {
    text("Volvé a mostrar tu cara a la cámara.", 500, 435);
  } else {
    text(
      "Para cambiar, relajá la cara y hacé el gesto de otro Pokémon.",
      500,
      435
    );
  }
}

function elegirPokemon() {
  if (!hayCara) return;

  let gesto = -1;

  if (
    ojo1 < ojosInicial * 0.55 &&
    ojo2 < ojosInicial * 0.55
  ) {
    gesto = 2;

  } else if (
    anchoBeso < bocaAnchoInicial * 0.80 &&
    aperturaBoca < 0.35
  ) {
    gesto = 0;

  } else if (anchoBeso > bocaAnchoInicial * 1.18) {
    gesto = 1;
  }

  if (gesto === -1) {
    eleccionLista = true;
    inicioEleccion = -1;
  }

  if (eleccionLista && gesto !== -1) {
    if (gesto !== gestoEleccion || inicioEleccion === -1) {
      gestoEleccion = gesto;
      inicioEleccion = millis();
    }

    if (millis() - inicioEleccion >= 900) {
      candidato = gesto;
      eleccionLista = false;
      inicioEleccion = -1;
      gestoListo = false;
      inicioCeja = -1;
    }
  }

  if (alturaCejas < cejasInicial + 0.015) {
    gestoListo = true;
    inicioCeja = -1;
  }

  if (
    candidato !== -1 &&
    gestoListo &&
    alturaCejas > cejasInicial + 0.035
  ) {
    if (inicioCeja === -1) inicioCeja = millis();

    if (millis() - inicioCeja >= 400) {
      companero = candidato;
      equipo.push(nombres[companero]);
      pantalla = "laboratorio";

      abrirDialogo([
        "¡" + nombres[companero] + " se suma a tu equipo!",
        "OAK: ¡Ahora buscá a Hatenna en las flores del mapa!\nAbrí la boca para lanzar tu Pokébola cuando la encuentres.",
        "Después llevá a Hatenna al restaurante, abajo a la derecha.\nTambién podés acariciar a tu compañero en el jardín."
      ]);
    }
  } else {
    inicioCeja = -1;
  }
}


// ENCUENTRO CON HATENNA

function enFlores() {
  let arriba =
    jugadorX > 296 && jugadorX < 514 &&
    jugadorY > 53 && jugadorY < 187;

  let abajo =
    jugadorX > 76 && jugadorX < 354 &&
    jugadorY > 298 && jugadorY < 432;

  return arriba || abajo;
}

function detectarLanzamiento() {
  if (!hayCara || etapaCaptura !== "espera") return;

  if (aperturaBoca < bocaInicial + 0.08) {
    lanzamientoListo = true;
  }

  if (lanzamientoListo && aperturaBoca > bocaInicial + 0.2) {
    if (inicioGestoBoca === -1) inicioGestoBoca = millis();

    if (millis() - inicioGestoBoca >= 250) {
      etapaCaptura = "vuelo";
      inicioCaptura = millis();
      lanzamientoListo = false;
      bocaAbierta = true;
    }
  } else {
    inicioGestoBoca = -1;
  }
}

function encuentroHatenna() {
  fondoEncuentro();
  actualizarCaptura();

  let tiempo = millis() - inicioCaptura;

  if (etapaCaptura === "espera" || etapaCaptura === "vuelo") {
    image(hatenna, 350, 65, 300, 300);
  }

  if (etapaCaptura === "espera") {
    botonCaptura();

  } else if (etapaCaptura === "vuelo") {
    let progreso = constrain(tiempo / 850, 0, 1);
    let x = 170 + 330 * progreso;
    let y = 390 - 105 * progreso - 130 * sin(PI * progreso);

    image(pokebola, x - 30, y - 30, 60, 60);

  } else if (etapaCaptura === "abriendo") {
    let tamano = 300 * (
      1 - constrain((tiempo - 600) / 450, 0, 1)
    );

    if (tamano > 0) {
      image(
        hatenna,
        500 - tamano / 2,
        290 - tamano * 0.75,
        tamano,
        tamano
      );
    }

    image(pokebolaAbierta, 460, 245, 80, 80);

  } else {
    image(pokebola, 470, 260, 60, 60);
  }
}

function actualizarCaptura() {
  if (
    etapaCaptura === "vuelo" &&
    millis() - inicioCaptura >= 850
  ) {
    etapaCaptura = "abriendo";
    inicioCaptura = millis();
    pokebolaAbierta.reset();

  } else if (
    etapaCaptura === "abriendo" &&
    millis() - inicioCaptura >= 1400
  ) {
    etapaCaptura = "capturada";
    hatennaCapturada = true;
    equipo.push("Hatenna");

    abrirDialogo([
      "¡Hatenna se suma a tu equipo!",
      "¡Es hora de merendar! Llevá a Hatenna al restaurante.\nEstá abajo, a la derecha del mapa."
    ]);
  }
}

function fondoEncuentro() {
  noStroke();

  fill("#ebf2d8");
  rect(0, 0, 1000, 465);

  fill("#b5dee4");

  for (let y = 0; y < 190; y += 35) {
    rect(0, y, 1000, 12);
  }

  fill("#cfd951");

  for (let y = 210; y < 465; y += 45) {
    rect(0, y, 1000, 9);
  }

  fill("#aba517");
  rect(270, 275, 460, 45);
  rect(295, 260, 410, 75);

  fill("#cfd951");
  rect(280, 275, 440, 35);
  rect(305, 265, 390, 60);

  for (let x = 295; x < 710; x += 25) {
    rect(x, 260, 8, 20);
    rect(x + 8, 270, 8, 10);
  }
}

function botonCaptura() {
  fill("#c83f6c");
  rect(310, 355, 380, 58);
  rect(304, 363, 392, 42);

  fill("#f08aa4");
  rect(316, 361, 368, 46);

  fill("#ebf2d8");
  textSize(27);
  text("LANZAR POKÉBOLA", 500, 384);

  fill("#c83f6c");
  textSize(19);

  let ayuda = "Cerrá la boca para preparar el lanzamiento";

  if (lanzamientoListo) {
    ayuda = "Abrí la boca un instante para lanzarla";
  }

  if (!hayCara) {
    ayuda = "Mostrá tu cara a la cámara para lanzar";
  }

  text(ayuda, 500, 440);
}


// JARDÍN DE CARICIAS

function entradaJardin() {
  fill("#ebf2d8");
  rect(85, 65, 160, 140);

  for (let x = 90; x < 250; x += 35) {
    flor(x, 80, "#f08aa4");
    flor(x, 145, "#b5dee4");
  }

  fill("#c83f6c");
  rect(70, 185, 190, 25);

  fill("#ebf2d8");
  textSize(16);
  text("JARDÍN DE CARICIAS", 165, 198);

  fill("#f08aa4");
  rect(145, 212, 40, 20);
}

function entrarJardin() {
  pantalla = "jardin";
  faceMesh.detectStop();

  hayCara = false;
  hayMano = false;
  ultimaMano = 0;
  inicioVolver = -1;

  handPose.detectStart(video, recibirManos);
}

// Sirve para volver desde el jardín o el restaurante.
function salirJardin() {
  let estabaComiendo = pantalla === "restaurante";

  handPose.detectStop();
  soltarBaya();

  pantalla = "juego";
  hayMano = false;
  hayCara = false;

  jugadorX = 220;
  jugadorY = 240;

  if (estabaComiendo) {
    jugadorX = 650;
    jugadorY = 440;
  }

  gestoListo = false;
  bocaAbierta = true;
  inicioCeja = -1;
  ultimaDeteccion = 0;

  faceMesh.detectStart(video, recibirCaras);
}

function recibirManos(manos) {
  if (pantalla !== "jardin" && pantalla !== "restaurante") {
    return;
  }

  if (manos.length === 0) {
    hayMano = false;
    inicioVolver = -1;
    soltarBaya();
    return;
  }

  let p = manos[0].keypoints;

  if (p.length < 21) {
    hayMano = false;
    inicioVolver = -1;
    soltarBaya();
    return;
  }

  let ahora = millis();
  let continua = hayMano && ahora - ultimaMano < 400;

  manoAnteriorX = manoX;
  manoAnteriorY = manoY;

  manoX = constrain((640 - p[8].x) / 640 * 1000, 0, 1000);
  manoY = constrain(p[8].y / 480 * 465, 0, 465);

  let dt = ahora - ultimaMano;

  ultimaMano = ahora;
  hayMano = true;

  if (pantalla === "restaurante") {
    if (!continua) soltarBaya();
    alimentarHatenna(p);
  }

  let sobreCabeza =
    manoX > 420 && manoX < 580 &&
    manoY > 160 && manoY < 260;

  let antesSobreCabeza =
    manoAnteriorX > 420 && manoAnteriorX < 580 &&
    manoAnteriorY > 160 && manoAnteriorY < 260;

  let movimiento = dist(
    manoX, manoY,
    manoAnteriorX, manoAnteriorY
  );

  let velocidad = movimiento / max(dt, 1);

  if (
    pantalla === "jardin" &&
    !jardinCompleto &&
    continua &&
    sobreCabeza &&
    antesSobreCabeza &&
    movimiento > 2 &&
    velocidad < 0.7
  ) {
    caricias = min(600, caricias + movimiento);
    ultimaCaricia = ahora;

    if (caricias >= 600) {
      jardinCompleto = true;
      celebrar();
    }
  }

  let sobreVolver =
    manoX > 800 && manoX < 975 &&
    manoY > 20 && manoY < 75;

  if (sobreVolver) {
    if (!continua || inicioVolver === -1) {
      inicioVolver = ahora;
    }

    if (ahora - inicioVolver >= 1000) {
      salirJardin();
    }
  } else {
    inicioVolver = -1;
  }
}

function jardin() {
  fill("#ebf2d8");
  rect(0, 0, 1000, 465);

  fill("#b5dee4");
  rect(0, 0, 1000, 125);

  fill("#c83f6c");
  textSize(30);
  text("JARDÍN DE CARICIAS", 430, 45);

  textSize(18);
  text("Mové tu índice suavemente sobre su cabeza.", 430, 90);

  fill("#cfd951");
  rect(0, 310, 1000, 155);

  fill("#f08aa4");
  rect(420, 153, 160, 4);

  image(pokemonDibujo(companero), 350, 115, 300, 300);

  let flores = floor(caricias / 50);

  for (let i = 0; i < 12; i++) {
    let x = 65 + i * 78;

    fill("#aba517");
    rect(x + 11, 380, 4, 22);

    if (i < flores) flor(x, 365, "#f08aa4");
  }

  if (hayMano && millis() - ultimaCaricia < 650) {
    corazonJardin(
      390,
      160 - (millis() - ultimaCaricia) / 25
    );

    corazonJardin(
      610,
      180 - (millis() - ultimaCaricia) / 25
    );
  }

  fill("#c83f6c");
  textSize(20);

  if (jardinCompleto) {
    text(
      "¡" + nombres[companero] + " está feliz de estar con vos!",
      500,
      435
    );
  } else if (!hayMano) {
    text(
      "Mostrá una mano a la cámara. Tu progreso te espera.",
      500,
      435
    );
  } else {
    text(
      "Cada caricia hace florecer el jardín. Sin apuro.",
      500,
      435
    );
  }

  fill("#c83f6c");
  rect(800, 20, 175, 55);

  fill("#ebf2d8");
  textSize(20);
  text("VOLVER", 887, 41);

  textSize(12);
  text("Mantené la manito acá", 887, 62);

  if (inicioVolver !== -1 && hayMano) {
    let progreso = constrain(
      (millis() - inicioVolver) / 1000,
      0,
      1
    );

    fill("#f08aa4");
    rect(800, 76, 175 * progreso, 5);
  }

  if (hayMano) manito(manoX, manoY);
}

function manito(x, y) {
  push();
  translate(x, y);
  noStroke();

  fill("#c83f6c");
  rect(-5, 0, 10, 34);
  rect(-17, 20, 36, 24);
  rect(-12, 40, 26, 10);

  fill("#ebf2d8");
  rect(-2, 3, 4, 29);
  rect(-13, 24, 28, 16);
  rect(-8, 40, 18, 6);

  pop();
}

function corazonJardin(x, y) {
  fill("#c83f6c");
  rect(x, y, 12, 8);
  rect(x + 16, y, 12, 8);
  rect(x, y + 8, 28, 8);
  rect(x + 4, y + 16, 20, 4);
  rect(x + 8, y + 20, 12, 4);
}


// RESTAURANTE

function entrarRestaurante() {
  if (!hatennaCapturada) return;

  pantalla = "restaurante";
  faceMesh.detectStop();

  hayCara = false;
  hayMano = false;
  ultimaMano = 0;
  inicioVolver = -1;

  soltarBaya();
  handPose.detectStart(video, recibirManos);
}

function soltarBaya() {
  bayaAgarrada = false;
  pinzaLista = false;
  bayaX = 190;
  bayaY = 325;
}

function alimentarHatenna(p) {
  if (comidaCompleta) return;

  let anchoMano = dist(
    p[5].x, p[5].y,
    p[17].x, p[17].y
  );

  if (anchoMano < 15) {
    soltarBaya();
    return;
  }

  let pinza = dist(
    p[4].x, p[4].y,
    p[8].x, p[8].y
  ) / anchoMano;

  if (bayaAgarrada) {
    bayaX = manoX;
    bayaY = manoY;

    if (pinza > 0.65) {
      if (dist(bayaX, bayaY, 560, 260) < 65) {
        bayasComidas++;
        ultimaComida = millis();

        if (bayasComidas >= 3) {
          comidaCompleta = true;
          celebrar();
        }
      }

      soltarBaya();
      pinzaLista = true;
    }

    return;
  }

  if (pinza > 0.65) pinzaLista = true;

  if (pinzaLista && pinza < 0.35) {
    pinzaLista = false;

    if (dist(manoX, manoY, bayaX, bayaY) < 55) {
      bayaAgarrada = true;
      bayaX = manoX;
      bayaY = manoY;
    }
  }
}

function restaurante() {
  fill("#ebf2d8");
  rect(0, 0, 1000, 465);

  fill("#f08aa4");
  rect(0, 0, 1000, 115);

  fill("#c83f6c");
  textSize(30);
  text("LA MERIENDA DE HATENNA", 410, 40);

  textSize(17);
  text(
    "Agarrá una baya con pulgar e índice. Acercala y abrí los dedos.",
    410,
    85
  );

  fill("#b5dee4");
  rect(75, 300, 850, 110);

  fill("#ebf2d8");

  for (let i = 0; i < 17; i++) {
    for (let fila = 0; fila < 2; fila++) {
      if ((i + fila) % 2 === 0) {
        rect(75 + i * 50, 300 + fila * 50, 50, 50);
      }
    }
  }

  fill("#c83f6c");
  rect(75, 405, 850, 8);

  image(hatenna, 410, 110, 300, 300);

  fill("#c83f6c");
  rect(125, 350, 130, 8);

  fill("#ebf2d8");
  rect(130, 340, 120, 10);

  fill("#c83f6c");
  textSize(18);
  text("BAYAS", 190, 285);

  if (!comidaCompleta) {
    dibujarBaya(bayaX, bayaY);
  }

  textSize(18);
  text("Merienda: " + bayasComidas + " / 3", 770, 360);

  if (millis() - ultimaComida < 1000) {
    corazonJardin(
      700,
      205 - (millis() - ultimaComida) / 40
    );
  }

  fill("#c83f6c");
  textSize(19);

  let ayuda =
    "Separá los dedos sobre la baya; después juntalos para agarrarla.";

  if (pinzaLista) {
    ayuda = "Juntá pulgar e índice sobre la baya para agarrarla.";
  }

  if (bayaAgarrada) {
    ayuda = "¡La tenés! Acercala a Hatenna y separá los dedos.";
  }

  if (!hayMano) {
    ayuda = "Mostrá tu mano a la cámara. Las bayas te esperan.";
  }

  if (comidaCompleta) {
    ayuda = "¡A Hatenna le encantó la merienda!";
  }

  text(ayuda, 500, 442);

  fill("#c83f6c");
  rect(800, 20, 175, 55);

  fill("#ebf2d8");
  textSize(20);
  text("VOLVER", 887, 41);

  textSize(12);
  text("Mantené la manito acá", 887, 62);

  if (inicioVolver !== -1 && hayMano) {
    let progreso = constrain(
      (millis() - inicioVolver) / 1000,
      0,
      1
    );

    fill("#ebf2d8");
    rect(800, 76, 175 * progreso, 5);
  }

  if (hayMano) manito(manoX, manoY);
}

function dibujarBaya(x, y) {
  push();
  translate(x, y);
  noStroke();

  fill("#c83f6c");
  rect(-18, -10, 36, 24);
  rect(-12, 14, 24, 6);

  fill("#f08aa4");
  rect(-13, -7, 26, 20);

  fill("#ebf2d8");
  rect(-8, -3, 5, 5);

  fill("#aba517");
  rect(-3, -19, 6, 10);
  rect(3, -17, 12, 5);

  pop();
}


// CIERRE

function dibujarCierre() {
  fondo();
  nube(-110, 65);
  nube(835, 65);

  // Recuadro más amplio, con espacio para todas las líneas.
  fill("#ebf2d8");
  rect(120, 135, 760, 175);

  fill("#c83f6c");
  textSize(44);
  text("¡GRACIAS POR JUGAR!", 500, 175);

  textSize(21);
  text("Esperamos que hayas disfrutado", 500, 220);
  text("de esta pequeña aventura.", 500, 247);
  text(
    "¡Tus nuevos amigos te esperan para volver a jugar!",
    500,
    282
  );

  let amigos = [cleffa, jigglypuff, togepi, hatenna];
  let posiciones = [180, 320, 680, 820];

  for (let i = 0; i < amigos.length; i++) {
    let salto = sin(millis() / 400 + i) * 5;

    image(
      amigos[i],
      posiciones[i] - 65,
      350 + salto,
      130,
      130
    );

    corazonJardin(posiciones[i], 325 + salto);
  }

  image(oak, 435, 330, 130, 150);

  fill("#c83f6c");
  textSize(24);
  text(
    "OAK Y TUS AMIGOS TE DICEN: ¡HASTA PRONTO!",
    500,
    510
  );

  textSize(21);
  text("POKÉMON PINK ADVENTURE", 500, 555);
}