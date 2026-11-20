/*
Un juego que se juega con el cuerpo: la cámara reconoce tus movimientos con ml5 (bodyPose).
Sos un astronauta y en el mapa de misiones vas desbloqueando 5 planetas. Cada nivel es una misión
(nivel 1 = misión 1, nivel 2 = misión 2... nivel 5 = misión 5):

Nivel 1 · Cohete (Tierra): caen piezas del cohete y chatarra. Agarrá 10 piezas con las manos, esquivá la chatarra y ensamblá el cohete.
Nivel 2 · Estrellas (Espacio): tus manos sostienen una bolsa. Guardá 20 estrellas y esquivá los meteoritos.
Nivel 3 · Constelaciones: uní las estrellas en orden tocándolas con la mano.
Nivel 4 · Señales a la Tierra: repará la antena de la nave con el cuerpo, las manos y la cabeza.
Nivel 5 · Aliens (Marte): poné un guante sobre cada alien que se asoma para dispararle.

Todos los dibujos del juego (piezas, chatarra, estrellas, meteoritos, guantes, casco, cohete, aliens,
planetas, naves, fondos, la copa...) son GIF animados que están en assets/gifs y se cargan en preload.
Las animaciones que dependen de lo que pasa en el juego (la tapa de la escotilla, el alien, la nave
que se despliega, la torre del cohete) están separadas en cuadros, en assets/gifs/cuadros.

Teclas y mouse:
CLIC = activa el sonido. En el mapa, el botón del parlante lo prende y lo apaga
ESPACIO = pausa
R = volver al mapa
F = pantalla completa

  Los 17 puntos que reconoce bodyPose:
     0  "nose"             nariz
     1  "left_eye"         ojo izquierdo
     2  "right_eye"        ojo derecho
     3  "left_ear"         oreja izquierda
     4  "right_ear"        oreja derecha
     5  "left_shoulder"    hombro izquierdo
     6  "right_shoulder"   hombro derecho
     7  "left_elbow"       codo izquierdo
     8  "right_elbow"      codo derecho
     9  "left_wrist"       muñeca izquierda
    10  "right_wrist"      muñeca derecha
    11  "left_hip"         cadera izquierda
    12  "right_hip"        cadera derecha
    13  "left_knee"        rodilla izquierda
    14  "right_knee"       rodilla derecha
    15  "left_ankle"       tobillo izquierdo
    16  "right_ankle"      tobillo derecho
*/


// Espejo: true hace que la cámara se vea como un espejo
const ESPEJO = true;



// Parte 1: El juego
// Estado del juego: indica qué pantalla se muestra. Para pasar a otra pantalla, se le cambia el valor: 
//   "menu"     → el mapa de niveles: un planeta por nivel
//   "intro1"   → la consigna del nivel 1 (misión 1) y el botón para empezar
//   "nivel1"   → Tierra: juntar piezas del cohete y esquivar la chatarra
//   "despegue" → el cohete está armado: hay que tocarlo para despegar
//   "intro2"   → la consigna del nivel 2 (misión 2) y el botón para empezar
//   "nivel2"   → Espacio: juntar estrellas en la bolsa y esquivar meteoritos
//   "intro3"   → la consigna del nivel 3
//   "nivel3"   → Constelaciones: unir estrellas en orden
//   "intro4"   → la consigna del nivel 4 (misión 4)
//   "nivel4"   → Misión 4: reparar la antena (con el cuerpo, las manos y la cabeza)
//   "credencial"→ nuevo rango: te sacás la foto para la credencial de astronauta
//   "pregunta5"→ ¿estás listo para combatir? un solo botón: MÁS QUE LISTO
//   "viaje"    → animación: el cohete con tu cara viaja a Marte
//   "nivel5"   → Misión 5, Marte: los aliens se asoman por las escotillas; poné un guante sobre cada uno
//   "finJuego" → ganaste las 5 misiones: la copa de mejor astronauta y el botón JUGAR DE NUEVO

let estado = "menu";
let pausado = false;
let fuente;

// Botón de la pantalla de inicio
const BOTON_ANCHO = 680;
const BOTON_ALTO = 110;
let botonX = 0;   
let botonY = 0; 

const RADIO_MANO = 50;


// Piezas del cohete (nivel 1)
// Datos de cada pieza, repartidos en tres listas (x, y, velocidad).
let piezasX = [];    
let piezasY = [];  
let piezasVel = []; 

const CANT_PIEZAS = 5;      
const TAM_PIEZA = 80; 
const PIEZAS_PARA_GANAR = 10;
let piezasJuntadas = 0;


// Chatarra (nivel 1): pedazos de metal oxidado que NO sirven para el cohete.
// Si una mano toca una chatarra, el cohete se destruye y las piezas vuelven a 0.
// Se guardan igual que las piezas: tres listas (x, y, velocidad).
let chatarrasX = [];
let chatarrasY = [];
let chatarrasVel = [];

const CANT_CHATARRAS = 4; 
const TAM_CHATARRA = 90;  

// Velocidad de caída de piezas y chatarras
const VEL_MIN = 3;
const VEL_MAX = 7;

// Tiempo (nivel 1): el jugador tiene 25 segundos para armar el cohete. El reloj va bajando de a 1 segundo. 
const TIEMPO_NIVEL1 = 25;              
let segundosRestantes = TIEMPO_NIVEL1; 
// Cada 60 repeticiones pasó 1 segundo hasta llegar a 0 y el jugador pierde.
const CUADROS_POR_SEGUNDO = 60; 
let contadorCuadros = 0;



// Estrellas (nivel 2)
// Se guardan igual que las piezas: tres listas (x, y, velocidad).
let estrellasX = [];
let estrellasY = [];
let estrellasVel = [];

const CANT_ESTRELLAS = 6;
const TAM_ESTRELLA = 40;
// Las estrellas caen un poco más rápido que las piezas del nivel 1 (que van de 3 a 7)
const VEL_MIN_ESTRELLA = 4;
const VEL_MAX_ESTRELLA = 8.5;
const ESTRELLAS_PARA_GANAR = 20;
let estrellasGuardadas = 0;

// Meteoritos (nivel 2): caen más rápido que las estrellas.
// Si un meteorito entra en la bolsa, se pierden todas las estrellas.
let meteoritosX = [];
let meteoritosY = [];
let meteoritosVel = [];

const CANT_METEORITOS = 3;
const TAM_METEORITO = 70;
const VEL_MIN_METEORITO = 10;
const VEL_MAX_METEORITO = 15;

// Bolsa y casco
const GROSOR_BOLSA = 12;
const COLOR_BOLSA = "#F77F00";

// Agarre de la bolsa: la estrella se guarda un poco ANTES de tocar la línea.
// ZONA_AGARRE = cuántos píxeles por encima de la línea ya cuenta como "adentro".
// MARGEN_LADOS = cuánto se agranda la boca de la bolsa hacia los costados.
const ZONA_AGARRE = 70;
const MARGEN_LADOS = 30;
// SUAVIZADO: las muñecas que ve la cámara tiemblan un poco. Se mezcla la posición nueva
// con la anterior para que la bolsa no salte (0 = no se mueve, 1 = sin suavizar).
const SUAVIZADO = 0.6;
let hayBolsa = false;                // false mientras la cámara no ve a nadie (todavía no hay bolsa)
let bolsaIzq = { x: 0, y: 0 };       // extremo izquierdo de la bolsa en este cuadro
let bolsaDer = { x: 0, y: 0 };       // extremo derecho
let bolsaIzqAntes = { x: 0, y: 0 };  // dónde estaban en el cuadro anterior
let bolsaDerAntes = { x: 0, y: 0 };

// Espera entre pantallas: cuenta cuadros (60 = 1 segundo).
// Se usa al ganar el nivel 2 (antes de pasar al 3) y en la pantalla de la consigna del nivel 3.
let cuadrosEspera = 0;


// Nivel 3: constelaciones
// Hay que completar 3 misiones: en cada una se dibuja una constelación real
// tocando sus estrellas en orden con una mano.

const CANT_MISIONES = 3;
let misionActual = 0;     // 0 = Osa Mayor, 1 = Osa Menor, 2 = Orión
let puntoActual = 0;      // la próxima estrella que hay que tocar
let mostrandoInfo = false; // true cuando la constelación está completa y se muestra la explicación
let cuadrosInfo = 0;       // cuánto hace que se está mostrando la explicación

const NOMBRES_CONST = ["OSA MAYOR", "OSA MENOR", "ORIÓN"];

// Posición de cada estrella, EN EL ORDEN EN QUE HAY QUE TOCARLAS.
// Los valores van de 0 a 1: después se agrandan al tamaño de la pantalla (ver estrellaX y estrellaY).
// Una estrella puede aparecer dos veces cuando hay que volver a ella para cerrar la figura.
const CONST_X = [
  // Osa Mayor: Alkaid, Mizar, Alioth, Megrez, Phecda, Merak, Dubhe, Megrez
  [0.0, 0.2, 0.35, 0.5, 0.55, 0.95, 1.0, 0.5],
  // Osa Menor: Polaris, Yildun, Épsilon, Zeta, Kochab, Pherkad, Eta, Zeta
  [0.0, 0.2, 0.38, 0.55, 0.95, 1.0, 0.62, 0.55],
  // Orión: Mintaka, Bellatrix, Betelgeuse, Alnitak, Alnilam, Mintaka, Rigel, Saiph, Alnitak
  [0.67, 0.75, 0.2, 0.33, 0.5, 0.67, 0.8, 0.3, 0.33]
];
const CONST_Y = [
  [0.55, 0.4, 0.35, 0.38, 0.65, 0.7, 0.3, 0.38],
  [0.2, 0.3, 0.38, 0.5, 0.45, 0.75, 0.78, 0.5],
  [0.46, 0.15, 0.1, 0.56, 0.51, 0.46, 0.9, 0.95, 0.56]
];
const NOMBRES_ESTRELLAS = [
  ["Alkaid", "Mizar", "Alioth", "Megrez", "Phecda", "Merak", "Dubhe", "Megrez"],
  ["Polaris", "Yildun", "Épsilon", "Zeta", "Kochab", "Pherkad", "Eta", "Zeta"],
  ["Mintaka", "Bellatrix", "Betelgeuse", "Alnitak", "Alnilam", "Mintaka", "Rigel", "Saiph", "Alnitak"]
];

// La explicación que aparece al completar cada constelación, separada en renglones
const TEXTOS_CONST = [
  ["La Osa Mayor es una de las constelaciones más famosas del cielo",
   "del norte. Sus 7 estrellas más brillantes forman el Carro o",
   "Cucharón. Si seguís la línea que une Merak con Dubhe, llegás a",
   "Polaris, la Estrella Polar. Desde Argentina casi no se ve: queda",
   "muy baja sobre el horizonte norte."],
  ["En la punta de la cola de la Osa Menor está Polaris, la Estrella",
   "Polar. Como está casi justo sobre el Polo Norte, parece quedarse",
   "quieta mientras el resto del cielo gira, y durante siglos los",
   "navegantes la usaron para orientarse. Desde Argentina no se ve:",
   "está siempre debajo del horizonte."],
  ["Orión representa a un cazador de la mitología griega. Las tres",
   "estrellas del medio son su cinturón, que en Argentina llamamos",
   "las Tres Marías. Betelgeuse es una supergigante roja y Rigel una",
   "supergigante azul. Desde el hemisferio sur la vemos \"al revés\" y",
   "se ve muy bien en las noches de verano."]
];

const RADIO_TOQUE = 60;             // qué tan cerca de la estrella tiene que estar la mano
const ESPERA_SIGUIENTE = 3 * 60;    // cuadros antes de que aparezca el botón SIGUIENTE (3 segundos)
const TAM_BOTON_SIG = 170;

// Estrellitas de fondo del nivel 3 (posiciones de 0 a 1, se generan en empezar)


// Misión 4: Señales a la Tierra (reparar la antena)
// Se perdió la comunicación con la Tierra. Para volver a hablar con la base,
// hay que reparar la antena de la nave en 3 fases, cada una con una parte del cuerpo:
//   Fase 1 (todo el cuerpo): desplegar la nave → brazos en cruz (paneles solares) y brazos arriba (antena)
//   Fase 2 (las manos): sintonizar la frecuencia → separar o juntar las manos para mover la aguja del dial
//   Fase 3 (la cabeza): apuntar a la Tierra → mover la cabeza para que la mira quede sobre la Tierra

let faseSenales = 1;          // en qué fase estamos (1, 2 o 3; 4 = la señal ya se envió)
let pasoSenales = 0;          // qué paso de la fase toca ahora
let cuadrosPaso = 0;          // cuánto tiempo pasó desde que empezó el paso
let cuadrosSosteniendo = 0;   // cuánto tiempo seguido lo estás haciendo bien
let vidasSenales = 3;

const TIEMPO_POR_PASO = 10 * 60;      // 10 segundos para cada paso (60 cuadros = 1 segundo)
const CUADROS_PARA_SOSTENER = 45;     // fases 1 y 2: hay que sostenerlo casi 1 segundo
const CUADROS_PARA_APUNTAR = 3 * 60;  // fase 3: hay que apuntar a la Tierra 3 segundos
const VIDAS_SENALES = 3;

const NOMBRES_FASES = ["DESPLEGAR LA NAVE", "SINTONIZAR LA FRECUENCIA", "APUNTAR A LA TIERRA"];
const PARTES_FASES = ["CON TODO EL CUERPO", "CON LAS MANOS", "CON LA CABEZA"];

// Fase 1: las dos poses (son los números de poseCumplida: 1 = brazos en cruz, 0 = brazos arriba)
const POSES_FASE1 = [1, 0];
const NOMBRES_FASE1 = ["PANELES SOLARES", "ANTENA"];
const TEXTOS_FASE1 = ["Abrí los brazos en cruz para desplegar los paneles solares",
                      "Levantá los dos brazos para subir la antena"];

// Fase 2: dónde está cada frecuencia en el dial (0 = todo a la izquierda, 1 = todo a la derecha)
const FRECUENCIAS = [0.65, 0.45, 0.85];
const MARGEN_FRECUENCIA = 0.07;   // qué tan cerca de la frecuencia tiene que estar la aguja
let agujaDial = 0;                // dónde está la aguja ahora (de 0 a 1)

// Fase 3: la mira que sigue tu nariz y la Tierra que se mueve de un lado al otro
let miraX = 0;
let cuadrosApuntando = 0;         // cuánto tiempo (en total) la mira estuvo sobre la Tierra
const TAM_TIERRA_SENALES = 150;



// Nivel 5 (misión 5): Marte
// Los aliens se asoman por las escotillas de su nave, como en el juego de "golpear al topo".
// Para dispararles hay que poner un GUANTE sobre el alien (se usa el cuerpo, igual que en las otras misiones).
// Tiene que ser un toque nuevo: el guante tiene que entrar en el alien
// (no sirve dejarlo quieto esperando a que aparezca uno abajo). Si un alien se vuelve a esconder
// sin que le dispares, perdés una vida. Cuantos más derrotás, más rápido salen y menos se quedan.

const ALIENS_PARA_GANAR = 15;
let aliensMatados = 0;
const VIDAS_INICIALES = 5;
let vidas = VIDAS_INICIALES;

// Escotillas: los agujeros de la nave por donde se asoman (posiciones de 0 a 1)
const ESCOTILLAS_X = [0.16, 0.38, 0.62, 0.84, 0.27, 0.5, 0.73, 0.16, 0.38, 0.62, 0.84];
const ESCOTILLAS_Y = [0.50, 0.50, 0.50, 0.50, 0.67, 0.67, 0.67, 0.85, 0.85, 0.85, 0.85];
const CANT_ESCOTILLAS = 11;

// Lo que pasa en cada escotilla:
//   "vacia" → no hay nadie · "sube" → el alien se asoma · "burla" → hace caras y espera
//   "golpe" → le pegó el disparo · "cae" → se desploma adentro · "baja" → se escapó
let escEstado = [];
let escCuadros = [];     // cuánto hace que está en ese estado
let escDuracion = [];    // cuánto tiempo se queda burlándose
let escCara = [];        // con qué cara de burla empieza (0 a 3)
let escTapa = [];        // la tapa de la escotilla: 0 = cerrada, 1 = abierta
let escDedos = [];       // qué dedos estaban adentro del alien en el cuadro anterior
let cuadrosProximoAlien = 0;
let cuadrosNivel5 = 0;
const TIEMPO_NIVEL5 = 25;                // segundos para derrotar a los aliens
let segundosNivel5 = TIEMPO_NIVEL5;     // el reloj de la misión 5 (va para atrás)
let disparos = [];       // los rayos que van del cohete al alien
let avisosVida = [];     // los "-1" que suben cuando se escapa un alien

const CUADROS_SUBE = 12;
const CUADROS_GOLPE = 24;
const CUADROS_CAE = 34;
const CUADROS_BAJA = 16;
const TAM_COHETE5 = 1.15;   // el cohete de la misión 5, un poco más grande

// Credencial de astronauta (antes de la misión 5)
//   "anuncio" → nuevo rango y la credencial vacía · "foto" → mantené la mano sobre FOTO
//   "cuenta"  → 3, 2, 1 y se saca la foto · "lista" → la credencial completa con tu foto
// La foto es la MISMA que después va en la ventana del cohete: se guarda en caraFoto toda la sesión.
const RANGO_NUEVO = "PILOTO DE DEFENSA";
const CUADROS_PARA_FOTO = 50;
const TAM_BOTON_FOTO = 180;
let faseCred = "anuncio";
let cuadrosCred = 0;
let progresoFoto = 0;
let flashFoto = 0;
let tarjetaX = 0;
let hayCaraSuave = false;               // false hasta que se calcula la primera vez
let caraSuave = { x: 0, y: 0, tam: 0 };  // la posición de la cara, suavizada (para la vista previa)
let idAstronauta = "";   // el número de la credencial (se elige al azar en empezar)

const DURACION_VIAJE = 5 * 60;  // la animación del viaje dura 5 segundos
let cuadrosViaje = 0;

let caraFoto;            // la foto de tu cara que va en la ventana del cohete
let hayFoto = false;     // true cuando ya se sacó la foto
let anguloCohete = 180;  // hacia dónde apunta el cohete en el nivel 5, en grados (180 = hacia abajo)

// Misión 1, final: ensamblar el cohete en la plataforma y despegar.
// "armar"  → hay que mantener la mano sobre el botón: las piezas se encastran de a una
// "lanzar" → cuenta regresiva, se prenden los motores y el cohete sale por arriba
const CUADROS_ARMADO = 5 * 60;   // 5 segundos manteniendo presionado para armarlo entero
const CUADROS_IGNICION = 120;    // la cuenta regresiva dura 3 segundos; a los 2 se prenden los motores
const CUADROS_DESPEGUE = 180;    // a los 3 segundos despega
let faseDespegue = "armar";
let progresoArmado = 0;          // de 0 a 1
let piezasEncastradas = 0;
let cuadrosEncastre = 0;         // cuánto hace que se encastró la última pieza (para el destello)
let cuadrosLanzamiento = 0;
let despegueTerminado = false;

// cargarMisArchivos: carga la tipografía, las imágenes, los sonidos y la música antes de arrancar (la llama preload).
function cargarMisArchivos() {
  fuente = loadFont("assets/JetBrainsMono-VariableFont_wght.ttf");

  // Imágenes del menú
  for (let i = 0; i < CANT_NIVELES; i++) {
    imgPlanetas.push(loadImage("assets/planeta" + (i + 1) + ".png"));
  }
  imgCandado = loadImage("assets/candado.png");
  imgCoheteMapa = loadImage("assets/cohete.png");

  // GIFs animados: todos los dibujos del juego (están en la carpeta assets/gifs)
  cargarGifs();

  // Sonidos (están en la carpeta assets/sonidos)
  efectoBoton = loadSound("assets/sonidos/04_boton_espacial.wav");
  efectoPop = loadSound("assets/sonidos/pop.wav");
  efectoBloqueado = loadSound("assets/sonidos/bloqueado.wav");
  efectoTransicion = loadSound("assets/sonidos/06_transicion_espacial.wav");
  efectoMision = loadSound("assets/sonidos/05_mision_completada.wav");
  efectoCredencial = loadSound("assets/sonidos/11_credencial_desbloqueada.wav");
  efectoFoto = loadSound("assets/sonidos/10_foto_credencial.wav");
  efectoLaser = loadSound("assets/sonidos/08_disparo_laser.wav");
  efectoBurla = loadSound("assets/sonidos/07_alien_burla.wav");
  efectoAlien = loadSound("assets/sonidos/09_alien_derrotado.wav");
  efectoEstrella = loadSound("assets/sonidos/01_estrella_recolectada.wav");
  efectoPieza = loadSound("assets/sonidos/12_pieza_cohete_encastrada.wav");
  efectoMotor = loadSound("assets/sonidos/02_motor_encendido.wav");
  efectoDespegue = loadSound("assets/sonidos/03_despegue_cohete.wav");

  // Música de fondo
  cargarMusica();
}

// IMÁGENES GIF: todos los dibujos del juego son GIF animados (están en assets/gifs).
// Los que tienen varias versiones se guardan en listas y se cargan con un for.
let gifPiezas = [];        // las 5 piezas del cohete que caen (misión 1)
let gifChatarras = [];     // los 4 tipos de chatarra (misión 1)
let gifPartesCohete = [];  // las 10 partes del cohete que se encastran en la plataforma (misión 1)
let gifHologramas = [];    // las mismas 10 partes, como plano holográfico: muestran dónde va cada una
let gifMeteoritos = [];    // 3 meteoritos distintos (misión 2)
let gifAliensBurla = [];   // las 4 caras de burla del alien (misión 5): una lista de cuadros por cara
let gifPoses = [];         // las poses guía de la misión 4: 0 = brazos arriba, 1 = brazos en cruz
let gifFondoBase;          // la base de lanzamiento al atardecer (fondo de la misión 1)
let gifFondoEspacio;       // el espacio: nebulosas, una galaxia, un planeta con anillos y estrellas que titilan
let gifPlataforma = [];    // la plataforma de lanzamiento con la torre (el brazo se retira al despegar): 24 cuadros
let gifHumo;               // el humo del despegue
let gifCohete;             // el cohete armado
let gifLlama;              // el fuego del motor
let gifEstrella;           // la estrella que cae (misión 2)
let gifEstrellita;         // una estrellita amarilla (mapa, bolsa y pantalla final)
let gifBolsa;              // la bolsa espacial que cuelga entre las manos (misión 2)
let gifGuante;             // el guante del astronauta (va en las muñecas)
let gifCasco;              // el casco del astronauta (con el visor transparente, para ver tu cara)
let gifGuanteObra;         // el guante de trabajo del constructor (misión 1, en la Tierra)
let gifCascoObra;          // el casco amarillo de obra, con protectores de oído y chaleco (misión 1)
let gifNavePaneles = [];   // la nave de la misión 4 abriendo los paneles solares: 16 cuadros
let gifNaveAntena = [];    // la nave de la misión 4 subiendo la antena: 16 cuadros
let gifTierra;             // la Tierra girando
let gifMarte;              // Marte girando
let gifNaveAliens;         // el piso de la nave de los aliens (misión 5)
let gifEscotilla = [];     // la escotilla con su tapa, que se abre: 11 cuadros
let gifEscotillaBorde;     // el borde de adelante de la escotilla (va encima del alien)
let gifAlienAsoma = [];    // el alien cuando se asoma: 12 cuadros
let gifAlienRisa = [];     // el alien cuando se escapa riéndose: 8 cuadros
let gifAlienMuere = [];    // el alien cuando le disparás: se aplasta, se marea y se cae: 29 cuadros
let gifAlienManos;         // las manitos del alien agarradas del borde
let gifCopa;               // la copa de mejor astronauta
let gifConfeti;            // los papelitos de colores de la pantalla final

// cargarGifs: carga todos los GIF (la llama cargarMisArchivos, en preload).
function cargarGifs() {
  for (let i = 0; i < 5; i++) {
    gifPiezas.push(loadImage("assets/gifs/pieza" + i + ".gif"));
  }
  for (let i = 0; i < 4; i++) {
    gifChatarras.push(loadImage("assets/gifs/chatarra" + i + ".gif"));
    gifAliensBurla.push(cargarCuadros("alien_burla" + i, 19));
  }
  for (let i = 0; i < 10; i++) {
    gifPartesCohete.push(loadImage("assets/gifs/cohete_parte" + i + ".gif"));
    gifHologramas.push(loadImage("assets/gifs/holograma_parte" + i + ".gif"));
  }
  for (let i = 0; i < 3; i++) {
    gifMeteoritos.push(loadImage("assets/gifs/meteorito" + i + ".gif"));
  }
  for (let i = 0; i < 2; i++) {
    gifPoses.push(loadImage("assets/gifs/pose" + i + ".gif"));
  }
  gifFondoBase = loadImage("assets/gifs/fondo_base.gif");
  gifFondoEspacio = loadImage("assets/gifs/fondo_espacio.gif");
  gifPlataforma = cargarCuadros("plataforma", 24);
  gifHumo = loadImage("assets/gifs/humo.gif");
  gifCohete = loadImage("assets/gifs/cohete.gif");
  gifLlama = loadImage("assets/gifs/llama.gif");
  gifEstrella = loadImage("assets/gifs/estrella.gif");
  gifEstrellita = loadImage("assets/gifs/estrellita.gif");
  gifBolsa = loadImage("assets/gifs/bolsa.gif");
  gifGuante = loadImage("assets/gifs/guante.gif");
  gifCasco = loadImage("assets/gifs/casco.gif");
  gifGuanteObra = loadImage("assets/gifs/guante_obra.gif");
  gifCascoObra = loadImage("assets/gifs/casco_obra.gif");
  gifNavePaneles = cargarCuadros("nave_paneles", 16);
  gifNaveAntena = cargarCuadros("nave_antena", 16);
  gifTierra = loadImage("assets/gifs/tierra.gif");
  gifMarte = loadImage("assets/gifs/marte.gif");
  gifNaveAliens = loadImage("assets/gifs/nave_aliens.gif");
  gifEscotilla = cargarCuadros("escotilla", 11);
  gifEscotillaBorde = loadImage("assets/gifs/escotilla_borde.gif");
  gifAlienAsoma = cargarCuadros("alien_asoma", 12);
  gifAlienRisa = cargarCuadros("alien_risa", 8);
  gifAlienMuere = cargarCuadros("alien_muere", 29);
  gifAlienManos = loadImage("assets/gifs/alien_manos.gif");
  gifCopa = loadImage("assets/gifs/copa.gif");
  gifConfeti = loadImage("assets/gifs/confeti.gif");
}

// cargarCuadros: carga los cuadros de una animación y los devuelve en una lista.
// Cada cuadro es un GIF de un solo cuadro: assets/gifs/cuadros/nombre/nombre_0.gif, nombre_1.gif...
// Se usa para las animaciones que dependen de lo que pasa en el juego (ver dibujarGifEnCuadro).
function cargarCuadros(nombre, cantidad) {
  let lista = [];
  for (let k = 0; k < cantidad; k++) {
    lista.push(loadImage("assets/gifs/cuadros/" + nombre + "/" + nombre + "_" + k + ".gif"));
  }
  return lista;
}

// dibujarGifEnCuadro: dibuja el cuadro (frame) de la animación que le pidamos, en vez de dejar que se anime solo.
// Sirve cuando la animación depende de lo que pasa en el juego: el alien que se muere, la tapa que se abre,
// los paneles de la nave que se despliegan o el brazo de la torre que se retira.
// cuadros = la lista con los cuadros de la animación; cuadro = cuál mostrar (0 = el primero).
function dibujarGifEnCuadro(cuadros, cuadro, x, y, w, h) {
  cuadro = parteEntera(limitar(cuadro, 0, cuadros.length - 1));
  image(cuadros[cuadro], x, y, w, h);
}

// AYUDANTES: funciones chiquitas que usamos en todo el juego, hechas con lo que vimos en clase
// (variables, if, return y el operador %).

// Contador de cuadros: sube 1 en cada cuadro (en draw). Lo usan las animaciones que se repiten.
let cuadroAnimacion = 0;

