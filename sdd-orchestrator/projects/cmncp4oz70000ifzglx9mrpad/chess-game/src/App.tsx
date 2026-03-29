import { useMemo, useState } from "react";

import {
  createGameState,
  describeMove,
  formatSquare,
  getLegalMoves,
  isInsideBoard,
  movePiece,
  pieceLabel,
  pieceSymbols,
  samePosition,
  type Position,
} from "./chess";

type MessageTone = "neutral" | "success" | "error";

function isLegalMove(moves: Position[], target: Position) {
  return moves.some((move) => samePosition(move, target));
}

export default function App() {
  const [game, setGame] = useState(() => createGameState());
  const [selected, setSelected] = useState<Position | null>(null);
  const [message, setMessage] = useState("Elige una pieza blanca para empezar.");
  const [tone, setTone] = useState<MessageTone>("neutral");

  const selectedPiece = selected ? game.board[selected.row][selected.col] : null;
  const legalMoves = useMemo(() => (selected ? getLegalMoves(game.board, selected) : []), [game.board, selected]);

  const statusText = game.winner
    ? `Ganaron las ${game.winner === "white" ? "blancas" : "negras"}.`
    : `Turno de ${game.turn === "white" ? "blancas" : "negras"}.`;

  const capturedPieces = useMemo(() => {
    const whiteCaptured = game.history.filter((move: (typeof game.history)[number]) => move.captured?.color === "white").length;
    const blackCaptured = game.history.filter((move: (typeof game.history)[number]) => move.captured?.color === "black").length;
    return { whiteCaptured, blackCaptured };
  }, [game.history]);

  function handleReset() {
    setGame(createGameState());
    setSelected(null);
    setTone("neutral");
    setMessage("Partida reiniciada.");
  }

  function handleSquareClick(position: Position) {
    if (!isInsideBoard(position.row, position.col)) return;

    if (game.winner) {
      setTone("neutral");
      setMessage("La partida terminó. Reinicia para jugar otra vez.");
      return;
    }

    const clickedPiece = game.board[position.row][position.col];

    if (!selected) {
      if (!clickedPiece) {
        setTone("error");
        setMessage("Selecciona una pieza de tu color.");
        return;
      }

      if (clickedPiece.color !== game.turn) {
        setTone("error");
        setMessage("Ahora mueve el rival.");
        return;
      }

      setSelected(position);
      setTone("neutral");
      setMessage(`Seleccionado: ${pieceLabel(clickedPiece)} en ${formatSquare(position)}.`);
      return;
    }

    if (samePosition(selected, position)) {
      setSelected(null);
      setTone("neutral");
      setMessage("Selección cancelada.");
      return;
    }

    if (clickedPiece && clickedPiece.color === game.turn) {
      setSelected(position);
      setTone("neutral");
      setMessage(`Seleccionado: ${pieceLabel(clickedPiece)} en ${formatSquare(position)}.`);
      return;
    }

    if (!isLegalMove(legalMoves, position)) {
      setTone("error");
      setMessage("Ese movimiento no es válido para esa pieza.");
      return;
    }

    const result = movePiece(game, selected, position);
    if (result.error) {
      setTone("error");
      setMessage(result.error);
      return;
    }

    setGame(result.state);
    setSelected(null);
    setTone("success");
    setMessage(result.state.winner ? `Jaque mate simplificado: ganan las ${result.state.winner === "white" ? "blancas" : "negras"}.` : `Movimiento realizado: ${describeMove(result.state.history[result.state.history.length - 1])}.`);
  }

  return (
    <main className="app-shell chess-app">
      <section className="hero">
        <div>
          <p className="eyebrow">Ajedrez local</p>
          <h1>Juega una partida simple en el navegador</h1>
          <p className="hero-copy">Tablero visual, piezas movibles, turnos alternados y validación básica de cada movimiento.</p>
        </div>
        <div className="hero-actions">
          <button className="button" onClick={handleReset} type="button">Reiniciar</button>
          <div className={`status-pill ${game.winner ? "win" : game.turn}`}>{statusText}</div>
        </div>
      </section>

      <section className="game-layout">
        <div className="board-card">
          <div className="board-header">
            <div>
              <h2>Tablero</h2>
              <p>Haz clic en una pieza y luego en una casilla destino.</p>
            </div>
            <div className="board-hints">
              <span>Seleccionada: {selectedPiece ? pieceLabel(selectedPiece) : "ninguna"}</span>
              <span>Movimientos legales: {legalMoves.length}</span>
            </div>
          </div>

          <div className="board" aria-label="Tablero de ajedrez">
            {game.board.map((row, rowIndex) =>
              row.map((piece, colIndex) => {
                const position = { row: rowIndex, col: colIndex };
                const squareDark = (rowIndex + colIndex) % 2 === 1;
                const selectedSquare = selected ? samePosition(selected, position) : false;
                const legal = selected ? isLegalMove(legalMoves, position) : false;
                const capture = legal && !!piece && piece.color !== game.turn;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={[
                      "square",
                      squareDark ? "dark" : "light",
                      selectedSquare ? "selected" : "",
                      legal ? "legal" : "",
                      capture ? "capture" : "",
                    ].join(" ")}
                    onClick={() => handleSquareClick(position)}
                    type="button"
                    aria-label={`${formatSquare(position)}${piece ? `, ${pieceLabel(piece)}` : ""}`}
                  >
                    <span className={`piece ${piece?.color ?? "empty"}`}>{piece ? pieceSymbols[piece.color][piece.type] : ""}</span>
                    {legal && <span className={`move-dot ${capture ? "capture" : ""}`} />}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <aside className="side-panel">
          <section className={`panel message ${tone}`}>
            <h2>Estado</h2>
            <p>{message}</p>
          </section>

          <section className="panel stats">
            <div>
              <span>Capturas blancas</span>
              <strong>{capturedPieces.whiteCaptured}</strong>
            </div>
            <div>
              <span>Capturas negras</span>
              <strong>{capturedPieces.blackCaptured}</strong>
            </div>
            <div>
              <span>Turno actual</span>
              <strong>{game.turn === "white" ? "Blancas" : "Negras"}</strong>
            </div>
          </section>

          <section className="panel moves">
            <div className="panel-title">
              <h2>Historial</h2>
              <span>{game.history.length} movimientos</span>
            </div>
            <ol>
              {game.history.length === 0 ? (
                <li className="muted">Todavía no hay movimientos.</li>
              ) : (
                game.history.slice().reverse().map((move, index) => (
                  <li key={`${move.from.row}-${move.from.col}-${move.to.row}-${move.to.col}-${index}`}>
                    {describeMove(move)}
                  </li>
                ))
              )}
            </ol>
          </section>
        </aside>
      </section>
    </main>
  );
}
