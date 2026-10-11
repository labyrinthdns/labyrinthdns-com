"use client";

import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { MazeMap } from "@/components/maze-map";

export function LostSignal() {
  const [running, setRunning] = useState(true);
  const [attempt, setAttempt] = useState(0);
  return (
    <div className={`resolver-art lost-art ${running ? "" : "signal-paused"}`}>
      <div className="art-topline">
        <span>
          <i /> SIGNAL LOST
        </span>
        <span>FIG. 404</span>
      </div>
      <div className="lost-numeral">
        4<span>0</span>4
      </div>
      <div className="lost-maze">
        <MazeMap key={attempt} running={running} lost />
      </div>
      <div className="lost-terminal">
        <span className="signal-blink">▍</span>
        <code>query → dead end → retry</code>
      </div>
      <div className="art-result">
        <span>NO ROUTE FOUND</span>
        <div className="flex gap-2">
          <button
            aria-label="Retrace the path"
            onClick={() => {
              setAttempt((value) => value + 1);
              setRunning(true);
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            aria-label={
              running ? "Pause labyrinth animation" : "Play labyrinth animation"
            }
            onClick={() => setRunning((value) => !value)}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