// vaiven: devuelve un número que va de -1 a 1 y vuelve, una y otra vez, como una pelota que rebota.
// Sirve para lo que va y viene (la Tierra de la fase 3) y para las luces que titilan.
// velocidad = qué tan rápido; desfase = para que no se muevan todos al mismo tiempo.
function vaiven(velocidad, desfase) {
  return onda(cuadroAnimacion * velocidad + desfase);
}

// onda: lo mismo que vaiven, pero con el tiempo t que le pasemos (sirve para las animaciones
// que tienen su propio contador, como las caras de los aliens). Cada 4 unidades de t se repite.
function onda(t) {
  t = t % 4;          // va de 0 a 4 y vuelve a empezar
  if (t < 0) {
    t = t + 4;        // si t era negativo, % da negativo: lo corremos a positivo
  }
  if (t < 2) {
    return t - 1;     // de 0 a 2: sube de -1 a 1
  } else {
    return 3 - t;     // de 2 a 4: baja de 1 a -1
  }
}

// elMenor: devuelve el más chico de los dos números.
function elMenor(a, b) {
  if (a < b) {
    return a;
  }
  return b;
}

// elMayor: devuelve el más grande de los dos números.
function elMayor(a, b) {
  if (a > b) {
    return a;
  }
  return b;
}

// limitar: deja el valor entre un mínimo y un máximo (si se pasa, lo corta).
function limitar(valor, minimo, maximo) {
  if (valor < minimo) {
    return minimo;
  }
  if (valor > maximo) {
    return maximo;
  }
  return valor;
}

// sinSigno: el número sin el signo menos (la distancia hasta el 0). Por ejemplo, sinSigno(-5) es 5.
function sinSigno(valor) {
  if (valor < 0) {
    return -valor;
  }
  return valor;
}

// parteEntera: le saca los decimales a un número positivo. Por ejemplo, parteEntera(3.7) es 3.
// valor % 1 es lo que sobra después de la coma (0.7), así que se lo restamos.
function parteEntera(valor) {
  return valor - (valor % 1);
}

// empezar: prepara el juego una sola vez al principio (la llama setup): la tipografía, los grados,
// el número de la credencial, y crea las piezas, chatarras, estrellas y meteoritos.
function empezar() {
  textFont(fuente);
  angleMode(DEGREES);   // todos los ángulos del juego están en grados
  idAstronauta = "AEI-" + parteEntera(random(1000, 10000));
  for (let i = 0; i < CANT_PIEZAS; i++) {
    piezasX.push(random(TAM_PIEZA, width - TAM_PIEZA));
    piezasY.push(random(-height, 0));
    piezasVel.push(random(VEL_MIN, VEL_MAX));
  }

  for (let i = 0; i < CANT_CHATARRAS; i++) {
    chatarrasX.push(random(TAM_CHATARRA, width - TAM_CHATARRA));
    chatarrasY.push(random(-height, 0));
    chatarrasVel.push(random(VEL_MIN, VEL_MAX));
  }
  for (let i = 0; i < CANT_ESTRELLAS; i++) {
    estrellasX.push(random(TAM_ESTRELLA, width - TAM_ESTRELLA));
    estrellasY.push(random(-height, 0));
    estrellasVel.push(random(VEL_MIN_ESTRELLA, VEL_MAX_ESTRELLA));
  }

  for (let i = 0; i < CANT_METEORITOS; i++) {
    meteoritosX.push(random(TAM_METEORITO, width - TAM_METEORITO));
    meteoritosY.push(random(-height, 0));
    meteoritosVel.push(random(VEL_MIN_METEORITO, VEL_MAX_METEORITO));
  }


  reiniciarEscotillas();
}

// reubicarPieza: manda la pieza i otra vez arriba, fuera de la pantalla, en un lugar al azar. Se usa en dos casos: cuando el jugador la agarra con la mano, o cuando llega abajo de la pantalla sin que nadie la agarre.
function reubicarPieza(i) {
  piezasX[i] = random(TAM_PIEZA, width - TAM_PIEZA);
  piezasY[i] = random(-300, -TAM_PIEZA);
  piezasVel[i] = random(VEL_MIN, VEL_MAX);
}


// reubicarChatarra: lo mismo que reubicarPieza, pero para la chatarra i.
function reubicarChatarra(i) {
  chatarrasX[i] = random(TAM_CHATARRA, width - TAM_CHATARRA);
  chatarrasY[i] = random(-300, -TAM_CHATARRA);
  chatarrasVel[i] = random(VEL_MIN, VEL_MAX);
}

// reubicarEstrella: manda la estrella i otra vez arriba, fuera de la pantalla.
function reubicarEstrella(i) {
  estrellasX[i] = random(TAM_ESTRELLA, width - TAM_ESTRELLA);
  estrellasY[i] = random(-300, -TAM_ESTRELLA);
  estrellasVel[i] = random(VEL_MIN_ESTRELLA, VEL_MAX_ESTRELLA);
}

// reubicarMeteorito: lo mismo, para el meteorito i. Salen más arriba para que no caigan todos juntos.
function reubicarMeteorito(i) {
  meteoritosX[i] = random(TAM_METEORITO, width - TAM_METEORITO);
  meteoritosY[i] = random(-600, -TAM_METEORITO);
  meteoritosVel[i] = random(VEL_MIN_METEORITO, VEL_MAX_METEORITO);
}

// alturaBolsa: la altura (y) de la línea de la bolsa justo en la posición x.
// La línea puede estar inclinada, por eso se calcula con map().
function alturaBolsa(x, izq, der) {
  if (der.x - izq.x < 1) {
    return (izq.y + der.y) / 2; // manos casi una arriba de la otra
  }
  return map(x, izq.x, der.x, izq.y, der.y);
}

// actualizarBolsa: guarda dónde estaba la bolsa y la mueve a donde están las muñecas ahora (suavizado).
// bolsaIzq siempre es el extremo de la izquierda de la pantalla.
function actualizarBolsa() {
  if (poses.length == 0) {
    hayBolsa = false;
    return;
  }
  let a = obtenerPunto(0, "left_wrist");
  let b = obtenerPunto(0, "right_wrist");
  // izq es la muñeca que está más a la izquierda de la pantalla, der la otra
  let izq = b;
  let der = a;
  if (a.x < b.x) {
    izq = a;
    der = b;
  }

  if (hayBolsa == false) {
    bolsaIzq = { x: izq.x, y: izq.y };
    bolsaDer = { x: der.x, y: der.y };
    hayBolsa = true;
  }
  bolsaIzqAntes = { x: bolsaIzq.x, y: bolsaIzq.y };
  bolsaDerAntes = { x: bolsaDer.x, y: bolsaDer.y };
  bolsaIzq = { x: lerp(bolsaIzq.x, izq.x, SUAVIZADO), y: lerp(bolsaIzq.y, izq.y, SUAVIZADO) };
  bolsaDer = { x: lerp(bolsaDer.x, der.x, SUAVIZADO), y: lerp(bolsaDer.y, der.y, SUAVIZADO) };
}

// entroEnLaBolsa: devuelve true si algo que cae entró en la bolsa en este cuadro.
// x = posición horizontal, yAntes / yAhora = su altura antes y después de moverse.
// zona = cuántos píxeles antes de tocar la línea ya cuenta (0 = tiene que cruzarla).
function entroEnLaBolsa(x, yAntes, yAhora, zona) {
  if (hayBolsa == false) {
    return false;
  }
  // Si pasa por afuera de la boca de la bolsa, no entra
  if (x < bolsaIzq.x - MARGEN_LADOS || x > bolsaDer.x + MARGEN_LADOS) {
    return false;
  }

  // Cuánto le falta para llegar a la línea (negativo = está arriba de la línea)
  let antes = yAntes - alturaBolsa(x, bolsaIzqAntes, bolsaDerAntes);
  let ahora = yAhora - alturaBolsa(x, bolsaIzq, bolsaDer);

  // 1) Ya está dentro de la zona de agarre, justo arriba de la línea
  if (ahora > -zona && ahora < GROSOR_BOLSA) {
    return true;
  }
  // 2) Estaba arriba y ahora quedó abajo: la atravesó (aunque la mano se haya movido rápido)
  return antes < -zona && ahora >= 0;
}

// reiniciarJuego: deja los niveles como al principio y vuelve al mapa. Se usa con la tecla R.
// Los niveles que ya completaste siguen completos (eso se borra solo al recargar la página).
function reiniciarJuego() {
  reiniciarNiveles();
  estado = "menu";
}

// reiniciarNiveles: pone en cero los contadores de todos los niveles (sin cambiar de pantalla).
// Se usa al entrar a un nivel desde el mapa, para que siempre arranque de cero.
function reiniciarNiveles() {
  pausado = false;
  piezasJuntadas = 0;
  segundosRestantes = TIEMPO_NIVEL1;
  contadorCuadros = 0;

  for (let i = 0; i < CANT_PIEZAS; i++) {
    reubicarPieza(i);
  }
  for (let i = 0; i < CANT_CHATARRAS; i++) {
    reubicarChatarra(i);
  }

  estrellasGuardadas = 0;
  hayBolsa = false;
  for (let i = 0; i < CANT_ESTRELLAS; i++) {
    reubicarEstrella(i);
  }
  for (let i = 0; i < CANT_METEORITOS; i++) {
    reubicarMeteorito(i);
  }

  cuadrosEspera = 0;
  misionActual = 0;
  puntoActual = 0;
  mostrandoInfo = false;
  cuadrosInfo = 0;

  // Misión 1: ensamblaje
  faseDespegue = "armar";
  progresoArmado = 0;
  piezasEncastradas = 0;
  cuadrosLanzamiento = 0;
  despegueTerminado = false;
  apagarMotor();

  // Misión 4: señales a la Tierra
  reiniciarSenales();

  // Nivel 5 (Marte)
  aliensMatados = 0;
  vidas = VIDAS_INICIALES;
  cuadrosViaje = 0;
  anguloCohete = 180;
  reiniciarEscotillas();
  cuadrosNivel5 = 0;
  segundosNivel5 = TIEMPO_NIVEL5;
}

//interaccion elige qué acciones se ejecutan, según la pantalla en la que estás.
function interaccion() {
  if (pausado) {
  } else if (estado == "menu") {
    interaccionMenu();

  } else if (estado == "intro1") {
    interaccionIntro1();

  } else if (estado == "nivel1") {
    interaccionNivel1();
    if (piezasJuntadas >= PIEZAS_PARA_GANAR) {
      empezarEnsamblaje();
    }
    revisarFinNivel1();

  } else if (estado == "despegue") {
    interaccionDespegue();

  } else if (estado == "intro2") {
    interaccionIntro2();

  } else if (estado == "nivel2") {
    interaccionNivel2();

  } else if (estado == "intro3") {
    interaccionIntro3();

  } else if (estado == "nivel3") {
    interaccionNivel3();

  } else if (estado == "intro4") {
    interaccionIntro4();

  } else if (estado == "nivel4") {
    interaccionNivel4();

  } else if (estado == "credencial") {
    interaccionCredencial();

  } else if (estado == "pregunta5") {
    interaccionPregunta5();

  } else if (estado == "viaje") {
    interaccionViaje();

  } else if (estado == "nivel5") {
    interaccionNivel5();
    revisarFinNivel5();

  } else if (estado == "finJuego") {
    interaccionFinJuego();
  }
}

// dibujarJuego: Según el estado, dibuja la pantalla que corresponde.
// Si el juego está en pausa, además dibuja el cartel de pausa encima.
function dibujarJuego() {
  if (estado == "menu") {
    dibujarMenu();
  } else if (estado == "intro1") {
    dibujarIntro1();
  } else if (estado == "nivel1") {
    dibujarNivel1();
  } else if (estado == "despegue") {
    dibujarDespegue();
  } else if (estado == "intro2") {
    dibujarIntro2();
  } else if (estado == "nivel2") {
    dibujarNivel2();
  } else if (estado == "intro3") {
    dibujarIntro3();
  } else if (estado == "nivel3") {
    dibujarNivel3();
  } else if (estado == "intro4") {
    dibujarIntro4();
  } else if (estado == "nivel4") {
    dibujarNivel4();
  } else if (estado == "credencial") {
    dibujarCredencial();
  } else if (estado == "pregunta5") {
    dibujarPregunta5();
  } else if (estado == "viaje") {
    dibujarViaje();
  } else if (estado == "nivel5") {
    dibujarNivel5();
  } else if (estado == "finJuego") {
    dibujarFinJuego();
  }

  dibujarMarcoHUD();
  dibujarComandos();

  if (pausado) {
    dibujarPausa();
  }
}

// dibujarComandos: escribe en letra chica, abajo de todo, las teclas que sirven en cada pantalla.
// En el mapa: pantalla completa y el parlante. En las misiones: pausa y volver al mapa.
function dibujarComandos() {
  push();
  noStroke();
  fill(170, 190, 235, 200);
  textAlign(CENTER, BOTTOM);
  textSize(14);
  if (estado == "menu") {
    text("F = pantalla completa · CLIC en el parlante = sonido sí / no", width / 2, height - 4);
  } else {
    text("ESPACIO = pausa · R = volver al mapa", width / 2, height - 4);
  }
  pop();
}

// Pantalla de inicio (consigna de la misión 1): textos cortos y grandes para leer de lejos.
// El botón se toca con la mano: hay que dejarla encima un ratito (se va llenando) para empezar.
const ESPERA_BOTON_INICIO = CUADROS_POR_SEGUNDO * 1.5; // el botón se activa a los 1,5 segundos
const CUADROS_PARA_TOCAR = 40;                        // cuánto hay que dejar la mano encima (40 = 2/3 de segundo)
let cuadrosToque = 0;

// botonInicioY: la altura del botón de la pantalla de inicio.
function botonInicioY() { return height * 0.84; }

// manoSobreBotonInicio: true si alguna muñeca está encima del botón.
function manoSobreBotonInicio() {
  if (poses.length == 0) {
    return false;
  }
  let mano = manoMasCercana(width / 2, botonInicioY());
  return mano.x > botonX - RADIO_MANO && mano.x < botonX + BOTON_ANCHO + RADIO_MANO &&
         mano.y > botonY - RADIO_MANO && mano.y < botonY + BOTON_ALTO + RADIO_MANO;
}

// interaccionIntro1: si la mano se queda sobre el botón, empieza el nivel 1.
function interaccionIntro1() {
  cuadrosEspera = cuadrosEspera + 1;
  botonX = width / 2 - BOTON_ANCHO / 2;
  botonY = botonInicioY() - BOTON_ALTO / 2;

  if (cuadrosEspera > ESPERA_BOTON_INICIO && manoSobreBotonInicio()) {
    cuadrosToque = cuadrosToque + 1;
    if (cuadrosToque >= CUADROS_PARA_TOCAR) {
      empezarNivel1();
    }
  } else {
    cuadrosToque = 0;
  }
}

// empezarNivel1: arranca el nivel 1 (se llama cuando dejás la mano sobre el botón del inicio).
function empezarNivel1() {
  sonido("boton");
  cuadrosToque = 0;
  cuadrosEspera = 0;
  estado = "nivel1";
}

// dibujarIntro1: la consigna corta de la misión 1, con dibujos de lo que hay que agarrar y lo que no.
function dibujarIntro1() {
  push();
  dibujarBaseTerrestre();
  noStroke();
  fill(4, 6, 24, 120); // un poco más oscuro, para leer bien
  rect(0, 0, width, height);

  dibujarTitulo("MISIÓN 01 · DESPEGUE", height * 0.11, "Base de lanzamiento · Planeta Tierra", 60);

  textAlign(CENTER, CENTER);
  // El brillo: el mismo texto con un borde rojo grueso y transparente
  stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2], 80);
  strokeWeight(12);
  fill(255);
  textSize(elMenor(46, width * 0.038));
  text("¡Armá el cohete!", width / 2, height * 0.265);
  noStroke();

  // Dos tarjetas: AGARRÁ (pieza del cohete) y NO TOQUES (chatarra)
  let tw = elMenor(width * 0.26, 320);
  let th = height * 0.27;
  let ty = height * 0.46;
  let dorado = [255, 225, 100];
  dibujarTarjetaInfo(width * 0.32, ty, tw, th, dorado);
  dibujarTarjetaInfo(width * 0.68, ty, tw, th, UI_ROJO);
  let tamDibujo = elMenor(th * 0.42, 110);
  dibujarPiezaCohete(0, width * 0.32, ty - th * 0.1, tamDibujo);
  dibujarChatarra(1, width * 0.68, ty - th * 0.1, tamDibujo, 0);
  noStroke();
  textSize(elMenor(38, width * 0.03));
  fill(dorado[0], dorado[1], dorado[2]);
  text("AGARRÁ", width * 0.32, ty + th * 0.34);
  fill(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
  text("NO TOQUES", width * 0.68, ty + th * 0.34);

  dibujarConsigna(["Juntá " + PIEZAS_PARA_GANAR + " piezas en " + TIEMPO_NIVEL1 + " segundos"], height * 0.67, dorado);

  // Botón para empezar (se mantiene presionado con la mano)
  botonX = width / 2 - BOTON_ANCHO / 2;
  botonY = botonInicioY() - BOTON_ALTO / 2;
  let activo = cuadrosEspera > ESPERA_BOTON_INICIO;
  let encima = manoSobreBotonInicio();
  // Cuánto se llenó el botón (solo cuando ya está activo)
  let progresoInicio = 0;
  if (activo) {
    progresoInicio = cuadrosToque / CUADROS_PARA_TOCAR;
  }
  dibujarBotonRect(width / 2, botonInicioY(), BOTON_ANCHO, BOTON_ALTO, "Mantené presionado para empezar", {
    activo: activo,
    encima: activo && encima,
    progreso: progresoInicio,
    tamTexto: 30
  });

  // Ayuda y teclas (chiquito, abajo)
  noStroke();
  fill(170, 185, 225);
  textSize(16);
  text("Una persona · Alejate hasta que se vean tus dos manos", width / 2, height - 34);

  dibujarManos();
  pop();
}

// interaccionIntro2: igual que la consigna del nivel 1: si la mano se queda sobre el botón, empieza el nivel 2.
function interaccionIntro2() {
  cuadrosEspera = cuadrosEspera + 1;
  botonX = width / 2 - BOTON_ANCHO / 2;
  botonY = botonInicioY() - BOTON_ALTO / 2;

  if (cuadrosEspera > ESPERA_BOTON_INICIO && manoSobreBotonInicio()) {
    cuadrosToque = cuadrosToque + 1;
    if (cuadrosToque >= CUADROS_PARA_TOCAR) {
      sonido("boton");
      cuadrosToque = 0;
      cuadrosEspera = 0;
      estado = "nivel2";
    }
  } else {
    cuadrosToque = 0;
  }
}

// dibujarIntro2: la consigna corta de la misión 2: qué hay que recolectar (estrellas) y qué esquivar (meteoritos).
function dibujarIntro2() {
  push();
  dibujarFondoApagado();

  dibujarTitulo("MISIÓN 02 · ESTRELLAS", height * 0.11, "Viaje por el espacio", 60);

  textAlign(CENTER, CENTER);
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 80);
  strokeWeight(12);
  fill(255);
  textSize(elMenor(46, width * 0.038));
  text("¡Llená la bolsa de estrellas!", width / 2, height * 0.265);
  noStroke();

  // Dos tarjetas: RECOLECTÁ (estrella) y ¡CUIDADO! (meteorito)
  let tw = elMenor(width * 0.26, 320);
  let th = height * 0.27;
  let ty = height * 0.46;
  let dorado = [255, 225, 100];
  dibujarTarjetaInfo(width * 0.32, ty, tw, th, dorado);
  dibujarTarjetaInfo(width * 0.68, ty, tw, th, UI_ROJO);
  let tamDibujo = elMenor(th * 0.22, 50);
  dibujarEstrellaCayendo(width * 0.32, ty, tamDibujo);
  dibujarMeteorito(0, width * 0.68, ty, tamDibujo);
  noStroke();
  textSize(elMenor(38, width * 0.03));
  fill(dorado[0], dorado[1], dorado[2]);
  text("RECOLECTÁ", width * 0.32, ty + th * 0.34);
  fill(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
  text("¡CUIDADO!", width * 0.68, ty + th * 0.34);

  dibujarConsigna(["Recolectá " + ESTRELLAS_PARA_GANAR + " estrellas · ¡cuidado con los meteoritos!"], height * 0.67, dorado);

  // Botón para empezar (se mantiene presionado con la mano)
  botonX = width / 2 - BOTON_ANCHO / 2;
  botonY = botonInicioY() - BOTON_ALTO / 2;
  let activo = cuadrosEspera > ESPERA_BOTON_INICIO;
  let encima = manoSobreBotonInicio();
  let progresoInicio = 0;
  if (activo) {
    progresoInicio = cuadrosToque / CUADROS_PARA_TOCAR;
  }
  dibujarBotonRect(width / 2, botonInicioY(), BOTON_ANCHO, BOTON_ALTO, "Mantené presionado para empezar", {
    activo: activo,
    encima: activo && encima,
    progreso: progresoInicio,
    tamTexto: 30
  });

  dibujarManos();
  pop();
}

// dibujarTarjetaInfo: un recuadro oscuro con borde luminoso (para las tarjetas de las consignas).
function dibujarTarjetaInfo(cx, cy, w, h, col) {
  push();
  noStroke();
  fill(4, 6, 24, 230);
  formaChaflan(cx, cy, w, h, 18);
  noFill();
  // El brillo: el mismo borde, más grueso y transparente, abajo del borde fino
  stroke(col[0], col[1], col[2], 50);
  strokeWeight(8);
  formaChaflan(cx, cy, w, h, 18);
  stroke(col[0], col[1], col[2], 200);
  strokeWeight(2);
  formaChaflan(cx, cy, w, h, 18);
  pop();
}

// Nivel 1: actualizarTiempo hace correr el reloj hacia atrás, y si llega a 0 antes de juntar las piezas, perdés.
function actualizarTiempo() {
  if (piezasJuntadas < PIEZAS_PARA_GANAR && segundosRestantes > 0) {
    contadorCuadros = contadorCuadros + 1;

    if (contadorCuadros >= CUADROS_POR_SEGUNDO) {
      segundosRestantes = segundosRestantes - 1;
      contadorCuadros = 0;
    }
  }
}

// interaccionNivel1: la lógica del nivel 1, en cada cuadro. Avanza el reloj, hace caer las piezas
// y la chatarra, y revisa si una mano las toca (pieza = suma 1, chatarra = vuelve a 0).
function interaccionNivel1() {
  actualizarTiempo();
  for (let i = 0; i < CANT_PIEZAS; i++) {
    piezasY[i] = piezasY[i] + piezasVel[i];

    if (piezasY[i] > height + TAM_PIEZA) {
      reubicarPieza(i);
    }
  }

  for (let i = 0; i < CANT_CHATARRAS; i++) {
    chatarrasY[i] = chatarrasY[i] + chatarrasVel[i];

    if (chatarrasY[i] > height + TAM_CHATARRA) {
      reubicarChatarra(i);
    }
  }

  if (poses.length > 0 && segundosRestantes > 0) {
    let munecaIzq = obtenerPunto(0, "left_wrist");
    let munecaDer = obtenerPunto(0, "right_wrist");

    // Piezas: si una mano toca una, suma 1. Se tocan si la distancia es menor que el radio de la pieza + el radio de la mano.
    for (let i = 0; i < CANT_PIEZAS; i++) {
      let distIzq = dist(munecaIzq.x, munecaIzq.y, piezasX[i], piezasY[i]);
      let distDer = dist(munecaDer.x, munecaDer.y, piezasX[i], piezasY[i]);

      if (distIzq < TAM_PIEZA / 2 + RADIO_MANO || distDer < TAM_PIEZA / 2 + RADIO_MANO) {
        piezasJuntadas = piezasJuntadas + 1;
        sonidoMetal();
        reubicarPieza(i);
      }
    }

    // Chatarras: si una mano toca una, el cohete se destruye y vuelve a 0
    for (let i = 0; i < CANT_CHATARRAS; i++) {
      let distIzq = dist(munecaIzq.x, munecaIzq.y, chatarrasX[i], chatarrasY[i]);
      let distDer = dist(munecaDer.x, munecaDer.y, chatarrasX[i], chatarrasY[i]);

      if (distIzq < TAM_CHATARRA / 2 + RADIO_MANO || distDer < TAM_CHATARRA / 2 + RADIO_MANO) {
        piezasJuntadas = 0;
        reubicarChatarra(i);
      }
    }
  }
}

// Solo dibuja: lo que pasa ya se decidió en interaccionNivel1().
function dibujarNivel1() {
  push();
  // Antes de tapar la cámara con el fondo, se copia tu cara (para el visor del casco)
  if (poses.length > 0) {
    copiarCaraCasco();
  }
  dibujarBaseTerrestre();
  if (poses.length > 0) {
    dibujarCascoObra();   // en la Tierra sos constructor: casco de obra (no de astronauta)
  }

  // Los guantes van DEBAJO de las piezas, así nunca las tapan
  dibujarGuantes(225);

  for (let i = 0; i < CANT_PIEZAS; i++) {
    dibujarPiezaCohete(i % 5, piezasX[i], piezasY[i], TAM_PIEZA);
  }
  for (let i = 0; i < CANT_CHATARRAS; i++) {
    dibujarChatarra(i % 4, chatarrasX[i], chatarrasY[i], TAM_CHATARRA, chatarrasY[i] * 0.57 + i * 57);
  }

  // Paneles: piezas (izquierda) y tiempo (derecha; se pone rojo en los últimos 5 segundos)
  dibujarPanel(30, 30, 260, 88, "PIEZAS DEL COHETE", piezasJuntadas + " / " + PIEZAS_PARA_GANAR, {
    color: [255, 225, 100],
    progreso: piezasJuntadas / PIEZAS_PARA_GANAR,
    tamValor: 32,
    vidasTotal: 0,
    vidasLlenas: 0
  });
  // El tiempo se pone rojo en los últimos 5 segundos
  let colorTiempo = UI_AZUL;
  if (segundosRestantes <= 5) {
    colorTiempo = UI_ROJO;
  }
  dibujarPanel(width - 30 - 200, 30, 200, 88, "TIEMPO", segundosRestantes + " s", {
    color: colorTiempo,
    progreso: segundosRestantes / TIEMPO_NIVEL1,
    tamValor: 32,
    vidasTotal: 0,
    vidasLlenas: 0
  });

  // Si se terminó el tiempo sin armar el cohete, perdiste
  if (segundosRestantes <= 0 && piezasJuntadas < PIEZAS_PARA_GANAR) {
    dibujarCartel("¡SE ACABÓ EL TIEMPO!", "Volviendo al mapa...", UI_ROJO);
  }
  pop();
}

// dibujarPiezaCohete: dibuja el GIF de una de las 5 piezas del cohete (con su aro dorado que brilla),
// centrada en (x, y) y del tamaño tam.
//   0 = punta, 1 = cuerpo, 2 = aleta, 3 = ventana, 4 = motor
function dibujarPiezaCohete(tipo, x, y, tam) {
  // El GIF mide 130 x 130 para una pieza de 80 (con el aro dorado alrededor): por eso se agranda 130 / 80
  let lado = tam * 130 / 80;
  image(gifPiezas[tipo], x - lado / 2, y - lado / 2, lado, lado);
}

// dibujarChatarra: dibuja el GIF de un pedazo de chatarra oxidada (lo que NO hay que agarrar),
// con un aro rojo punteado que gira.
//   0 = chapa doblada, 1 = engranaje roto, 2 = lata aplastada, 3 = tubo torcido
// giro (en grados) hace que la chatarra dé vueltas mientras cae.
function dibujarChatarra(tipo, x, y, tam, giro) {
  // El GIF mide 130 x 130 para una chatarra de 90 (con el aro rojo punteado alrededor)
  let lado = tam * 130 / 90;
  push();
  translate(x, y);
  rotate(giro);
  image(gifChatarras[tipo], -lado / 2, -lado / 2, lado, lado);
  pop();
}

