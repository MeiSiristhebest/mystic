import React from "react";

interface SpreadGeometryProps {
  spreadId?: string;
  count: number;
  renderCard: (index: number) => React.ReactNode;
}

// Helpers
function Row({ indices, renderCard, gap = "gap-8 md:gap-12" }: {
  indices: number[];
  renderCard: (i: number) => React.ReactNode;
  gap?: string;
}) {
  return (
    <div className={`flex justify-center items-start ${gap}`}>
      {indices.map(i => <div key={i}>{renderCard(i)}</div>)}
    </div>
  );
}
function Col({ index, renderCard }: { index: number; renderCard: (i: number) => React.ReactNode }) {
  return <div className="flex justify-center">{renderCard(index)}</div>;
}

export function SpreadGeometry({ spreadId, count, renderCard }: SpreadGeometryProps) {

  // ── 1 card ────────────────────────────────────────────────────────────────
  if (count === 1) {
    return <Col index={0} renderCard={renderCard} />;
  }

  // ── 2 cards ───────────────────────────────────────────────────────────────
  if (count === 2) {
    return <Row indices={[0, 1]} renderCard={renderCard} gap="gap-16 md:gap-28" />;
  }

  // ── 3 cards (Holy Triangle / Pyramid) ─────────────────────────────────────
  if (count === 3) {
    // Top apex: card 2 (Future / Outcome / Spirit)
    // Bottom left: card 0 (Past / Present / Body)
    // Bottom right: card 1 (Present / Obstacle / Mind)
    return (
      <div className="flex flex-col items-center gap-8 md:gap-12 w-full max-w-md mx-auto">
        <Col index={2} renderCard={renderCard} />
        <Row indices={[0, 1]} renderCard={renderCard} gap="gap-16 md:gap-32" />
      </div>
    );
  }

  // ── 4 cards ───────────────────────────────────────────────────────────────
  if (count === 4) {
    if (spreadId === "blind_spot") {
      // 2×2 Johari window
      return (
        <div className="flex flex-col items-center gap-8 md:gap-12 w-full max-w-xl mx-auto">
          <Row indices={[0, 1]} renderCard={renderCard} gap="gap-10 md:gap-16" />
          <Row indices={[2, 3]} renderCard={renderCard} gap="gap-10 md:gap-16" />
        </div>
      );
    }
    // Default: elemental cross (top / left-right / bottom)
    return (
      <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-xl mx-auto">
        <Col index={0} renderCard={renderCard} />
        <Row indices={[1, 2]} renderCard={renderCard} gap="gap-14 md:gap-24" />
        <Col index={3} renderCard={renderCard} />
      </div>
    );
  }

  // ── 5 cards ───────────────────────────────────────────────────────────────
  if (count === 5) {
    if (spreadId === "choice") {
      // Y-branch: present at bottom, two paths mid, two outcomes top
      return (
        <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-xl mx-auto">
          <Row indices={[3, 4]} renderCard={renderCard} gap="gap-10 md:gap-20" />
          <Row indices={[1, 2]} renderCard={renderCard} gap="gap-10 md:gap-20" />
          <Col index={0} renderCard={renderCard} />
        </div>
      );
    }
    // career / mirror / past_life / generic cross
    return (
      <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-xl mx-auto">
        <Col index={2} renderCard={renderCard} />
        <Row indices={[0, 1, 3]} renderCard={renderCard} />
        <Col index={4} renderCard={renderCard} />
      </div>
    );
  }

  // ── 7 cards ───────────────────────────────────────────────────────────────
  if (count === 7) {
    if (spreadId === "hexagram") {
      // Star of David: top 1 / wing-2 / center 1 / wing-2 / bottom 1
      return (
        <div className="flex flex-col items-center gap-5 md:gap-7 w-full max-w-lg mx-auto">
          <Col index={0} renderCard={renderCard} />
          <Row indices={[5, 1]} renderCard={renderCard} gap="gap-16 md:gap-28" />
          <Col index={6} renderCard={renderCard} />
          <Row indices={[4, 2]} renderCard={renderCard} gap="gap-16 md:gap-28" />
          <Col index={3} renderCard={renderCard} />
        </div>
      );
    }
    if (spreadId === "chakra") {
      // Vertical spine, top (crown) to bottom (root)
      return (
        <div className="flex flex-col items-center gap-4 md:gap-5 w-full">
          {[6, 5, 4, 3, 2, 1, 0].map(i => <Col key={i} index={i} renderCard={renderCard} />)}
        </div>
      );
    }
    // week: 4 + 3
    return (
      <div className="flex flex-col items-center gap-6 md:gap-10 w-full">
        <Row indices={[0, 1, 2, 3]} renderCard={renderCard} gap="gap-3 md:gap-8" />
        <Row indices={[4, 5, 6]} renderCard={renderCard} gap="gap-3 md:gap-8" />
      </div>
    );
  }

  // ── 10 cards ──────────────────────────────────────────────────────────────
  if (count === 10) {
    if (spreadId === "tree_of_life") {
      // Kabbalistic Tree: symmetric diamond pairs descending
      return (
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-lg mx-auto">
          <Col index={0} renderCard={renderCard} />
          <Row indices={[1, 2]} renderCard={renderCard} gap="gap-12 md:gap-20" />
          <Row indices={[3, 4]} renderCard={renderCard} gap="gap-12 md:gap-20" />
          <Col index={5} renderCard={renderCard} />
          <Row indices={[6, 7]} renderCard={renderCard} gap="gap-12 md:gap-20" />
          <Row indices={[8, 9]} renderCard={renderCard} gap="gap-12 md:gap-20" />
        </div>
      );
    }
    // Celtic Cross: cross left + staff right
    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <Col index={2} renderCard={renderCard} />
          <Row indices={[4, 0, 5]} renderCard={renderCard} />
          <Col index={3} renderCard={renderCard} />
        </div>
        <div className="flex flex-col items-center gap-4 md:gap-6">
          {[9, 8, 7, 6].map(i => <Col key={i} index={i} renderCard={renderCard} />)}
        </div>
      </div>
    );
  }

  // ── 12 cards (Zodiac) ─────────────────────────────────────────────────────
  if (count === 12) {
    // 3 rows of 4
    return (
      <div className="flex flex-col items-center gap-5 md:gap-8 w-full max-w-2xl mx-auto">
        <Row indices={[0, 1, 2, 3]} renderCard={renderCard} gap="gap-3 md:gap-6" />
        <Row indices={[4, 5, 6, 7]} renderCard={renderCard} gap="gap-3 md:gap-6" />
        <Row indices={[8, 9, 10, 11]} renderCard={renderCard} gap="gap-3 md:gap-6" />
      </div>
    );
  }

  // ── 13 cards (Yearly) ─────────────────────────────────────────────────────
  if (count === 13) {
    // 3 rows of 4, plus 1 center "year theme" card
    return (
      <div className="flex flex-col items-center gap-5 md:gap-8 w-full max-w-2xl mx-auto">
        <Row indices={[0, 1, 2, 3]} renderCard={renderCard} gap="gap-2 md:gap-5" />
        <Row indices={[4, 5, 6, 7]} renderCard={renderCard} gap="gap-2 md:gap-5" />
        <Row indices={[8, 9, 10, 11]} renderCard={renderCard} gap="gap-2 md:gap-5" />
        <Col index={12} renderCard={renderCard} />
      </div>
    );
  }

  // ── Ultimate fallback ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-10 w-full max-w-4xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderCard(i)}</div>
      ))}
    </div>
  );
}
