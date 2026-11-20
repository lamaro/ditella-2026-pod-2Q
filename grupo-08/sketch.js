// EN QUE PANTALLA ESTAMOS
// kiosco: portada, maxiEspera, dialogo, seleccion, finalEspera, finalKiosco
// palitos: palitosIntro, palitos
// capitan: capitanIntro, capitan, capitanPerdio, capitanGano
// lenguetazo: lenguetazoIntro, lenguetazo
let estado = "portada"

let capitanDesbloqueado = false
let lenguetazoDesbloqueado = false


//camara y ml5
let video
let handPose
let faceMesh
let manos = []
let caras = []
let detectorDeCarasPrendido = false
let anchoVideo = 640
let altoVideo = 480

//donde se dibuja la camara (se calcula en calcularPosiciones) 
let videoX = 0
let videoY = 0
let camAncho = 0
let camAlto = 0

// el dedo indice (suavizado para que no tiemble)
let dedoX = 0
let dedoY = 0
let hayMano = false
let saltosSeguidos = 0 // cuantas veces seguidas el dedo salto lejos de golpe


//imagenes 
let animacionPortada
let botonJugar
let botonJugarNuevo
let botonVolver
let imagenFinal
let maxiEspera
let maxiBrillando
let maxiJuegos
let maxiAsistente
let globo
let globoKiosco
let cajaPalitos
let cajaCapitan
let cajaLenguetazo
let manoIndice
let fondoPalitos
let fondoCapitan
let fondoLenguetazo
let marcoSelva
let marcoCapitan
let marcoLenguetazo
let laberinto
let flecha
let premio
let cartel
let medalla
let koalaBlanco
let koalaColor
let serpienteBlanco
let serpienteColor
let pandaBlanco
let pandaColor
let canguroBlanco
let canguroColor
let dedal
let estrella
let meteorito
let skate
let bocaAbierta
let bocaCerrada
let lenguetazoSolo
let lenguetazoConSkate


//sonidos
let sonidoAgarrar
let sonidoPerder
let sonidoGanar
let musicaKiosco
let musicaPalitos
let musicaCapitan
let musicaLenguetazo


//tipografia
let tipografia


//textos de Maxi (`` para que funcione como enter)
let dialogosKiosco = [
  `Hola, soy Maxi!
 Bienvenido a mi kiosco`,
  `Hoy estoy vendiendo 
 tres golosinas`,
  `Para comprar cada una 
  hay que jugar un minijuego`,
  `Estoy para ayudarte 
  con lo que necesites!`
]

let dialogosPalitos = [
  `¡Este es el juego de 
  Palitos de la Selva!`,
  `Llevá el dedo índice
 por el laberinto.`,
  `Si tocás el pasto,perdés.`,
  `Los animales son checkpoints:
 si perdés, volvés al último.`,
  `¡Colecta los animales
 y llegá al regalo!`
]

let dialogosCapitan = [
  `¡Este es el juego de
 Capitán del Espacio!`,
  `Recolectá las estrellas
 y esquivá los meteoritos.`,
  `Si necesitás ayuda,
 hacé click en mí
 durante el juego.`
]

let ayudasCapitan = [
  `Mové el dedo índice
 para juntar las estrellas.`,
  `Evitá los meteoritos:
 si te tocan, perdés.`,
  `Cuando juntes todas,
 agarrá el skate.`
]

let dialogosLenguetazo = [
  `¡Este es el juego
 de Lengüetazo!`,
  `Abrí la boca para
 dibujar el recorrido.`,
  `Cuando cierres la boca,
 el skate va a deslizarse.`,
  `Hacé que el skate llegue
 hasta Lengüetazo.`
]

let pasoDialogo = 0 // array kisoco intro (que dialogo del kiosco se esta mostrando)
let pasoMaxi = 0 // dailogo maxi asistente (que dialogo de la intro de cada juego se esta mostrando)


//  posiciones (se calculan en calcularPosiciones)
let kioscoX = 0
let kioscoY = 0
let kioscoAncho = 0
let kioscoAlto = 0
let maxiX = 0
let maxiY = 0
let maxiAncho = 0
let maxiAlto = 0
let globoX = 0
let globoY = 0
let globoAncho = 0
let globoAlto = 0
let botonAncho = 0
let botonAlto = 0
let botonNuevoX = 0
let botonVolverX = 0
let botonY = 0

// para que Maxi y las cajas titilen en el kiosco
let zoom = 0
let zoomSube = true





// PALITO DE LA SELVA 
// esperando, jugando, cartel, perdio o gano
let estadoPalitos = "esperando" 
// las posiciones en % calculadas con ia
let animalesX = [0.436, 0.43, 0.088, 0.792] //las posiciones las calculamos con ia
let animalesY = [0.111, 0.572, 0.58, 0.278]

let animalesNombre = ["KOALA", "ANACONDA", "PANDA", "CANGURO"]
let animalesConArticulo = ["al koala", "a la anaconda", "al panda", "al canguro"]
let animalesDato = [
  `Es el animal más atractivo de todo el mundo y
se alimenta de hojas y corteza de eucaliptus.`,
  `Puede medir hasta 12 mts y comerse un ciervo
de un bocado. Son excelentes nadadoras.`,
  `Pasa 10 horas por día comiendo hojas de bambú.
Vive en los bosques de China.`,
  `Cuando es grande mide más que una persona, pero
al nacer pesa menos que una galletita: 1 gr.`
]
let animalesNumeros = [
  "Velocidad 5 km/h    Peso 10 kg    Altura 0.7 m",
  "Velocidad 10 km/h    Peso 90 kg    Altura 12 m",
  "Velocidad 32 km/h    Peso 200 kg    Altura 1.7 m",
  "Velocidad 65 km/h    Peso 90 kg    Altura 1.8 m"
]

let animalesBlanco = [] // se llenan en setup, cuando las imagenes ya cargaron
let animalesColor = []
let animalesTocados = [false, false, false, false]

// la flecha de START y el regalo en % del laberinto (ia)
let flechaX = 0
let flechaY = 0.12
let salidaX = 0.98
let salidaY = 0.883

// desde donde arrancas, al principio la flecha, despues el ultimo animal
let checkpointX = 0
let checkpointY = 0.12
let ultimoAnimal = -1 // -1 = todavia no tocaste ninguno
let dedoAnteriorX = 0 // donde estaba el dedo en el cuadro anterior
let dedoAnteriorY = 0
let cuadrosEnElPasto = 0 // cuantas veces seguidas estuvo el dedo arriba del pasto

// el camino que va dibujando el dedo en % del laberinto
let recorridoX = []
let recorridoY = []

// el cartel del fun fact
let animalDelCartel = 0
let tiempoCartel = 0

// donde esta el laberinto (calculado en calcularPosiciones)
let laberintoX = 0
let laberintoY = 0
let laberintoAncho = 0
let laberintoAlto = 0





