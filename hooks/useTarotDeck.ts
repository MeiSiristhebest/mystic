import { useState, useCallback } from 'react';
import { generateDeck, shuffleDeck, TarotCard as TarotCardType } from '@/lib/tarot-data';
import { playCardSound } from '@/lib/audio';

export function useTarotDeck() {
  const [deckCards, setDeckCards] = useState<TarotCardType[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSelectingCards, setIsSelectingCards] = useState(false);
  const [drawnCards, setDrawnCards] = useState<TarotCardType[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);

  const startShuffle = useCallback(() => {
    if (isShuffling) return;
    setIsShuffling(true);
    setDrawnCards([]);
    setDeckCards([]);
    setSelectedIndices([]);
    
    setTimeout(() => {
      const deck = shuffleDeck(generateDeck());
      setDeckCards(deck);
      setIsShuffling(false);
      setIsSelectingCards(true);
    }, 3500);
  }, [isShuffling]);

  const selectCard = useCallback((index: number, cardCount: number) => {
    if (selectedIndices.includes(index) || selectedIndices.length >= cardCount) return;

    playCardSound();
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === cardCount) {
      setTimeout(() => {
        const selectedCards = newSelected.map(i => deckCards[i]);
        setDrawnCards(selectedCards);
        setRevealedCards(new Array(cardCount).fill(false));
        setIsSelectingCards(false);
      }, 800);
    }
  }, [selectedIndices, deckCards]);

  const revealCard = useCallback((index: number) => {
    if (revealedCards[index]) return;
    playCardSound();
    const newRevealed = [...revealedCards];
    newRevealed[index] = true;
    setRevealedCards(newRevealed);
  }, [revealedCards]);

  const revealAll = useCallback((cardCount: number) => {
    setRevealedCards(new Array(cardCount).fill(true));
  }, []);

  const resetDeck = useCallback(() => {
    setDrawnCards([]);
    setDeckCards([]);
    setSelectedIndices([]);
    setRevealedCards([]);
    setIsSelectingCards(false);
  }, []);

  return {
    deckCards,
    isShuffling,
    selectedIndices,
    isSelectingCards,
    drawnCards,
    revealedCards,
    startShuffle,
    selectCard,
    revealCard,
    revealAll,
    resetDeck
  };
}
