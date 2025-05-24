import React from "react";
import { Chessboard } from "react-chessboard";

interface BoardProps {
  position: string;
  boardWidth?: number;
  lastMove?: { from: string; to: string } | null;
  bestMove?: string | null;
}

export default function Board({
  position,
  boardWidth = 460,
  lastMove,
  bestMove,
}: BoardProps) {
  // Convert chess move notation to square coordinates
  const customArrows = React.useMemo(() => {
    const arrows = [];

    // Add arrow for the last move played (blue)
    if (lastMove && lastMove.from && lastMove.to) {
      arrows.push([lastMove.from, lastMove.to, "rgb(59, 130, 246)"]); // Blue arrow for actual move
    }

    // Add arrow for best move (green) - only if it's different from the actual move
    if (bestMove && bestMove.length >= 4) {
      const bestFrom = bestMove.substring(0, 2);
      const bestTo = bestMove.substring(2, 4);

      // Only show green arrow if it's different from the actual move
      const isDifferentMove =
        !lastMove || lastMove.from !== bestFrom || lastMove.to !== bestTo;

      if (isDifferentMove) {
        arrows.push([bestFrom, bestTo, "rgb(34, 197, 94)"]); // Green arrow for best move
      }
    }

    return arrows;
  }, [lastMove, bestMove]);

  // Highlight squares for the last move
  const customSquareStyles = React.useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove && lastMove.from && lastMove.to) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(59, 130, 246, 0.3)", // Blue highlight for move start
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(59, 130, 246, 0.3)", // Blue highlight for move end
      };
    }

    return styles;
  }, [lastMove]);

  return (
    <div className="board-container">
      <Chessboard
        position={position}
        boardWidth={boardWidth}
        arePiecesDraggable={false}
        customArrows={customArrows}
        customSquareStyles={customSquareStyles}
      />
      <div className="board-legend">
        <div className="legend-item">
          <div className="legend-arrow blue"></div>
          <span>Move Played</span>
        </div>
        <div className="legend-item">
          <div className="legend-arrow green"></div>
          <span>Best Move</span>
        </div>
      </div>
    </div>
  );
}
