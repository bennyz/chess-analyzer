export interface Move {
  san: string;
  from: string;
  to: string;
  fen: string;
  moveNumber: number;
  isWhite: boolean;
}

export interface MoveAnalysis {
  eval?: number;
  bestMove?: string;
  cpLoss?: number;
  classification?: ClassifiedMove;
  explanation?: string;
}

export type MoveClassification =
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export interface ClassifiedMove {
  class: MoveClassification;
  label: string;
}
