import { useState, useEffect } from 'react';

function Blackjack() {
  const [mazoId, setMazoId] = useState(null);
  const [cartasJugador, setCartasJugador] = useState([]);
  const [cartasCroupier, setCartasCroupier] = useState([]);
  const [mensaje, setMensaje] = useState('Cargando mesa...');

  const iniciarJuego = async () => {
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
    if (!mazoId) return;
    
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${mazoId}/draw/?count=1`);
    const data = await res.json();
    
    setCartasJugador((prevCartas) => [...prevCartas, data.cards[0]]);
  };

  // 3. Declaramos plantarse para que el botón no rompa la app
  const plantarse = () => {
    setMensaje('Te has plantado. Turno del croupier...');
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
          <p>Puntuación: </p>
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
          <p>Puntuación: </p>
        </section>

        <hr />

        <section>
          <button onClick={pedirCarta} type="button">
            Pedir Carta
          </button>
          <button onClick={plantarse} type="button">
            Plantarse
          </button>
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