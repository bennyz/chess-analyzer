import { ClassifiedMove } from "../types/chess.ts";

export function classifyMove(
  cpLoss: number,
  actualMove: string,
  bestMove?: string,
): ClassifiedMove {
  if (actualMove && bestMove && actualMove === bestMove) {
    return { class: "best", label: "Best" };
  }

  const absLoss = Math.abs(cpLoss);

  if (absLoss < 0.5) return { class: "excellent", label: "Excellent" };
  if (absLoss < 1.0) return { class: "good", label: "Good" };
  if (absLoss < 2.0) return { class: "inaccuracy", label: "Inaccuracy" };
  if (absLoss < 4.0) return { class: "mistake", label: "Mistake" };
  return { class: "blunder", label: "Blunder" };
}

export function formatEval(evaluation: number, isWhiteTurn: boolean): string {
  if (evaluation > 0) {
    return `+${evaluation.toFixed(2)}`;
  } else if (evaluation < 0) {
    return evaluation.toFixed(2);
  } else {
    return "0.00";
  }
}

export function explainMove(
  cpLoss: number,
  actualMove: string,
  bestMove: string,
  classification: ClassifiedMove,
): string {
  if (classification.class === "good") {
    if (actualMove === bestMove) {
      return `Perfect! You found the computer's top choice.`;
    }
    return `Good move with minimal loss of advantage.`;
  }

  const lossText = `costing ${Math.abs(cpLoss).toFixed(2)} centipawns`;

  if (classification.class === "inaccuracy") {
    return `A slight inaccuracy ${lossText}. Consider ${bestMove} instead, which maintains a better position.`;
  }

  if (classification.class === "mistake") {
    return `A notable mistake ${lossText}. The move ${bestMove} would have been significantly better, maintaining your advantage or reducing your disadvantage.`;
  }

  if (classification.class === "blunder") {
    return `A serious blunder ${lossText}! This move severely damaged your position. The recommended ${bestMove} would have been much stronger.`;
  }

  return "Move evaluation unavailable.";
}
