import { useEffect, useRef, useState, useCallback } from "react";

interface StockfishAnalysis {
  eval?: number;
  bestMove?: string;
  depth?: number;
}

export function useStockfish() {
  const stockfishRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<StockfishAnalysis>({});
  const analysisCallbackRef = useRef<
    ((analysis: StockfishAnalysis) => void) | null
  >(null);
  const pendingAnalysisRef = useRef<StockfishAnalysis>({});

  useEffect(() => {
    const stockfish = new Worker("/stockfish.js");

    stockfish.onmessage = (event) => {
      const message = event.data;
      console.log("Stockfish message:", message);

      if (message === "uciok") {
        setIsReady(true);
        return;
      }

      // Parse evaluation from info messages
      if (message.includes("info depth") && message.includes("score cp")) {
        const depthMatch = message.match(/depth (\d+)/);
        const cpMatch = message.match(/score cp (-?\d+)/);

        if (cpMatch) {
          const cp = parseInt(cpMatch[1]) / 100;
          const depth = depthMatch ? parseInt(depthMatch[1]) : undefined;

          console.log(`Parsed evaluation: ${cp} at depth ${depth}`);

          // Store in pending analysis
          pendingAnalysisRef.current = {
            ...pendingAnalysisRef.current,
            eval: cp,
            depth,
          };

          // Update current analysis for UI
          const analysis = { ...currentAnalysis, eval: cp, depth };
          setCurrentAnalysis(analysis);
        }
      }

      // When we get bestmove, combine it with the evaluation and resolve
      if (message.includes("bestmove")) {
        const parts = message.split(" ");
        const bestMove = parts[1];

        console.log(`Got bestmove: ${bestMove}`);

        // Combine bestmove with pending evaluation
        const finalAnalysis = {
          ...pendingAnalysisRef.current,
          bestMove,
        };

        console.log("Final analysis result:", finalAnalysis);

        setCurrentAnalysis(finalAnalysis);

        // Resolve the promise with complete analysis
        if (analysisCallbackRef.current) {
          analysisCallbackRef.current(finalAnalysis);
          analysisCallbackRef.current = null;
        }

        // Clear pending analysis for next position
        pendingAnalysisRef.current = {};
      }
    };

    stockfish.postMessage("uci");
    stockfish.postMessage("setoption name Threads value 2");
    stockfish.postMessage("setoption name Hash value 16");

    stockfishRef.current = stockfish;

    return () => {
      stockfish.terminate();
    };
  }, []);

  const analyzePosition = useCallback(
    (fen: string, depth: number = 15): Promise<StockfishAnalysis> => {
      return new Promise((resolve) => {
        if (!stockfishRef.current || !isReady) {
          console.log("Stockfish not ready, resolving empty analysis");
          resolve({});
          return;
        }

        console.log(`Starting analysis of position: ${fen}`);

        // Clear previous analysis
        pendingAnalysisRef.current = {};
        analysisCallbackRef.current = resolve;
        setCurrentAnalysis({});

        // Send commands to Stockfish
        stockfishRef.current.postMessage(`position fen ${fen}`);
        stockfishRef.current.postMessage(`go depth ${depth}`);
      });
    },
    [isReady],
  );

  return { analyzePosition, isReady, currentAnalysis };
}
