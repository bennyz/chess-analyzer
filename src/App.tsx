import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import Board from "./components/Board.tsx";
import Controls from "./components/Controls.tsx";
import MoveList from "./components/MoveList.tsx";
import AnalysisPanel from "./components/AnalysisPanel.tsx";
import { useStockfish } from "./hooks/useStockfish.ts";
import { Move, MoveAnalysis } from "./types/chess.ts";
import { classifyMove } from "./utils/chess.ts";
import "./App.css";

export default function App() {
  const [game] = useState(new Chess());
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveAnalysis, setMoveAnalysis] = useState<
    Record<number, MoveAnalysis>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string>();

  const { analyzePosition, isReady } = useStockfish();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentMoveIndex > 0) {
        setCurrentMoveIndex(currentMoveIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        currentMoveIndex < moves.length - 1
      ) {
        setCurrentMoveIndex(currentMoveIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMoveIndex, moves.length]);

  const analyzeEntireGame = async (gameMoves: Move[]) => {
    if (!isReady) return;

    setIsAnalyzing(true);
    console.log("Starting analysis of entire game...");

    const analysisResults: Record<number, MoveAnalysis> = {};

    // Analyze all positions
    for (let i = 0; i < gameMoves.length; i++) {
      const position = gameMoves[i];
      console.log(`Analyzing position ${i}/${gameMoves.length - 1}`);

      const analysis = await analyzePosition(position.fen);
      analysisResults[i] = analysis;

      if (
        i > 0 &&
        analysis.eval !== undefined &&
        analysisResults[i - 1]?.eval !== undefined
      ) {
        const evalBeforeMoveRaw = analysisResults[i - 1].eval!; // Eval of the FEN at moves[i-1]
        const evalAfterMoveRaw = analysis.eval; // Eval of the FEN at moves[i] (after current move)

        const isCurrentPlayerWhite = position.isWhite; // Player making the current move

        let prevScorePlayerPov: number;
        let currentScorePlayerPov: number;

        if (isCurrentPlayerWhite) {
          prevScorePlayerPov = evalBeforeMoveRaw;
          currentScorePlayerPov = -evalAfterMoveRaw;
        } else {
          prevScorePlayerPov = evalBeforeMoveRaw;
          currentScorePlayerPov = -evalAfterMoveRaw;
        }

        const cpLoss = prevScorePlayerPov - currentScorePlayerPov;

        const classification = classifyMove(
          cpLoss,
          position.san,
          analysis.bestMove,
        );

        analysisResults[i] = {
          ...analysisResults[i],
          cpLoss,
          classification,
        };

        const prevEvalWhitePovLog = isCurrentPlayerWhite
          ? prevScorePlayerPov
          : -prevScorePlayerPov;
        const currentEvalWhitePovLog = isCurrentPlayerWhite
          ? currentScorePlayerPov
          : -currentScorePlayerPov;

        console.log(
          `Move ${i} (${position.san} by ${isCurrentPlayerWhite ? "White" : "Black"}): ` +
            `evalBeforeWhitePov=${prevEvalWhitePovLog.toFixed(2)}, evalAfterWhitePov=${currentEvalWhitePovLog.toFixed(2)}, ` +
            `cpLoss=${cpLoss.toFixed(2)}, classification=${classification.label}, engineBestForNext=${analysis.bestMove || "N/A"}`,
        );
      }

      // Update state progressively so user can see progress
      setMoveAnalysis({ ...analysisResults });
    }

    setIsAnalyzing(false);
    console.log("Game analysis complete!");
  };

  const handlePgnPaste = async (pgn: string) => {
    try {
      game.loadPgn(pgn);

      const newMoves: Move[] = [];
      const tempGame = new Chess();

      newMoves.push({
        san: "",
        from: "",
        to: "",
        fen: tempGame.fen(),
        moveNumber: 0,
        isWhite: true,
      });

      // Add all moves
      const gameMoves = game.history({ verbose: true });
      tempGame.reset();

      gameMoves.forEach((move, index) => {
        tempGame.move(move.san);
        newMoves.push({
          san: move.san,
          from: move.from,
          to: move.to,
          fen: tempGame.fen(),
          moveNumber: Math.floor(index / 2) + 1,
          isWhite: index % 2 === 0,
        });
      });

      // Set the moves and start at position 0
      setMoves(newMoves);
      setMoveAnalysis({});
      setCurrentMoveIndex(0);
      setFileName("Pasted PGN");

      // Start analyzing the entire game
      await analyzeEntireGame(newMoves);
    } catch (error) {
      console.error("Error parsing PGN:", error);
      alert("Error parsing PGN. Please check the format and try again.");
    }
  };

  const currentPosition = moves[currentMoveIndex];

  return (
    <div className="app">
      <header className="header">
        <h1>Chess Game Analyzer</h1>
        <p>Paste PGN text to analyze your games with Stockfish</p>
      </header>

      <Controls
        onPgnPaste={handlePgnPaste}
        onPrevMove={() =>
          setCurrentMoveIndex(Math.max(0, currentMoveIndex - 1))
        }
        onNextMove={() =>
          setCurrentMoveIndex(Math.min(moves.length - 1, currentMoveIndex + 1))
        }
        canNavigate={moves.length > 0}
        isAnalyzing={isAnalyzing}
        fileName={fileName}
      />

      <div className="main-content">
        <MoveList
          moves={moves}
          currentMoveIndex={currentMoveIndex}
          moveAnalysis={moveAnalysis}
          onMoveClick={setCurrentMoveIndex}
        />

        <Board
          position={currentPosition?.fen || "start"}
          lastMove={
            currentMoveIndex > 0
              ? {
                  from: moves[currentMoveIndex].from,
                  to: moves[currentMoveIndex].to,
                }
              : null
          }
          bestMove={
            currentMoveIndex > 0
              ? moveAnalysis[currentMoveIndex - 1]?.bestMove || null
              : null
          }
        />

        <AnalysisPanel
          analysis={moveAnalysis[currentMoveIndex] || {}}
          previousAnalysis={
            currentMoveIndex > 0
              ? moveAnalysis[currentMoveIndex - 1]
              : undefined
          }
          fen={
            currentPosition?.fen ||
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          }
          previousFen={
            currentMoveIndex > 0 ? moves[currentMoveIndex - 1].fen : undefined
          }
          isAnalyzing={false}
          actualMove={
            currentMoveIndex > 0 ? moves[currentMoveIndex].san : undefined
          }
          currentMoveIndex={currentMoveIndex}
        />
      </div>
    </div>
  );
}