// circuloPunteado: un círculo hecho de rayitas (como una línea punteada), centrado en (x, y), de diámetro d.
// largo = cuánto mide cada rayita y espacio = cuánto hay entre una y otra (en píxeles).
// Cada rayita es un arc(): un pedacito del borde del círculo.
function circuloPunteado(x, y, d, largo, espacio) {
  let vuelta = 3.1416 * d;                       // cuánto mide el borde del círculo entero
  let gradosRayita = largo * 360 / vuelta;       // cuántos grados ocupa una rayita
  let gradosPaso = (largo + espacio) * 360 / vuelta;
  noFill();
  for (let a = 0; a < 360; a = a + gradosPaso) {
    arc(x, y, d, d, a, a + gradosRayita);
  }
}

// empezarEnsamblaje: ya juntaste las piezas: aparece el cohete desarmado en la plataforma.
function empezarEnsamblaje() {
  estado = "despegue";
  faseDespegue = "armar";
  progresoArmado = 0;
  piezasEncastradas = 0;
  cuadrosEncastre = 99;
  cuadrosLanzamiento = 0;
  despegueTerminado = false;
}

// Medidas y posiciones de la escena del despegue
// escCohete: cuánto se agranda el cohete armado para que entre en la pantalla.
function escCohete() {
  return elMenor(height * 0.55 / 250, width * 0.4 / 140);
}
// xCoheteDespegue / yCoheteDespegue: dónde está el cohete en la plataforma.
function xCoheteDespegue() { return width * 0.34; }
// yCoheteDespegue: la altura del cohete, apoyado en el piso de la base.
function yCoheteDespegue() { return pisoBase() - (26 + 76) * escCohete(); }
// botonArmadoX / botonArmadoY / botonArmadoW: posición y ancho del botón para ensamblar.
function botonArmadoX() { return width * 0.72; }
// botonArmadoY: la altura del botón para ensamblar.
function botonArmadoY() { return height * 0.66; }
// botonArmadoW: el ancho del botón para ensamblar (como mucho 520 píxeles).
function botonArmadoW() { return elMenor(520, width * 0.4); }
const BOTON_ARMADO_H = 100;

// manoSobreRect: true si una muñeca está sobre el rectángulo centrado en (cx, cy).
function manoSobreRect(cx, cy, w, h) {
  if (poses.length == 0) {
    return false;
  }
  let mano = manoMasCercana(cx, cy);
  return sinSigno(mano.x - cx) < w / 2 + RADIO_MANO && sinSigno(mano.y - cy) < h / 2 + RADIO_MANO;
}

// subidaCohete: cuántos píxeles subió el cohete (acelera cada vez más).
function subidaCohete() {
  let t = cuadrosLanzamiento - CUADROS_DESPEGUE;
  if (t <= 0) {
    return 0;
  }
  return 0.06 * t * t;
}

// fuerzaMotor: qué tan grande es el fuego (0 = apagado).
function fuerzaMotor() {
  if (faseDespegue != "lanzar" || cuadrosLanzamiento < CUADROS_IGNICION) {
    return 0;
  }
  if (cuadrosLanzamiento > CUADROS_DESPEGUE) {
    return 1.3;
  }
  return elMenor(1, (cuadrosLanzamiento - CUADROS_IGNICION) / 40) * 0.8;
}

// interaccionDespegue: mientras mantenés la mano sobre el botón, el cohete se arma de a una pieza.
// Si soltás, el armado se queda quieto donde estaba. Cuando está completo: cuenta regresiva y despegue.
function interaccionDespegue() {
  cuadrosEncastre = cuadrosEncastre + 1;

  if (faseDespegue == "armar") {
    if (manoSobreRect(botonArmadoX(), botonArmadoY(), botonArmadoW(), BOTON_ARMADO_H)) {
      progresoArmado = elMenor(1, progresoArmado + 1 / CUADROS_ARMADO);
      let encastradas = parteEntera(progresoArmado * PARTES_COHETE.length + 0.0001);
      if (encastradas > piezasEncastradas) {
        piezasEncastradas = encastradas;
        cuadrosEncastre = 0;
        sonidoMetal(); // ¡clang! la pieza quedó en su lugar
      }
    }
    if (progresoArmado >= 1) {
      faseDespegue = "lanzar";
      cuadrosLanzamiento = 0;
      sonido("motor");
    }
  } else {
    cuadrosLanzamiento = cuadrosLanzamiento + 1;
    // Cuenta regresiva: 3, 2, 1...
    if (cuadrosLanzamiento == 30 || cuadrosLanzamiento == 90 || cuadrosLanzamiento == 150) {
      sonido("boton");
    }
    if (cuadrosLanzamiento == CUADROS_IGNICION) {
      encenderMotor();
    }
    // Cuando el cohete sale por arriba de la pantalla: misión cumplida y vuelve al mapa
    if (!despegueTerminado && subidaCohete() > yCoheteDespegue() + 220 * escCohete()) {
      despegueTerminado = true;
      apagarMotor();
      completarNivel(1);
      iniciarTransicion(xCoheteDespegue(), 0, "menu");
    }
  }
}

// dibujarDespegue: la plataforma con el cohete. Primero se arma pieza por pieza y después despega.
function dibujarDespegue() {
  push();
  dibujarBaseTerrestre();
  let esc = escCohete();
  let x = xCoheteDespegue();
  let fuerza = fuerzaMotor();
  let lanzando = faseDespegue == "lanzar";

  // Resplandor del fuego sobre el piso y humo a los costados
  if (fuerza > 0) {
    noStroke();
    fill(255, 140, 60, 70 * elMenor(1, fuerza));
    ellipse(x, pisoBase(), 520 * esc * fuerza, 90 * esc);
    dibujarHumo(x, pisoBase() - 26 * esc, fuerza);
  }

  // El brazo de la torre se retira durante el primer segundo del lanzamiento
  let brazo = 0;
  if (lanzando) {
    brazo = elMenor(1, cuadrosLanzamiento / 60);
  }
  dibujarPlataforma(x, pisoBase(), esc, brazo);

  // El cohete (tiembla cuando se prenden los motores)
  let temblor = 0;
  if (fuerza > 0 && cuadrosLanzamiento < CUADROS_DESPEGUE + 40) {
    temblor = 2.5 * fuerza;
  }
  push();
  translate(x + random(-temblor, temblor), yCoheteDespegue() - subidaCohete());
  scale(esc);
  if (!lanzando) {
    // El plano holográfico muestra dónde va cada pieza que falta
    modoFantasma = true;
    for (let k = 0; k < PARTES_COHETE.length; k++) {
      dibujarParteCohete(k);
    }
    modoFantasma = false;

    // Las piezas llegan volando de a una y se encastran (según cuánto mantuviste presionado)
    for (let k = 0; k < PARTES_COHETE.length; k++) {
      let p = limitar(progresoArmado * PARTES_COHETE.length - k, 0, 1);
      if (p > 0) {
        let e = 1 - (1 - p) * (1 - p) * (1 - p); // frena suave al llegar
        push();
        translate(LLEGADA_X[k] * (1 - e), LLEGADA_Y[k] * (1 - e));
        // Llega girando: las piezas pares giran para un lado y las impares para el otro
        if (k % 2 == 0) {
          rotate((1 - e) * 40);
        } else {
          rotate((1 - e) * -40);
        }
        // Mientras viene volando es medio transparente
        if (p < 1) {
          alfaParte = 255 * (0.35 + 0.65 * p);
        }
        // Destello azul al encastrar: un círculo transparente que se apaga de a poco
        if (k == piezasEncastradas - 1 && cuadrosEncastre < 20) {
          noStroke();
          fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 120 * (1 - cuadrosEncastre / 20));
          circle(0, 0, 160);
        }
        dibujarParteCohete(k);
        alfaParte = 255;
        pop();
      }
    }
  } else {
    dibujarLlama(fuerza);
    for (let k = 0; k < PARTES_COHETE.length; k++) {
      dibujarParteCohete(k);
    }
  }
  pop();

  if (!lanzando) {
    dibujarTitulo("¡PIEZAS COMPLETAS!", height * 0.1, "Ensamblá el cohete en la plataforma de lanzamiento", 60);
    let bx = botonArmadoX();
    let bw = botonArmadoW();
    dibujarPanel(bx - bw / 2, height * 0.3, bw, 92, "ENSAMBLAJE DEL COHETE", parteEntera(progresoArmado * 100 + 0.5) + "%", {
      color: UI_AZUL,
      progreso: progresoArmado,
      tamValor: 32,
      vidasTotal: 0,
      vidasLlenas: 0
    });
    let actual = elMenor(PARTES_COHETE.length - 1, parteEntera(progresoArmado * PARTES_COHETE.length));
    noStroke();
    textAlign(CENTER, CENTER);
    fill(175, 200, 255);
    textSize(20);
    text("PIEZA " + (actual + 1) + " / " + PARTES_COHETE.length + " · " + PARTES_COHETE[actual], bx, height * 0.3 + 126);

    let presionando = manoSobreRect(bx, botonArmadoY(), bw, BOTON_ARMADO_H);
    dibujarBotonRect(bx, botonArmadoY(), bw, BOTON_ARMADO_H, "Mantené presionado para ensamblar", {
      activo: true,
      encima: presionando,
      progreso: progresoArmado,
      tamTexto: elMenor(21, bw / 26)
    });
    if (!presionando && progresoArmado > 0) {
      noStroke();
      fill(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
      textSize(19);
      text("Ensamblaje en pausa: volvé a apoyar la mano", bx, botonArmadoY() + 82);
    }
  } else if (cuadrosLanzamiento < CUADROS_DESPEGUE + 70) {
    dibujarTitulo("SECUENCIA DE LANZAMIENTO", height * 0.1, "Motores encendidos · Rumbo al espacio", 60);
    let cuenta = "PREPARADOS";
    if (cuadrosLanzamiento >= CUADROS_DESPEGUE) {
      cuenta = "¡DESPEGUE!";
    } else if (cuadrosLanzamiento >= 150) {
      cuenta = "1";
    } else if (cuadrosLanzamiento >= 90) {
      cuenta = "2";
    } else if (cuadrosLanzamiento >= 30) {
      cuenta = "3";
    }
    push();
    textAlign(CENTER, CENTER);
    noStroke();
    // Los números van grandes; las palabras, más chicas
    if (cuenta.length == 1) {
      textSize(160);
    } else {
      textSize(56);
    }
    // Brillo rojo: el mismo texto con un borde grueso y transparente
    fill(255);
    stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2], 90);
    strokeWeight(14);
    text(cuenta, width * 0.7, height * 0.45);
    pop();
  }

  dibujarGuantes(200);
  pop();
}

// dibujarPlataforma: la plataforma de lanzamiento y la torre de servicio con su brazo.
// brazo: 0 = sostiene el cohete, 1 = ya se retiró.
function dibujarPlataforma(x, yPiso, esc, brazo) {
  // El GIF tiene 24 cuadros: 12 posiciones del brazo (de sostener el cohete a retirado),
  // cada una dos veces: con la luz roja de la torre prendida (cuadro par) y apagada (cuadro impar).
  let posicionBrazo = parteEntera(brazo * 11 + 0.5);
  let luz = 1;
  if (cuadroAnimacion % 50 < 25) {
    luz = 0;
  }
  dibujarGifEnCuadro(gifPlataforma, posicionBrazo * 2 + luz, x - 125 * esc, yPiso - 275 * esc, 250 * esc, 280 * esc);
}

// dibujarHumo: nubes de humo que salen para los costados de la plataforma.
function dibujarHumo(x, y, fuerza) {
  // El GIF tiene el humo de un solo lado (sale hacia la izquierda y mide 300 de largo)
  let s = width * 0.28 * elMenor(1, fuerza) / 300;
  push();
  tint(255, 170);   // el humo es un poco transparente
  image(gifHumo, x - 330 * s, y - 150 * s, 360 * s, 180 * s);   // humo a la izquierda
  translate(x, y);
  scale(-1, 1);                                                  // el mismo GIF dado vuelta: humo a la derecha
  image(gifHumo, -330 * s, -150 * s, 360 * s, 180 * s);
  pop();
}

// Nivel 2: el espacio 

// interaccionNivel2: caen estrellas y meteoritos. Las estrellas que entran en la bolsa suman 1.
// Si entra un meteorito, las estrellas vuelven a 0.
// Las estrellas se agarran con la zona de agarre (más fácil); los meteoritos solo si cruzan la línea.
function interaccionNivel2() {
  actualizarBolsa();

  if (estrellasGuardadas < ESTRELLAS_PARA_GANAR) {
    // Estrellas
    for (let i = 0; i < CANT_ESTRELLAS; i++) {
      let yAntes = estrellasY[i];
      estrellasY[i] = estrellasY[i] + estrellasVel[i];

      if (entroEnLaBolsa(estrellasX[i], yAntes, estrellasY[i], ZONA_AGARRE)) {
        estrellasGuardadas = estrellasGuardadas + 1;
        sonidoEstrella();
        reubicarEstrella(i);
      } else if (estrellasY[i] > height + TAM_ESTRELLA) {
        reubicarEstrella(i);
      }
    }

    // Meteoritos
    for (let i = 0; i < CANT_METEORITOS; i++) {
      let yAntes = meteoritosY[i];
      meteoritosY[i] = meteoritosY[i] + meteoritosVel[i];

      if (entroEnLaBolsa(meteoritosX[i], yAntes, meteoritosY[i], 0)) {
        estrellasGuardadas = 0;
        sonido("bloqueado");
        reubicarMeteorito(i);
      } else if (meteoritosY[i] > height + TAM_METEORITO) {
        reubicarMeteorito(i);
      }
    }
  } else {
    // Ya juntaste las 20: se muestra el cartel 3 segundos y vuelve al mapa
    cuadrosEspera = cuadrosEspera + 1;
    if (cuadrosEspera >= CUADROS_POR_SEGUNDO * 3) {
      completarNivel(2);
      volverAlMapa();
    }
  }
}

// dibujarNivel2: el espacio, las estrellas, los meteoritos, la bolsa, el casco y el contador.
function dibujarNivel2() {
  push();
  // Antes de tapar la cámara con el espacio, se copia el pedazo donde está tu cara (para el visor del casco)
  if (poses.length > 0) {
    copiarCaraCasco();
  }
  dibujarEspacio(true);

  // El casco va primero (atrás), así las estrellas y los meteoritos pasan por delante
  if (poses.length > 0) {
    dibujarCascoAstronauta();
  }
  for (let i = 0; i < CANT_ESTRELLAS; i++) {
    dibujarEstrellaCayendo(estrellasX[i], estrellasY[i], TAM_ESTRELLA);
  }
  for (let i = 0; i < CANT_METEORITOS; i++) {
    dibujarMeteorito(i, meteoritosX[i], meteoritosY[i], TAM_METEORITO);
  }
  if (hayBolsa) {
    dibujarBolsaEspacial(bolsaIzq, bolsaDer);
  }

  dibujarPanel(30, 30, 270, 88, "ESTRELLAS GUARDADAS", estrellasGuardadas + " / " + ESTRELLAS_PARA_GANAR, {

    color: [255, 225, 100],

    progreso: estrellasGuardadas / ESTRELLAS_PARA_GANAR,

    tamValor: 32,

    vidasTotal: 0,

    vidasLlenas: 0

  });

  if (estrellasGuardadas >= ESTRELLAS_PARA_GANAR) {
    dibujarCartel("¡MISIÓN 02 COMPLETADA!", "Volviendo al mapa...", UI_AZUL);
  }
  pop();
}

// dibujarEspacio: tapa la cámara con el espacio (un GIF con nebulosas, una galaxia, un planeta con anillos
// y estrellas que titilan). deriva = true hace que el fondo baje despacio (parece que viajamos hacia arriba):
// se dibuja dos veces, una arriba de la otra, y las dos se van corriendo.
function dibujarEspacio(deriva) {
  let y = 0;
  if (deriva) {
    y = (cuadroAnimacion * 0.6) % height;   // va bajando y cuando llega abajo vuelve a empezar
  }
  image(gifFondoEspacio, 0, y - height, width, height);
  image(gifFondoEspacio, 0, y, width, height);
}

// dibujarFondoApagado: el mismo espacio pero más oscuro, para que no moleste cuando hay que leer
// (las consignas y las constelaciones con su explicación).
function dibujarFondoApagado() {
  dibujarEspacio(false);
  noStroke();
  fill(2, 3, 14, 150);
  rect(0, 0, width, height);
}

// Los 10 vértices de una estrella de 5 puntas de tamaño 1 (punta, hueco, punta, hueco...),
// empezando por la punta de arriba. Para dibujarla más grande se multiplican por el radio.
const ESTRELLA_X = [0, 0.588, 0.951, 0.951, 0.588, 0, -0.588, -0.951, -0.951, -0.588];
const ESTRELLA_Y = [-1, -0.809, -0.309, 0.309, 0.809, 1, 0.809, 0.309, -0.309, -0.809];

// dibujarEstrella5: una estrella de 5 puntas centrada en (0, 0).
// radioAfuera = qué tan largas son las puntas; radioAdentro = qué tan hondos son los huecos.
function dibujarEstrella5(radioAfuera, radioAdentro) {
  beginShape();
  for (let k = 0; k < 10; k++) {
    // los vértices pares son puntas y los impares son huecos
    let r = radioAdentro;
    if (k % 2 == 0) {
      r = radioAfuera;
    }
    vertex(ESTRELLA_X[k] * r, ESTRELLA_Y[k] * r);
  }
  endShape(CLOSE);
}

// dibujarEstrellaCayendo: el GIF de la estrella que hay que guardar. Gira, late y deja una estela.
function dibujarEstrellaCayendo(x, y, tam) {
  // El GIF mide 2,4 estrellas de ancho y 4,4 de alto: la estrella está abajo y la estela arriba
  image(gifEstrella, x - tam * 1.2, y - tam * 3.2, tam * 2.4, tam * 4.4);
}

// dibujarMeteorito: el GIF del meteorito i (una roca con cráteres que gira, con fuego arriba porque cae).
function dibujarMeteorito(i, x, y, tam) {
  push();
  translate(x, y);
  // Los impares se dibujan dados vuelta (como en un espejo): así giran para el otro lado
  if (i % 2 == 1) {
    scale(-1, 1);
  }
  // Hay 3 GIF distintos; el GIF mide 1,6 meteoritos de ancho y 3,2 de alto (el fuego va arriba)
  image(gifMeteoritos[i % 3], -tam * 0.8, -tam * 2.4, tam * 1.6, tam * 3.2);
  pop();
}

// SENOS[k] es qué tan alto sube una línea de largo 1 inclinada k * 5 grados (0°, 5°, 10°... hasta 90°).
// Con esta tabla se calcula el ángulo de una línea usando solo listas, for, if y map.
const SENOS = [0, 0.0872, 0.1736, 0.2588, 0.342, 0.4226, 0.5, 0.5736, 0.6428, 0.7071,
               0.766, 0.8192, 0.866, 0.9063, 0.9397, 0.9659, 0.9848, 0.9962, 1];

// anguloDeLinea: el ángulo (en grados) de la línea que va del punto a al punto b.
// 0 = acostada hacia la derecha; positivo = baja hacia la derecha (es el ángulo que usa rotate).
function anguloDeLinea(a, b) {
  let largo = dist(a.x, a.y, b.x, b.y);
  if (largo == 0) {
    return 0;
  }
  let altura = sinSigno(b.y - a.y) / largo;   // de 0 (acostada) a 1 (parada)
  // Busca entre qué dos valores de la tabla está la altura, y con map calcula los grados
  let angulo = 90;
  for (let k = 0; k < SENOS.length - 1; k++) {
    if (altura >= SENOS[k] && altura < SENOS[k + 1]) {
      angulo = map(altura, SENOS[k], SENOS[k + 1], k * 5, k * 5 + 5);
    }
  }
  if (b.x < a.x) {
    angulo = 180 - angulo;   // la línea va hacia la izquierda
  }
  if (b.y < a.y) {
    angulo = -angulo;        // la línea sube
  }
  return angulo;
}

// dibujarBolsaEspacial: la bolsa que cuelga entre las dos muñecas.
// La boca de la bolsa es la línea entre las manos; el cuerpo (un GIF) cuelga hacia abajo.
// Adentro se ven las estrellas que ya guardaste.
function dibujarBolsaEspacial(izq, der) {
  push();
  let ancho = dist(izq.x, izq.y, der.x, der.y);
  if (ancho < 1) {
    pop();
    return;
  }
  let hondo = elMayor(80, ancho * 0.7);

  // Zona de agarre: un brillo suave arriba de la boca
  noStroke();
  fill(255, 200, 80, 35);
  quad(izq.x - MARGEN_LADOS, izq.y - ZONA_AGARRE, der.x + MARGEN_LADOS, der.y - ZONA_AGARRE,
       der.x + MARGEN_LADOS, der.y, izq.x - MARGEN_LADOS, izq.y);

  // El cuerpo de la bolsa es un GIF (tela plateada con el parche de la estrella).
  // Se pone en la mano izquierda, se gira con el ángulo de la línea entre las manos
  // (anguloDeLinea calcula ese ángulo) y se estira hasta llegar a la otra mano.
  push();
  translate(izq.x, izq.y);
  rotate(anguloDeLinea(izq, der));
  let sx = ancho / 200;   // el GIF está dibujado para una bolsa de 200 de ancho...
  let sy = hondo / 140;   // ...y 140 de hondo
  image(gifBolsa, -4 * sx, -4 * sy, 208 * sx, 119 * sy);

  // Estrellitas guardadas adentro (posiciones fijas por número de estrella)
  for (let k = 0; k < elMenor(estrellasGuardadas, ESTRELLAS_PARA_GANAR); k++) {
    let t = 0.2 + 0.6 * ((k * 0.37) % 1);    // a lo ancho
    let h = 0.1 + 0.25 * ((k * 0.61) % 1);   // a lo hondo
    image(gifEstrellita, t * ancho - 10, h * hondo - 10, 20, 20);
  }
  pop();

  // Boca de la bolsa: aro naranja que brilla
  stroke(255, 160, 40, 90);
  strokeWeight(GROSOR_BOLSA + 10);
  line(izq.x, izq.y, der.x, der.y);
  stroke(COLOR_BOLSA);
  strokeWeight(GROSOR_BOLSA);
  line(izq.x, izq.y, der.x, der.y);

  // Agarraderas en las manos
  noStroke();
  fill(COLOR_BOLSA);
  circle(izq.x, izq.y, 30);
  circle(der.x, der.y, 30);
  fill(255, 220, 160);
  circle(izq.x, izq.y, 12);
  circle(der.x, der.y, 12);
  pop();
}

// El casco: su tamaño y dónde está (se calculan en medidasCasco, a partir de la nariz y las orejas)
let cascoTam = 0;
let cascoX = 0;
let cascoY = 0;
let caraCasco;   // la foto de tu cara que se ve adentro del visor (se copia en cada cuadro)
let hayCaraCasco = false;   // true cuando ya se copió la foto de tu cara por primera vez

// medidasCasco: calcula el tamaño del casco (según la distancia entre las orejas) y su centro (en la nariz).
function medidasCasco() {
  let nariz = obtenerPunto(0, "nose");
  let orejaIzq = obtenerPunto(0, "left_ear");
  let orejaDer = obtenerPunto(0, "right_ear");
  cascoTam = dist(orejaIzq.x, orejaIzq.y, orejaDer.x, orejaDer.y) * 2.4;
  cascoX = nariz.x;
  cascoY = nariz.y - cascoTam * 0.08;
}

// copiarCaraCasco: copia con get() el pedazo de la pantalla donde está tu cara, ANTES de que el
// espacio tape la cámara. Después se dibuja adentro del visor, así tu cara se ve clara.
function copiarCaraCasco() {
  medidasCasco();
  if (cascoTam >= 40) {
    caraCasco = get(cascoX - cascoTam * 0.34, cascoY - cascoTam * 0.29, cascoTam * 0.68, cascoTam * 0.58);
    hayCaraCasco = true;
  }
}

// dibujarCascoAstronauta: el casco (un GIF) alrededor de la cabeza: carcasa blanca, aro dorado,
// visor transparente (se ve tu cara), antena y luces que titilan a los costados.
// El tamaño depende de la distancia entre las orejas.
function dibujarCascoAstronauta() {
  if (cascoTam < 40 || !hayCaraCasco) {
    return;
  }
  let tam = cascoTam;
  push();
  translate(cascoX, cascoY);
  // 1) Tu cara (la foto que se copió antes de tapar la cámara), del tamaño del visor
  image(caraCasco, -tam * 0.34, -tam * 0.29, tam * 0.68, tam * 0.58);
  // 2) El casco encima: el GIF tiene el visor transparente, así se ve tu cara adentro
  image(gifCasco, -tam * 0.6, -tam * 0.6, tam * 1.2, tam * 1.26);
  pop();
}

// TRAJE DEL ASTRONAUTA (misión 4): el cuerpo entero sigue tus hombros, codos, caderas, rodillas y tobillos.
// Las piernas solo se dibujan si la cámara las ve (si la confianza c del punto es mayor que 0.3).

// segmentoTraje: una parte del traje (un brazo o una pierna) entre dos puntos, de grosor g:
// primero una línea gris más gruesa (el borde) y encima una blanca (la tela).
function segmentoTraje(a, b, g) {
  stroke(160, 166, 180);
  strokeWeight(g + 6);
  line(a.x, a.y, b.x, b.y);
  stroke(240, 242, 248);
  strokeWeight(g);
  line(a.x, a.y, b.x, b.y);
}

// seVe: true si la cámara está bastante segura de ese punto del cuerpo.
function seVe(p) {
  return p.c > 0.3;
}

// dibujarTrajeAstronauta: las piernas, el torso con el panel de control y los brazos.
function dibujarTrajeAstronauta() {
  let hi = obtenerPunto(0, "left_shoulder");
  let hd = obtenerPunto(0, "right_shoulder");
  let ci = obtenerPunto(0, "left_hip");
  let cd = obtenerPunto(0, "right_hip");
  let ancho = dist(hi.x, hi.y, hd.x, hd.y);   // el ancho de los hombros: de ahí sale el grosor de todo
  let g = ancho * 0.28;
  push();
  // Si la cámara no ve las caderas, el torso se alarga hacia abajo desde los hombros
  if (!seVe(ci) || !seVe(cd)) {
    ci = { x: hi.x, y: hi.y + ancho * 1.3, c: 0 };
    cd = { x: hd.x, y: hd.y + ancho * 1.3, c: 0 };
  }
  // Piernas (cadera → rodilla → tobillo) con una bota en el pie
  let piernas = [["left_hip", "left_knee", "left_ankle"], ["right_hip", "right_knee", "right_ankle"]];
  for (let k = 0; k < piernas.length; k++) {
    let cadera = obtenerPunto(0, piernas[k][0]);
    let rodilla = obtenerPunto(0, piernas[k][1]);
    let tobillo = obtenerPunto(0, piernas[k][2]);
    if (seVe(cadera) && seVe(rodilla)) {
      segmentoTraje(cadera, rodilla, g * 1.15);
      if (seVe(tobillo)) {
        segmentoTraje(rodilla, tobillo, g);
        noStroke();
        fill(90, 96, 115);
        ellipse(tobillo.x, tobillo.y + g * 0.3, g * 1.5, g * 0.9);
      }
      noStroke();
      fill(200, 205, 218);
      circle(rodilla.x, rodilla.y, g * 0.7);
    }
  }
  // Torso: un cuadrilátero de los hombros a las caderas, con cinturón y panel de control
  stroke(160, 166, 180);
  strokeWeight(4);
  fill(240, 242, 248);
  quad(hi.x + g * 0.3, hi.y - g * 0.2, hd.x - g * 0.3, hd.y - g * 0.2, cd.x - g * 0.2, cd.y, ci.x + g * 0.2, ci.y);
  noStroke();
  fill(120, 128, 145);
  quad(ci.x + g * 0.2, ci.y - g * 0.4, cd.x - g * 0.2, cd.y - g * 0.4, cd.x - g * 0.2, cd.y, ci.x + g * 0.2, ci.y);
  let px = (hi.x + hd.x + ci.x + cd.x) / 4;   // el centro del pecho
  let py = (hi.y + hd.y) / 2 + (ci.y - hi.y) * 0.35;
  fill(70, 80, 110);
  rect(px - ancho * 0.18, py - ancho * 0.12, ancho * 0.36, ancho * 0.24, 4);
  // Lucecitas del panel: titilan, una distinta cada medio segundo
  let colores = [UI_ROJO, UI_AZUL, UI_VERDE];
  for (let k = 0; k < 3; k++) {
    let luz = colores[k];
    if (parteEntera(cuadroAnimacion / 30) % 3 == k) {
      fill(luz[0], luz[1], luz[2]);
    } else {
      fill(luz[0], luz[1], luz[2], 80);
    }
    circle(px - ancho * 0.1 + k * ancho * 0.1, py, ancho * 0.06);
  }
  fill(214, 40, 40);
  rect(hi.x + g * 0.4, hi.y + g * 0.2, ancho * 0.12, ancho * 0.08, 2);   // la banderita en el hombro
  // Brazos (hombro → codo → muñeca); los guantes se dibujan después, encima
  let brazos = [["left_shoulder", "left_elbow", "left_wrist"], ["right_shoulder", "right_elbow", "right_wrist"]];
  for (let k = 0; k < brazos.length; k++) {
    let hombro = obtenerPunto(0, brazos[k][0]);
    let codo = obtenerPunto(0, brazos[k][1]);
    let muneca = obtenerPunto(0, brazos[k][2]);
    segmentoTraje(hombro, codo, g);
    segmentoTraje(codo, muneca, g * 0.9);
    noStroke();
    fill(200, 205, 218);
    circle(codo.x, codo.y, g * 0.6);
  }
  pop();
}

