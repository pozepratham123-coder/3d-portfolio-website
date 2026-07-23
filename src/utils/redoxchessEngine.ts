// redoxchessEngine.ts — Interface for the Redox chess engine running as a Web Worker.
//
// The engine binary (redoxchess.js + redoxchess.wasm) is compiled from Rust/WASM
// and placed in /public/. It speaks the UCI (Universal Chess Interface) protocol —
// the same text-based protocol used by Stockfish and other professional engines.
//
// How UCI works:
//   1. Send "uci"     → engine replies "uciok" (handshake)
//   2. Send "isready" → engine replies "readyok" (confirms it's ready)
//   3. Send "position fen <FEN>" → sets the current board position
//   4. Send "go depth <N>" → engine thinks N moves deep and replies "bestmove <move>"
//   5. Send "stop"    → interrupt thinking early (not used in current UI)
//   6. Send "quit"    → terminate the worker
//
// The engine runs in a Web Worker so it doesn't block the main UI thread
// while it's searching (which can take 100 ms–several seconds at higher depths).
//
// Move format: UCI algebraic, e.g. "e2e4" (from square + to square).
// Promotion is specified as a 5th character: "e7e8q" = promote to queen.

class RedoxChessEngine {
  private engine: Worker | null = null;           // The Web Worker running the engine WASM
  private onMoveCallback: ((move: string) => void) | null = null; // Called when engine returns bestmove
  private _isReady = false;                        // true once "readyok" is received

  // Public getter — checked by Play.tsx before sending commands
  get isReady() {
    return this._isReady;
  }

  // ── init ─────────────────────────────────────────────────────────────────
  // Starts the Web Worker and performs the UCI handshake.
  // Returns a Promise that resolves when the engine confirms "readyok".
  async init() {
    return new Promise<void>((resolve) => {
      // Spawn the worker from the engine script in /public/
      this.engine = new Worker('/redoxchess.js');

      this.engine.onmessage = (event) => {
        const message = event.data; // UCI text response from the engine

        if (message === 'readyok') {
          // Engine is initialised and ready to receive positions
          this._isReady = true;
          resolve();
        } else if (message.startsWith('bestmove')) {
          // Engine finished thinking — extract the recommended move
          // Format: "bestmove e2e4 ponder d7d5" → we only need "e2e4"
          const move = message.split(' ')[1];
          if (this.onMoveCallback) {
            this.onMoveCallback(move); // Pass move back to Play.tsx
          }
        }
      };

      // UCI handshake: identify as UCI client, then ask if ready
      this.send('uci');
      this.send('isready');
    });
  }

  // ── send ─────────────────────────────────────────────────────────────────
  // Posts a raw UCI command string to the worker.
  private send(command: string) {
    if (this.engine) {
      this.engine.postMessage(command);
    }
  }

  // ── setPosition ──────────────────────────────────────────────────────────
  // Tells the engine the current board state using FEN notation.
  // Must be called before getBestMove() on every turn.
  setPosition(fen: string) {
    this.send(`position fen ${fen}`);
  }

  // ── getBestMove ──────────────────────────────────────────────────────────
  // Asks the engine to search `depth` moves deep and call `onMove` with the
  // best move it finds. Higher depth = stronger but slower.
  // Default depth 15 is strong enough to beat most casual players.
  getBestMove(onMove: (move: string) => void, depth = 15) {
    this.onMoveCallback = onMove;
    this.send(`go depth ${depth}`);
  }

  // ── stop ─────────────────────────────────────────────────────────────────
  // Interrupts the current search (engine still returns the best move found so far)
  stop() {
    this.send('stop');
  }

  // ── quit ─────────────────────────────────────────────────────────────────
  // Gracefully shuts down the engine and terminates the Web Worker.
  // Called by Play.tsx's useEffect cleanup on unmount.
  quit() {
    if (this.engine) {
      this.send('quit');
      this.engine.terminate(); // Force-kill the worker thread
      this.engine = null;
    }
  }
}

export default RedoxChessEngine;
