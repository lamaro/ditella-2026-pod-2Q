// El navegador prueba el MP3 primero y usa el WAV de muestra si falta.
const pistas = {inicio: 'intro', jedi: 'jedi', sith: 'sith'};
const musicaDeFondo = new Audio();
musicaDeFondo.loop = true;
musicaDeFondo.volume = 0.4;
let temaActual;

function habilitarMusica(){
  if (musicaDeFondo.paused) {
    musicaDeFondo.play().catch(() => {
      // Si el navegador pide una interacción, Comenzar vuelve a intentar.
    });
  }
}

function cambiarTema(clave){
  if (temaActual === clave) return;
  temaActual = clave;
  musicaDeFondo.pause();
  const base = 'assets/audio/' + pistas[clave];
  const archivos = [['mp3', 'audio/mpeg'], ['wav', 'audio/wav']];
  const fuentes = archivos.map(([extension, formato]) => {
    const fuente = document.createElement('source');
    fuente.src = base + '.' + extension;
    fuente.type = formato;
    return fuente;
  });
  musicaDeFondo.replaceChildren(...fuentes);
  musicaDeFondo.load();
  habilitarMusica();
}

cambiarTema('inicio');
