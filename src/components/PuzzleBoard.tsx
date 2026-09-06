import { type Cell } from "@/lib/puzzle";
import { cn } from "@/lib/utils";

type Props = {
  rows: Cell[][];
  revealed: Set<string>;
  /** ms delay per revealed square, keyed by cell id */
  delays: Record<string, number>;
};

export function PuzzleBoard({ rows, revealed, delays }: Props) {
  return (
    <div className="board-frame">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {rows.map((row, r) => (
          <div key={r} className="flex justify-center gap-1.5 sm:gap-2">
            {row.map((cell, c) => {
              const id = `${r}-${c}`;
              const isOpen = cell.kind !== "empty" && revealed.has(id);
              const showPunct = cell.kind === "punct";
              return (
                <div key={id} className="tile-slot">
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
                    <div className="tile-face tile-back">
                      {cell.kind !== "empty" ? cell.char : ""}
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
