import { useState, useEffect } from 'react';

function Blackjack() {
  const [mazoId, setMazoId] = useState(null);
  const [cartasJugador, setCartasJugador] = useState([]);
  const [cartasCroupier, setCartasCroupier] = useState([]);
  const [mensaje, setMensaje] = useState('Cargando mesa...');
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const iniciarJuego = async () => {
    setJuegoTerminado(false);
    setMensaje('Barajando mazo...');

    const resMazo = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const dataMazo = await resMazo.json();
    setMazoId(dataMazo.deck_id);

    const resCartas = await fetch(`https://deckofcardsapi.com/api/deck/${dataMazo.deck_id}/draw/?count=4`);
    const dataCartas = await resCartas.json();

    setCartasJugador([dataCartas.cards[0], dataCartas.cards[1]]);
    setCartasCroupier([dataCartas.cards[2], dataCartas.cards[3]]);
    setMensaje('Tu turno: Stand(Plantarse) / Hit(Pedir Carta)');
  };

  useEffect(() => {
    iniciarJuego();
  }, []);

  const pedirCarta = async () => {
    if (!mazoId || juegoTerminado) return;
    
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${mazoId}/draw/?count=1`);
    const data = await res.json();
    

    const nuevasCartasJugador = [...cartasJugador, data.cards[0]];
    setCartasJugador(nuevasCartasJugador);

    if (calcularPuntuacion(nuevasCartasJugador) > 21) {
      setMensaje('Te pasaste de 21. ¡Gana el Croupier!');
      setJuegoTerminado(true);
    }
  };

  const calcularPuntuacion = (cartas) => {
    let puntuacion = 0;
    let cantidadAses = 0;

    cartas.forEach((carta) => {
      if (carta.value === 'ACE') {
        cantidadAses += 1;
        puntuacion += 11;
      } else if (['KING', 'QUEEN', 'JACK'].includes(carta.value)) {
        puntuacion += 10;
      } else {
        puntuacion += parseInt(carta.value);
      }
    });

    while (puntuacion > 21 && cantidadAses > 0) {
      puntuacion -= 10;
      cantidadAses -= 1;
    }

    return puntuacion;
  };

  const plantarse = async () => {
    if (!mazoId || juegoTerminado) return;

    setMensaje('Turno del croupier...');

    let cartasActualesCroupier = [...cartasCroupier];
    let puntosCroupier = calcularPuntuacion(cartasActualesCroupier);
    const puntosJugador = calcularPuntuacion(cartasJugador);

    while (puntosCroupier < 17) {
      const res = await fetch(`https://deckofcardsapi.com/api/deck/${mazoId}/draw/?count=1`);
      const data = await res.json();
      cartasActualesCroupier.push(data.cards[0]);
      puntosCroupier = calcularPuntuacion(cartasActualesCroupier);
    }

    setCartasCroupier(cartasActualesCroupier);

    if (puntosCroupier > 21) {
      setMensaje(`El Croupier se pasó con ${puntosCroupier}. ¡Ganaste!`);
    } else if (puntosJugador > puntosCroupier) {
      setMensaje(`¡Ganaste! Superaste al croupier ${puntosJugador} a ${puntosCroupier}.`);
    } else if (puntosCroupier > puntosJugador) {
      setMensaje(`Gana el Croupier ${puntosCroupier} a ${puntosJugador}.`);
    } else {
      setMensaje(`Empate. Ambos tienen ${puntosJugador} puntos.`);
    }

    setJuegoTerminado(true); 
  };

  return (
    <div>
      <header>
        <h1>Mesa de Blackjack</h1>
      </header>

      <main>
        <section>
          <h2>Croupier</h2>
          <div>
            {cartasCroupier.map((carta, index) => (
              <img 
                key={index} 
                src={carta.image} 
                alt={`${carta.value} of ${carta.suit}`} 
              />
            ))}
          </div>
          <p>Puntuación: <strong>{calcularPuntuacion(cartasCroupier)}</strong></p>
        </section>

        <hr />

        <section>
          <h2>Jugador</h2>
          <div>
            {cartasJugador.map((carta, index) => (
              <img 
                key={index} 
                src={carta.image} 
                alt={`${carta.value} of ${carta.suit}`} 
              />
            ))}
          </div>
          <p>Puntuación: <strong>{calcularPuntuacion(cartasJugador)}</strong></p>
        </section>

        <hr />

        <section>
          {!juegoTerminado ? (
            <>
              <button onClick={pedirCarta} type="button">
                Pedir Carta
              </button>
              <button onClick={plantarse} type="button">
                Plantarse
              </button>
            </>
          ) : (
            <button onClick={iniciarJuego} type="button">
              Nuevo Juego
            </button>
          )}
        </section>

        <section>
          <h3>Estado del Juego:</h3>
          <p>{mensaje}</p>
        </section>
      </main>
    </div>
  );
}

export default Blackjack;