// CAPITAN DEL ESPACIO
let estrellasX = []
let estrellasY = []
let estrellasTomadas = []
let totalEstrellas = 12
let estrellasJuntadas = 0
let meteoritosX = []
let meteoritosY = []
let meteoritosVelocidad = []
let segundosRestantes = 30
let tiempo = 0
let skateX = 0
let skateY = 0
let ayudaActual = -1 // -1 = Maxi no esta mostrando ayuda





// LENGEUTAZO
let estadoLenguetazo = "esperando" // esperando, dibujando, deslizando, cayendo o gano
let trazoX = []
let trazoY = []
let bocaX = 0
let bocaY = 0
let bocaEstaAbierta = false
let hayCara = false
let hayCaraAntes = false
let cuadrosAbierta = 0
let cuadrosCerrada = 0
let puntoDelTrazo = 0
let skateLenguetazoX = 0
let skateLenguetazoY = 0
let velocidadCaida = 0
let avisoCaida = 0 // cuantos cuadros mas Maxi avisa que se cayo el skate
let personajeX = 0
let personajeY = 0
let personajeAncho = 0
let personajeAlto = 0



// carga de imagenes, sonidos, tipografia y modelos ml5
function preload() {
  animacionPortada = loadImage("assets/imagenes/Animacion.gif")
  botonJugar = loadImage("assets/imagenes/jugar.png")
  botonJugarNuevo = loadImage("assets/imagenes/botonJugarNuevo.png")
  botonVolver = loadImage("assets/imagenes/botonVolver.png")
  imagenFinal = loadImage("assets/imagenes/final.png")
  maxiEspera = loadImage("assets/imagenes/maxiEspera.png")
  maxiBrillando = loadImage("assets/imagenes/maxi.png")
  maxiJuegos = loadImage("assets/imagenes/maxiJuegos.png")
  maxiAsistente = loadImage("assets/imagenes/maxiAsistente.png")
  globo = loadImage("assets/imagenes/globo.png")
  globoKiosco = loadImage("assets/imagenes/globoRecortado.png")
  cajaPalitos = loadImage("assets/imagenes/palitoSelva.png")
  cajaCapitan = loadImage("assets/imagenes/capitan.png")
  cajaLenguetazo = loadImage("assets/imagenes/lenguetazo.png")
  manoIndice = loadImage("assets/imagenes/manoIndice.png")
  fondoPalitos = loadImage("assets/imagenes/fondoPalitos.png")
  fondoCapitan = loadImage("assets/imagenes/marcoCapitan.png")
  fondoLenguetazo = loadImage("assets/imagenes/marcoLenguetazo.png")
  marcoSelva = loadImage("assets/imagenes/marcoSelva.png")
  marcoCapitan = loadImage("assets/imagenes/marcoCapitanCamara.png")
  marcoLenguetazo = loadImage("assets/imagenes/marcoLenguetazoCamara.png")
  laberinto = loadImage("assets/imagenes/laberinto.png")
  flecha = loadImage("assets/imagenes/flechaDerecha.png")
  premio = loadImage("assets/imagenes/premio.png")
  cartel = loadImage("assets/imagenes/cartel.png")
  medalla = loadImage("assets/imagenes/medalla.png")
  koalaBlanco = loadImage("assets/imagenes/koalaBlanco.png")
  koalaColor = loadImage("assets/imagenes/koalaColor.png")
  serpienteBlanco = loadImage("assets/imagenes/serpienteBlanco.png")
  serpienteColor = loadImage("assets/imagenes/serpienteColor.png")
  pandaBlanco = loadImage("assets/imagenes/pandaBlanco.png")
  pandaColor = loadImage("assets/imagenes/pandaColor.png")
  canguroBlanco = loadImage("assets/imagenes/canguroBlanco.png")
  canguroColor = loadImage("assets/imagenes/canguroColor.png")
  dedal = loadImage("assets/imagenes/dedal.png")
  estrella = loadImage("assets/imagenes/estrella.png")
  meteorito = loadImage("assets/imagenes/meteorito.png")
  skate = loadImage("assets/imagenes/skate.png")
  bocaAbierta = loadImage("assets/imagenes/bocaAbierta.png")
  bocaCerrada = loadImage("assets/imagenes/bocaCerrada.png")
  lenguetazoSolo = loadImage("assets/imagenes/lenguetazoSimple.png")
  lenguetazoConSkate = loadImage("assets/imagenes/leguetazoSkate.png")

  sonidoAgarrar = loadSound("assets/sonidos/sonido-animal.mp3")
  sonidoPerder = loadSound("assets/sonidos/sonido-perder.mp3")
  sonidoGanar = loadSound("assets/sonidos/sonido-ganar.mp3")
  musicaKiosco = loadSound("assets/sonidos/musica-kiosco.mp3")
  musicaPalitos = loadSound("assets/sonidos/musica-fondo.mp3")
  musicaCapitan = loadSound("assets/sonidos/musica-capitan.mp3")
  musicaLenguetazo = loadSound("assets/sonidos/musica-lenguetazo.mp3")

  tipografia = loadFont("assets/tipografia/pix32/Pix32.ttf")

  handPose = ml5.handPose({ maxHands: 1, flipped: true })
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false })
}









function setup() {
  createCanvas(windowWidth, windowHeight)
  video = createCapture(VIDEO, { flipped: true })
  video.size(anchoVideo, altoVideo)
  video.hide()
  handPose.detectStart(video, recibirManos)
  textFont(tipografia)
  laberinto.loadPixels() // guarda los colores del laberinto una sola vez
  calcularPosiciones()

  animalesBlanco = [koalaBlanco, serpienteBlanco, pandaBlanco, canguroBlanco]
  animalesColor = [koalaColor, serpienteColor, pandaColor, canguroColor]
}


function recibirManos(resultados) {
  manos = resultados
}
function recibirCaras(resultados) {
  caras = resultados
}