// dibujarCascoObra: en la misión 1 estás en la Tierra construyendo el cohete, así que en vez del casco
// de astronauta tenés un casco amarillo de obra, con una correa de abrojo que te rodea la cara:
// así tu cara queda adentro de un círculo (la correa tapa las esquinas de la foto).
function dibujarCascoObra() {
  if (cascoTam < 40 || !hayCaraCasco) {
    return;
  }
  let tam = cascoTam;
  push();
  translate(cascoX, cascoY);
  // Tu cara (la foto que se copió antes de tapar la cámara)
  image(caraCasco, -tam * 0.34, -tam * 0.29, tam * 0.68, tam * 0.58);
  // El casco con la correa: el GIF mide 112 x 134 para una cara de 100 (de -56 a 56 y de -86 a 48)
  image(gifCascoObra, -tam * 0.56, -tam * 0.86, tam * 1.12, tam * 1.34);
  pop();
}

// Nivel 3: constelaciones

// manoMasCercana: de las dos muñecas, devuelve la que está más cerca del punto (x, y).
// Esa mano es el "lápiz" que dibuja.
function manoMasCercana(x, y) {
  let munecaIzq = obtenerPunto(0, "left_wrist");
  let munecaDer = obtenerPunto(0, "right_wrist");
  if (dist(munecaIzq.x, munecaIzq.y, x, y) < dist(munecaDer.x, munecaDer.y, x, y)) {
    return munecaIzq;
  } else {
    return munecaDer;
  }
}

// ladoCaja: tamaño del cuadrado en el que se dibuja la constelación.
function ladoCaja() {
  return elMenor(width, height) * 0.55;
}

// estrellaX / estrellaY: pasan la posición de la estrella p de la constelación c (de 0 a 1) a píxeles.
function estrellaX(c, p) {
  return width / 2 - ladoCaja() / 2 + CONST_X[c][p] * ladoCaja();
}
// estrellaY: lo mismo que estrellaX, pero para la altura.
function estrellaY(c, p) {
  return height * 0.42 - ladoCaja() / 2 + CONST_Y[c][p] * ladoCaja();
}

// dibujarFondoEstrellado: tapa la cámara con el espacio, quieto.
function dibujarFondoEstrellado() {
  dibujarEspacio(false);
}

// dibujarManos: los guantes del astronauta en las dos manos, para ver dónde están.
function dibujarManos() {
  dibujarGuantes(210);
}

// interaccionIntro3: después de 2 segundos, si una mano toca la estrella grande, empieza el nivel 3.
function interaccionIntro3() {
  cuadrosEspera = cuadrosEspera + 1;
  if (cuadrosEspera > CUADROS_POR_SEGUNDO * 2 && poses.length > 0) {
    let botonX3 = width / 2;
    let botonY3 = height * 0.8;
    let mano = manoMasCercana(botonX3, botonY3);
    if (dist(mano.x, mano.y, botonX3, botonY3) < TAM_BOTON_SIG / 2 + RADIO_MANO) {
      sonido("boton");
      cuadrosEspera = 0;
      estado = "nivel3";
    }
  }
}

// dibujarIntro3: la consigna del nivel 3.
function dibujarIntro3() {
  push();
  dibujarFondoApagado();   // el fondo más oscuro, así se lee bien

  dibujarTitulo("MISIÓN 03 · CONSTELACIONES", height * 0.13, "Tres constelaciones para completar la misión", 60);

  let tw = elMenor(width * 0.24, 300);
  let ty = height * 0.38;
  let nombres = ["OSA MAYOR", "OSA MENOR", "ORIÓN"];
  for (let k = 0; k < 3; k++) {
    let x = width / 2 + (k - 1) * (tw + 30);
    // la del medio es violeta y las otras azules
    if (k == 1) {
      dibujarTarjetaInfo(x, ty, tw, 110, UI_VIOLETA);
    } else {
      dibujarTarjetaInfo(x, ty, tw, 110, UI_AZUL);
    }
    noStroke();
    textAlign(CENTER, CENTER);
    fill(170, 190, 235);
    textSize(16);
    text("CONSTELACIÓN " + (k + 1), x, ty - 22);
    fill(255);
    textSize(elMenor(28, tw / 10));
    text(nombres[k], x, ty + 14);
  }

  dibujarConsigna(["Uní las estrellas en orden: tocá con la mano la estrella", "que brilla."], height * 0.575, UI_VIOLETA);

  // Botón para empezar (aparece a los 2 segundos)
  if (cuadrosEspera > CUADROS_POR_SEGUNDO * 2) {
    dibujarBotonCirculo(width / 2, height * 0.8, TAM_BOTON_SIG, "EMPEZAR", {
      color: UI_AZUL,
      encima: manoEncima(width / 2, height * 0.8, TAM_BOTON_SIG / 2),
      progreso: 0,
      tamTexto: TAM_BOTON_SIG * 0.14,
      icono: "estrella",
      texto2: ""
    });
  }

  dibujarManos();
  pop();
}

// interaccionNivel3: si la mano toca la estrella que sigue, se une. Al completar la constelación,
// se muestra la explicación; después de 3 segundos aparece el botón SIGUIENTE.
function interaccionNivel3() {
  if (poses.length > 0) {
    if (mostrandoInfo) {
      cuadrosInfo = cuadrosInfo + 1;
      if (cuadrosInfo > ESPERA_SIGUIENTE) {
        let botonSigX = width - TAM_BOTON_SIG;
        let botonSigY = height - TAM_BOTON_SIG;
        let mano = manoMasCercana(botonSigX, botonSigY);
        if (dist(mano.x, mano.y, botonSigX, botonSigY) < TAM_BOTON_SIG / 2 + RADIO_MANO) {
          // Pasa a la constelación siguiente, o vuelve al mapa si era la última
          sonido("boton");
          if (misionActual + 1 >= CANT_MISIONES) {
            // Terminaste las tres constelaciones: se completa el nivel 3 y volvés al mapa.
            // misionActual no se pasa de la última (no existe una cuarta constelación para dibujar
            // mientras dura la transición).
            completarNivel(3);
            volverAlMapa();
          } else {
            misionActual = misionActual + 1;
            puntoActual = 0;
            mostrandoInfo = false;
            cuadrosInfo = 0;
          }
        }
      }
    } else {
      let x = estrellaX(misionActual, puntoActual);
      let y = estrellaY(misionActual, puntoActual);
      let mano = manoMasCercana(x, y);
      if (dist(mano.x, mano.y, x, y) < RADIO_TOQUE) {
        puntoActual = puntoActual + 1;
        sonido("pop");
        if (puntoActual >= CONST_X[misionActual].length) {
          mostrandoInfo = true;
          cuadrosInfo = 0;
        }
      }
    }
  }
}

// dibujarNivel3: la constelación que se está dibujando, o la constelación completa con su explicación.
function dibujarNivel3() {
  push();
  dibujarFondoApagado();   // el fondo más oscuro, así se lee bien

  let c = misionActual;
  let cant = CONST_X[c].length;

  // Título de la misión
  dibujarTitulo("CONSTELACIÓN " + (c + 1) + " DE " + CANT_MISIONES + " · " + NOMBRES_CONST[c], 60, "", 40);

  if (!mostrandoInfo) {
    // Líneas ya dibujadas: cada estrella tocada se une con la anterior
    stroke(255);
    strokeWeight(5);
    for (let i = 1; i < puntoActual; i++) {
      line(estrellaX(c, i - 1), estrellaY(c, i - 1), estrellaX(c, i), estrellaY(c, i));
    }

    // Línea "lápiz": desde la última estrella tocada hasta la mano
    if (puntoActual > 0 && poses.length > 0) {
      let xSig = estrellaX(c, puntoActual);
      let ySig = estrellaY(c, puntoActual);
      let mano = manoMasCercana(xSig, ySig);
      stroke(255, 255, 255, 150);
      strokeWeight(3);
      line(estrellaX(c, puntoActual - 1), estrellaY(c, puntoActual - 1), mano.x, mano.y);
    }

    // Estrellas
    noStroke();
    for (let i = 0; i < cant; i++) {
      fill(255);
      circle(estrellaX(c, i), estrellaY(c, i), 18);
    }

    // La próxima estrella brilla y late
    let brillo = 50 + vaiven(0.095, 1) * 12;
    fill(255, 230, 80, 90);
    circle(estrellaX(c, puntoActual), estrellaY(c, puntoActual), brillo * 1.8);
    fill("#FFE650");
    circle(estrellaX(c, puntoActual), estrellaY(c, puntoActual), brillo * 0.6);

    // Números de las estrellas que faltan. Si una estrella se repite, se ve solo el número más bajo.
    fill(255);
    stroke(0);
    strokeWeight(4);
    textSize(22);
    textAlign(LEFT, BOTTOM);
    for (let i = puntoActual; i < cant; i++) {
      let repetida = false;
      for (let j = puntoActual; j < i; j++) {
        if (CONST_X[c][j] == CONST_X[c][i] && CONST_Y[c][j] == CONST_Y[c][i]) {
          repetida = true;
        }
      }
      if (!repetida) {
        text(i + 1, estrellaX(c, i) + 14, estrellaY(c, i) - 8);
      }
    }

    dibujarInstruccion("Tocá con la mano la estrella que brilla", height - 60, UI_VIOLETA);

  } else {
    // Constelación completa: todas las líneas, estrellas brillantes y sus nombres
    stroke(150, 200, 255);
    strokeWeight(4);
    for (let i = 1; i < cant; i++) {
      line(estrellaX(c, i - 1), estrellaY(c, i - 1), estrellaX(c, i), estrellaY(c, i));
    }
    noStroke();
    for (let i = 0; i < cant; i++) {
      fill(150, 200, 255, 70);
      circle(estrellaX(c, i), estrellaY(c, i), 55);
      fill(255);
      circle(estrellaX(c, i), estrellaY(c, i), 22);
    }
    fill(200, 225, 255);
    stroke(0);
    strokeWeight(3);
    textSize(16);
    textAlign(LEFT, TOP);
    for (let i = 0; i < cant; i++) {
      text(NOMBRES_ESTRELLAS[c][i], estrellaX(c, i) + 16, estrellaY(c, i) + 8);
    }

    // Recuadro con la explicación
    let cajaX = width * 0.08;
    let cajaY = height * 0.71;
    let cajaAncho = width * 0.68;
    let cajaAlto = height * 0.27;
    noStroke();
    fill(4, 6, 24, 245);
    formaChaflan(cajaX + cajaAncho / 2, cajaY + cajaAlto / 2, cajaAncho, cajaAlto, 16);
    noFill();
    stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 50);
    strokeWeight(8);
    formaChaflan(cajaX + cajaAncho / 2, cajaY + cajaAlto / 2, cajaAncho, cajaAlto, 16);
    stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 200);
    strokeWeight(2);
    formaChaflan(cajaX + cajaAncho / 2, cajaY + cajaAlto / 2, cajaAncho, cajaAlto, 16);
    noStroke();
    fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
    textSize(28);
    textAlign(LEFT, TOP);
    text("¡" + NOMBRES_CONST[c] + " COMPLETA!", cajaX + 20, cajaY + 15);
    fill(255);
    textSize(20);
    // Un renglón abajo del otro
    for (let r = 0; r < TEXTOS_CONST[c].length; r++) {
      text(TEXTOS_CONST[c][r], cajaX + 20, cajaY + 55 + r * 26);
    }

    // Botón SIGUIENTE (aparece a los 3 segundos, para que dé tiempo a leer)
    if (cuadrosInfo > ESPERA_SIGUIENTE) {
      let botonSigX = width - TAM_BOTON_SIG;
      let botonSigY = height - TAM_BOTON_SIG;
      // En la última constelación dice TERMINAR
      let textoSig = "SIGUIENTE";
      if (c == CANT_MISIONES - 1) {
        textoSig = "TERMINAR";
      }
      dibujarBotonCirculo(botonSigX, botonSigY, TAM_BOTON_SIG, textoSig, {
        color: UI_AZUL,
        encima: manoEncima(botonSigX, botonSigY, TAM_BOTON_SIG / 2),
        progreso: 0,
        tamTexto: TAM_BOTON_SIG * 0.14,
        icono: "",
        texto2: ""
      });
    }
  }

  dibujarManos();
  pop();
}

// MISIÓN 4: SEÑALES A LA TIERRA



// interaccionIntro4: a los 2 segundos aparece el botón; si lo tocás con la mano, empieza la misión.
function interaccionIntro4() {
  cuadrosEspera = cuadrosEspera + 1;
  if (cuadrosEspera > CUADROS_POR_SEGUNDO * 2 && poses.length > 0) {
    let botonX4 = width / 2;
    let botonY4 = height * 0.8;
    let mano = manoMasCercana(botonX4, botonY4);
    if (dist(mano.x, mano.y, botonX4, botonY4) < TAM_BOTON_SIG / 2 + RADIO_MANO) {
      sonido("boton");
      cuadrosEspera = 0;
      estado = "nivel4";
    }
  }
}


// dibujarIntro4: la historia y las tres fases de la misión 4 (con el mismo estilo que la consigna de la misión 3).
function dibujarIntro4() {
  push();
  dibujarFondoApagado();   // el fondo más oscuro, así se lee bien

  dibujarTitulo("MISIÓN 04 · SEÑALES A LA TIERRA", height * 0.13, "¡Se perdió la comunicación con la base!", 60);

  // Una tarjeta por fase
  let tw = width * 0.26;
  if (tw > 330) {
    tw = 330;
  }
  let ty = height * 0.4;
  for (let k = 0; k < 3; k++) {
    let x = width / 2 + (k - 1) * (tw + 30);
    if (k == 1) {
      dibujarTarjetaInfo(x, ty, tw, 130, UI_VIOLETA);
    } else {
      dibujarTarjetaInfo(x, ty, tw, 130, UI_AZUL);
    }
    noStroke();
    textAlign(CENTER, CENTER);
    fill(170, 190, 235);
    textSize(16);
    text("FASE " + (k + 1) + " · " + PARTES_FASES[k], x, ty - 30);
    fill(255);
    textSize(21);
    text(NOMBRES_FASES[k], x, ty + 6);
    fill(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
    textSize(15);
    text("10 segundos por paso", x, ty + 38);
  }

  dibujarConsigna(["Repará la antena de la nave para volver a hablar con la", "Tierra. Tenés 3 vidas."], height * 0.6, UI_VIOLETA);

  // Botón para empezar (aparece a los 2 segundos)
  if (cuadrosEspera > CUADROS_POR_SEGUNDO * 2) {
    dibujarBotonCirculo(width / 2, height * 0.8, TAM_BOTON_SIG, "EMPEZAR", {
      color: UI_AZUL,
      encima: manoEncima(width / 2, height * 0.8, TAM_BOTON_SIG / 2),
      progreso: 0,
      tamTexto: TAM_BOTON_SIG * 0.14,
      icono: "estrella",
      texto2: ""
    });
  }

  dibujarManos();
  pop();
}


// reiniciarSenales: deja la misión 4 como al principio.
function reiniciarSenales() {
  faseSenales = 1;
  pasoSenales = 0;
  cuadrosPaso = 0;
  cuadrosSosteniendo = 0;
  vidasSenales = VIDAS_SENALES;
  agujaDial = 0;
  miraX = width / 2;
  cuadrosApuntando = 0;
}


// poseCumplida: revisa si el jugador está haciendo la pose número p (0 = brazos arriba, 1 = brazos en cruz).
// Compara la altura (y) de las muñecas con la de la nariz y los hombros.
// Ojo: en la pantalla la y crece hacia abajo, así que "más arriba" es "y más chica".
function poseCumplida(p) {
  let nariz = obtenerPunto(0, "nose");
  let munecaIzq = obtenerPunto(0, "left_wrist");
  let munecaDer = obtenerPunto(0, "right_wrist");
  let hombroIzq = obtenerPunto(0, "left_shoulder");
  let hombroDer = obtenerPunto(0, "right_shoulder");

  // El ancho de los hombros sirve de medida: si estás lejos de la cámara es más chico
  let anchoHombros = dist(hombroIzq.x, hombroIzq.y, hombroDer.x, hombroDer.y);
  let margen = anchoHombros * 0.5;
  let separacionManos = dist(munecaIzq.x, munecaIzq.y, munecaDer.x, munecaDer.y);

  let cumple = false;

  if (p == 0) {
    // BRAZOS ARRIBA: las dos muñecas más arriba que la nariz
    if (munecaIzq.y < nariz.y && munecaDer.y < nariz.y) {
      cumple = true;
    }
  } else if (p == 1) {
    // BRAZOS EN CRUZ: las dos muñecas a la altura de los hombros y bien separadas
    if (munecaIzq.y > hombroIzq.y - margen && munecaIzq.y < hombroIzq.y + margen &&
        munecaDer.y > hombroDer.y - margen && munecaDer.y < hombroDer.y + margen &&
        separacionManos > anchoHombros * 2.5) {
      cumple = true;
    }
  }

  return cumple;
}


// actualizarDial: la aguja del dial depende de qué tan separadas están las manos.
// Se compara con el ancho de los hombros, así funciona igual cerca o lejos de la cámara.
function actualizarDial() {
  let munecaIzq = obtenerPunto(0, "left_wrist");
  let munecaDer = obtenerPunto(0, "right_wrist");
  let hombroIzq = obtenerPunto(0, "left_shoulder");
  let hombroDer = obtenerPunto(0, "right_shoulder");
  let anchoHombros = dist(hombroIzq.x, hombroIzq.y, hombroDer.x, hombroDer.y);
  let separacionManos = dist(munecaIzq.x, munecaIzq.y, munecaDer.x, munecaDer.y);

  // Manos juntas (medio hombro de distancia) = 0; brazos bien abiertos (3 hombros) = 1
  let valor = map(separacionManos, anchoHombros * 0.5, anchoHombros * 3, 0, 1);
  if (valor < 0) {
    valor = 0;
  }
  if (valor > 1) {
    valor = 1;
  }

  // lerp hace que la aguja se mueva suave y no tiemble
  agujaDial = lerp(agujaDial, valor, 0.3);
}


// tierraSenalesX: la Tierra de la fase 3 va y viene de un lado al otro de la pantalla.
function tierraSenalesX() {
  return width / 2 + vaiven(0.005, 1) * width * 0.3;
}


// tierraSenalesY: la altura de la Tierra en la fase 3.
function tierraSenalesY() {
  return height * 0.34;
}


// siguientePasoSenales: pasa al paso siguiente. Si se terminaron los pasos de la fase, pasa a la fase siguiente.
function siguientePasoSenales() {
  sonido("pop");
  pasoSenales = pasoSenales + 1;
  cuadrosPaso = 0;
  cuadrosSosteniendo = 0;

  if (faseSenales == 1 && pasoSenales >= POSES_FASE1.length) {
    faseSenales = 2;
    pasoSenales = 0;
  } else if (faseSenales == 2 && pasoSenales >= FRECUENCIAS.length) {
    faseSenales = 3;
    pasoSenales = 0;
  }
}


// interaccionNivel4: la lógica de la misión 4, en cada cuadro, según la fase en la que estás.
// Si un paso no se completa en 10 segundos, perdés una vida y lo intentás de nuevo.
function interaccionNivel4() {
  if (faseSenales <= 3 && vidasSenales > 0) {
    cuadrosPaso = cuadrosPaso + 1;

    if (poses.length > 0) {
      if (faseSenales == 1) {
        // FASE 1: sostener la pose que toca
        if (poseCumplida(POSES_FASE1[pasoSenales])) {
          cuadrosSosteniendo = cuadrosSosteniendo + 1;
        } else {
          cuadrosSosteniendo = 0;
        }
        if (cuadrosSosteniendo >= CUADROS_PARA_SOSTENER) {
          siguientePasoSenales();
        }

      } else if (faseSenales == 2) {
        // FASE 2: la aguja tiene que quedarse en la zona de la frecuencia que toca
        actualizarDial();
        let objetivo = FRECUENCIAS[pasoSenales];
        if (agujaDial > objetivo - MARGEN_FRECUENCIA && agujaDial < objetivo + MARGEN_FRECUENCIA) {
          cuadrosSosteniendo = cuadrosSosteniendo + 1;
        } else {
          cuadrosSosteniendo = 0;
        }
        if (cuadrosSosteniendo >= CUADROS_PARA_SOSTENER) {
          siguientePasoSenales();
        }

      } else if (faseSenales == 3) {
        // FASE 3: la mira sigue tu nariz (de costado). Cuenta el tiempo que está sobre la Tierra.
        let nariz = obtenerPunto(0, "nose");
        miraX = lerp(miraX, nariz.x, 0.3);
        let tx = tierraSenalesX();
        if (miraX > tx - TAM_TIERRA_SENALES / 2 && miraX < tx + TAM_TIERRA_SENALES / 2) {
          cuadrosApuntando = cuadrosApuntando + 1;
          cuadrosPaso = 0;   // mientras apuntás bien, el tiempo no corre
        }
        if (cuadrosApuntando >= CUADROS_PARA_APUNTAR) {
          sonido("mision");
          faseSenales = 4;
          cuadrosEspera = 0;
        }
      }
    }

    // Se terminó el tiempo del paso: perdés una vida y empieza de nuevo ese paso
    if (faseSenales <= 3 && cuadrosPaso >= TIEMPO_POR_PASO) {
      sonido("bloqueado");
      vidasSenales = vidasSenales - 1;
      cuadrosPaso = 0;
      cuadrosSosteniendo = 0;
    }
  } else {
    // Ganaste o perdiste: se muestra el cartel 4 segundos y vuelve al mapa
    cuadrosEspera = cuadrosEspera + 1;
    if (cuadrosEspera >= CUADROS_POR_SEGUNDO * 4) {
      if (vidasSenales > 0) {
        completarNivel(4);
      }
      volverAlMapa();
    }
  }
}


// dibujarPoseGuia: dibuja un astronauta de líneas luminosas haciendo la pose p (0 = brazos arriba, 1 = en cruz).
// x, y = centro del cuerpo; tam = alto aproximado del dibujo.
function dibujarPoseGuia(p, x, y, tam) {
  // El GIF muestra al astronauta subiendo los brazos hasta la pose (y se repite)
  image(gifPoses[p], x - tam * 0.5, y - tam * 0.62, tam, tam * 1.2);
}


// dibujarNaveSenales: la nave de la misión 4 con sus paneles solares y su antena.
// x, y = centro del cuerpo; paneles y antena van de 0 (guardados) a 1 (desplegados); tam = tamaño.
// Devuelve la altura (y) de la punta de la antena, para saber desde dónde salen las señales.
function dibujarNaveSenales(x, y, paneles, antena, tam) {
  // Hay dos GIF de 16 cuadros: uno abre los paneles y el otro sube la antena.
  // El cuadro que se muestra depende de cuánto se desplegó (0 = primer cuadro, 1 = último).
  let w = 370 * tam;
  let h = 275 * tam;
  if (antena <= 0) {
    dibujarGifEnCuadro(gifNavePaneles, paneles * 15 + 0.5, x - 185 * tam, y - 140 * tam, w, h);
  } else {
    dibujarGifEnCuadro(gifNaveAntena, antena * 15 + 0.5, x - 185 * tam, y - 140 * tam, w, h);
  }
  return y - 45 * tam - 80 * tam * antena;   // la punta de la antena
}


// dibujarDial: la radio de la nave, con la zona de la frecuencia y la aguja que movés con las manos.
function dibujarDial() {
  let panelAncho = width * 0.64;
  let panelAlto = height * 0.36;
  let centroX = width / 2;
  let centroY = height * 0.42;
  let panelX = centroX - panelAncho / 2;
  let panelY = centroY - panelAlto / 2;

  // El panel: verde cuando encontraste la señal
  if (cuadrosSosteniendo > 0) {
    dibujarTarjetaInfo(centroX, centroY, panelAncho, panelAlto, UI_VERDE);
  } else {
    dibujarTarjetaInfo(centroX, centroY, panelAncho, panelAlto, UI_AZUL);
  }

  push();
  // La escala del dial: una línea con rayitas y números (como una radio)
  let escalaX = panelX + panelAncho * 0.08;
  let escalaAncho = panelAncho * 0.84;
  let escalaY = panelY + panelAlto * 0.62;
  stroke(170, 190, 235);
  strokeWeight(2);
  line(escalaX, escalaY, escalaX + escalaAncho, escalaY);
  for (let k = 0; k <= 20; k++) {
    let xRaya = escalaX + escalaAncho * k / 20;
    if (k % 5 == 0) {
      stroke(170, 190, 235);
      line(xRaya, escalaY - 24, xRaya, escalaY);
      noStroke();
      fill(170, 190, 235);
      textAlign(CENTER, TOP);
      textSize(14);
      text(88 + k, xRaya, escalaY + 8);
    } else {
      stroke(170, 190, 235, 150);
      line(xRaya, escalaY - 10, xRaya, escalaY);
    }
  }
  noStroke();
  fill(170, 190, 235);
  textAlign(RIGHT, TOP);
  textSize(14);
  text("MHz", escalaX + escalaAncho, escalaY + 28);

  // La zona de la frecuencia de la Tierra: una franja azul que brilla
  let objetivo = FRECUENCIAS[pasoSenales];
  let zonaX = escalaX + escalaAncho * (objetivo - MARGEN_FRECUENCIA);
  let zonaAncho = escalaAncho * MARGEN_FRECUENCIA * 2;
  noFill();
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 60);
  strokeWeight(10);
  rect(zonaX, escalaY - 66, zonaAncho, 82, 6); // el brillo: borde grueso y transparente
  fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 45);
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
  strokeWeight(2);
  rect(zonaX, escalaY - 66, zonaAncho, 82, 6);

  // La aguja roja, en la posición que marcan tus manos (con brillo)
  let agujaX = escalaX + escalaAncho * agujaDial;
  stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2], 70);
  strokeWeight(14);
  line(agujaX, escalaY - 72, agujaX, escalaY + 4); // el brillo
  stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
  strokeWeight(4);
  line(agujaX, escalaY - 72, agujaX, escalaY + 4);
  noStroke();
  fill(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
  circle(agujaX, escalaY - 72, 14);

  // Estática: puntitos al azar mientras la aguja está fuera de la frecuencia
  if (cuadrosSosteniendo == 0) {
    for (let k = 0; k < 70; k++) {
      if (k % 2 == 0) {
        fill(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 140);
      } else {
        fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 110);
      }
      rect(random(panelX + 30, panelX + panelAncho - 30), random(panelY + 24, panelY + panelAlto * 0.3), 3, 3);
    }
  }

  // Texto del panel
  textAlign(CENTER, CENTER);
  textSize(24);
  if (cuadrosSosteniendo > 0) {
    fill(UI_VERDE[0], UI_VERDE[1], UI_VERDE[2]);
    text("¡SEÑAL ENCONTRADA! Mantené las manos así", centroX, panelY + panelAlto * 0.17);
  } else {
    fill(235, 240, 255);
    text("FRECUENCIA " + (pasoSenales + 1) + " DE " + FRECUENCIAS.length + " · buscando señal...", centroX, panelY + panelAlto * 0.17);
  }

  // Barra: se llena mientras la aguja está en la frecuencia
  fill(255, 255, 255, 30);
  rect(escalaX, panelY + panelAlto * 0.86, escalaAncho, 6, 3);
  fill(UI_VERDE[0], UI_VERDE[1], UI_VERDE[2]);
  rect(escalaX, panelY + panelAlto * 0.86, escalaAncho * cuadrosSosteniendo / CUADROS_PARA_SOSTENER, 6, 3);

  // Una línea entre tus manos, para ver la distancia que estás usando
  if (poses.length > 0) {
    let munecaIzq = obtenerPunto(0, "left_wrist");
    let munecaDer = obtenerPunto(0, "right_wrist");
    stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 160);
    strokeWeight(4);
    line(munecaIzq.x, munecaIzq.y, munecaDer.x, munecaDer.y);
  }
  pop();
}


