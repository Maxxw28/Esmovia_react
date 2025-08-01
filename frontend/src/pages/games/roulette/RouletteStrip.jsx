import React, { useEffect, useRef, useState } from "react";
import "./strip.css"
const rouletteOrder = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27,
  13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
  20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const getColor = (num) => {
  if (num === 0) return "bg-green-600";
  const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36
  ];
  return redNumbers.includes(num) ? "bg-red-600" : "bg-black";
};

export default function RouletteStrip({ selectedNumber, spinning, onEnd }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const ITEM_WIDTH = 60;
  const REPEAT_COUNT = 20;
  const SCROLL_DURATION = 3000;

  const [strip, setStrip] = useState([]);

  useEffect(() => {
    const extended = [];
    for (let i = 0; i < REPEAT_COUNT; i++) {
      extended.push(...rouletteOrder);
    }
    setStrip(extended);
  }, []);

  useEffect(() => {
    if (!spinning || !trackRef.current || !containerRef.current || strip.length === 0) return;

    const track = trackRef.current;
    const container = containerRef.current;

    // Krok 1: rozpocznij scroll od początku
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";

    // Krok 2: znajdź indeks numeru do trafienia
    const middle = Math.floor(strip.length / 2);
    const candidates = strip.map((val, i) => ({ val, i }))
      .filter(({ val }) => val === selectedNumber);
    const targetIndex = candidates.reduce((prev, curr) =>
      Math.abs(curr.i - middle) < Math.abs(prev.i - middle) ? curr : prev
    ).i;

    // Oblicz przesunięcie, aby `selectedNumber` był na środku
    const visibleCount = Math.floor(container.offsetWidth / ITEM_WIDTH);
    const centerOffset = targetIndex * ITEM_WIDTH - ((visibleCount * ITEM_WIDTH) / 2 - ITEM_WIDTH / 2);

    // Krok 3: rozpocznij animację
    requestAnimationFrame(() => {
      track.style.transition = `transform ${SCROLL_DURATION}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
      track.style.transform = `translateX(-${centerOffset}px)`;
    });

    const timeout = setTimeout(() => {
      onEnd?.();
    }, SCROLL_DURATION + 100); // zapas 100ms

    return () => clearTimeout(timeout);
  }, [spinning, selectedNumber, strip]);

  return (
    <div
      ref={containerRef}
      className="w-[360px] h-[60px] overflow-hidden border-4 border-white rounded-lg bg-gray-800 mx-auto relative"
    >
      {/* Znacznik środka */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white opacity-60 z-10 pointer-events-none" />

      {/* Pasek liczb */}
      <div ref={trackRef} className="flex items-center h-full will-change-transform">
        {strip.map((num, i) => (
          <div
            key={`${i}-${num}`}
            className={`w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center text-white font-bold text-xl ${getColor(num)}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