// calcula donde va cada cosa segun el tamano de la pantalla (posciiones ia)
function calcularPosiciones() {
  // camara centrada
  let escala = min(width * 0.66 / anchoVideo, height * 0.68 / altoVideo)
  camAncho = anchoVideo * escala
  camAlto = altoVideo * escala
  videoX = (width - camAncho) / 2
  videoY = (height - camAlto) / 2

  // kiosco centrado
  kioscoAncho = min(width * 0.75, height * 0.73 * 16 / 9)
  kioscoAlto = kioscoAncho * 9 / 16
  kioscoX = (width - kioscoAncho) / 2
  kioscoY = (height - kioscoAlto) / 2

  // Maxi abajo a la izquierda
  maxiAncho = min(width * 0.4, 520)
  maxiAlto = maxiAncho * maxiAsistente.height / maxiAsistente.width
  maxiX = 0
  maxiY = height - maxiAlto * 0.88

  // el globo de Maxi 
  globoAncho = min(width * 0.31, 380)
  globoAlto = globoAncho * globo.height / globo.width
  globoX = maxiX + maxiAncho * 0.64
  globoY = maxiY + maxiAlto * 0.43 - globoAlto * 0.82
  if (globoY < 5) {
    globoY = 5
  }

  // los dos botones de abajo
  botonAlto = min(52, height - videoY - camAlto - 6)
  if (botonAlto < 38) {
    botonAlto = 38
  }
  botonAncho = botonAlto * 4.14
  botonNuevoX = width / 2 - botonAncho - 17
  botonVolverX = width / 2 + 17
  botonY = videoY + camAlto + 6

  // el laberinto centrado
  laberintoAlto = camAlto * 0.82
  laberintoAncho = laberintoAlto * laberinto.width / laberinto.height
  laberintoX = videoX + camAncho / 2 - laberintoAncho / 2
  laberintoY = videoY + camAlto / 2 - laberintoAlto / 2

  // Lenguetazo abajo 
  personajeAncho = min(camAncho * 0.22, 145)
  personajeAlto = personajeAncho * lenguetazoSolo.height / lenguetazoSolo.width
  personajeX = videoX + camAncho * 0.78
  personajeY = videoY + camAlto * 0.76
}


// estamos en alguna pantalla del kiosco???
function esKiosco() {
  if (estado === "portada" || estado === "maxiEspera" || estado === "dialogo") {
    return true
  }
  if (estado === "seleccion" || estado === "finalEspera" || estado === "finalKiosco") {
    return true
  }
  return false
}



function draw() {
  actualizarMusica()

  if (esKiosco()) {
    dibujarKiosco()
  }

  if (estado === "palitosIntro") {
    dibujarCamara(fondoPalitos)
    dibujarMarcoCamara(marcoSelva, 0.05, 0.06, 0.9, 0.84) // posicion ia
    dibujarGuiaMano()
    dibujarMaxi(dialogosPalitos[pasoMaxi])
  }
  if (estado === "palitos") {
    dibujarPalitos()
  }

  if (estado === "capitanIntro" || estado === "capitan" || estado === "capitanPerdio" || estado === "capitanGano") {
    dibujarCapitan()
  }

  if (estado === "lenguetazoIntro") {
    dibujarCamara(fondoLenguetazo)
    dibujarMarcoCamara(marcoLenguetazo, 0.07, 0.12, 0.85, 0.79) // posicion ia
    dibujarMaxi(dialogosLenguetazo[pasoMaxi])
  }
  if (estado === "lenguetazo") {
    dibujarLenguetazo()
  }
}




// 3 JUEGOS

// fondo de pantalla
function dibujarCamara(fondo) {
  background(10, 12, 30)
  image(fondo, 0, 0, width, height)
  image(video, videoX, videoY, camAncho, camAlto)
}

// marco alrededor de la camara
// bordeIzquierdo,bordeArriba y anchoHueco y altoHueco(mrgenes)
function dibujarMarcoCamara(marco, bordeIzquierdo, bordeArriba, anchoHueco, altoHueco) {
  let anchoMarco = camAncho / anchoHueco
  let altoMarco = camAlto / altoHueco
  image(marco, videoX - anchoMarco * bordeIzquierdo, videoY - altoMarco * bordeArriba, anchoMarco, altoMarco)
}


function detectarDedo() {
  if (manos.length > 0) {
    let punta = manos[0].keypoints[8]
    let x = map(punta.x, 0, anchoVideo, videoX, videoX + camAncho)
    let y = map(punta.y, 0, altoVideo, videoY, videoY + camAlto)
    if (hayMano === false) {
      dedoX = x
      dedoY = y
    }
    // a veces handPose se confunde y el dedo salta lejos un solo cuadro
    // si salta mas de 80 pixeles de golpe lo ignoro (salvo que siga ahi varios cuadros)
    if (dist(dedoX, dedoY, x, y) > 80 && saltosSeguidos < 5) {
      saltosSeguidos = saltosSeguidos + 1
      dedoAnteriorX = dedoX
      dedoAnteriorY = dedoY
      hayMano = true
      return
    }
    saltosSeguidos = 0
    dedoAnteriorX = dedoX
    dedoAnteriorY = dedoY
    dedoX = lerp(dedoX, x, 0.35)
    dedoY = lerp(dedoY, y, 0.35)
    hayMano = true
  } else {
    hayMano = false
  }
}

// Maxi abajo a la izquierda y su globo con el mensaje (si hay mensaje)
function dibujarMaxi(mensaje) {
  image(maxiAsistente, maxiX, maxiY, maxiAncho, maxiAlto)
  if (mensaje === "") {
    return
  }
  image(globo, globoX, globoY, globoAncho, globoAlto)
  push()
  fill(32, 25, 44)
  noStroke()
  textAlign(CENTER, CENTER)
  textSize(18)
  textLeading(24)
  text(mensaje, globoX + globoAncho * 0.52, globoY + globoAlto * 0.43)
  pop()
  if (estado === "palitosIntro" || estado === "capitanIntro" || estado === "lenguetazoIntro") {
    instruccion("TOCÁ EL GLOBO PARA CONTINUAR", height - 22)
  }
}

// texto blanco centrado (las instrucciones de abajo)
function instruccion(mensaje, y) {
  push()
  fill(255)
  noStroke()
  textAlign(CENTER, CENTER)
  textSize(16)
  text(mensaje, width / 2, y)
  pop()
}

// dice si el mouse esta adentro de un boton
function dentro(x, y, ancho, alto) {
  if (mouseX > x && mouseX < x + ancho && mouseY > y && mouseY < y + alto) {
    return true
  }
  return false
}

// dice si el click fue en Maxi o en su globo
function clickEnMaxi() {
  if (dentro(maxiX + maxiAncho * 0.2, maxiY + maxiAlto * 0.06, maxiAncho * 0.62, maxiAlto * 0.93)) {
    return true
  }
  if (dentro(globoX, globoY, globoAncho, globoAlto)) {
    return true
  }
  return false
}

// los botones JUGAR DE NUEVO y VOLVER AL KIOSCO
function dibujarBotones() {
  image(botonJugarNuevo, botonNuevoX, botonY, botonAncho, botonAlto)
  image(botonVolver, botonVolverX, botonY, botonAncho, botonAlto)
}

function clickEnJugarNuevo() {
  return dentro(botonNuevoX, botonY, botonAncho, botonAlto)
}

function clickEnVolver() {
  return dentro(botonVolverX, botonY, botonAncho, botonAlto)
}