// dibujarTierraSenales: la Tierra de la fase 3 en (x, y), con su atmósfera que brilla.
function dibujarTierraSenales(x, y) {
  let t = TAM_TIERRA_SENALES;
  image(gifTierra, x - t * 0.75, y - t * 0.75, t * 1.5, t * 1.5);   // el GIF incluye la atmósfera
}


// dibujarRayo: una línea de puntitos que va de (x1, y1) a (x2, y2): el rayo de la antena.
function dibujarRayo(x1, y1, x2, y2) {
  push();
  noStroke();
  fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 200);
  for (let k = 0; k <= 20; k++) {
    let t = k / 20;
    circle(lerp(x1, x2, t), lerp(y1, y2, t), 6);
  }
  pop();
}


// dibujarNivel4: dibuja la misión 4 según la fase: la nave que se despliega, la radio
// o la Tierra con la mira. Arriba, la fase con su tiempo y las vidas; abajo, la instrucción.
function dibujarNivel4() {
  push();
  if (poses.length > 0) {
    copiarCaraCasco();
  }
  dibujarFondoEstrellado();
  if (poses.length > 0) {
    dibujarTrajeAstronauta();   // el cuerpo entero del astronauta (abajo del casco y de los guantes)
    dibujarCascoAstronauta();
  }

  let instruccion = "";

  if (faseSenales == 1) {
    // FASE 1: el astronauta con la pose a la izquierda, la nave a la derecha
    let cartaX = width * 0.2;
    let cartaY = height * 0.53;
    let cartaAncho = width * 0.26;
    let cartaAlto = height * 0.56;
    let col = UI_AZUL;
    if (cuadrosSosteniendo > 0) {
      col = UI_VERDE;
    }
    dibujarTarjetaInfo(cartaX, cartaY, cartaAncho, cartaAlto, col);
    dibujarPoseGuia(POSES_FASE1[pasoSenales], cartaX, cartaY - cartaAlto * 0.06, cartaAlto * 0.6);
    noStroke();
    fill(col[0], col[1], col[2]);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(NOMBRES_FASE1[pasoSenales], cartaX, cartaY + cartaAlto * 0.36);
    // Barrita que se llena mientras sostenés la pose
    fill(255, 255, 255, 30);
    rect(cartaX - cartaAncho * 0.35, cartaY + cartaAlto * 0.43, cartaAncho * 0.7, 5, 2);
    fill(UI_VERDE[0], UI_VERDE[1], UI_VERDE[2]);
    rect(cartaX - cartaAncho * 0.35, cartaY + cartaAlto * 0.43, cartaAncho * 0.7 * cuadrosSosteniendo / CUADROS_PARA_SOSTENER, 5, 2);

    // Cuánto están desplegados los paneles y la antena (de 0 a 1)
    let avance = cuadrosSosteniendo / CUADROS_PARA_SOSTENER;
    let paneles = avance;
    let antena = 0;
    if (pasoSenales == 1) {
      paneles = 1;
      antena = avance;
    }
    dibujarNaveSenales(width * 0.65, height * 0.55, paneles, antena, 1.3);
    dibujarManos();
    instruccion = TEXTOS_FASE1[pasoSenales];

  } else if (faseSenales == 2) {
    // FASE 2: la radio
    dibujarNaveSenales(width * 0.5, height * 0.8, 1, 1, 0.6);
    dibujarDial();
    dibujarManos();
    instruccion = "Separá o juntá las manos hasta que la aguja quede en la franja azul";

  } else {
    // FASE 3 (y el final): la Tierra que se mueve, la nave abajo y la mira
    let tx = tierraSenalesX();
    let ty = tierraSenalesY();
    dibujarTierraSenales(tx, ty);
    let antenaY = dibujarNaveSenales(width / 2, height * 0.74, 1, 1, 0.9);

    if (faseSenales == 3) {
      // El rayo de la antena hacia la mira
      dibujarRayo(width / 2, antenaY, miraX, ty);

      // Anillo azul alrededor de la Tierra: se llena mientras apuntás
      noFill();
      stroke(255, 255, 255, 30);
      strokeWeight(6);
      circle(tx, ty, TAM_TIERRA_SENALES + 50);
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
      // arc(x, y, ancho, alto, ángulo de inicio, ángulo final): empieza arriba (-90°) y se completa la vuelta (360°)
      arc(tx, ty, TAM_TIERRA_SENALES + 50, TAM_TIERRA_SENALES + 50, -90, -90 + 360 * cuadrosApuntando / CUADROS_PARA_APUNTAR);

      // La mira roja (sigue tu nariz de costado), igual a la de la misión 5
      stroke(255, 80, 100, 220);
      strokeWeight(3);
      circle(miraX, ty, 46);
      line(miraX - 34, ty, miraX - 14, ty);
      line(miraX + 14, ty, miraX + 34, ty);
      line(miraX, ty - 34, miraX, ty - 14);
      line(miraX, ty + 14, miraX, ty + 34);
      instruccion = "Mové la cabeza para que la mira quede sobre la Tierra";

    } else if (vidasSenales > 0) {
      // FINAL: ondas de señal que viajan de la antena a la Tierra
      noFill();
      strokeWeight(4);
      for (let k = 0; k < 4; k++) {
        let t = ((cuadrosEspera + k * 15) % 60) / 60;
        stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 255 * (1 - t));
        circle(lerp(width / 2, tx, t), lerp(antenaY, ty, t), 20 + t * 80);
      }
    }
  }

  // Paneles de arriba: la fase (con el tiempo que queda) y las vidas, como en la misión 5
  if (faseSenales <= 3) {
    dibujarPanel(30, 30, 420, 88, "FASE " + faseSenales + " DE 3 · " + PARTES_FASES[faseSenales - 1], NOMBRES_FASES[faseSenales - 1], {
      color: UI_AZUL,
      progreso: (TIEMPO_POR_PASO - cuadrosPaso) / TIEMPO_POR_PASO,
      tamValor: 24,
      vidasTotal: 0,
      vidasLlenas: 0
    });
  }
  let anchoVidas = 60 + VIDAS_SENALES * 34;
  dibujarPanel(width - 30 - anchoVidas, 30, anchoVidas, 88, "VIDAS", "", {
    color: UI_ROJO,
    progreso: -1,
    tamValor: 32,
    vidasTotal: VIDAS_SENALES,
    vidasLlenas: vidasSenales
  });

  // Abajo: la instrucción
  if (faseSenales <= 3 && vidasSenales > 0) {
    dibujarInstruccion(instruccion, height - 50, UI_VIOLETA);
  }

  // Cartel final
  if (faseSenales == 4) {
    dibujarCartel("¡SEÑAL RECIBIDA EN LA TIERRA!", "Misión 04 completada · Volviendo al mapa...", UI_AZUL);
  } else if (vidasSenales <= 0) {
    dibujarCartel("SE PERDIÓ LA COMUNICACIÓN", "Volviendo al mapa...", UI_ROJO);
  }

  pop();
}


// Botón de abajo a la derecha (lo usa JUGAR DE NUEVO en la pantalla final)
// botonVolverX: dónde está el botón (a lo ancho).
function botonVolverX() { return width - TAM_BOTON_SIG; }
// botonVolverY: dónde está el botón (a lo alto).
function botonVolverY() { return height - TAM_BOTON_SIG * 1.1; }

// ESTÉTICA COMÚN
// Todas las pantallas usan las mismas piezas: títulos con líneas luminosas, paneles de datos,
// carteles centrales y un marco fino en las esquinas, como la pantalla de una nave.
// El "brillo" de los bordes se hace dibujando lo mismo dos veces: primero grueso y transparente,
// y encima fino y fuerte.
const UI_ROJO = [255, 80, 100];

// rombo: un rombito (se usa como detalle en los títulos)
function rombo(x, y, r) {
  quad(x, y - r, x + r, y, x, y + r, x - r, y);
}

// anchoTexto: cuánto mide a lo ancho un texto escrito con la tipografía del juego.
// En JetBrains Mono todas las letras miden lo mismo: 0.6 veces el tamaño de la letra.
function anchoTexto(texto, tam) {
  return texto.length * tam * 0.6;
}

// dibujarTitulo: título centrado con líneas luminosas a los costados.
// sub = el subtítulo de abajo ("" si no tiene); tam = tamaño de la letra (si la pantalla es chica, se achica).
function dibujarTitulo(texto, y, sub, tam) {
  push();
  textAlign(CENTER, CENTER);
  tam = elMenor(tam, width * 0.05);
  textSize(tam);
  let w = anchoTexto(texto, tam);
  let largo = elMenor(200, width * 0.13);

  // Líneas y rombos a los costados (con brillo)
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 50);
  strokeWeight(8);
  line(width / 2 - w / 2 - 34 - largo, y, width / 2 - w / 2 - 34, y);
  line(width / 2 + w / 2 + 34, y, width / 2 + w / 2 + 34 + largo, y);
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 200);
  strokeWeight(2);
  line(width / 2 - w / 2 - 34 - largo, y, width / 2 - w / 2 - 34, y);
  line(width / 2 + w / 2 + 34, y, width / 2 + w / 2 + 34 + largo, y);
  noStroke();
  fill(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2]);
  rombo(width / 2 - w / 2 - 20, y, 7);
  rombo(width / 2 + w / 2 + 20, y, 7);

  // Texto con un brillo suave: el mismo texto con un borde grueso azul y transparente
  fill(255);
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 70);
  strokeWeight(10);
  text(texto, width / 2, y);

  if (sub != "") {
    noStroke();
    fill(175, 200, 255);
    textSize(elMenor(26, width * 0.021));
    text(sub, width / 2, y + tam * 0.9);
  }
  pop();
}

// dibujarPanel: un recuadro de datos (contadores, tiempo, vidas).
// opciones es un objeto con:
//   color → el color del borde · progreso → de 0 a 1 dibuja una barrita (-1 = sin barrita)
//   tamValor → el tamaño del número · vidasTotal / vidasLlenas → rombitos de vidas (0 = sin rombitos)
function dibujarPanel(x, y, w, h, etiqueta, valor, opciones) {
  let col = opciones.color;
  push();
  noStroke();
  fill(8, 12, 38, 190);
  formaChaflan(x + w / 2, y + h / 2, w, h, 14);
  noFill();
  stroke(col[0], col[1], col[2], 50);
  strokeWeight(7);
  formaChaflan(x + w / 2, y + h / 2, w, h, 14);
  stroke(col[0], col[1], col[2], 210);
  strokeWeight(2);
  formaChaflan(x + w / 2, y + h / 2, w, h, 14);

  // Barrita de color a la izquierda
  noStroke();
  fill(col[0], col[1], col[2]);
  rect(x + 12, y + 14, 4, h - 28, 2);

  // Etiqueta y valor
  fill(170, 190, 235);
  textAlign(LEFT, TOP);
  textSize(15);
  text(etiqueta, x + 28, y + 12);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(opciones.tamValor);
  text(valor, x + 28, y + h * 0.56);

  // Barra de progreso abajo
  if (opciones.progreso >= 0) {
    fill(255, 255, 255, 30);
    rect(x + 28, y + h - 14, w - 50, 4, 2);
    fill(col[0], col[1], col[2]);
    rect(x + 28, y + h - 14, (w - 50) * limitar(opciones.progreso, 0, 1), 4, 2);
  }

  // Rombitos de las vidas: llenos (las que te quedan) y apagados (las que perdiste)
  for (let k = 0; k < opciones.vidasTotal; k++) {
    let px = x + 40 + k * 34;
    let py = y + h * 0.58;
    if (k < opciones.vidasLlenas) {
      fill(col[0], col[1], col[2], 70);
      rombo(px, py, 16);
      fill(col[0], col[1], col[2]);
    } else {
      fill(255, 255, 255, 40);
    }
    rombo(px, py, 11);
  }
  pop();
}

// dibujarCartel: una franja oscura en el medio de la pantalla con un mensaje grande y uno chico abajo.
function dibujarCartel(titulo, subtitulo, col) {
  push();
  let y = height * 0.45;
  let alto = 190;
  noStroke();
  fill(6, 8, 30, 215);
  rect(0, y - alto / 2, width, alto);
  stroke(col[0], col[1], col[2], 60);
  strokeWeight(9);
  line(0, y - alto / 2, width, y - alto / 2);
  line(0, y + alto / 2, width, y + alto / 2);
  stroke(col[0], col[1], col[2], 220);
  strokeWeight(2);
  line(0, y - alto / 2, width, y - alto / 2);
  line(0, y + alto / 2, width, y + alto / 2);
  stroke(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 90);
  strokeWeight(1);
  line(width * 0.1, y - alto / 2 + 10, width * 0.9, y - alto / 2 + 10);
  line(width * 0.1, y + alto / 2 - 10, width * 0.9, y + alto / 2 - 10);

  // El mensaje grande, con brillo del color del cartel
  textAlign(CENTER, CENTER);
  fill(255);
  stroke(col[0], col[1], col[2], 80);
  strokeWeight(12);
  // La letra es grande, pero si el mensaje no entra en la pantalla se achica
  textSize(elMenor(elMenor(68, width * 0.055), width * 0.92 / (titulo.length * 0.6)));
  text(titulo, width / 2, y - 22);
  noStroke();
  fill(col[0], col[1], col[2]);
  textSize(26);
  text(subtitulo, width / 2, y + 48);
  pop();
}

// dibujarInstruccion: una indicación corta dentro de una cápsula oscura, centrada, con detalles del color col.
// La letra es grande, pero si el texto no entra en la pantalla se achica sola.
function dibujarInstruccion(texto, y, col) {
  push();
  let tam = elMenor(28, (width * 0.9 - 80) / (texto.length * 0.6));
  textSize(tam);
  let w = anchoTexto(texto, tam) + 80;
  let h = tam * 2.1;
  noStroke();
  fill(4, 6, 24, 235);
  formaChaflan(width / 2, y, w, h, 12);
  noFill();
  stroke(col[0], col[1], col[2], 70);   // el brillo: el mismo borde, grueso y transparente
  strokeWeight(8);
  formaChaflan(width / 2, y, w, h, 12);
  stroke(col[0], col[1], col[2]);
  strokeWeight(2);
  formaChaflan(width / 2, y, w, h, 12);
  noStroke();
  fill(col[0], col[1], col[2]);
  rombo(width / 2 - w / 2 + 24, y, 6);
  rombo(width / 2 + w / 2 - 24, y, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  text(texto, width / 2, y);
  pop();
}

// dibujarConsigna: la consigna de cada misión en un recuadro grande y oscuro, para leerla bien de lejos.
// renglones = una lista con los renglones del texto (uno o dos), que se escriben uno abajo del otro.
function dibujarConsigna(renglones, y, col) {
  let w = elMenor(width * 0.84, 1150);
  let h = 100;
  dibujarTarjetaInfo(width / 2, y, w, h, col);
  push();
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  // El renglón más largo tiene que entrar en el recuadro (cada letra mide 0.6 del tamaño del texto)
  let masLargo = 0;
  for (let k = 0; k < renglones.length; k++) {
    masLargo = elMayor(masLargo, renglones[k].length);
  }
  let tam = elMenor(elMenor(30, width * 0.025), (w - 60) / (masLargo * 0.6));
  textSize(tam);
  let alto = tam * 1.25;   // la distancia entre un renglón y el siguiente
  for (let k = 0; k < renglones.length; k++) {
    text(renglones[k], width / 2, y + (k - (renglones.length - 1) / 2) * alto);
  }
  pop();
}

// dibujarMarcoHUD: esquinas finas en los bordes de la pantalla (como el visor de una nave).
function dibujarMarcoHUD() {
  push();
  let m = 16;
  let l = 46;
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 110);
  strokeWeight(2);
  noFill();
  line(m, m, m + l, m);
  line(m, m, m, m + l);
  line(width - m, m, width - m - l, m);
  line(width - m, m, width - m, m + l);
  line(m, height - m, m + l, height - m);
  line(m, height - m, m, height - m - l);
  line(width - m, height - m, width - m - l, height - m);
  line(width - m, height - m, width - m, height - m - l);
  pop();
}

// GUANTES DEL ASTRONAUTA (se ven en primera persona, en las muñecas, con los dedos para arriba)
// dibujarGuante: un guante en (x, y). tam = tamaño (1 = normal); espejo: true pone el pulgar del otro lado;
// alfa = qué tan transparente es (255 = nada transparente).
function dibujarGuante(x, y, tam, espejo, alfa) {
  push();
  translate(x, y);
  scale(tam);
  if (espejo) {
    scale(-1, 1);   // lo da vuelta como en un espejo
  }
  tint(255, alfa);
  // El GIF mide 90 x 138; la muñeca está en el punto (45, 62) del GIF
  image(guanteDeEstado(), -45, -62, 90, 138);
  pop();
}

// guanteDeEstado: en la misión 1 (la Tierra) devuelve el guante de trabajo del constructor;
// en el resto del juego, el guante del astronauta.
function guanteDeEstado() {
  if (estado == "intro1" || estado == "nivel1" || estado == "despegue") {
    return gifGuanteObra;
  }
  return gifGuante;
}

// dibujarGuantes: los dos guantes, en las dos muñecas.
// El tamaño depende del ancho de los hombros, así se agrandan si te acercás.
function dibujarGuantes(alfa) {
  if (poses.length == 0) {
    return;
  }
  let mi = obtenerPunto(0, "left_wrist");
  let md = obtenerPunto(0, "right_wrist");
  let hi = obtenerPunto(0, "left_shoulder");
  let hd = obtenerPunto(0, "right_shoulder");
  let tam = limitar(dist(hi.x, hi.y, hd.x, hd.y) / 230, 0.55, 1.3);
  // El pulgar siempre mira hacia la otra mano
  dibujarGuante(mi.x, mi.y, tam, mi.x > md.x, alfa);
  dibujarGuante(md.x, md.y, tam, md.x >= mi.x, alfa);
}

// FONDO DE LA MISIÓN 1: la base de lanzamiento en la Tierra, al atardecer.


// pisoBase: la altura del piso de la base de lanzamiento.
function pisoBase() {
  return height * 0.86;
}

// dibujarBaseTerrestre: el fondo de la misión 1 (un GIF): cielo del atardecer, estrellas, montañas,
// la pista, las torres, los edificios y las luces rojas que parpadean arriba de las torres.
function dibujarBaseTerrestre() {
  image(gifFondoBase, 0, 0, width, height);
}

// EL COHETE: se dibuja por partes (en "unidades del cohete": el centro es el cuerpo, la punta mira hacia arriba).
// Las 10 partes son las 10 piezas que juntaste en la misión 1, en el orden en que se encastran.
const PARTES_COHETE = ["MOTOR", "CUERPO INFERIOR", "ALETA IZQUIERDA", "ALETA DERECHA", "CUERPO SUPERIOR",
                       "FRANJA", "VENTANA", "PUNTA", "LUCES", "ANTENA"];
// Desde dónde llega volando cada parte al armarse
const LLEGADA_X = [0, -260, -320, 320, 260, -300, 300, 0, -240, 240];
const LLEGADA_Y = [260, 140, 40, 40, -80, 10, -40, -320, -160, -220];

// modoFantasma: dibuja las partes como un plano holográfico (los GIF de gifHologramas)
let modoFantasma = false;
// alfaParte: qué tan transparente se dibuja la parte (255 = nada transparente)
let alfaParte = 255;

// dibujarParteCohete: dibuja el GIF de la parte número k del cohete (0 = motor ... 9 = antena, ver PARTES_COHETE).
// En modo fantasma dibuja el GIF del plano holográfico de esa parte.
function dibujarParteCohete(k) {
  push();
  if (alfaParte < 255) {
    tint(255, alfaParte);   // la pieza que viene volando es medio transparente
  }
  // Todos los GIF de las partes miden 124 x 218 y el centro del cohete está en el punto (62, 138)
  if (modoFantasma) {
    image(gifHologramas[k], -62, -138, 124, 218);
  } else {
    image(gifPartesCohete[k], -62, -138, 124, 218);
  }
  pop();
}

// dibujarLlama: el GIF del fuego del motor, debajo de la tobera. fuerza: 0 = apagado, 1 = despegue.
function dibujarLlama(fuerza) {
  if (fuerza <= 0) {
    return;
  }
  // El GIF es el fuego con fuerza 1: con más fuerza se estira para abajo y se ensancha un poco
  let ancho = (30 + 14 * elMenor(1, fuerza)) / 44;
  image(gifLlama, -45 * ancho, 60, 90 * ancho, 170 * fuerza);
}

// dibujarCohete: el cohete completo con tu cara en la ventana.
// x, y = centro; angulo = hacia dónde apunta, en grados (0 = arriba, 180 = abajo); tam = tamaño (1 = normal).
function dibujarCohete(x, y, angulo, tam) {
  push();
  translate(x, y);
  rotate(angulo);
  scale(tam);
  dibujarLlama(0.55);
  image(gifCohete, -62, -138, 124, 218);   // el GIF del cohete armado
  // Tu cara en la ventana (se gira al revés que el cohete, así queda derecha)
  if (hayFoto) {
    push();
    translate(0, -12);
    rotate(-angulo);
    image(caraFoto, -21, -21, 42, 42);   // la foto centrada en la ventana
    pop();
    // Reflejo del vidrio arriba a la izquierda
    noStroke();
    fill(255, 255, 255, 70);
    ellipse(-8, -24, 16, 7);
  }
  pop();
}

// BOTONES ESPACIALES
// Todos los botones del juego usan el mismo estilo: fondo oscuro transparente,
// borde que brilla en azul / violeta y detalles finos, como una pantalla de nave espacial.
const UI_AZUL = [110, 180, 255];
const UI_VIOLETA = [170, 120, 255];
const UI_VERDE = [90, 230, 200];   // para SÍ

// manoEncima: true si una mano está encima de un botón redondo de radio r.
function manoEncima(x, y, r) {
  if (poses.length == 0) {
    return false;
  }
  let mano = manoMasCercana(x, y);
  return dist(mano.x, mano.y, x, y) < r + RADIO_MANO;
}

// formaChaflan: un rectángulo con las esquinas cortadas en diagonal (centrado en cx, cy).
function formaChaflan(cx, cy, w, h, corte) {
  let x1 = cx - w / 2;
  let x2 = cx + w / 2;
  let y1 = cy - h / 2;
  let y2 = cy + h / 2;
  beginShape();
  vertex(x1 + corte, y1);
  vertex(x2 - corte, y1);
  vertex(x2, y1 + corte);
  vertex(x2, y2 - corte);
  vertex(x2 - corte, y2);
  vertex(x1 + corte, y2);
  vertex(x1, y2 - corte);
  vertex(x1, y1 + corte);
  endShape(CLOSE);
}

// dibujarBotonRect: botón rectangular centrado en (cx, cy).
// opciones es un objeto con: activo (false = apagado), encima (true si la mano está arriba),
// progreso (de 0 a 1, cuánto se llenó) y tamTexto (el tamaño de la letra).
function dibujarBotonRect(cx, cy, w, h, texto, opciones) {
  let activo = opciones.activo;
  let encima = opciones.encima;
  let progreso = opciones.progreso;
  let corte = h * 0.28;

  // Color: azul si está activo, gris si todavía no se puede tocar. El borde late despacio.
  let col = [120, 125, 150];
  let pulso = 0;
  if (activo) {
    col = UI_AZUL;
    pulso = (vaiven(0.032, 1) + 1) / 2;   // va de 0 a 1 y vuelve
  }

  push();
  // Fondo oscuro transparente
  noStroke();
  if (activo) {
    fill(8, 12, 38, 190);
  } else {
    fill(8, 12, 38, 140);
  }
  formaChaflan(cx, cy, w, h, corte);

  // Relleno que crece mientras se mantiene presionado (de violeta a azul)
  if (progreso > 0) {
    fill(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 70);
    let wp = (w - 16) * progreso;
    rect(cx - w / 2 + 8, cy - h / 2 + 8, wp, h - 16, 4);
    fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
    rect(cx - w / 2 + 8, cy + h / 2 - 12, wp, 4, 2);
  }

  // Borde luminoso: primero el brillo (grueso y transparente) y después el borde
  noFill();
  if (encima) {
    stroke(col[0], col[1], col[2], 90);
    strokeWeight(14);
  } else {
    stroke(col[0], col[1], col[2], 40 + pulso * 30);
    strokeWeight(9);
  }
  formaChaflan(cx, cy, w, h, corte);
  if (encima) {
    stroke(col[0], col[1], col[2], 255);
    strokeWeight(3.5);
  } else {
    stroke(col[0], col[1], col[2], 190 + pulso * 50);
    strokeWeight(2.5);
  }
  formaChaflan(cx, cy, w, h, corte);

  // Línea fina de adentro y dos puntitos a los costados
  if (activo) {
    stroke(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 90);
  } else {
    stroke(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 40);
  }
  strokeWeight(1);
  formaChaflan(cx, cy, w - 14, h - 14, corte * 0.75);
  noStroke();
  if (activo) {
    fill(col[0], col[1], col[2], 230);
  } else {
    fill(col[0], col[1], col[2], 100);
  }
  circle(cx - w / 2 + 22, cy, 6);
  circle(cx + w / 2 - 22, cy, 6);

  // Texto
  if (activo) {
    fill(255);
  } else {
    fill(170);
  }
  textAlign(CENTER, CENTER);
  textSize(opciones.tamTexto);
  text(texto, cx, cy);
  pop();
}

