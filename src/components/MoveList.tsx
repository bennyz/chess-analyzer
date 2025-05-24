import React from "react";
import { Move, MoveAnalysis } from "../types/chess.ts";

interface MoveListProps {
  moves: Move[];
  currentMoveIndex: number;
  moveAnalysis: Record<number, MoveAnalysis>;
  onMoveClick: (index: number) => void;
}

export default function MoveList({
  moves,
  currentMoveIndex,
  moveAnalysis,
  onMoveClick,
}: MoveListProps) {
  // Debug: log the moveAnalysis to see what's actually stored
  React.useEffect(() => {
    console.log("=== MoveList Debug ===");
    console.log("Full moveAnalysis object:", moveAnalysis);

    Object.keys(moveAnalysis).forEach((key) => {
      const index = parseInt(key);
      const analysis = moveAnalysis[index];
      console.log(`Position ${index}:`, {
        eval: analysis.eval,
        bestMove: analysis.bestMove,
        cpLoss: analysis.cpLoss,
        classification: analysis.classification,
      });
    });
  }, [moveAnalysis]);

  return (
    <div className="move-list">
      <h3>Moves</h3>
      <div className="moves-container">
        {moves.slice(1).map((move, index) => {
          const moveIndex = index + 1;
          const analysis = moveAnalysis[moveIndex];
          const classification = analysis?.classification;

          // Debug log for each move
          if (analysis) {
            console.log(`Move ${moveIndex} (${move.san}) analysis:`, analysis);
          }

          return (
            <div
              key={moveIndex}
              className={`move ${currentMoveIndex === moveIndex ? "active" : ""}`}
              onClick={() => onMoveClick(moveIndex)}
            >
              {move.isWhite && (
                <span className="move-number">{move.moveNumber}.</span>
              )}
              <span className="move-notation">{move.san}</span>
              {classification && (
                <span className={`move-eval ${classification.class}`}>
                  {classification.label}
                </span>
              )}
              {/* Temporary debug display */}
              {analysis && (
                <span
                  style={{
                    fontSize: "0.7em",
                    color: "#666",
                    marginLeft: "5px",
                  }}
                >
                  [eval: {analysis.eval?.toFixed(2) || "none"}, cp:{" "}
                  {analysis.cpLoss?.toFixed(2) || "none"}, class:{" "}
                  {classification?.label || "none"}]
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
