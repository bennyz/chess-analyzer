import React from "react";
import { Chess } from "chess.js";
import { MoveAnalysis } from "../types/chess.ts";
import { formatEval, explainMove } from "../utils/chess.ts";

interface AnalysisPanelProps {
  analysis: MoveAnalysis;
  previousAnalysis?: MoveAnalysis;
  fen: string;
  previousFen?: string;
  isAnalyzing: boolean;
  actualMove?: string;
  currentMoveIndex: number;
}

export default function AnalysisPanel({
  analysis,
  previousAnalysis,
  fen,
  previousFen,
  isAnalyzing,
  actualMove,
  currentMoveIndex,
}: AnalysisPanelProps) {
  const game = new Chess(fen);
  const isWhiteTurn = game.turn() === "w";

  const getBestMoveNotation = () => {
    // When viewing a move that was played, show the best move from BEFORE that move
    if (currentMoveIndex > 0 && previousAnalysis?.bestMove && previousFen) {
      try {
        const tempGame = new Chess(previousFen);
        const move = tempGame.move(previousAnalysis.bestMove);
        return move?.san || previousAnalysis.bestMove;
      } catch {
        return previousAnalysis.bestMove;
      }
    }

    // When viewing the starting position or current analysis
    if (analysis.bestMove) {
      try {
        const tempGame = new Chess(fen);
        const move = tempGame.move(analysis.bestMove);
        return move?.san || analysis.bestMove;
      } catch {
        return analysis.bestMove;
      }
    }

    return null;
  };

  const explanation = React.useMemo(() => {
    if (
      analysis.cpLoss !== undefined &&
      previousAnalysis?.bestMove &&
      actualMove &&
      analysis.classification
    ) {
      return explainMove(
        analysis.cpLoss,
        actualMove,
        getBestMoveNotation() || previousAnalysis.bestMove,
        analysis.classification,
      );
    }
    return null;
  }, [analysis, previousAnalysis, actualMove]);

  return (
    <div className="analysis-panel">
      <h3>Position Analysis</h3>

      <div className="current-eval">
        {analysis.eval !== undefined
          ? formatEval(analysis.eval, isWhiteTurn)
          : "-"}
      </div>

      {/* Show best move */}
      {getBestMoveNotation() && (
        <div className="best-move">
          <div className="best-move-label">
            {currentMoveIndex > 0 ? "Best move was:" : "Best move:"}
          </div>
          <div className="best-move-notation">{getBestMoveNotation()}</div>
        </div>
      )}

      {/* Show move evaluation for played moves */}
      {currentMoveIndex > 0 && (
        <>
          {analysis.classification && (
            <div className="move-classification">
              <div className="classification-header">Move Evaluation:</div>
              <div
                className={`classification-badge ${analysis.classification.class}`}
              >
                {analysis.classification.label}
                {analysis.cpLoss !== undefined && (
                  <span className="cp-loss">
                    ({analysis.cpLoss > 0 ? "+" : ""}
                    {analysis.cpLoss.toFixed(2)} cp)
                  </span>
                )}
              </div>
            </div>
          )}

          {actualMove && (
            <div className="actual-move">
              <div className="actual-move-label">Move played:</div>
              <div className="actual-move-notation">{actualMove}</div>
            </div>
          )}

          {explanation && (
            <div className="move-explanation">
              <div className="explanation-header">Explanation:</div>
              <div className="explanation-text">{explanation}</div>
            </div>
          )}
        </>
      )}

      {isAnalyzing && (
        <div className="loading">
          Analyzing position{analysis.depth && ` (depth ${analysis.depth})`}...
        </div>
      )}
    </div>
  );
}