// dibujarBotonCirculo: botón redondo centrado en (cx, cy) de diámetro d.
// opciones es un objeto con: color, encima (true si la mano está arriba), progreso (de 0 a 1, para
// los botones que se mantienen presionados), tamTexto, icono ("" = ninguno, "estrella", "si",
// "no" o "camara") y texto2 (un segundo renglón abajo; "" = sin segundo renglón).
function dibujarBotonCirculo(cx, cy, d, texto, opciones) {
  let col = opciones.color;
  let encima = opciones.encima;
  let pulso = (vaiven(0.032, 1) + 1) / 2;   // va de 0 a 1 y vuelve
  let r = d / 2;

  push();
  // Fondo oscuro transparente
  noStroke();
  fill(8, 12, 38, 190);
  circle(cx, cy, d);
  if (encima) {
    fill(col[0], col[1], col[2], 45);
  } else {
    fill(col[0], col[1], col[2], 18);
  }
  circle(cx, cy, d * 0.86);

  // Aro luminoso: primero el brillo (grueso y transparente) y después el aro
  noFill();
  if (encima) {
    stroke(col[0], col[1], col[2], 90);
    strokeWeight(16);
  } else {
    stroke(col[0], col[1], col[2], 40 + pulso * 30);
    strokeWeight(10);
  }
  circle(cx, cy, d);
  if (encima) {
    stroke(col[0], col[1], col[2], 255);
    strokeWeight(4);
  } else {
    stroke(col[0], col[1], col[2], 190 + pulso * 50);
    strokeWeight(3);
  }
  circle(cx, cy, d);

  // Progreso (para los botones que se mantienen presionados): un arco que se completa
  if (opciones.progreso > 0) {
    stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
    strokeWeight(7);
    arc(cx, cy, d + 2, d + 2, -90, -90 + 360 * elMenor(1, opciones.progreso));
  }

  // Aro de afuera punteado que gira despacio (como un radar)
  push();
  translate(cx, cy);
  rotate(cuadroAnimacion * 0.35);
  stroke(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 120);
  strokeWeight(1.5);
  circuloPunteado(0, 0, d + 22, 4, 10);
  // Cuatro marquitas, una cada 90 grados
  stroke(col[0], col[1], col[2], 200);
  strokeWeight(2);
  for (let k = 0; k < 4; k++) {
    rotate(90);
    line(r + 6, 0, r + 16, 0);
  }
  pop();

  // Ícono chiquito arriba del texto
  let yTexto = cy;
  if (opciones.icono != "") {
    yTexto = cy + r * 0.14;
    let yIcono = cy - r * 0.38;
    noFill();
    stroke(col[0], col[1], col[2], 230);
    strokeWeight(3);
    if (opciones.icono == "si") {
      line(cx - r * 0.14, yIcono, cx - r * 0.03, yIcono + r * 0.1);
      line(cx - r * 0.03, yIcono + r * 0.1, cx + r * 0.16, yIcono - r * 0.1);
    } else if (opciones.icono == "camara") {
      rect(cx - r * 0.2, yIcono - r * 0.1, r * 0.4, r * 0.26, 3);
      circle(cx, yIcono + r * 0.03, r * 0.15);
      rect(cx - r * 0.07, yIcono - r * 0.16, r * 0.14, r * 0.06, 2);
    } else if (opciones.icono == "no") {
      line(cx - r * 0.1, yIcono - r * 0.1, cx + r * 0.1, yIcono + r * 0.1);
      line(cx + r * 0.1, yIcono - r * 0.1, cx - r * 0.1, yIcono + r * 0.1);
    } else {
      noStroke();
      fill(col[0], col[1], col[2], 230);
      push();
      translate(cx, yIcono);
      dibujarEstrella5(r * 0.14, r * 0.06);
      pop();
    }
  }

  // Texto (en uno o dos renglones)
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(opciones.tamTexto);
  if (opciones.texto2 == "") {
    text(texto, cx, yTexto);
  } else {
    text(texto, cx, yTexto - opciones.tamTexto * 0.6);
    text(opciones.texto2, cx, yTexto + opciones.tamTexto * 0.6);
  }
  pop();
}

// Posición del botón MÁS QUE LISTO (en el medio, abajo de la pregunta)
// botonListoX: dónde está el botón (a lo ancho).
function botonListoX() { return width / 2; }
// botonListoY: la altura del botón.
function botonListoY() { return height * 0.65; }
const TAM_BOTON_LISTO = 220;

// tamFotoCara: de qué tamaño es el recorte de la cara (depende de la distancia entre las orejas).
function tamFotoCara() {
  let orejaIzq = obtenerPunto(0, "left_ear");
  let orejaDer = obtenerPunto(0, "right_ear");
  return elMayor(120, dist(orejaIzq.x, orejaIzq.y, orejaDer.x, orejaDer.y) * 2.0);
}

// sacarFotoCara: copia con get() el pedazo cuadrado de la pantalla donde está tu cara.
// Se llama desde interaccion(), cuando en el canvas todavía está solo la cámara (sin dibujos encima).
// Para que se vea redonda, cuando se dibuja se le pone encima un aro grueso que tapa las esquinas.
function sacarFotoCara() {
  if (poses.length > 0) {
    let nariz = obtenerPunto(0, "nose");
    let tam = tamFotoCara();
    caraFoto = get(nariz.x - tam / 2, nariz.y - tam / 2, tam, tam);
    hayFoto = true;
  }
}

// dibujarFotoRedonda: dibuja una foto cuadrada centrada en (x, y) de tamaño d, y encima un aro grueso
// del color colorAro que tapa las esquinas: así la foto se ve redonda.
function dibujarFotoRedonda(foto, x, y, d, colorAro) {
  image(foto, x - d / 2, y - d / 2, d, d);
  noFill();
  stroke(colorAro[0], colorAro[1], colorAro[2]);
  strokeWeight(d * 0.22);
  circle(x, y, d + d * 0.22);
}

// CREDENCIAL DE ASTRONAUTA

// empezarCredencial: prepara la pantalla de la credencial (antes de la misión 5).
function empezarCredencial() {
  estado = "credencial";
  cuadrosCred = 0;
  progresoFoto = 0;
  flashFoto = 0;
  hayCaraSuave = false;
  tarjetaX = width / 2;
  // Si ya te sacaste la foto en esta sesión, se usa esa (no hace falta sacarse otra)
  if (hayFoto) {
    faseCred = "lista";
  } else {
    faseCred = "anuncio";
  }
}

// botonFotoX / botonFotoY: dónde está el botón FOTO.
function botonFotoX() { return width * 0.85; }
// botonFotoY: la altura del botón FOTO.
function botonFotoY() { return height * 0.56; }

// medidasTarjeta: el tamaño de la credencial (siempre con la misma proporción, entra en cualquier pantalla)
function medidasTarjeta() {
  let w = elMenor(width * 0.6, 860);
  let h = elMenor(w * 0.58, height * 0.6);
  w = h / 0.58;
  return { w: w, h: h, y: height * 0.55 };
}

// suave: hace que un movimiento arranque y frene despacio (t va de 0 a 1)
function suave(t) {
  t = limitar(t, 0, 1);
  return t * t * (3 - 2 * t);
}

// interaccionCredencial: la lógica de la credencial, según la fase:
// anuncio (3 segundos) → foto (mantener la mano sobre FOTO) → cuenta (3, 2, 1 y se saca) → lista.
function interaccionCredencial() {
  cuadrosCred = cuadrosCred + 1;
  if (flashFoto > 0) {
    flashFoto = flashFoto - 1;
  }
  // Mientras te sacás la foto, la credencial se corre a la izquierda para dejar lugar al botón
  let destino = width / 2;
  if (faseCred == "foto" || faseCred == "cuenta") {
    destino = width * 0.42;
  }
  tarjetaX = lerp(tarjetaX, destino, 0.08);

  if (faseCred == "anuncio") {
    if (cuadrosCred > CUADROS_POR_SEGUNDO * 3) {
      faseCred = "foto";
      cuadrosCred = 0;
    }
  } else if (faseCred == "foto") {
    // Mantené la mano sobre FOTO: el aro se llena. Si la sacás, se vacía de a poco.
    let encima = cuadrosCred > 40 && manoEncima(botonFotoX(), botonFotoY(), TAM_BOTON_FOTO / 2);
    if (encima && poses.length > 0) {
      progresoFoto = elMenor(1, progresoFoto + 1 / CUADROS_PARA_FOTO);
    } else {
      progresoFoto = elMayor(0, progresoFoto - 0.04);
    }
    if (progresoFoto >= 1) {
      faseCred = "cuenta";
      cuadrosCred = 0;
      progresoFoto = 0;
    }
  } else if (faseCred == "cuenta") {
    if (cuadrosCred == 1 || cuadrosCred == 61 || cuadrosCred == 121) {
      sonido("boton");
    }
    // A los 3 segundos se saca la foto (en este momento en el canvas está solo la cámara)
    if (cuadrosCred >= 180 && poses.length > 0) {
      sacarFotoCara();
      flashFoto = 22;
      sonido("foto");
      faseCred = "lista";
      cuadrosCred = 0;
    }
  } else if (faseCred == "lista") {
    if (cuadrosCred == 45) {
      sonido("desbloqueo"); // el sello de ACCESO AUTORIZADO
    }
    if (cuadrosCred > CUADROS_POR_SEGUNDO * 4.5) {
      iniciarTransicion(width / 2, height / 2, "pregunta5");
    }
  }
}

// dibujarCredencial: la pantalla de la credencial: el título, la tarjeta, el botón FOTO y el flash.
function dibujarCredencial() {
  push();
  // Antes de tapar la cámara, se copia tu cara para la vista previa de la foto
  if (faseCred == "foto" || faseCred == "cuenta") {
    copiarVistaCara();
  }
  dibujarFondoEstrellado();

  if (faseCred == "lista") {
    dibujarTitulo("CREDENCIAL OBTENIDA", height * 0.1, "Nuevo rango: " + RANGO_NUEVO + " · La misión 05 está por comenzar", 60);
  } else {
    dibujarTitulo("NUEVO RANGO ALCANZADO", height * 0.1, "Superaste las misiones anteriores · Obtené tu credencial espacial", 60);
  }

  // La credencial (al principio entra desde abajo)
  let m = medidasTarjeta();
  let entrada = 0;
  if (faseCred == "anuncio") {
    entrada = 1 - suave(cuadrosCred / 45);
  }
  dibujarTarjeta(tarjetaX, m.y + entrada * height * 0.7, m.w, m.h);

  if (faseCred == "foto") {
    dibujarBotonCirculo(botonFotoX(), botonFotoY(), TAM_BOTON_FOTO, "FOTO", {
      color: UI_AZUL,
      encima: manoEncima(botonFotoX(), botonFotoY(), TAM_BOTON_FOTO / 2),
      progreso: progresoFoto,
      tamTexto: 30,
      icono: "camara",
      texto2: ""
    });
    dibujarInstruccion("Mirá a la cámara y mantené la mano sobre FOTO", height * 0.93, UI_VIOLETA);
    dibujarManos();
  } else if (faseCred == "cuenta") {
    dibujarInstruccion("¡Quedate quieto y mirá a la cámara!", height * 0.93, UI_ROJO);
  } else if (faseCred == "anuncio" && cuadrosCred > 60) {
    dibujarInstruccion("Preparate para tu foto de astronauta", height * 0.93, UI_VIOLETA);
  }

  // Flash de la cámara
  if (flashFoto > 0) {
    noStroke();
    fill(255, 255, 255, 200 * flashFoto / 22);
    rect(0, 0, width, height);
  }
  pop();
}

// Colores de la credencial: el fondo va de azul (izquierda) a violeta y a bordó (derecha),
// y el borde de azul a violeta y a rojo.
const CRED_FONDO = [[16, 24, 64], [36, 20, 74], [64, 16, 52]];
const CRED_BORDE = [[110, 180, 255], [170, 120, 255], [255, 80, 100]];

// colorDegrade: el color en la posición t (de 0 a 1) de una lista de 3 colores (mezclados con lerp).
function colorDegrade(colores, t) {
  let a = colores[0];
  let b = colores[1];
  let mezcla = t / 0.5;
  if (t > 0.5) {
    a = colores[1];
    b = colores[2];
    mezcla = (t - 0.5) / 0.5;
  }
  return [lerp(a[0], b[0], mezcla), lerp(a[1], b[1], mezcla), lerp(a[2], b[2], mezcla)];
}

// dibujarTarjeta: la credencial de la Agencia de Exploración Interestelar (una agencia inventada).
function dibujarTarjeta(cx, cy, w, h) {
  let x0 = cx - w / 2;
  let y0 = cy - h / 2;
  let c = h * 0.08;   // cuánto se cortan las esquinas
  push();

  // Brillo violeta alrededor
  noFill();
  stroke(150, 140, 255, 50);
  strokeWeight(14);
  formaChaflan(cx, cy, w, h, c);

  // Fondo con degradé: franjitas verticales de 4 píxeles, cada una de un color un poco distinto.
  // Cerca de las esquinas cortadas, la franja empieza más abajo y termina más arriba.
  // También pasa un brillo blanco de izquierda a derecha (el reflejo del plástico).
  let pasada = x0 - w * 0.3 + ((cuadroAnimacion * 5) % (w * 1.8));
  noStroke();
  for (let x = x0; x < x0 + w; x = x + 4) {
    let corte = elMayor(0, c - (x - x0));
    corte = elMayor(corte, c - (x0 + w - x));
    let col = colorDegrade(CRED_FONDO, (x - x0) / w);
    fill(col[0], col[1], col[2], 247);
    rect(x, y0 + corte, 4, h - corte * 2);
    let reflejo = 1 - sinSigno(x - pasada) / 90;
    if (reflejo > 0) {
      fill(200, 220, 255, 26 * reflejo);
      rect(x, y0 + corte, 4, h - corte * 2);
    }
    // Una línea finita cada 24 píxeles (la cuadrícula holográfica)
    if ((x - x0) % 24 == 0) {
      fill(120, 160, 255, 18);
      rect(x, y0 + corte, 1, h - corte * 2);
    }
  }

  // Borde con degradé: el de arriba y el de abajo en pedacitos de colores; los costados de un color
  strokeWeight(3);
  for (let k = 0; k < 40; k++) {
    let t1 = k / 40;
    let t2 = (k + 1) / 40;
    let col = colorDegrade(CRED_BORDE, t1);
    stroke(col[0], col[1], col[2]);
    let xa = lerp(x0 + c, x0 + w - c, t1);
    let xb = lerp(x0 + c, x0 + w - c, t2);
    line(xa, y0, xb, y0);
    line(xa, y0 + h, xb, y0 + h);
  }
  stroke(CRED_BORDE[0][0], CRED_BORDE[0][1], CRED_BORDE[0][2]);
  line(x0, y0 + c, x0, y0 + h - c);
  line(x0, y0 + c, x0 + c, y0);
  line(x0, y0 + h - c, x0 + c, y0 + h);
  stroke(CRED_BORDE[2][0], CRED_BORDE[2][1], CRED_BORDE[2][2]);
  line(x0 + w, y0 + c, x0 + w, y0 + h - c);
  line(x0 + w, y0 + c, x0 + w - c, y0);
  line(x0 + w, y0 + h - c, x0 + w - c, y0 + h);

  // Encabezado: logo y nombre de la agencia
  let lx = x0 + w * 0.085;
  let ly = y0 + h * 0.125;
  let lr = h * 0.06;
  noFill();
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
  strokeWeight(2);
  circle(lx, ly, lr * 2);
  push();
  translate(lx, ly);
  rotate(-23);
  stroke(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2]);
  ellipse(0, 0, lr * 3, lr * 1.1);
  noStroke();
  fill(255);
  rotate(23);
  dibujarEstrella5(lr * 0.5, lr * 0.22);
  pop();

  noStroke();
  textAlign(LEFT, CENTER);
  fill(255);
  textSize(h * 0.046);
  text("AGENCIA DE EXPLORACIÓN INTERESTELAR", x0 + w * 0.16, y0 + h * 0.1);
  fill(150, 190, 255);
  textSize(h * 0.032);
  text("CREDENCIAL OFICIAL DE ASTRONAUTA", x0 + w * 0.16, y0 + h * 0.16);
  textAlign(RIGHT, CENTER);
  fill(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
  text("ACCESO · NIVEL 05", x0 + w * 0.95, y0 + h * 0.1);
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 120);
  strokeWeight(1);
  line(x0 + w * 0.05, y0 + h * 0.22, x0 + w * 0.95, y0 + h * 0.22);

  // Foto del titular
  let fx = x0 + w * 0.24;
  let fy = y0 + h * 0.58;
  dibujarFotoTarjeta(fx, fy, h * 0.5, colorDegrade(CRED_FONDO, 0.24));
  noStroke();
  textAlign(CENTER, CENTER);
  fill(150, 190, 255);
  textSize(h * 0.028);
  text("FOTO DEL TITULAR", fx, y0 + h * 0.91);

  // Datos: una lista de pares [nombre del dato, valor]
  let rango = "PENDIENTE DE FOTO";
  if (faseCred == "lista") {
    rango = RANGO_NUEVO;
  }
  let campos = [
    ["TITULAR", "ASTRONAUTA"],
    ["RANGO", rango],
    ["N.º DE IDENTIFICACIÓN", idAstronauta],
    ["MISIONES APROBADAS", "01 · 02 · 03 · 04"],
    ["DESTINO", "MARTE · SECTOR 05"]
  ];
  let xc = x0 + w * 0.46;
  for (let k = 0; k < campos.length; k++) {
    let yy = y0 + h * (0.29 + k * 0.125);
    textAlign(LEFT, TOP);
    fill(140, 175, 240);
    textSize(h * 0.028);
    text(campos[k][0], xc, yy);
    if (k == 1 && faseCred == "lista") {
      fill(225, 200, 255);
    } else if (k == 1) {
      fill(150, 155, 180);
    } else {
      fill(255);
    }
    textSize(h * 0.05);
    text(campos[k][1], xc, yy + h * 0.035);
  }

  // Código de barras al costado
  stroke(200, 210, 240, 150);
  for (let k = 0; k < 36; k++) {
    strokeWeight((k * 7) % 3 + 1);
    let yb = y0 + h * 0.3 + k * h * 0.014;
    line(x0 + w * 0.885, yb, x0 + w * 0.93, yb);
  }

  // Sello de ACCESO AUTORIZADO (cae sobre la credencial cuando ya tiene la foto)
  if (faseCred == "lista" && cuadrosCred > 30) {
    let t = suave((cuadrosCred - 30) / 15);
    push();
    translate(x0 + w * 0.76, y0 + h * 0.6);
    rotate(-9);
    scale(lerp(2.2, 1, t));
    let a = 230 * t;
    rectMode(CENTER);
    noFill();
    stroke(255, 80, 100, a);
    strokeWeight(3);
    rect(0, 0, w * 0.34, h * 0.11, 6);
    rect(0, 0, w * 0.34 - 10, h * 0.11 - 10, 4);
    noStroke();
    fill(255, 80, 100, a);
    textAlign(CENTER, CENTER);
    textSize(h * 0.045);
    text("ACCESO AUTORIZADO", 0, 1);
    pop();
  }
  pop();
}

// dibujarFotoTarjeta: el lugar de la foto: vacío, con la cámara en vivo, o con tu foto ya sacada.
// colorFondo es el color de la credencial alrededor de la foto (para el aro que la hace redonda).
function dibujarFotoTarjeta(x, y, d, colorFondo) {
  push();
  noStroke();
  fill(6, 8, 24);
  circle(x, y, d);

  if (faseCred == "lista" && hayFoto) {
    dibujarFotoRedonda(caraFoto, x, y, d, colorFondo);
  } else if (faseCred == "foto" || faseCred == "cuenta") {
    // Vista previa en vivo: exactamente el mismo recorte que va a tener la foto
    if (poses.length > 0) {
      image(vistaCara, x - d / 2, y - d / 2, d, d);
      // La línea que escanea de arriba a abajo
      let ys = y - d / 2 + ((cuadroAnimacion * 3) % d);
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 120);
      strokeWeight(2);
      line(x - d / 2, ys, x + d / 2, ys);
      // El aro que tapa las esquinas (la vista previa también se ve redonda)
      noFill();
      stroke(colorFondo[0], colorFondo[1], colorFondo[2]);
      strokeWeight(d * 0.22);
      circle(x, y, d + d * 0.22);
    } else {
      noStroke();
      fill(150, 170, 230);
      textAlign(CENTER, CENTER);
      textSize(d * 0.07);
      text("Ponete frente", x, y - d * 0.05);
      text("a la cámara", x, y + d * 0.05);
    }
  } else {
    // Silueta vacía: la cabeza y los hombros
    noStroke();
    fill(40, 48, 92);
    circle(x, y - d * 0.1, d * 0.34);
    arc(x, y + d * 0.42, d * 0.75, d * 0.6, 180, 360);
  }

  // Aro luminoso y aro punteado que gira
  noFill();
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 60);
  strokeWeight(9);
  circle(x, y, d);
  stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 230);
  strokeWeight(3);
  circle(x, y, d);
  push();
  translate(x, y);
  rotate(cuadroAnimacion * 0.57);
  stroke(UI_VIOLETA[0], UI_VIOLETA[1], UI_VIOLETA[2], 150);
  strokeWeight(1.5);
  circuloPunteado(0, 0, d + 18, 5, 9);
  pop();

  // Cuenta regresiva arriba de la vista previa (no sale en la foto: la foto se saca antes de dibujar)
  if (faseCred == "cuenta") {
    let n = 3 - parteEntera(cuadrosCred / 60);
    if (n >= 1) {
      textAlign(CENTER, CENTER);
      fill(255);
      stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2], 90);
      strokeWeight(12);
      textSize(d * 0.45);
      text(n, x, y);
    }
  }
  if (flashFoto > 0) {
    noStroke();
    fill(255, 255, 255, 255 * flashFoto / 22);
    circle(x, y, d);
  }
  pop();
}

// La vista previa de la foto: tu cara en vivo (se copia en cada cuadro)
let vistaCara;

// copiarVistaCara: copia con get() el mismo cuadrado que después va a ser la foto (centrado en tu nariz).
// La posición se suaviza con lerp para que la vista previa no tiemble.
function copiarVistaCara() {
  if (poses.length == 0) {
    hayCaraSuave = false;
    return;
  }
  let nariz = obtenerPunto(0, "nose");
  let tam = tamFotoCara();
  if (hayCaraSuave == false) {
    caraSuave = { x: nariz.x, y: nariz.y, tam: tam };
    hayCaraSuave = true;
  } else {
    caraSuave.x = lerp(caraSuave.x, nariz.x, 0.3);
    caraSuave.y = lerp(caraSuave.y, nariz.y, 0.3);
    caraSuave.tam = lerp(caraSuave.tam, tam, 0.3);
  }
  vistaCara = get(caraSuave.x - caraSuave.tam / 2, caraSuave.y - caraSuave.tam / 2, caraSuave.tam, caraSuave.tam);
}

// interaccionPregunta5: tocá el botón ¡MÁS LISTO QUE NUNCA! con la mano y empieza el viaje.
function interaccionPregunta5() {
  cuadrosEspera = cuadrosEspera + 1;
  if (poses.length > 0) {
    let mano = manoMasCercana(botonListoX(), botonListoY());
    if (dist(mano.x, mano.y, botonListoX(), botonListoY()) < TAM_BOTON_LISTO / 2 + RADIO_MANO) {
      sonido("boton");
      if (hayFoto == false) {
        sacarFotoCara(); // solo si llegaste sin foto (por ejemplo, si la cámara no te vio en la credencial)
      }
      cuadrosEspera = 0;
      cuadrosViaje = 0;
      estado = "viaje";
    }
  }
}

// dibujarPregunta5: la pregunta "¿ESTÁS LISTO PARA COMBATIR?" con un solo botón: MÁS QUE LISTO.
function dibujarPregunta5() {
  push();
  dibujarFondoEstrellado();

  noStroke();
  textAlign(CENTER, CENTER);
  fill(175, 200, 255);
  textSize(elMenor(30, width * 0.025));
  text("Ahora que ya tenés conocimiento espacial,", width / 2, height * 0.2);
  dibujarTitulo("¿ESTÁS LISTO PARA COMBATIR?", height * 0.31, "", 56);

  // El botón aparece junto con la pregunta
  dibujarBotonCirculo(botonListoX(), botonListoY(), TAM_BOTON_LISTO, "¡MÁS LISTO", {
    color: UI_VERDE,
    encima: manoEncima(botonListoX(), botonListoY(), TAM_BOTON_LISTO / 2),
    progreso: 0,
    tamTexto: 26,
    icono: "",
    texto2: "QUE NUNCA!"
  });
  dibujarInstruccion("Tocá el botón con la mano", height * 0.9, UI_VIOLETA);

  dibujarManos();
  pop();
}

// interaccionViaje: cuenta el tiempo de la animación y después empieza el nivel 5.
function interaccionViaje() {
  cuadrosViaje = cuadrosViaje + 1;
  if (cuadrosViaje >= DURACION_VIAJE) {
    estado = "nivel5";
  }
}

// dibujarViaje: la Tierra, Marte que se agranda y el cohete que viaja de uno al otro.
function dibujarViaje() {
  push();
  let t = cuadrosViaje / DURACION_VIAJE;   // de 0 (empieza) a 1 (llega)

  // El espacio se corre hacia la izquierda, para que parezca que viajás rápido:
  // se dibuja dos veces, una al lado de la otra, y las dos se van corriendo
  let corrimiento = (t * 1.5 * width) % width;
  image(gifFondoEspacio, -corrimiento, 0, width, height);
  image(gifFondoEspacio, width - corrimiento, 0, width, height);

  // La Tierra, abajo a la izquierda, que se va achicando
  let tamTierra = lerp(220, 60, t);
  image(gifTierra, width * 0.1 - tamTierra * 0.75, height * 0.85 - tamTierra * 0.75, tamTierra * 1.5, tamTierra * 1.5);

  // Marte, arriba a la derecha, que se va agrandando
  let tamMarte = lerp(60, 420, t * t);
  image(gifMarte, width * 0.85 - tamMarte * 0.65, height * 0.25 - tamMarte * 0.65, tamMarte * 1.3, tamMarte * 1.3);

  // El cohete va de la Tierra hacia Marte
  let xIni = width * 0.18;
  let yIni = height * 0.75;
  let xFin = width * 0.7;
  let yFin = height * 0.35;
  let x = lerp(xIni, xFin, t);
  let y = lerp(yIni, yFin, t);
  // Va en diagonal hacia arriba a la derecha: girado 65 grados
  dibujarCohete(x, y, 65, 1.3);

  dibujarTitulo("RUMBO A MARTE", 70, "Credencial verificada · Misión 05", 60);
  pop();
}

// Posición del cohete en la misión 5 (arriba, en el medio)
// coheteX: el cohete está en el medio de la pantalla.
function coheteX() { return width / 2; }
// coheteY: la altura del cohete.
function coheteY() { return height * 0.2; }

// reiniciarEscotillas: deja todas las escotillas vacías y cerradas, y borra los disparos.
function reiniciarEscotillas() {
  for (let i = 0; i < CANT_ESCOTILLAS; i++) {
    escEstado[i] = "vacia";
    escCuadros[i] = 0;
    escDuracion[i] = 0;
    escCara[i] = 0;
    escTapa[i] = 0;
    escDedos[i] = [false, false];
  }
  cuadrosProximoAlien = 90; // el primero sale al segundo y medio
  disparos = [];
  avisosVida = [];
}

// escX / escY: dónde está la escotilla i (ESCOTILLAS_X y ESCOTILLAS_Y van de 0 a 1).
function escX(i) { return width * ESCOTILLAS_X[i]; }
// escY: la altura de la escotilla i.
function escY(i) { return height * ESCOTILLAS_Y[i]; }
// escTam: las escotillas de abajo son un poco más grandes (están "más cerca")
function escTam(i) { return elMenor(width * 0.13, 180) * (0.85 + (ESCOTILLAS_Y[i] - 0.5) * 0.7); }
// tamCabeza: el tamaño de la cabeza del alien (depende del tamaño de su escotilla).
function tamCabeza(i) { return escTam(i) * 0.62; }
// radioGolpe: qué tan cerca tiene que estar el guante para dispararle al alien.
function radioGolpe(i) { return tamCabeza(i) * 0.6 + 35; }

// asomado: cuánto sacó la cabeza el alien (0 = adentro, 1 = afuera)
function asomado(i) {
  let e = escEstado[i];
  let c = escCuadros[i];
  if (e == "sube") {
    return suave(c / CUADROS_SUBE);
  }
  if (e == "burla" || e == "golpe") {
    return 1;
  }
  if (e == "cae") {
    return 1 - suave(c / CUADROS_CAE);
  }
  if (e == "baja") {
    return 1 - suave(c / CUADROS_BAJA);
  }
  return 0;
}
// cabezaX: la cabeza del alien está en el medio de su escotilla.
function cabezaX(i) { return escX(i); }
// cabezaY: la altura de la cabeza: más abajo cuando está adentro, más arriba cuando se asoma.
function cabezaY(i) {
  let t = tamCabeza(i);
  return escY(i) + t * 1.05 - asomado(i) * t * 1.4;
}
// La cabeza cuando ya terminó de asomarse
function cabezaYArriba(i) {
  return escY(i) - tamCabeza(i) * 0.35;
}

