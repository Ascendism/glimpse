import { type Cell } from "@/lib/puzzle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  rows: Cell[][];
  revealed: Set<string>;
  /** ms delay per revealed square, keyed by cell id */
  delays: Record<string, number>;
};

export function PuzzleBoard({ rows, revealed, delays }: Props) {
  const [painted, setPainted] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPainted(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  return (
    <div className="board-frame puzzle-board" role="group" aria-label="Puzzle title board">
      <div className="flex flex-col puzzle-rows">
        {rows.map((row, r) => (
          <div key={r} className="flex justify-center puzzle-row">
            {row.map((cell, c) => {
              const id = `${r}-${c}`;
              const isOpen = painted && cell.kind !== "empty" && revealed.has(id);
              const showPunct = cell.kind === "punct";
              return (
                <div
                  key={id}
                  className="tile-slot"
                  data-cell={id}
                  aria-label={
                    cell.kind === "empty"
                      ? "Empty"
                      : isOpen || showPunct
                        ? cell.char
                        : "Hidden letter"
                  }
                >
                  <div
                    className={cn("tile-inner", (isOpen || showPunct) && "tile-flipped")}
                    style={{ transitionDelay: `${delays[id] ?? 0}ms` }}
                  >
                    <div
                      className={cn(
                        "tile-face",
                        cell.kind === "empty" ? "tile-empty" : "tile-blank",
                      )}
                    />
                    <div className="tile-face tile-back" aria-hidden="true">
                      {cell.kind !== "empty" && (isOpen || showPunct) ? cell.char : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