// al ganar
function dibujarPremio(imagenPremio) {
  push()
  noStroke()
  fill(0, 150)
  rect(videoX, videoY, camAncho, camAlto)
  let escalaPremio = min(camAncho * 0.6 / imagenPremio.width, camAlto * 0.6 / imagenPremio.height)
  let ancho = imagenPremio.width * escalaPremio
  let alto = imagenPremio.height * escalaPremio
  imageMode(CENTER)
  image(imagenPremio, videoX + camAncho / 2, videoY + camAlto / 2, ancho, alto)
  pop()
  dibujarBotones()
}

// el panel amarillo con la mano a la derecha
function dibujarGuiaMano() {
  let ancho = min(width * 0.1, 115)
  let alto = ancho * manoIndice.height / manoIndice.width
  let x = width * 0.845 - ancho / 2
  let y = (height - alto - 72) / 2
  push()
  noStroke()
  fill(255, 205, 37)
  rect(x - 17, y, ancho + 34, alto + 72, 12)
  image(manoIndice, x, y + 12, ancho, alto)
  fill(0)
  textAlign(CENTER, CENTER)
  textSize(15)
  text("CONTROL DE MANOS", x + ancho / 2, y + alto + 48)
  pop()
}

// cada juego tiene su musica y el kiosco tmb
function actualizarMusica() {
  let musica = musicaKiosco
  if (estado === "palitosIntro" || estado === "palitos") {
    musica = musicaPalitos
  }
  if (estado === "capitanIntro" || estado === "capitan" || estado === "capitanPerdio" || estado === "capitanGano") {
    musica = musicaCapitan
  }
  if (estado === "lenguetazoIntro" || estado === "lenguetazo") {
    musica = musicaLenguetazo
  }

  // apago las musicas que no va
  let todas = [musicaKiosco, musicaPalitos, musicaCapitan, musicaLenguetazo]
  for (let i = 0; i < todas.length; i++) {
    if (todas[i] !== musica && todas[i].isPlaying()) {
      todas[i].stop()
    }
  }
  // prendemos la que va
  if (musica.isPlaying() === false) {
    musica.setVolume(0.3)
    musica.loop()
  }
}




// KIOSCO

