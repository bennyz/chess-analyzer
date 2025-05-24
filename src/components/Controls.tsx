import React, { useState } from "react";

interface ControlsProps {
  onPgnPaste: (pgn: string) => void;
  onPrevMove: () => void;
  onNextMove: () => void;
  canNavigate: boolean;
  isAnalyzing: boolean;
  fileName?: string;
}

export default function Controls({
  onPgnPaste,
  onPrevMove,
  onNextMove,
  canNavigate,
  isAnalyzing,
  fileName,
}: ControlsProps) {
  const [showPgnDialog, setShowPgnDialog] = useState(false);
  const [pgnText, setPgnText] = useState("");

  const handlePgnSubmit = () => {
    if (pgnText.trim()) {
      onPgnPaste(pgnText.trim());
      setPgnText("");
      setShowPgnDialog(false);
    }
  };

  const handlePgnCancel = () => {
    setPgnText("");
    setShowPgnDialog(false);
  };

  return (
    <>
      <div className="controls">
        <button
          onClick={() => setShowPgnDialog(true)}
          className="paste-pgn-button"
        >
          Paste PGN
        </button>

        <button onClick={onPrevMove} disabled={!canNavigate}>
          ← Previous
        </button>

        <button onClick={onNextMove} disabled={!canNavigate}>
          Next →
        </button>

        {isAnalyzing && (
          <span className="analyzing-status">Analyzing game...</span>
        )}

        {fileName && <span className="file-name">{fileName}</span>}
      </div>

      {showPgnDialog && (
        <div className="pgn-dialog-overlay">
          <div className="pgn-dialog">
            <h3>Paste PGN</h3>
            <textarea
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              placeholder="Paste your PGN text here..."
              rows={10}
              cols={60}
            />
            <div className="pgn-dialog-buttons">
              <button onClick={handlePgnSubmit} disabled={!pgnText.trim()}>
                Analyze Game
              </button>
              <button onClick={handlePgnCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
