import React, { useEffect, useRef, useState } from "react";
import "./strip.css";

const numbers = Array.from({ length: 37 }, (_, i) => i);

const getColor = (num) => {
  if (num === 0) return "bg-green-600";
  return num % 2 === 0 ? "bg-black" : "bg-red-600";
};

export default function RouletteStrip({ selectedNumber, spinning, onEnd }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [stripItems, setStripItems] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);

  const ITEM_WIDTH = 60;
  const PRE_SPIN_ITEMS = 80;
  const POST_SPIN_ITEMS = 10;

  // Inicjalne losowe tło (zapełnia pasek od razu)
  useEffect(() => {
    const initialStrip = Array.from({ length: PRE_SPIN_ITEMS + POST_SPIN_ITEMS }, () =>
      numbers[Math.floor(Math.random() * numbers.length)]
    );
    setStripItems(initialStrip);
  }, []);

  // Obsługa losowania
  useEffect(() => {
    if (!spinning || isSpinning) return;
    setIsSpinning(true);

    // Tworzymy pełny pasek: losowe + wynik + losowe za wynikiem
    const prefix = Array.from({ length: PRE_SPIN_ITEMS }, () =>
      numbers[Math.floor(Math.random() * numbers.length)]
    );
    const suffix = Array.from({ length: POST_SPIN_ITEMS }, () =>
      numbers[Math.floor(Math.random() * numbers.length)]
    );

    const fullStrip = [...prefix, selectedNumber, ...suffix];
    setStripItems(fullStrip);

    // oblicz przesunięcie do wyśrodkowania wyniku
    requestAnimationFrame(() => {
      if (!trackRef.current || !containerRef.current) return;

      const visibleItems = Math.floor(containerRef.current.offsetWidth / ITEM_WIDTH);
      const resultIndex = prefix.length;

      const shift =
        resultIndex * ITEM_WIDTH -
        ((visibleItems * ITEM_WIDTH) / 2 - ITEM_WIDTH / 2);

      trackRef.current.style.transition = "transform 2.5s ease-out";
      trackRef.current.style.transform = `translateX(-${shift}px)`;
    });

    const timeout = setTimeout(() => {
      onEnd && onEnd();
      setIsSpinning(false);
    }, 2700);

    return () => clearTimeout(timeout);
  }, [spinning, selectedNumber, onEnd, isSpinning]);

  return (
    <div
      ref={containerRef}
      className="w-[360px] h-[60px] overflow-hidden border-4 border-white rounded-lg bg-gray-800 mx-auto relative"
    >
      {/* Wskaźnik */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white opacity-60 z-10 pointer-events-none" />

      {/* Pasek liczb */}
      <div ref={trackRef} className="flex items-center h-full">
        {stripItems.map((num, i) => (
          <div
            key={i}
            className={`w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center text-white font-bold text-xl ${getColor(
              num
            )}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