// dificultad: de 0 a 1 según cuántos aliens derrotaste
function dificultad() {
  return limitar(aliensMatados / ALIENS_PARA_GANAR, 0, 1);
}

// caraActual: la cara de burla va cambiando cada casi un segundo
function caraActual(i) {
  return (escCara[i] + parteEntera(escCuadros[i] / 55)) % 4;
}

// dedosActuales: el centro de cada guante: un poco más arriba de la muñeca, donde están los dedos.
// Devuelve una lista con dos objetos {lado, x, y}: lado 0 = guante izquierdo, lado 1 = derecho.
function dedosActuales() {
  let lista = [];
  if (poses.length == 0) {
    return lista;
  }
  let munecas = ["left_wrist", "right_wrist"];
  let hi = obtenerPunto(0, "left_shoulder");
  let hd = obtenerPunto(0, "right_shoulder");
  let tam = limitar(dist(hi.x, hi.y, hd.x, hd.y) / 230, 0.55, 1.3);
  for (let lado = 0; lado < 2; lado++) {
    let m = obtenerPunto(0, munecas[lado]);
    // Los dedos del guante apuntan para arriba: el centro está 28 píxeles más arriba de la muñeca
    lista.push({ lado: lado, x: m.x, y: m.y - 28 * tam });
  }
  return lista;
}

// cambiarEscotilla: pone la escotilla i en un estado nuevo y empieza a contar desde 0.
function cambiarEscotilla(i, nuevo) {
  escEstado[i] = nuevo;
  escCuadros[i] = 0;
}

// aliensVisibles: cuántos aliens están asomados ahora.
function aliensVisibles() {
  let n = 0;
  for (let i = 0; i < CANT_ESCOTILLAS; i++) {
    if (escEstado[i] == "sube" || escEstado[i] == "burla") {
      n = n + 1;
    }
  }
  return n;
}

// asomarAlien: elige una escotilla vacía al azar y hace salir un alien.
function asomarAlien() {
  let libres = [];
  for (let i = 0; i < CANT_ESCOTILLAS; i++) {
    if (escEstado[i] == "vacia" && escTapa[i] < 0.05) {
      libres.push(i);
    }
  }
  if (libres.length == 0) {
    return;
  }
  let i = libres[parteEntera(random(libres.length))];   // una escotilla libre al azar
  cambiarEscotilla(i, "sube");
  escDuracion[i] = parteEntera(lerp(150, 65, dificultad()) * random(0.85, 1.15));
  escCara[i] = parteEntera(random(4));
  // Los dedos que YA están donde aparece el alien no cuentan: tienen que salir y volver a entrar
  escDedos[i] = [false, false];
  for (let d of dedosActuales()) {
    escDedos[i][d.lado] = dist(d.x, d.y, cabezaX(i), cabezaYArriba(i)) < radioGolpe(i);
  }
}

// dispararAlien: le pega el disparo al alien i, suma uno y el cohete gira para apuntarle.
function dispararAlien(i) {
  cambiarEscotilla(i, "golpe");
  aliensMatados = aliensMatados + 1;
  // El cohete apunta hacia el alien: si está a la izquierda gira hacia la izquierda (240°),
  // si está justo abajo apunta abajo (180°) y si está a la derecha gira a la derecha (120°)
  anguloCohete = map(cabezaX(i) - coheteX(), -width / 2, width / 2, 240, 120);
  disparos.push({ x: cabezaX(i), y: cabezaY(i), t: 12 });
  sonido("laser");
  sonido("alien");
}

// interaccionNivel5: hace salir aliens, revisa los toques nuevos y avanza las animaciones.
function interaccionNivel5() {
  cuadrosNivel5 = cuadrosNivel5 + 1;
  let terminado = aliensMatados >= ALIENS_PARA_GANAR || vidas <= 0 || segundosNivel5 <= 0;

  // El reloj: cada 60 cuadros (1 segundo) le resta 1, mientras la misión no terminó
  if (!terminado && cuadrosNivel5 % CUADROS_POR_SEGUNDO == 0) {
    segundosNivel5 = segundosNivel5 - 1;
  }

  // Los disparos y los "-1" duran un rato: se les resta 1 y se quedan solo los que siguen vivos
  let disparosVivos = [];
  for (let d of disparos) {
    d.t = d.t - 1;
    if (d.t > 0) {
      disparosVivos.push(d);
    }
  }
  disparos = disparosVivos;
  let avisosVivos = [];
  for (let a of avisosVida) {
    a.t = a.t - 1;
    if (a.t > 0) {
      avisosVivos.push(a);
    }
  }
  avisosVida = avisosVivos;

  let dedos = dedosActuales();
  for (let i = 0; i < CANT_ESCOTILLAS; i++) {
    // La tapa se abre si hay alien y se cierra si no
    let tapaDestino = 1;
    if (escEstado[i] == "vacia") {
      tapaDestino = 0;
    }
    escTapa[i] = lerp(escTapa[i], tapaDestino, 0.25);

    escCuadros[i] = escCuadros[i] + 1;
    let e = escEstado[i];
    if (terminado && (e == "sube" || e == "burla")) {
      cambiarEscotilla(i, "baja"); // al terminar, se esconden todos (sin quitar vidas)
    } else if (e == "sube" && escCuadros[i] >= CUADROS_SUBE) {
      cambiarEscotilla(i, "burla");
    } else if (e == "burla" && escCuadros[i] >= escDuracion[i]) {
      // Se escapó: perdés una vida
      cambiarEscotilla(i, "baja");
      vidas = vidas - 1;
      avisosVida.push({ x: escX(i), y: escY(i) - tamCabeza(i), t: 60 });
      sonido("risa");
    } else if (e == "golpe" && escCuadros[i] >= CUADROS_GOLPE) {
      cambiarEscotilla(i, "cae");
    } else if ((e == "cae" && escCuadros[i] >= CUADROS_CAE) || (e == "baja" && escCuadros[i] >= CUADROS_BAJA)) {
      cambiarEscotilla(i, "vacia");
    }

    // ¿Le dispararon? Solo con un toque NUEVO: el dedo estaba afuera del alien y ahora está adentro
    e = escEstado[i];
    let golpeable = !terminado && (e == "burla" || (e == "sube" && escCuadros[i] > CUADROS_SUBE / 2));
    // Mientras sube se mide contra donde va a quedar la cabeza: así, si un alien aparece abajo
    // de un guante quieto, no cuenta como toque (la cabeza "entra" en el guante, no al revés)
    let yCabeza = cabezaY(i);
    if (e == "sube") {
      yCabeza = cabezaYArriba(i);
    }
    for (let d of dedos) {
      let adentro = dist(d.x, d.y, cabezaX(i), yCabeza) < radioGolpe(i);
      if (golpeable && adentro && escDedos[i][d.lado] == false) {
        dispararAlien(i);
        golpeable = false;
      }
      escDedos[i][d.lado] = adentro;
    }
  }

  // Cada tanto sale un alien nuevo (más seguido y hasta 3 a la vez a medida que avanzás)
  if (!terminado) {
    cuadrosProximoAlien = cuadrosProximoAlien - 1;
    if (cuadrosProximoAlien <= 0) {
      let maximo = elMenor(3, 1 + parteEntera(dificultad() * 3));
      if (aliensVisibles() < maximo) {
        asomarAlien();
      }
      cuadrosProximoAlien = parteEntera(lerp(80, 28, dificultad()) * random(0.7, 1.3));
    }
  }
}

// dibujarAlien: el GIF del alien de la escotilla i, según su estado (se asoma, se burla, se ríe o se muere).
function dibujarAlien(i) {
  let e = escEstado[i];
  let c = escCuadros[i];
  let t = tamCabeza(i);

  // Qué GIF le toca según lo que está haciendo, y en qué cuadro del GIF va
  let gif = gifAlienAsoma;
  let cuadro = parteEntera(cuadroAnimacion / 4) % 12;
  if (e == "burla") {
    gif = gifAliensBurla[caraActual(i)];   // 4 caras de burla distintas
    cuadro = parteEntera((c % 55) / 3);
  } else if (e == "baja") {
    gif = gifAlienRisa;                    // se escapa riéndose
    cuadro = parteEntera(c / 2);
  } else if (e == "golpe") {
    gif = gifAlienMuere;                   // le pegaron: ojos en cruz, se aplasta y le dan vueltas estrellitas
    cuadro = parteEntera(c / 2);
  } else if (e == "cae") {
    gif = gifAlienMuere;                   // se marea y se cae (la segunda parte del mismo GIF)
    cuadro = 12 + parteEntera(c / 2);
  }

  // El GIF mide 160 x 190 para una cabeza de 100; la cabeza está en el punto (80, 125) del GIF
  let esc = t / 100;
  dibujarGifEnCuadro(gif, cuadro, cabezaX(i) - 80 * esc, cabezaY(i) - 125 * esc, 160 * esc, 190 * esc);
}

// dibujarEscotilla: el agujero de la nave, su tapa y el alien que se asoma (todo con GIFs).
function dibujarEscotilla(i) {
  let x = escX(i);
  let y = escY(i);
  let w = escTam(i);
  let e = escEstado[i];

  // 1) La placa, el agujero y la tapa. El GIF tiene 11 cuadros: la tapa cerrada (0), abriéndose... y abierta (10)
  dibujarGifEnCuadro(gifEscotilla, escTapa[i] * 10 + 0.5, x - w * 0.7, y - w * 0.3, w * 1.9, w * 0.65);

  // 2) El alien: solo se ve lo que está arriba del agujero, así parece que sale de ahí.
  // Antes de dibujarlo se copia con get() lo que hay abajo del agujero, y después se vuelve a poner
  // encima: eso tapa la parte del alien que todavía está adentro de la nave.
  if (e != "vacia") {
    let abajo = get(x - w * 0.8, y, w * 1.6, w * 1.1);
    dibujarAlien(i);
    image(abajo, x - w * 0.8, y, w * 1.6, w * 1.1);
  }

  // 3) El borde de adelante, que brilla en violeta
  image(gifEscotillaBorde, x - w * 0.55, y - w * 0.25, w * 1.1, w * 0.5);

  // 4) Manitos agarradas del borde mientras se burla (menos en la cara que ya tiene las manos en la cabeza)
  let burlaConManos = e == "burla" && caraActual(i) == 3;
  if ((e == "sube" || e == "burla") && asomado(i) > 0.7 && !burlaConManos) {
    image(gifAlienManos, x - w * 0.45, y - w * 0.12, w * 0.9, w * 0.2);
  }
}

// dibujarNave: el piso de metal de la nave (un GIF), con paneles, remaches, el borde que brilla
// y luces que corren por el borde.
function dibujarNave() {
  image(gifNaveAliens, 0, 0, width, height);
}

// dibujarMarte: el GIF de Marte girando, chiquito arriba a la derecha
function dibujarMarte() {
  let mx = width * 0.8;
  let my = height * 0.27;
  let mr = elMenor(width, height) * 0.08;   // el radio de Marte
  image(gifMarte, mx - mr * 1.3, my - mr * 1.3, mr * 2.6, mr * 2.6);
}

// dibujarNivel5: la misión 5 (Marte): la nave con las escotillas, los aliens, los disparos,
// el cohete, los guantes con su mira, los paneles y los carteles de ganar o perder.
function dibujarNivel5() {
  push();
  dibujarFondoEstrellado();
  dibujarMarte();
  dibujarNave();
  for (let i = 0; i < CANT_ESCOTILLAS; i++) {
    dibujarEscotilla(i);
  }

  // Rayos del cohete al alien
  for (let d of disparos) {
    let a = d.t / 12;
    // El rayo sale de la punta del cohete: 114 unidades desde el centro, en la dirección del alien
    let largo = elMayor(1, dist(coheteX(), coheteY(), d.x, d.y));
    let nx = coheteX() + (d.x - coheteX()) / largo * 114 * TAM_COHETE5;
    let ny = coheteY() + (d.y - coheteY()) / largo * 114 * TAM_COHETE5;
    stroke(255, 80, 120, 80 * a);
    strokeWeight(24 * a + 4);
    line(nx, ny, d.x, d.y);
    stroke(255, 80, 120, 230 * a);
    strokeWeight(10 * a + 2);
    line(nx, ny, d.x, d.y);
    stroke(255, 240, 245, 255 * a);
    strokeWeight(3);
    line(nx, ny, d.x, d.y);
    noStroke();
    fill(255, 220, 230, 200 * a);
    circle(d.x, d.y, 70 * (1.2 - a));
  }

  // El cohete arriba, apuntando al último alien que tocaste
  dibujarCohete(coheteX(), coheteY(), anguloCohete, TAM_COHETE5);

  // Los "-1" cuando se escapa un alien
  for (let av of avisosVida) {
    let t = 1 - av.t / 60;
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255, 80, 100, 255 * (1 - t));
    text("-1", av.x, av.y - t * 60);
  }

  // Los guantes (un poco transparentes, para ver cómo reacciona el alien), con una mira roja
  // en el centro: ahí es donde dispara
  dibujarGuantes(150);
  for (let d of dedosActuales()) {
    noFill();
    stroke(255, 80, 100, 70);
    strokeWeight(9);
    circle(d.x, d.y, 30);
    stroke(255, 80, 100, 220);
    strokeWeight(3);
    circle(d.x, d.y, 30);
    line(d.x - 24, d.y, d.x - 10, d.y);
    line(d.x + 10, d.y, d.x + 24, d.y);
    line(d.x, d.y - 24, d.x, d.y - 10);
    line(d.x, d.y + 10, d.x, d.y + 24);
  }

  // Paneles: aliens derrotados y vidas
  dibujarPanel(30, 30, 270, 88, "ALIENS DERROTADOS", aliensMatados + " / " + ALIENS_PARA_GANAR, {
    color: UI_AZUL,
    progreso: aliensMatados / ALIENS_PARA_GANAR,
    tamValor: 32,
    vidasTotal: 0,
    vidasLlenas: 0
  });
  let anchoVidas = 60 + VIDAS_INICIALES * 34;
  dibujarPanel(width - 30 - anchoVidas, 30, anchoVidas, 88, "VIDAS", "", {
    color: UI_ROJO,
    progreso: -1,
    tamValor: 32,
    vidasTotal: VIDAS_INICIALES,
    vidasLlenas: vidas
  });
  // El tiempo, abajo de las vidas (se pone rojo en los últimos 5 segundos)
  let colorTiempo = UI_AZUL;
  if (segundosNivel5 <= 5) {
    colorTiempo = UI_ROJO;
  }
  dibujarPanel(width - 30 - 200, 130, 200, 88, "TIEMPO", segundosNivel5 + " s", {
    color: colorTiempo,
    progreso: segundosNivel5 / TIEMPO_NIVEL5,
    tamValor: 32,
    vidasTotal: 0,
    vidasLlenas: 0
  });

  let terminado = aliensMatados >= ALIENS_PARA_GANAR || vidas <= 0 || segundosNivel5 <= 0;
  if (!terminado && cuadrosNivel5 < CUADROS_POR_SEGUNDO * 6 && poses.length > 0) {
    dibujarInstruccion("Poné un guante sobre cada alien para dispararle", height - 50, UI_VIOLETA);
  }

  // Ganaste o perdiste
  if (aliensMatados >= ALIENS_PARA_GANAR) {
    dibujarCartel("¡DEFENDISTE MARTE!", "Volviendo al mapa...", UI_AZUL);
  } else if (vidas <= 0) {
    dibujarCartel("¡LOS ALIENS GANARON!", "Volviendo al mapa...", UI_ROJO);
  } else if (segundosNivel5 <= 0) {
    dibujarCartel("¡SE ACABÓ EL TIEMPO!", "Volviendo al mapa...", UI_ROJO);
  }
  pop();
}

// FIN DEL JUEGO: después de ganar la misión 5 aparece la copa de mejor astronauta
// y un botón para jugar de nuevo desde cero (con todos los planetas bloqueados otra vez).

// jugarDeNuevo: borra todo lo que ganaste (niveles, estrellas y la foto de la credencial) y vuelve al mapa.
function jugarDeNuevo() {
  nivelesDesbloqueados = 1;
  for (let i = 0; i < CANT_NIVELES; i++) {
    nivelesCompletos[i] = false;
  }
  planetaRecienAbierto = -1;
  hayFoto = false;
  volverAlMapa();
}


// interaccionFinJuego: a los 3 segundos aparece el botón JUGAR DE NUEVO; si lo tocás con la mano, empieza todo otra vez.
function interaccionFinJuego() {
  cuadrosEspera = cuadrosEspera + 1;
  if (cuadrosEspera == 20) {
    sonido("mision");
  }
  if (cuadrosEspera > CUADROS_POR_SEGUNDO * 3 && poses.length > 0) {
    let mano = manoMasCercana(botonVolverX(), botonVolverY());
    if (dist(mano.x, mano.y, botonVolverX(), botonVolverY()) < TAM_BOTON_SIG / 2 + RADIO_MANO) {
      sonido("elegir");
      jugarDeNuevo();
    }
  }
}


// dibujarCopa: el GIF de la copa dorada de mejor astronauta (con el halo que late y chispitas),
// centrada en (x, y). tam = 1 es el tamaño normal.
function dibujarCopa(x, y, tam) {
  // El GIF mide 350 x 360 y el centro de la copa está en el punto (175, 170)
  image(gifCopa, x - 175 * tam, y - 170 * tam, 350 * tam, 360 * tam);
}


// dibujarFinJuego: la pantalla final: título, la copa, el premio, los 5 planetas ganados y el botón JUGAR DE NUEVO.
function dibujarFinJuego() {
  push();
  dibujarEspacio(true);

  // Papelitos de colores que caen (un GIF que ocupa toda la pantalla)
  image(gifConfeti, 0, 0, width, height);

  dibujarTitulo("¡MISIÓN CUMPLIDA!", height * 0.12, "Completaste las 5 misiones del mapa", 60);

  // La copa
  dibujarCopa(width / 2, height * 0.46, height / 800);

  // El premio, en una tarjeta como las de las consignas
  dibujarTarjetaInfo(width / 2, height * 0.73, 520, 74, [255, 210, 80]);
  noStroke();
  textAlign(CENTER, CENTER);
  fill(255, 220, 120);
  textSize(15);
  text("PREMIO", width / 2, height * 0.73 - 18);
  fill(255);
  textSize(26);
  text("MEJOR ASTRONAUTA DE LA GALAXIA", width / 2, height * 0.73 + 10);

  // Los 5 planetas ganados, cada uno con su estrellita
  let tam = height * 0.08;
  for (let i = 0; i < CANT_NIVELES; i++) {
    let x = width / 2 + (i - 2) * tam * 1.4;
    let y = height * 0.87;
    // image dibuja desde la esquina: restamos la mitad del tamaño para que quede centrada en x, y
    image(imgPlanetas[i], x - tam * 0.65, y - tam * 0.65, tam * 1.3, tam * 1.3);
    dibujarEstrellita(x + tam * 0.4, y - tam * 0.4, 9, 255);
  }

  // Botón JUGAR DE NUEVO (aparece a los 3 segundos)
  if (cuadrosEspera > CUADROS_POR_SEGUNDO * 3) {
    dibujarBotonCirculo(botonVolverX(), botonVolverY(), TAM_BOTON_SIG, "JUGAR", {
      color: UI_AZUL,
      encima: manoEncima(botonVolverX(), botonVolverY(), TAM_BOTON_SIG / 2),
      progreso: 0,
      tamTexto: 22,
      icono: "",
      texto2: "DE NUEVO"
    });
  }

  dibujarManos();
  pop();
}


// MENÚ: el mapa de niveles

const CANT_NIVELES = 5;
const NOMBRES_NIVELES = ["COHETE", "ESTRELLAS", "CONSTELACIONES", "SEÑALES", "ALIENS"];
const ESTADO_DE_NIVEL = ["intro1", "intro2", "intro3", "intro4", "credencial"]; // la pantalla con la que empieza cada nivel

// Dónde está cada planeta (de 0 a 1, después se pasa al tamaño de la pantalla)
const MAPA_X = [0.12, 0.31, 0.5, 0.69, 0.88];
const MAPA_Y = [0.70, 0.42, 0.68, 0.40, 0.66];

let nivelesDesbloqueados = 1;                       // hasta qué nivel se puede jugar
let nivelesCompletos = [false, false, false, false, false];

let imgPlanetas = [];
let imgCandado;
let imgCoheteMapa;

// Elegir un planeta con la mano: hay que dejarla encima 1 segundo
const CUADROS_PARA_ELEGIR = 60;
let planetaApuntado = -1;     // el planeta que tiene una mano encima (-1 = ninguno)
let cuadrosSobrePlaneta = 0;

// Cartel de aviso abajo ("Completá la misión 1 primero", etc.)
let mensajeMenu = "";
let cuadrosMensaje = 0;

// Animación del candado cuando se desbloquea un planeta
let planetaRecienAbierto = -1;
let cuadrosApertura = 0;

// planetaX: la posición horizontal del planeta i en la pantalla.
function planetaX(i) {
  return width * MAPA_X[i];
}
// planetaY: la posición vertical del planeta i. Los planetas flotan un poco: suben y bajan cada uno a su ritmo.
function planetaY(i) {
  return height * MAPA_Y[i] + vaiven(0.019, i * 0.83 + 1) * 8;
}
// tamPlaneta: el tamaño de los planetas, según la pantalla.
function tamPlaneta() {
  return elMenor(width * 0.14, height * 0.25);
}

// estaBloqueado: true si el planeta i todavía tiene candado.
function estaBloqueado(i) {
  return i >= nivelesDesbloqueados;
}
// sePuedeJugar: true si el planeta i ya está desbloqueado.
function sePuedeJugar(i) {
  return estaBloqueado(i) == false;
}

// completarNivel: marca el nivel n (1 a 5) como completo y desbloquea el siguiente que exista.
function completarNivel(n) {
  nivelesCompletos[n - 1] = true;
  let siguiente = n + 1;
  if (siguiente <= CANT_NIVELES && siguiente > nivelesDesbloqueados) {
    nivelesDesbloqueados = siguiente;
    planetaRecienAbierto = siguiente - 1;
    cuadrosApertura = 0;
  }
}

// volverAlMapa: con una transición, deja los niveles en cero y muestra el mapa.
function volverAlMapa() {
  iniciarTransicion(width / 2, height / 2, "menu");
}

// avisar: muestra un cartel abajo del mapa durante 2 segundos.
function avisar(texto) {
  mensajeMenu = texto;
  cuadrosMensaje = CUADROS_POR_SEGUNDO * 2;
}

// tocarPlaneta: qué pasa cuando elegís el planeta i
function tocarPlaneta(i) {
  if (sePuedeJugar(i)) {
    sonido("elegir");
    iniciarTransicion(planetaX(i), planetaY(i), ESTADO_DE_NIVEL[i]);
  } else {
    sonido("bloqueado");
    avisar("Completá la misión " + i + " primero");
  }
}

// interaccionMenu: la lógica del mapa (qué planeta tiene la mano encima, el anillo que se llena, el candado).
function interaccionMenu() {
  if (cuadrosMensaje > 0) {
    cuadrosMensaje = cuadrosMensaje - 1;
  }

  // Animación del candado que se abre
  if (planetaRecienAbierto >= 0) {
    cuadrosApertura = cuadrosApertura + 1;
    if (cuadrosApertura == 15) {
      sonido("mision");
    }
    if (cuadrosApertura > 90) {
      planetaRecienAbierto = -1;
    }
  }

  // ¿Qué planeta tiene una mano encima?
  let apuntado = -1;
  if (poses.length > 0) {
    for (let i = 0; i < CANT_NIVELES; i++) {
      let mano = manoMasCercana(planetaX(i), planetaY(i));
      if (dist(mano.x, mano.y, planetaX(i), planetaY(i)) < tamPlaneta() / 2 + 20) {
        apuntado = i;
      }
    }
  }

  if (apuntado != planetaApuntado) {
    // La mano llegó a otro planeta (o salió): el anillo empieza de cero
    planetaApuntado = apuntado;
    cuadrosSobrePlaneta = 0;
    if (apuntado >= 0) {
      if (sePuedeJugar(apuntado)) {
        sonido("pop");
      } else {
        tocarPlaneta(apuntado); // avisa que está bloqueado
      }
    }
  } else if (apuntado >= 0 && sePuedeJugar(apuntado)) {
    cuadrosSobrePlaneta = cuadrosSobrePlaneta + 1;
    if (cuadrosSobrePlaneta == CUADROS_PARA_ELEGIR) {
      tocarPlaneta(apuntado);
    }
  }
}

// dibujarEstrellita: el GIF de una estrellita amarilla que titila, centrada en (x, y), de radio r.
// alfa = qué tan transparente es (255 = se ve entera, 0 = invisible).
function dibujarEstrellita(x, y, r, alfa) {
  push();
  tint(255, alfa);
  image(gifEstrellita, x - r * 1.25, y - r * 1.25, r * 2.5, r * 2.5);
  pop();
}

// Para las chispas del candado: 8 direcciones alrededor de un círculo (derecha, abajo-derecha, abajo...)
const CHISPAS_DX = [1, 0.71, 0, -0.71, -1, -0.71, 0, 0.71];
const CHISPAS_DY = [0, 0.71, 1, 0.71, 0, -0.71, -1, -0.71];

