import React from "react";

interface SpreadGeometryProps {
  spreadId?: string;
  count: number;
  renderCard: (index: number) => React.ReactNode;
}

// A row of N cards centered horizontally
function Row({ indices, renderCard, gap = "gap-8 md:gap-14" }: { indices: number[], renderCard: (i: number) => React.ReactNode, gap?: string }) {
  return (
    <div className={`flex justify-center items-start ${gap}`}>
      {indices.map(i => <div key={i}>{renderCard(i)}</div>)}
    </div>
  );
}

// A single centered card
function Center({ index, renderCard }: { index: number, renderCard: (i: number) => React.ReactNode }) {
  return <div className="flex justify-center">{renderCard(index)}</div>;
}

export function SpreadGeometry({ spreadId, count, renderCard }: SpreadGeometryProps) {
  // ── 1 card ───────────────────────────────────────────────────────────────
  if (count === 1) {
    return <Center index={0} renderCard={renderCard} />;
  }

  // ── 2 cards ───────────────────────────────────────────────────────────────
  if (count === 2) {
    return <Row indices={[0, 1]} renderCard={renderCard} gap="gap-16 md:gap-28" />;
  }

  // ── 3 cards (all spreads) ─────────────────────────────────────────────────
  if (count === 3) {
    return <Row indices={[0, 1, 2]} renderCard={renderCard} />;
  }

  // ── 4 cards ───────────────────────────────────────────────────────────────
  if (count === 4) {
    // Elemental cross: center top, left/right middle row, center bottom
    return (
      <div className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl mx-auto">
        <Center index={0} renderCard={renderCard} />
        <Row indices={[1, 2]} renderCard={renderCard} gap="gap-24 md:gap-40" />
        <Center index={3} renderCard={renderCard} />
      </div>
    );
  }

  // ── 5 cards ───────────────────────────────────────────────────────────────
  if (count === 5) {
    if (spreadId === "choice") {
      // Y-branch: top row 2 outcomes, middle row 2 paths, bottom center present
      return (
        <div className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl mx-auto">
          <Row indices={[3, 4]} renderCard={renderCard} gap="gap-16 md:gap-28" />
          <Row indices={[1, 2]} renderCard={renderCard} gap="gap-10 md:gap-20" />
          <Center index={0} renderCard={renderCard} />
        </div>
      );
    }
    // Default 5-card cross: top, left-center-right, bottom
    return (
      <div className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl mx-auto">
        <Center index={2} renderCard={renderCard} />
        <Row indices={[0, 1, 3]} renderCard={renderCard} />
        <Center index={4} renderCard={renderCard} />
      </div>
    );
  }

  // ── 7 cards ───────────────────────────────────────────────────────────────
  if (count === 7) {
    if (spreadId === "hexagram") {
      // True Hexagram (Star of David):
      //   Row 1 (top point):     [0]
      //   Row 2 (upper wings):   [5]   [1]
      //   Row 3 (center):        [6]
      //   Row 4 (lower wings):   [4]   [2]
      //   Row 5 (bottom point):  [3]
      return (
        <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-xl mx-auto">
          <Center index={0} renderCard={renderCard} />
          <Row indices={[5, 1]} renderCard={renderCard} gap="gap-20 md:gap-32" />
          <Center index={6} renderCard={renderCard} />
          <Row indices={[4, 2]} renderCard={renderCard} gap="gap-20 md:gap-32" />
          <Center index={3} renderCard={renderCard} />
        </div>
      );
    }
    if (spreadId === "chakra") {
      // 7 Chakras: vertical column, top to bottom
      return (
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <Center key={i} index={i} renderCard={renderCard} />
          ))}
        </div>
      );
    }
    // week/other 7-card spreads: two rows 4+3
    return (
      <div className="flex flex-col items-center gap-8 md:gap-12 w-full">
        <Row indices={[0, 1, 2, 3]} renderCard={renderCard} gap="gap-4 md:gap-10" />
        <Row indices={[4, 5, 6]} renderCard={renderCard} gap="gap-4 md:gap-10" />
      </div>
    );
  }

  // ── 10 cards (Tree of Life / Celtic Cross) ────────────────────────────────
  if (count === 10) {
    if (spreadId === "tree_of_life") {
      return (
        <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-xl mx-auto">
          <Center index={0} renderCard={renderCard} />
          <Row indices={[1, 2]} renderCard={renderCard} gap="gap-16 md:gap-28" />
          <Row indices={[3, 4]} renderCard={renderCard} gap="gap-16 md:gap-28" />
          <Center index={5} renderCard={renderCard} />
          <Row indices={[6, 7]} renderCard={renderCard} gap="gap-16 md:gap-28" />
          <Row indices={[8, 9]} renderCard={renderCard} gap="gap-16 md:gap-28" />
        </div>
      );
    }
    // Celtic Cross: cross on left, staff on right
    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <Center index={2} renderCard={renderCard} />
          <Row indices={[4, 0, 5]} renderCard={renderCard} />
          <Center index={3} renderCard={renderCard} />
        </div>
        <div className="flex flex-col items-center gap-6 md:gap-8">
          {[9, 8, 7, 6].map(i => <Center key={i} index={i} renderCard={renderCard} />)}
        </div>
      </div>
    );
  }

  // ── Ultimate fallback ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-4xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderCard(i)}</div>
      ))}
    </div>
  );
}