function dibujarKiosco() {
  background(0)

  // el zoom sube y baja todo el tiempo
  if (zoomSube) {
    zoom = zoom + 1
  } else {
    zoom = zoom - 1
  }
  if (zoom > 40) {
    zoomSube = false
  }
  if (zoom < 0) {
    zoomSube = true
  }

  if (estado === "portada") {
    image(animacionPortada, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    let ancho = kioscoAncho * 0.37
    let alto = ancho * botonJugar.height / botonJugar.width
    image(botonJugar, width / 2 - ancho / 2, kioscoY + kioscoAlto - alto * 0.35, ancho, alto)
  }

  if (estado === "maxiEspera" || estado === "finalEspera") {
    image(maxiEspera, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    // Maxi late para que se note que hay que tocarlo
    dibujarLatiendo(maxiBrillando, kioscoX + kioscoAncho * 0.53, kioscoY + kioscoAlto * 0.53)
  }

  if (estado === "finalKiosco") {
    image(imagenFinal, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    dibujarGloboKiosco("¡Gracias por venir!\n¡Volvé a jugar!", kioscoX + kioscoAncho * 0.66, kioscoY + kioscoAlto * 0.13, kioscoAncho * 0.3)
    image(botonJugarNuevo, width / 2 - botonAncho / 2, kioscoY + kioscoAlto - botonAlto * 1.05, botonAncho, botonAlto)
  }

  if (estado === "dialogo") {
    image(maxiJuegos, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    dibujarGloboKiosco(dialogosKiosco[pasoDialogo], kioscoX + kioscoAncho * 0.53, kioscoY + kioscoAlto * 0.15, kioscoAncho * 0.34)
    instruccion("HACÉ CLICK PARA CONTINUAR", kioscoY + kioscoAlto + 40)
  }

  if (estado === "seleccion") {
    image(maxiJuegos, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    // late solo la caja que se puede elegir las otras quedan quietas
    if (capitanDesbloqueado === false) {
      dibujarLatiendo(cajaPalitos, kioscoX + kioscoAncho * 0.254, kioscoY + kioscoAlto * 0.78)
    } else {
      image(cajaPalitos, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    }
    if (capitanDesbloqueado && lenguetazoDesbloqueado === false) {
      dibujarLatiendo(cajaCapitan, kioscoX + kioscoAncho * 0.414, kioscoY + kioscoAlto * 0.78)
    } else {
      image(cajaCapitan, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    }
    if (lenguetazoDesbloqueado) {
      dibujarLatiendo(cajaLenguetazo, kioscoX + kioscoAncho * 0.571, kioscoY + kioscoAlto * 0.78)
    } else {
      image(cajaLenguetazo, kioscoX, kioscoY, kioscoAncho, kioscoAlto)
    }

    // los juegos se desbloquean en orden
    let texto = "EMPEZÁ POR PALITOS DE LA SELVA"
    if (capitanDesbloqueado) {
      texto = "CAPITÁN DESBLOQUEADO: GANALO PARA DESBLOQUEAR LENGÜETAZO"
    }
    if (lenguetazoDesbloqueado) {
      texto = "LENGÜETAZO DESBLOQUEADO"
    }
    instruccion(texto, kioscoY + kioscoAlto + 40)
  }
}

// imagen del kiosco agranda y se achica (late)
// centroX y centroY punto desde donde se agranda
function dibujarLatiendo(imagen, centroX, centroY) {
  push()
  translate(centroX, centroY)
  scale(1 + zoom / 600)
  image(imagen, kioscoX - centroX, kioscoY - centroY, kioscoAncho, kioscoAlto)
  pop()
}
function dibujarGloboKiosco(mensaje, x, y, ancho) {
  let alto = ancho * globoKiosco.height / globoKiosco.width
  image(globoKiosco, x, y, ancho, alto)
  push()
  fill(125, 0, 30)
  noStroke()
  textAlign(CENTER, CENTER)
  textSize(20)
  textLeading(27)
  text(mensaje, x + ancho * 0.51, y + alto * 0.42)
  pop()
}

function clickKiosco() {
  if (estado === "portada") {
    let ancho = kioscoAncho * 0.37
    let alto = ancho * botonJugar.height / botonJugar.width
    if (dentro(width / 2 - ancho / 2, kioscoY + kioscoAlto - alto * 0.35, ancho, alto)) {
      estado = "maxiEspera"
    }
  } else if (estado === "maxiEspera") {
    // cualquier click despierta a Maxi
    pasoDialogo = 0
    estado = "dialogo"
  } else if (estado === "finalEspera") {
    estado = "finalKiosco"
  } else if (estado === "dialogo") {
    // cualquier click pasa al siguiente dialogo
    pasoDialogo = pasoDialogo + 1
    if (pasoDialogo === dialogosKiosco.length) {
      estado = "seleccion"
    }
  } else if (estado === "seleccion") {
   
    let x = (mouseX - kioscoX) / kioscoAncho
    let y = (mouseY - kioscoY) / kioscoAlto
    if (y > 0.59 && y < 0.91) {
      if (x > 0.17 && x < 0.335 && capitanDesbloqueado === false) {
        estado = "palitosIntro"
        pasoMaxi = 0
      }
      if (x > 0.35 && x < 0.51 && capitanDesbloqueado && lenguetazoDesbloqueado === false) {
        estado = "capitanIntro"
        pasoMaxi = 0
      }
      if (x > 0.51 && x < 0.66 && lenguetazoDesbloqueado) {
        estado = "lenguetazoIntro"
        pasoMaxi = 0
      }
    }
  } else if (estado === "finalKiosco") {
    if (dentro(width / 2 - botonAncho / 2, kioscoY + kioscoAlto - botonAlto * 1.05, botonAncho, botonAlto)) {
      reiniciarTodo()
    }
  }
}





// PALITOS DE LA SELVA
function empezarPalitos() {
  estado = "palitos"
  empezarDeCeroPalitos()
}

// vuelve todo al felcha si ningun animal tocado
function empezarDeCeroPalitos() {
  estadoPalitos = "esperando"
  animalesTocados = [false, false, false, false]
  checkpointX = flechaX
  checkpointY = flechaY
  ultimoAnimal = -1
  recorridoX = []
  recorridoY = []
}

// si pierde volves al ultimo animal
function volverAlCheckpoint() {
  estadoPalitos = "esperando"
  if (ultimoAnimal === -1) {
    recorridoX = []
    recorridoY = []
  }
}

function dibujarPalitos() {
  dibujarCamara(fondoPalitos)
  image(laberinto, laberintoX, laberintoY, laberintoAncho, laberintoAlto)
  dibujarMarcoCamara(marcoSelva, 0.05, 0.06, 0.9, 0.84)

// posiciones (ia)
  let inicioX = laberintoX + laberintoAncho * flechaX
  let inicioY = laberintoY + laberintoAlto * flechaY
  let finalX = laberintoX + laberintoAncho * salidaX
  let finalY = laberintoY + laberintoAlto * salidaY

  // la flecha, el regalo y los animales (centrados)
  let anchoFlecha = laberintoAlto * 0.12
  let altoFlecha = anchoFlecha * flecha.height / flecha.width
  let medidaPremio = laberintoAlto * 0.15
  let medidaAnimal = laberintoAlto * 0.11
  push()
  imageMode(CENTER)
  image(flecha, inicioX, inicioY, anchoFlecha, altoFlecha)
  image(premio, finalX, finalY, medidaPremio, medidaPremio)
  for (let i = 0; i < animalesX.length; i++) {
    let animalX = laberintoX + laberintoAncho * animalesX[i]
    let animalY = laberintoY + laberintoAlto * animalesY[i]
    // en blanco hasta que lo tocas, despues a color
    let dibujo = animalesBlanco[i]
    if (animalesTocados[i]) {
      dibujo = animalesColor[i]
    }
    image(dibujo, animalX, animalY, medidaAnimal * dibujo.width / dibujo.height, medidaAnimal)
  }
  pop()

  push()
  fill(255)
  stroke(0)
  strokeWeight(4)
  textSize(20)
  textAlign(CENTER)
  text("START", inicioX, inicioY - altoFlecha / 2 - 8)
  pop()

  // el camino que dibuja el dedo
  push()
  stroke(252, 232, 200)
  strokeWeight(6)
  for (let i = 1; i < recorridoX.length; i++) {
    let anteriorX = laberintoX + laberintoAncho * recorridoX[i - 1]
    let anteriorY = laberintoY + laberintoAlto * recorridoY[i - 1]
    let actualX = laberintoX + laberintoAncho * recorridoX[i]
    let actualY = laberintoY + laberintoAlto * recorridoY[i]
    line(anteriorX, anteriorY, actualX, actualY)
  }
  pop()

  detectarDedo()
  if (hayMano) {
    moverDedoPalitos(finalX, finalY, medidaAnimal, medidaPremio)
  }

  // el cartel se va despues de un rato
  if (estadoPalitos === "cartel") {
    tiempoCartel = tiempoCartel - 1
    if (tiempoCartel <= 0) {
      estadoPalitos = "esperando"
    }
  }

  // circulito en la punta del dedo
  if (hayMano) {
    push()
    fill(255, 80, 120)
    stroke(252, 232, 200)
    strokeWeight(3)
    circle(dedoX, dedoY, 20)
    pop()
  }

  dibujarGuiaMano()
  if (estadoPalitos === "gano") {
    dibujarPremio(medalla)
  }
  dibujarMaxi(mensajePalitos())
  if (estadoPalitos === "cartel") {
    dibujarCartel()
  }
}

function moverDedoPalitos(finalX, finalY, medidaAnimal, medidaPremio) {
  // para seguir hay que poner el dedo en el checkpoint
  if (estadoPalitos === "esperando") {
    let arranqueX = laberintoX + laberintoAncho * checkpointX
    let arranqueY = laberintoY + laberintoAlto * checkpointY
    if (dist(dedoX, dedoY, arranqueX, arranqueY) < 30) {
      estadoPalitos = "jugando"
    }
  }
  if (estadoPalitos !== "jugando") {
    return
  }

  // si el dedo esta arriba del pasto perdes recien a los 4 cuadros seguidos
  if (hayPasto(dedoX, dedoY)) {
    cuadrosEnElPasto = cuadrosEnElPasto + 1
  } else {
    cuadrosEnElPasto = 0
  }
  if (cuadrosEnElPasto >= 4) {
    perderPalitos()
    return
  }
  if (dist(dedoAnteriorX, dedoAnteriorY, dedoX, dedoY) > 15) {
    for (let i = 1; i < 6; i++) {
      let x = lerp(dedoAnteriorX, dedoX, i / 6)
      let y = lerp(dedoAnteriorY, dedoY, i / 6)
      if (hayPasto(x, y)) {
        perderPalitos()
        return
      }
    }
  }

  // si toca un animal pasa a ser el checkpoint
  for (let i = 0; i < animalesX.length; i++) {
    let animalX = laberintoX + laberintoAncho * animalesX[i]
    let animalY = laberintoY + laberintoAlto * animalesY[i]
    if (dist(dedoX, dedoY, animalX, animalY) < medidaAnimal / 2) {
      // suena y aparece el cartel con su fun fact
      if (animalesTocados[i] === false) {
        sonidoAgarrar.play()
        animalDelCartel = i
        tiempoCartel = 720 // 12 segundos tiempo cartel
        estadoPalitos = "cartel"
      }
      animalesTocados[i] = true
      checkpointX = animalesX[i]
      checkpointY = animalesY[i]
      ultimoAnimal = i
    }
  }

  // guardo donde esta el dedo para dibujar el camino
  let cantidad = recorridoX.length
  let puntoX = (dedoX - laberintoX) / laberintoAncho
  let puntoY = (dedoY - laberintoY) / laberintoAlto
  if (cantidad === 0 || dist(puntoX, puntoY, recorridoX[cantidad - 1], recorridoY[cantidad - 1]) > 0.005) {
    recorridoX.push(puntoX)
    recorridoY.push(puntoY)
  }

  // si llega al regalo gana
  if (dist(dedoX, dedoY, finalX, finalY) < medidaPremio / 2) {
    estadoPalitos = "gano"
    capitanDesbloqueado = true
    sonidoGanar.play()
  }
}

// dice si en ese punto de la pantalla hay pasto
// pixels lista con los colores del laberinto
function hayPasto(x, y) {
  let px = floor(map(x, laberintoX, laberintoX + laberintoAncho, 0, laberinto.width))
  let py = floor(map(y, laberintoY, laberintoY + laberintoAlto, 0, laberinto.height))
  // afuera del laberinto no hay pasto
  if (px < 0 || py < 0 || px >= laberinto.width || py >= laberinto.height) {
    return false
  }
  let posicion = (py * laberinto.width + px) * 4
  // opacidad es alta = es pasto
  if (laberinto.pixels[posicion + 3] > 150) {
    return true
  }
  return false
}

function perderPalitos() {
  cuadrosEnElPasto = 0
  sonidoPerder.play()
  estadoPalitos = "perdio"
}

// lo que dice Maxi en cada momento
function mensajePalitos() {
  let adonde = "a la flecha"
  if (ultimoAnimal !== -1) {
    adonde = animalesConArticulo[ultimoAnimal]
  }
  if (estadoPalitos === "esperando" && ultimoAnimal === -1) {
    return `Poné el dedo en la
flecha para empezar.`
  }
  if (estadoPalitos === "esperando") {
    return `Volvé ${adonde}
para seguir.`
  }
  if (estadoPalitos === "perdio") {
    return `¡Tocaste el pasto!
Hacé click para
volver ${adonde}.`
  }
  if (estadoPalitos === "gano") {
    return `¡Ganaste los Palitos!
Desbloqueaste
Capitán del Espacio.`
  }
  return ""
}

// el cartel con el fun fact 
function dibujarCartel() {
  let ancho = camAncho * 0.85
  let alto = ancho * cartel.height / cartel.width
  let x = videoX + camAncho / 2 - ancho / 2
  let y = videoY + camAlto / 2 - alto / 2
  image(cartel, x, y, ancho, alto)

  push()
  // el nombre animal
  fill(248, 35, 67)
  stroke(248, 35, 67)
  strokeWeight(2)
  textAlign(CENTER, CENTER)
  textSize(alto * 0.1)
  text(animalesNombre[animalDelCartel], x + ancho / 2, y + alto * 0.3)

  // dato y numeros
  noStroke()
  fill(30, 20, 10)
  textAlign(LEFT, CENTER)
  textSize(alto * 0.055)
  textLeading(alto * 0.075)
  text(animalesDato[animalDelCartel], x + ancho * 0.17, y + alto * 0.48)
  textAlign(CENTER, CENTER)
  text(animalesNumeros[animalDelCartel], x + ancho / 2, y + alto * 0.68)
  pop()

  instruccion("HACÉ CLICK PARA SEGUIR", y + alto + 22)
}



// CAPITAN DEL ESPACIO
function empezarCapitan() {
  estado = "capitan"
  estrellasJuntadas = 0
  segundosRestantes = 30
  tiempo = 0
  ayudaActual = -1

  // las estrellas en lugares al azar dentro de camara
  estrellasX = []
  estrellasY = []
  estrellasTomadas = []
  for (let i = 0; i < totalEstrellas; i++) {
    estrellasX.push(random(videoX + 45, videoX + camAncho - 45))
    estrellasY.push(random(videoY + 45, videoY + camAlto - 45))
    estrellasTomadas.push(false)
  }

  // cada meteorito arranca en un lugar una altura y una velocidad random
  meteoritosX = []
  meteoritosY = []
  meteoritosVelocidad = []
  for (let i = 0; i < 4; i++) {
    meteoritosX.push(random(videoX + 40, videoX + camAncho - 40))
    meteoritosY.push(videoY - random(60, 600))
    meteoritosVelocidad.push(random(2, 4.5))
  }

  skateX = videoX + camAncho * 0.52
  skateY = videoY + camAlto * 0.5
}

function dibujarCapitan() {
  dibujarCamara(fondoCapitan)
  dibujarMarcoCamara(marcoCapitan, 0.045, 0.075, 0.91, 0.84)

  detectarDedo()
  if (estado === "capitan") {
    jugarCapitan()
  }

  // dedal en la punta del dedo
  if (hayMano) {
    push()
    imageMode(CENTER)
    image(dedal, dedoX, dedoY, 60, 55)
    pop()
  }
  dibujarGuiaMano()

  let mensaje = ""
  if (estado === "capitanIntro") {
    mensaje = dialogosCapitan[pasoMaxi]
  }
  if (estado === "capitan" && ayudaActual !== -1) {
    mensaje = ayudasCapitan[ayudaActual]
  }
  if (estado === "capitanPerdio") {
    mensaje = `¡Perdiste!
    Hacé click para
    volver a empezar.`;
  }
  if (estado === "capitanGano") {
    mensaje = `Conseguiste el pase
    al último juego.
    ¡Guardá el skate!`;
    dibujarPremio(skate);
  }
  dibujarMaxi(mensaje);
}


function jugarCapitan() {
  push()
  imageMode(CENTER)

  // estrellas, las junta
  for (let i = 0; i < estrellasX.length; i++) {
    if (estrellasTomadas[i] === false) {
      image(estrella, estrellasX[i], estrellasY[i], 55, 55)
      if (hayMano && dist(dedoX, dedoY, estrellasX[i], estrellasY[i]) < 42) {
        estrellasTomadas[i] = true
        estrellasJuntadas = estrellasJuntadas + 1
        sonidoAgarrar.play()
      }
    }
  }

  // meteoritos, caen (adentro de la camara)
  for (let i = 0; i < meteoritosX.length; i++) {
    meteoritosY[i] = meteoritosY[i] + meteoritosVelocidad[i]
    if (meteoritosY[i] > videoY + camAlto - 35) {
      // vuelve a caer desde arriba en otro lugar y con otra velocidad
      meteoritosY[i] = videoY - random(60, 400)
      meteoritosX[i] = random(videoX + 40, videoX + camAncho - 40)
      meteoritosVelocidad[i] = random(2, 4.5)
    }
    if (meteoritosY[i] > videoY + 35) {
      image(meteorito, meteoritosX[i], meteoritosY[i], 70, 70)
      if (estado === "capitan" && hayMano && dist(dedoX, dedoY, meteoritosX[i], meteoritosY[i]) < 48) {
        estado = "capitanPerdio"
        sonidoPerder.play()
      }
    }
  }

  // cuando junta todas las estrellas aparece el skate
  if (estrellasJuntadas === totalEstrellas) {
    noStroke()
    fill(255, 215, 45, 28)
    circle(skateX, skateY, 190)
    fill(255, 235, 90, 48)
    circle(skateX, skateY, 145)
    image(skate, skateX, skateY, 150, 85)
    if (estado === "capitan" && hayMano && dist(dedoX, dedoY, skateX, skateY) < 60) {
      estado = "capitanGano"
      lenguetazoDesbloqueado = true
      sonidoGanar.play()
    }
  }
  pop()

  // el tiempo
  tiempo = tiempo + 1
  if (tiempo === 40) {
    tiempo = 0
    segundosRestantes = segundosRestantes - 1
  }
  if (segundosRestantes === 0 && estado === "capitan") {
    estado = "capitanPerdio"
    sonidoPerder.play()
  }

  push()
  fill(255)
  noStroke()
  textSize(20)
  textAlign(LEFT)
  text("ESTRELLAS: " + estrellasJuntadas + " / " + totalEstrellas, videoX + 15, videoY + 30)
  text("TIEMPO: " + segundosRestantes + "s", videoX + 15, videoY + 60)
  pop()
}







// LENGUETAZO
function empezarLenguetazo() {
  estado = "lenguetazo"
  reiniciarLenguetazo()
  if (detectorDeCarasPrendido === false) {
    faceMesh.detectStart(video, recibirCaras)
    detectorDeCarasPrendido = true
  }
  handPose.detectStop()
}

function reiniciarLenguetazo() {
  estadoLenguetazo = "esperando"
  // lenguetazo aparece en lugar random 
  personajeX = random(videoX + camAncho * 0.4, videoX + camAncho * 0.85)
  personajeY = random(videoY + camAlto * 0.35, videoY + camAlto * 0.75)
  trazoX = []
  trazoY = []
  puntoDelTrazo = 0
  cuadrosAbierta = 0
  cuadrosCerrada = 0
  velocidadCaida = 0
  bocaEstaAbierta = false
}


function detectarBoca() {
  hayCara = false
  if (caras.length === 0) {
    bocaEstaAbierta = false
    hayCaraAntes = false
    return
  }
  let puntos = caras[0].keypoints
  let labioArriba = puntos[13]
  let labioAbajo = puntos[14]
  let comisuraIzquierda = puntos[61]
  let comisuraDerecha = puntos[291]

  let x = map((labioArriba.x + labioAbajo.x) / 2, 0, anchoVideo, videoX, videoX + camAncho)
  let y = map((labioArriba.y + labioAbajo.y) / 2, 0, altoVideo, videoY, videoY + camAlto)
  if (hayCaraAntes === false) {
    bocaX = x
    bocaY = y
  }
  bocaX = lerp(bocaX, x, 0.5)
  bocaY = lerp(bocaY, y, 0.5)
  hayCaraAntes = true

  let apertura = dist(labioArriba.x, labioArriba.y, labioAbajo.x, labioAbajo.y)
  let anchoBoca = dist(comisuraIzquierda.x, comisuraIzquierda.y, comisuraDerecha.x, comisuraDerecha.y)
  if (apertura / anchoBoca > 0.18) {
    bocaEstaAbierta = true
  }
  if (apertura / anchoBoca < 0.12) {
    bocaEstaAbierta = false
  }
  hayCara = true
}

// boca abierta dibuja y boca cerrada suelta el skate
function controlarBoca() {
  if (hayCara === false) {
    return
  }
  if (bocaEstaAbierta) {
    cuadrosAbierta = cuadrosAbierta + 1
    cuadrosCerrada = 0
    if (estadoLenguetazo === "esperando" && cuadrosAbierta >= 3) {
      estadoLenguetazo = "dibujando"
      trazoX = []
      trazoY = []
    }
    if (estadoLenguetazo === "dibujando") {
      // dibuja puntos de la linea 
      let cantidad = trazoX.length
      if (cantidad === 0 || dist(bocaX, bocaY, trazoX[cantidad - 1], trazoY[cantidad - 1]) > 3) {
        trazoX.push(bocaX)
        trazoY.push(bocaY)
      }
    }
  } else {
    cuadrosAbierta = 0
    if (estadoLenguetazo === "dibujando") {
      cuadrosCerrada = cuadrosCerrada + 1
      if (cuadrosCerrada >= 12) {
        // si el dibujo es muy cortito no cuenta
        if (trazoX.length < 8) {
          reiniciarLenguetazo()
          return
        }
        estadoLenguetazo = "deslizando"
        puntoDelTrazo = 0
        skateLenguetazoX = trazoX[0]
        skateLenguetazoY = trazoY[0]
      }
    }
  }
}

// el skate recorre el dibujo y despues cae
function moverSkate() {
  if (estadoLenguetazo === "deslizando") {
    if (puntoDelTrazo < trazoX.length) {
      let destinoX = trazoX[puntoDelTrazo]
      let destinoY = trazoY[puntoDelTrazo]
      let distancia = dist(skateLenguetazoX, skateLenguetazoY, destinoX, destinoY)
      if (distancia < 9) {
        puntoDelTrazo = puntoDelTrazo + 1
      } else {
        // avanza hacia el siguiente punto
        skateLenguetazoX = skateLenguetazoX + (destinoX - skateLenguetazoX) / distancia * 5
        skateLenguetazoY = skateLenguetazoY + (destinoY - skateLenguetazoY) / distancia * 5
      }
    } else {
      estadoLenguetazo = "cayendo"
      velocidadCaida = 1
    }
  } else if (estadoLenguetazo === "cayendo") {
    velocidadCaida = velocidadCaida + 0.32
    skateLenguetazoY = skateLenguetazoY + velocidadCaida
    if (dist(skateLenguetazoX, skateLenguetazoY, personajeX, personajeY + personajeAlto * 0.34) < 32) {
      estadoLenguetazo = "gano"
      sonidoGanar.play()
    } else if (skateLenguetazoY > videoY + camAlto + 35) {
      // caida suena error, se borra el dibujo, vuelve a empezar
      sonidoPerder.play()
      reiniciarLenguetazo()
      avisoCaida = 180 
    }
  }
}

function dibujarLenguetazo() {
  dibujarCamara(fondoLenguetazo)
  dibujarMarcoCamara(marcoLenguetazo, 0.07, 0.12, 0.85, 0.79) // (posicion ia)

  detectarBoca()
  if (estadoLenguetazo === "esperando" || estadoLenguetazo === "dibujando") {
    controlarBoca()
  }

  push()
  imageMode(CENTER)
  if (estadoLenguetazo === "gano") {
    let ancho = personajeAncho * 1.4
    image(lenguetazoConSkate, personajeX, personajeY, ancho, ancho * lenguetazoConSkate.height / lenguetazoConSkate.width)
  } else {
    image(lenguetazoSolo, personajeX, personajeY, personajeAncho, personajeAlto)
  }
  pop()

  // dibuja linea
  push()
  stroke(246, 26, 96, 75)
  strokeWeight(17)
  for (let i = 1; i < trazoX.length; i++) {
    line(trazoX[i - 1], trazoY[i - 1], trazoX[i], trazoY[i])
  }
  stroke(255, 65, 164)
  strokeWeight(7)
  for (let i = 1; i < trazoX.length; i++) {
    line(trazoX[i - 1], trazoY[i - 1], trazoX[i], trazoY[i])
  }
  pop()

  // el circulo donde tiene que caer el skate
  if (estadoLenguetazo !== "gano") {
    push()
    noFill()
    stroke(255, 65, 164)
    strokeWeight(3)
    circle(personajeX, personajeY + personajeAlto * 0.34, 44)
    pop()
  }

  moverSkate()
  if (estadoLenguetazo === "deslizando" || estadoLenguetazo === "cayendo") {
    push()
    imageMode(CENTER)
    image(skate, skateLenguetazoX, skateLenguetazoY, 78, 42)
    pop()
  }

  // circulito en la boca para ver donde estas dibujando
  if (hayCara && estadoLenguetazo !== "gano") {
    push()
    noFill()
    stroke(255)
    strokeWeight(3)
    circle(bocaX, bocaY, 24)
    pop()
  }

  if (hayCara === false) {
    instruccion("MOSTRÁ TU CARA A LA CÁMARA", height * 0.85)
  }
  dibujarGuiaBoca()
  if (estadoLenguetazo === "gano") {
    dibujarPremio(lenguetazoConSkate)
  }
  dibujarMaxi(mensajeLenguetazo())
}

// lo que dice Maxi en cada momento
function mensajeLenguetazo() {
  if (avisoCaida > 0) {
    avisoCaida = avisoCaida - 1
    return `¡Se cayó el skate!
Abrí la boca para
volver a empezar.`;
  }
  if (estadoLenguetazo === "esperando") {
    return `Abrí la boca para
empezar a dibujar.`;
  }
  if (estadoLenguetazo === "dibujando") {
    return `Cerrá la boca para
soltar el skate.`;
  }
  if (estadoLenguetazo === "gano") {
    return `¡Ganaste!
Lengüetazo agarró
el skate.`;
  }
  return "";
}

// los dos carteles azules de la derecha: boca abierta y boca cerrada
function dibujarGuiaBoca() {
  let espacio = width - videoX - camAncho
  let ancho = min(espacio * 0.74, 190)
  let alto = min(height * 0.22, 165)
  let x = videoX + camAncho + (espacio - ancho) / 2 - 10
  let y = videoY + (camAlto - (alto * 2 + 14)) / 2
  let dibujos = [bocaAbierta, bocaCerrada]
  let textos = ["BOCA ABIERTA\nDIBUJA", "BOCA CERRADA\nTERMINA"]
  for (let i = 0; i < 2; i++) {
    let arriba = y + i * (alto + 14)
    let dibujo = dibujos[i]
    let dibujoAncho = ancho * 0.67
    let dibujoAlto = min(alto * 0.58, dibujoAncho * dibujo.height / dibujo.width)
    push()
    noStroke()
    fill(0, 110, 255)
    rect(x, arriba, ancho, alto, 12)
    image(dibujo, x + (ancho - dibujoAncho) / 2, arriba + 10, dibujoAncho, dibujoAlto)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(15)
    textLeading(19)
    text(textos[i], x + ancho / 2, arriba + alto * 0.82)
    pop()
  }
}



// CLICKS Y TECLAS

function mousePressed() {
  userStartAudio() // chrome solo deja que suene algo despues de un click (ia)

  if (esKiosco()) {
    clickKiosco()
    return
  }

  // INTROS tocar a Maxi o al globo pasa al siguiente dialogo
  if (estado === "palitosIntro" && clickEnMaxi()) {
    pasoMaxi = pasoMaxi + 1
    if (pasoMaxi === dialogosPalitos.length) {
      empezarPalitos()
    }
    return
  }
  if (estado === "capitanIntro" && clickEnMaxi()) {
    pasoMaxi = pasoMaxi + 1
    if (pasoMaxi === dialogosCapitan.length) {
      empezarCapitan()
    }
    return
  }
  if (estado === "lenguetazoIntro" && clickEnMaxi()) {
    pasoMaxi = pasoMaxi + 1
    if (pasoMaxi === dialogosLenguetazo.length) {
      empezarLenguetazo()
    }
    return
  }

  // palitos
  if (estado === "palitos") {
    if (estadoPalitos === "gano") {
      if (clickEnJugarNuevo()) {
        empezarDeCeroPalitos()
      }
      if (clickEnVolver()) {
        estado = "seleccion"
      }
    } else if (estadoPalitos === "perdio") {
      volverAlCheckpoint()
    } else if (estadoPalitos === "cartel") {
      estadoPalitos = "esperando"
    }
    return
  }

  // capitan
  if (estado === "capitanPerdio") {
    empezarCapitan()
    return
  }
  if (estado === "capitanGano") {
    if (clickEnJugarNuevo()) {
      empezarCapitan()
    }
    if (clickEnVolver()) {
      estado = "seleccion"
    }
    return
  }
  if (estado === "capitan" && clickEnMaxi()) {
    // cada click en Maxi muestra la siguiente ayuda
    ayudaActual = ayudaActual + 1
    if (ayudaActual === ayudasCapitan.length) {
      ayudaActual = -1
    }
    return
  }

  // lenguetazo
  if (estado === "lenguetazo" && estadoLenguetazo === "gano") {
    if (clickEnJugarNuevo()) {
      reiniciarLenguetazo()
    }
    if (clickEnVolver()) {
      estado = "finalEspera"
    }
  }
}


// vuelve a la portada con todo bloqueado de nuevo
function reiniciarTodo() {
  estado = "portada"
  // volver a prender el detector de manos para jugar de nuevo
  handPose.detectStart(video, recibirManos)
  pasoDialogo = 0
  pasoMaxi = 0
  capitanDesbloqueado = false
  lenguetazoDesbloqueado = false
  ayudaActual = -1
  reiniciarLenguetazo()
  empezarDeCeroPalitos()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  calcularPosiciones()
  if (estado === "lenguetazo") {
    reiniciarLenguetazo()
  }
  if (estado === "capitan") {
    empezarCapitan()
  }
}