// dibujarMenu: dibuja el mapa con los planetas, el caminito, los candados y el cohete.
function dibujarMenu() {
  push();
  dibujarFondoEstrellado();

  let tam = tamPlaneta();

  // Caminito de puntos entre los planetas (amarillo si el nivel de la izquierda está completo)
  for (let i = 0; i < CANT_NIVELES - 1; i++) {
    for (let k = 1; k < 14; k++) {
      let t = k / 14;
      let x = lerp(planetaX(i), planetaX(i + 1), t);
      // 4 * t * (1 - t) vale 0 en las puntas y 1 en el medio: el caminito hace una curva hacia abajo
      let y = lerp(planetaY(i), planetaY(i + 1), t) + 4 * t * (1 - t) * 40;
      if (nivelesCompletos[i]) {
        fill(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
        circle(x, y, 9);
      } else {
        fill(255, 255, 255, 90);
        circle(x, y, 7);
      }
    }
  }

  // Planetas
  textAlign(CENTER, CENTER);
  for (let i = 0; i < CANT_NIVELES; i++) {
    let x = planetaX(i);
    let y = planetaY(i);

    // El próximo nivel para jugar tiene un halo que late
    if (sePuedeJugar(i) && !nivelesCompletos[i]) {
      noFill();
      let halo = tam * 1.2 + vaiven(0.064, 1) * 10;
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 50);
      strokeWeight(14);
      circle(x, y, halo); // el brillo: el mismo círculo grueso y transparente
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 170);
      strokeWeight(4);
      circle(x, y, halo);
      noStroke();
    }

    // El planeta (la imagen tiene un halo alrededor, por eso se dibuja más grande)
    // image dibuja desde la esquina: restamos la mitad del tamaño para que quede centrado en x, y
    push();
    if (estaBloqueado(i)) {
      tint(90, 90, 140);
    }
    image(imgPlanetas[i], x - tam * 0.725, y - tam * 0.725, tam * 1.45, tam * 1.45);
    pop(); // pop saca el tint, así no oscurece lo que viene después

    // Candado: en los bloqueados, o saliendo volando en el que se acaba de abrir
    if (estaBloqueado(i)) {
      image(imgCandado, x - tam * 0.25, y - tam * 0.25, tam * 0.5, tam * 0.5);
    } else if (i == planetaRecienAbierto && cuadrosApertura > 15 && cuadrosApertura < 75) {
      let t = (cuadrosApertura - 15) / 60;
      let tc = tam * 0.5 * (1 + t * 0.5); // el candado crece mientras sube
      push();
      tint(255, 255 * (1 - t));
      image(imgCandado, x - tc / 2, y - t * tam - tc / 2, tc, tc);
      pop();
      // Chispas que salen para afuera, en las 8 direcciones (y se van haciendo transparentes)
      for (let k = 0; k < 8; k++) {
        let distancia = tam * (0.4 + t * 0.6);
        dibujarEstrellita(x + CHISPAS_DX[k] * distancia, y + CHISPAS_DY[k] * distancia, 10, 255 * (1 - t));
      }
    }

    // Anillo que se llena mientras dejás la mano encima
    if (i == planetaApuntado && sePuedeJugar(i)) {
      noFill();
      // arc empieza arriba (-90°) y avanza hasta dar la vuelta entera (360°) cuando pasó 1 segundo
      let finArco = -90 + 360 * cuadrosSobrePlaneta / CUADROS_PARA_ELEGIR;
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 60);
      strokeWeight(18);
      arc(x, y, tam * 1.15, tam * 1.15, -90, finArco); // el brillo
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2]);
      strokeWeight(8);
      arc(x, y, tam * 1.15, tam * 1.15, -90, finArco);
      noStroke();
    }

    // Número del nivel, arriba del planeta (insignia oscura con borde luminoso)
    let colNum = UI_AZUL;
    if (estaBloqueado(i)) {
      colNum = [120, 128, 165]; // gris si tiene candado
    } else {
      noFill();
      stroke(UI_AZUL[0], UI_AZUL[1], UI_AZUL[2], 60);
      strokeWeight(10);
      circle(x, y - tam * 0.62, 46); // el brillo, solo si está desbloqueado
    }
    fill(8, 12, 38, 220);
    stroke(colNum[0], colNum[1], colNum[2]);
    strokeWeight(2.5);
    circle(x, y - tam * 0.62, 46);
    noStroke();
    if (estaBloqueado(i)) {
      fill(160);
    } else {
      fill(255);
    }
    textSize(22);
    text(i + 1, x, y - tam * 0.62);

    // Nombre del nivel, abajo
    fill(235, 240, 255);
    stroke(4, 6, 24, 200);
    strokeWeight(4);
    textSize(20);
    text(NOMBRES_NIVELES[i], x, y + tam * 0.66);
    noStroke();

    // Tres estrellitas si está completo
    if (nivelesCompletos[i]) {
      for (let k = -1; k <= 1; k++) {
        dibujarEstrellita(x + k * 28, y + tam * 0.66 + 34, 12, 255);
      }
    }
  }

  // El cohete, al lado del último planeta desbloqueado
  let ultimo = nivelesDesbloqueados - 1;
  push();
  translate(elMayor(tam * 0.4, planetaX(ultimo) - tam * 0.72), planetaY(ultimo) + tam * 0.1 + vaiven(0.051, 1) * 10);
  rotate(20);
  image(imgCoheteMapa, -tam * 0.375, -tam * 0.375, tam * 0.75, tam * 0.75); // centrado en el (0, 0) del translate
  pop();

  // Títulos
  dibujarTitulo("MAPA DE MISIONES", height * 0.1, "Dejá la mano sobre un planeta para elegirlo", 60);
  textAlign(CENTER, CENTER);

  // Cartel de aviso: entra desde abajo
  if (cuadrosMensaje > 0) {
    let subida = elMenor(1, (CUADROS_POR_SEGUNDO * 2 - cuadrosMensaje) / 10);
    let yCartel = height + 40 - subida * 120;
    noStroke();
    fill(8, 12, 38, 230);
    formaChaflan(width / 2, yCartel, 620, 70, 16);
    noFill();
    stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2], 60);
    strokeWeight(10);
    formaChaflan(width / 2, yCartel, 620, 70, 16); // el brillo
    stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2], 200);
    strokeWeight(2);
    formaChaflan(width / 2, yCartel, 620, 70, 16);
    noStroke();
    fill(255);
    textSize(24);
    text(mensajeMenu, width / 2, yCartel);
  }

  // Aviso de sonido: el navegador no deja sonar nada hasta que hagas clic o aprietes una tecla
  if (sonidoActivado == false && sonidoElegido == false) {
    noStroke();
    textAlign(CENTER, BOTTOM);
    fill(255, 255, 255, 200);
    textSize(18);
    text("Hacé clic en el parlante (arriba a la derecha) para activar el sonido", width / 2, height - 50);
  }

  // El botón del parlante, arriba a la derecha
  dibujarBotonSonido();

  dibujarManos();
  pop();
}


// TRANSICIONES: un círculo oscuro crece desde un punto hasta tapar todo, cambia la pantalla,
// y después la pantalla nueva aparece de a poco.

const TRANS_MITAD = 28;   // cuadros que tarda en cerrarse (y lo mismo en abrirse)
const TRANS_CARTEL = 90;  // cuadros que se queda el cartel de la misión en el medio (1,5 segundos)
let transActiva = false;
let transConCartel = false;  // true si en el medio se muestra el cartel (entre el mapa y las misiones)
let transCuadros = 0;
let transX = 0;
let transY = 0;
let transProximo = "";  // la pantalla que se muestra cuando la transición tapa todo

// iniciarTransicion: empieza la animación de cambio de pantalla.
// x, y = desde dónde crece el círculo; proximo = la pantalla (estado) que se va a mostrar.
function iniciarTransicion(x, y, proximo) {
  if (!transActiva) {
    transActiva = true;
    transCuadros = 0;
    transX = x;
    transY = y;
    transProximo = proximo;
    // El cartel aparece cuando se va al mapa, a una misión o a la copa final
    transConCartel = proximo == "menu" || proximo == "finJuego";
    for (let i = 0; i < CANT_NIVELES; i++) {
      if (ESTADO_DE_NIVEL[i] == proximo) {
        transConCartel = true;
      }
    }
  }
}

// duracionCartel: cuántos cuadros dura el cartel del medio (0 si esta transición no tiene cartel).
function duracionCartel() {
  if (transConCartel) {
    return TRANS_CARTEL;
  }
  return 0;
}

// actualizarTransicion: cuenta los cuadros de la transición. A la mitad (cuando todo está tapado)
// cambia de pantalla, y al final la termina.
function actualizarTransicion() {
  if (transActiva) {
    transCuadros = transCuadros + 1;
    if (transCuadros == TRANS_MITAD) {
      if (transProximo == "pregunta5") {
        // De la credencial a la pregunta: no se borra nada (así se guarda la foto)
        cuadrosEspera = 0;
        estado = "pregunta5";
      } else {
        // Al resto de las pantallas se llega con los niveles en cero
        reiniciarNiveles();
        estado = transProximo;
        if (estado == "credencial") {
          empezarCredencial();
        }
      }
    }
    if (transCuadros >= TRANS_MITAD * 2 + duracionCartel()) {
      transActiva = false;
    }
  }
}

// dibujarCartelMision: la pantalla del medio de la transición, como un menú principal: el espacio,
// el planeta y el nombre de la misión que empieza (o del mapa), y el cohete que cruza la pantalla.
// c = cuántos cuadros pasaron desde que apareció el cartel.
function dibujarCartelMision(c) {
  push();
  dibujarEspacio(true);
  noStroke();
  fill(20, 12, 69, 110);
  rect(0, 0, width, height);

  // ¿Qué viene? El mapa, una misión o la copa final
  let titulo = "MAPA DE MISIONES";
  let sub = "Elegí tu próxima misión";
  let planeta = -1;
  for (let i = 0; i < CANT_NIVELES; i++) {
    if (ESTADO_DE_NIVEL[i] == transProximo) {
      titulo = "MISIÓN 0" + (i + 1);
      sub = NOMBRES_NIVELES[i];
      planeta = i;
    }
  }
  if (transProximo == "finJuego") {
    titulo = "¡LO LOGRASTE!";
    sub = "Ganaste las 5 misiones";
  }

  // El planeta de la misión, que crece un poco al aparecer
  let tamP = elMenor(width, height) * 0.3 * elMenor(1, 0.7 + c / 60);
  if (planeta >= 0) {
    image(imgPlanetas[planeta], width / 2 - tamP / 2, height * 0.56 - tamP / 2, tamP, tamP);
  } else if (transProximo == "finJuego") {
    dibujarCopa(width / 2, height * 0.6, height / 1100);
  } else {
    image(gifTierra, width / 2 - tamP / 2, height * 0.56 - tamP / 2, tamP, tamP);
  }

  dibujarTitulo(titulo, height * 0.2, sub, 80);

  // El cohete cruza la pantalla de izquierda a derecha, con el fuego prendido
  let t = c / TRANS_CARTEL;
  push();
  translate(lerp(-160, width + 160, t), height * 0.8 - 60 * t);
  rotate(75);
  scale(1.1);
  dibujarLlama(1);
  image(gifCohete, -62, -138, 124, 218);
  pop();

  // Puntitos de "cargando..."
  for (let k = 0; k < 3; k++) {
    if (parteEntera(c / 10) % 4 > k) {
      fill(255);
    } else {
      fill(255, 255, 255, 60);
    }
    circle(width / 2 - 24 + k * 24, height * 0.9, 10);
  }
  pop();
}

// dibujarTransicion: dibuja el círculo oscuro que crece, el cartel de la misión (si tiene)
// y después la pantalla que aparece de a poco.
function dibujarTransicion() {
  if (transActiva) {
    push();
    noStroke();
    if (transCuadros < TRANS_MITAD) {
      // 1) El círculo oscuro crece hasta tapar todo
      let t = transCuadros / TRANS_MITAD;
      fill(20, 12, 69);
      circle(transX, transY, dist(0, 0, width, height) * 2.2 * t * t);
    } else if (transCuadros < TRANS_MITAD + duracionCartel()) {
      // 2) El cartel de la misión que viene
      dibujarCartelMision(transCuadros - TRANS_MITAD);
    } else {
      // 3) La pantalla nueva aparece de a poco
      let t = (transCuadros - TRANS_MITAD - duracionCartel()) / TRANS_MITAD;
      fill(20, 12, 69, 255 * (1 - t));
      rect(0, 0, width, height);
    }
    pop();
  }
}


// SONIDOS: son archivos .wav que están en assets/sonidos (se cargan en cargarMisArchivos con loadSound).
let efectoBoton;        // tocar un botón (y los pitidos de la cuenta regresiva)
let efectoPop;          // pasar la mano por un planeta, tocar una estrella de la constelación, avanzar un paso
let efectoBloqueado;    // planeta bloqueado, perder una vida, tocar NO
let efectoTransicion;   // elegir un planeta
let efectoMision;       // misión completada (se desbloquea el planeta siguiente)
let efectoCredencial;   // el sello de ACCESO AUTORIZADO de la credencial
let efectoFoto;         // la foto de la credencial
let efectoLaser;        // el cohete dispara
let efectoBurla;        // el alien se burla
let efectoAlien;        // alien derrotado
let efectoEstrella;     // guardar una estrella en la bolsa
let efectoPieza;        // agarrar una pieza del cohete o encastrarla
let efectoMotor;        // los motores se prenden en la cuenta regresiva
let efectoDespegue;     // el cohete despega

// sonidoActivado: true si el sonido está prendido. Empieza apagado porque el navegador no deja sonar
// nada hasta que hagas clic o aprietes una tecla: el primer clic o tecla lo prende.
// Después se prende y se apaga con el botón del parlante del mapa.
let sonidoActivado = false;
let sonidoElegido = false;   // true cuando el jugador ya usó el botón del parlante (ahí manda el botón)

// Botón del parlante (arriba a la derecha del mapa)
const TAM_BOTON_SONIDO = 64;
// botonSonidoX: dónde está el botón del parlante (cerca del borde derecho).
function botonSonidoX() { return width - 70; }
// botonSonidoY: la altura del botón del parlante.
function botonSonidoY() { return 70; }

// clicEnBotonSonido: true si el mouse está sobre el botón del parlante.
function clicEnBotonSonido() {
  return dist(mouseX, mouseY, botonSonidoX(), botonSonidoY()) < TAM_BOTON_SONIDO / 2;
}

// cambiarSonido: si el sonido está prendido lo apaga (y para la música); si está apagado lo prende.
function cambiarSonido() {
  sonidoActivado = !sonidoActivado;
  sonidoElegido = true;
  if (sonidoActivado == false) {
    silenciarMusica();
    musicaActual = "";   // así, cuando lo prendas de nuevo, la música vuelve a empezar
  }
}

// dibujarBotonSonido: el botón redondo con el dibujo del parlante.
// Prendido: el parlante con dos ondas de sonido. Apagado: el parlante con una cruz roja.
function dibujarBotonSonido() {
  let x = botonSonidoX();
  let y = botonSonidoY();
  let d = TAM_BOTON_SONIDO;
  let col = UI_AZUL;
  if (sonidoActivado == false) {
    col = UI_ROJO;
  }
  let encima = clicEnBotonSonido();

  push();
  // Fondo oscuro y aro que brilla (más fuerte si el mouse está encima)
  noStroke();
  fill(8, 12, 38, 200);
  circle(x, y, d);
  noFill();
  // El brillo: el mismo aro grueso y transparente (más fuerte si el mouse está encima)
  if (encima) {
    stroke(col[0], col[1], col[2], 90);
    strokeWeight(14);
  } else {
    stroke(col[0], col[1], col[2], 50);
    strokeWeight(10);
  }
  circle(x, y, d);
  if (encima) {
    strokeWeight(3);
  } else {
    strokeWeight(2);
  }
  stroke(col[0], col[1], col[2]);
  circle(x, y, d);

  // El parlante: un rectángulo chiquito y un triángulo (el cono)
  noStroke();
  fill(255);
  rect(x - 16, y - 6, 9, 12, 2);
  triangle(x - 9, y - 6, x + 3, y - 15, x + 3, y + 15);
  rect(x - 9, y - 6, 12, 12);

  if (sonidoActivado) {
    // Dos ondas de sonido saliendo del parlante
    noFill();
    stroke(255);
    strokeWeight(2.5);
    arc(x + 4, y, 16, 18, -50, 50);   // de -50° a 50°: una curvita hacia la derecha
    arc(x + 4, y, 30, 32, -50, 50);
  } else {
    // Una cruz roja: sin sonido
    stroke(UI_ROJO[0], UI_ROJO[1], UI_ROJO[2]);
    strokeWeight(3);
    line(x + 9, y - 7, x + 21, y + 7);
    line(x + 21, y - 7, x + 9, y + 7);
  }

  // Texto chiquito abajo del botón
  noStroke();
  fill(170, 190, 235);
  textAlign(CENTER, TOP);
  textSize(13);
  if (sonidoActivado) {
    text("SONIDO", x, y + d / 2 + 8);
  } else {
    text("SIN SONIDO", x, y + d / 2 + 8);
  }
  pop();
}

// prepararSonido: le pone el volumen a la música de fondo (la llama setup).
function prepararSonido() {
  prepararMusica();
}

// sonido: hace sonar el efecto que se llama "nombre" (si el sonido ya está activado).
function sonido(nombre) {
  if (sonidoActivado) {
    if (nombre == "boton") {
      efectoBoton.play();
    } else if (nombre == "pop") {
      efectoPop.play();
    } else if (nombre == "bloqueado") {
      efectoBloqueado.play();
    } else if (nombre == "elegir") {
      efectoTransicion.play();
    } else if (nombre == "mision") {
      efectoMision.play();
    } else if (nombre == "desbloqueo") {
      efectoCredencial.play();
    } else if (nombre == "foto") {
      efectoFoto.play();
    } else if (nombre == "laser") {
      efectoLaser.play();
    } else if (nombre == "risa") {
      efectoBurla.play();
    } else if (nombre == "alien") {
      efectoAlien.play();
    } else if (nombre == "motor") {
      efectoMotor.play();
    }
  }
}

// MÚSICA DE FONDO: un archivo .wav para el mapa y uno para cada misión (están en assets/musica).
// Cada pantalla tiene su música: cuando cambiás de pantalla, la que sonaba se para y empieza la nueva con loop().
let musicaMenu;
let musicaNivel1;
let musicaNivel2;
let musicaNivel3;
let musicaNivel4;
let musicaNivel5;
let musicaActual = "";   // el nombre de la música que está sonando ("" = ninguna)

const VOLUMEN_MUSICA = 0.35;  // subí o bajá este número (de 0 a 1) para cambiar el volumen de la música

// cargarMusica: carga las 6 músicas (la llama cargarMisArchivos).
function cargarMusica() {
  musicaMenu = loadSound("assets/musica/musica_menu.wav");
  musicaNivel1 = loadSound("assets/musica/musica_nivel1.wav");
  musicaNivel2 = loadSound("assets/musica/musica_nivel2.wav");
  musicaNivel3 = loadSound("assets/musica/musica_nivel3.wav");
  musicaNivel4 = loadSound("assets/musica/musica_nivel4.wav");
  musicaNivel5 = loadSound("assets/musica/musica_nivel5.wav");
}

// prepararMusica: les pone el volumen a las músicas, más bajo que los efectos (la llama prepararSonido).
function prepararMusica() {
  musicaMenu.setVolume(VOLUMEN_MUSICA * 0.7);   // la del mapa suena un poco más fuerte, por eso se baja
  musicaNivel1.setVolume(VOLUMEN_MUSICA);
  musicaNivel2.setVolume(VOLUMEN_MUSICA);
  musicaNivel3.setVolume(VOLUMEN_MUSICA);
  musicaNivel4.setVolume(VOLUMEN_MUSICA);
  musicaNivel5.setVolume(VOLUMEN_MUSICA);
}

// cancionDeEstado: según la pantalla, devuelve el nombre de la música que tiene que sonar.
function cancionDeEstado() {
  if (estado == "menu") {
    return "menu";
  }
  if (estado == "intro1" || estado == "nivel1" || estado == "despegue") {
    return "nivel1";
  }
  if (estado == "intro2" || estado == "nivel2") {
    return "nivel2";
  }
  if (estado == "intro3" || estado == "nivel3") {
    return "nivel3";
  }
  if (estado == "intro4" || estado == "nivel4") {
    return "nivel4";
  }
  if (estado == "finJuego") {
    return "nivel1";
  }
  return "nivel5"; // credencial, pregunta5, viaje y nivel5 (Marte)
}

// musicaLlamada: devuelve el archivo de música que tiene ese nombre.
function musicaLlamada(nombre) {
  if (nombre == "menu") {
    return musicaMenu;
  } else if (nombre == "nivel1") {
    return musicaNivel1;
  } else if (nombre == "nivel2") {
    return musicaNivel2;
  } else if (nombre == "nivel3") {
    return musicaNivel3;
  } else if (nombre == "nivel4") {
    return musicaNivel4;
  } else {
    return musicaNivel5;
  }
}

// silenciarMusica: para todas las músicas.
function silenciarMusica() {
  musicaMenu.stop();
  musicaNivel1.stop();
  musicaNivel2.stop();
  musicaNivel3.stop();
  musicaNivel4.stop();
  musicaNivel5.stop();
}

// actualizarMusica: se llama en cada cuadro (desde draw). Si cambió la pantalla y le toca otra música,
// para la que sonaba y hace sonar la nueva en loop (cuando termina, vuelve a empezar).
function actualizarMusica() {
  if (sonidoActivado == false) {
    return;
  }
  let nombre = cancionDeEstado();
  if (nombre == musicaActual) {
    return;   // ya está sonando la que corresponde
  }
  silenciarMusica();
  musicaLlamada(nombre).loop();
  musicaActual = nombre;
}

// sonidoEstrella: suena al guardar una estrella en la bolsa (nivel 2).
function sonidoEstrella() {
  if (sonidoActivado) {
    efectoEstrella.play();
  }
}

// sonidoMetal: suena al agarrar una pieza del cohete y cuando una pieza se encastra en la plataforma.
function sonidoMetal() {
  if (sonidoActivado) {
    efectoPieza.play();
  }
}

// encenderMotor: el cohete despega (suena el despegue).
function encenderMotor() {
  if (sonidoActivado) {
    efectoDespegue.play();
  }
}

// apagarMotor: corta los sonidos del motor (por ejemplo, si volvés al mapa en el medio del despegue).
function apagarMotor() {
  efectoMotor.stop();
  efectoDespegue.stop();
}

// revisarFinNivel1: si se terminó el tiempo, a los 4 segundos vuelve al mapa.
function revisarFinNivel1() {
  if (segundosRestantes <= 0 && piezasJuntadas < PIEZAS_PARA_GANAR) {
    cuadrosEspera = cuadrosEspera + 1;
    if (cuadrosEspera >= CUADROS_POR_SEGUNDO * 4) {
      volverAlMapa();
    }
  }
}

// revisarFinNivel5: si ganaste o perdiste, a los 4 segundos pasa a la pantalla final (si ganaste) o vuelve al mapa.
function revisarFinNivel5() {
  if (aliensMatados >= ALIENS_PARA_GANAR || vidas <= 0 || segundosNivel5 <= 0) {
    cuadrosEspera = cuadrosEspera + 1;
    if (cuadrosEspera >= CUADROS_POR_SEGUNDO * 4) {
      if (aliensMatados >= ALIENS_PARA_GANAR) {
        // Ganaste la última misión: va a la pantalla final con la copa
        completarNivel(5);
        iniciarTransicion(width / 2, height / 2, "finJuego");
      } else {
        volverAlMapa();
      }
    }
  }
}

// dibujarPausa: oscurece la pantalla y muestra el cartel de pausa.
function dibujarPausa() {
  push();
  noStroke();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  dibujarCartel("PAUSA", "Apretá ESPACIO para seguir · R = volver al mapa", UI_VIOLETA);
  pop();
}

// mousePressed: p5 la llama sola con cada clic. El primer clic prende el sonido,
// y en el mapa el botón del parlante lo prende y lo apaga.
function mousePressed() {
  userStartAudio(); // el navegador deja sonar cosas recién después de un clic

  // En el mapa, el botón del parlante prende y apaga el sonido.
  // Si no tocaste el botón, el primer clic prende el sonido (después manda el botón).
  if (estado == "menu" && clicEnBotonSonido()) {
    cambiarSonido();
    return;
  } else if (sonidoElegido == false) {
    sonidoActivado = true;
  }
}

// keyPressed: p5 la llama sola cada vez que se aprieta una tecla.
// ESPACIO = pausa, R = volver al mapa, F = pantalla completa (están escritas abajo en el mapa).
function keyPressed() {
  userStartAudio(); // el navegador deja sonar cosas recién después de tocar una tecla
  if (sonidoElegido == false) {
    sonidoActivado = true;   // la primera tecla prende el sonido (si no lo apagaste con el parlante)
  }

  // ESPACIO: pausa o sigue el juego
  if (key == " ") {
    pausado = !pausado;
  }

  // R: vuelve al mapa (los niveles completados siguen completos)
  if (key == "r" || key == "R") {
    reiniciarJuego();
  }

  // F: pantalla completa
  if (key == "f" || key == "F") {
    fullscreen(!fullscreen());
  }
}

// Boilerplate: 
let bodyPose;     // el modelo de ml5 que reconoce el cuerpo
let video;        // la cámara
let poses = [];   // los cuerpos que ve la cámara (ml5 la actualiza solo)

// Tamaño en el que ml5 analiza la cámara (más chico = más rápido).
// Después la imagen se estira a toda la pantalla.
const VIDEO_ANCHO = 640;
const VIDEO_ALTO = 480;

// Para estirar el video a toda la pantalla sin deformarlo
let escala = 1;    // cuánto se agranda
let margenX = 0;   // cuánto se corre para quedar centrado
let margenY = 0;

// preload: carga el modelo de ml5 y los archivos del juego antes de arrancar.
function preload() {
  // flipped espeja los puntos, igual que la cámara
  // SINGLEPOSE: reconoce a UNA sola persona (aunque haya más gente frente a la cámara)
  bodyPose = ml5.bodyPose("MoveNet", { modelType: "SINGLEPOSE_LIGHTNING", flipped: ESPEJO });

  cargarMisArchivos();
}

// setup: se ejecuta una vez. Crea el canvas, prende la cámara,
// le dice a ml5 que empiece a reconocer el cuerpo y prepara el juego.
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Prende la cámara, espejada igual que los puntos
  video = createCapture(VIDEO, { flipped: ESPEJO });
  video.size(VIDEO_ANCHO, VIDEO_ALTO);
  video.hide(); // la escondemos porque la dibujamos nosotros en el canvas

  // ml5 mira el video sin parar y cada vez que termina llama a gotPoses()
  bodyPose.detectStart(video, gotPoses);

  calcularEscala();
  empezar();
  prepararSonido();
}

// draw: se repite en cada cuadro. Dibuja la cámara y el juego.
function draw() {
  background(0);
  cuadroAnimacion = cuadroAnimacion + 1;   // cuenta los cuadros (lo usan las animaciones)

  // La cámara estirada a toda la pantalla
  image(video, margenX, margenY, VIDEO_ANCHO * escala, VIDEO_ALTO * escala);

  // Durante una transición el juego se queda quieto
  if (!transActiva) {
    interaccion();  // PARTE 1: la lógica del juego
  }
  actualizarTransicion();
  dibujarJuego();   // PARTE 1: el dibujo del juego

  mostrarAviso();
  dibujarTransicion(); // la transición tapa todo

  actualizarMusica(); // la música de fondo de cada pantalla
}

// Los puntos que da la cámara tiemblan un poco aunque estés quieto (por eso los guantes vibraban).
// Para que se muevan suave, cada punto nuevo se mezcla con donde estaba antes:
// SUAVIZADO_PUNTOS = 1 es sin suavizar; más chico = más suave (pero tarda un poco más en seguirte).
const SUAVIZADO_PUNTOS = 0.5;
const CONFIANZA_MINIMA = 0.2;   // si la cámara está muy poco segura de un punto, se queda donde estaba
let anterioresX = [];          // la última posición de cada punto (por su número, de 0 a 16)
let anterioresY = [];
let hayAnteriores = false;      // false hasta que llegan los primeros puntos

// gotPoses: ml5 la llama sola con los cuerpos que encontró.
// Pasa los puntos del tamaño del video (640 x 480) al tamaño de la pantalla,
// así en la PARTE 1 se pueden comparar directo con las piezas y las chatarras.
// Además los suaviza (ver SUAVIZADO_PUNTOS) y guarda qué tan segura está la cámara de cada uno (c).
function gotPoses(results) {
  for (let cuerpo of results) {
    for (let j = 0; j < cuerpo.keypoints.length; j++) {
      let kp = cuerpo.keypoints[j];
      let x = kp.x * escala + margenX;
      let y = kp.y * escala + margenY;
      if (hayAnteriores) {
        if (kp.confidence < CONFIANZA_MINIMA) {
          x = anterioresX[j];   // la cámara no está segura: el punto se queda donde estaba
          y = anterioresY[j];
        } else {
          x = anterioresX[j] + (x - anterioresX[j]) * SUAVIZADO_PUNTOS;
          y = anterioresY[j] + (y - anterioresY[j]) * SUAVIZADO_PUNTOS;
        }
      }
      kp.x = x;
      kp.y = y;
      anterioresX[j] = x;
      anterioresY[j] = y;
      // también se guarda por nombre: cuerpo.nose, cuerpo.right_wrist, etc.
      cuerpo[kp.name] = { x: kp.x, y: kp.y, c: kp.confidence };
    }
    hayAnteriores = true;
  }
  // Solo nos quedamos con una persona: la primera que encontró ml5
  if (results.length > 0) {
    poses = [results[0]];
  } else {
    poses = [];
  }
}

// calcularEscala: calcula cuánto agrandar el video para cubrir toda la pantalla
// sin deformarlo (lo que sobra queda afuera).
function calcularEscala() {
  escala = elMayor(width / VIDEO_ANCHO, height / VIDEO_ALTO);
  margenX = (width - VIDEO_ANCHO * escala) / 2;
  margenY = (height - VIDEO_ALTO * escala) / 2;
}

// obtenerPunto: devuelve la posición {x, y} de un punto del cuerpo, buscándolo por nombre.
// Ejemplo: obtenerPunto(0, "nose") es la nariz del primer cuerpo.
function obtenerPunto(numCuerpo, nombre) {
  return poses[numCuerpo][nombre];
}

// mostrarAviso: muestra un cartel mientras la cámara no ve a nadie.
function mostrarAviso() {
  if (poses.length == 0 && estado != "credencial") {
    dibujarInstruccion("Ponete frente a la cámara", height * 0.5, UI_ROJO);
  }
}

// windowResized: si cambia el tamaño de la ventana, el canvas se adapta.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcularEscala();
}