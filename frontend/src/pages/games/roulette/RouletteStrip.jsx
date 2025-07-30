import React, { useEffect, useRef, useState } from "react";
import "./strip.css";

// Stały układ liczb w europejskiej ruletce (zgodny z ruletką fizyczną)
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
  const [stripItems, setStripItems] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [key, setKey] = useState(0);

  const ITEM_WIDTH = 60;
  const REPEAT_COUNT = 4; // Ile razy powielić całą sekwencję ruletki

  // Przy pierwszym załadowaniu – pokaż pasek z kolejnością ruletki
  useEffect(() => {
    const initialStrip = [...Array(REPEAT_COUNT)].flatMap(() => rouletteOrder);
    setStripItems(initialStrip);

    if (trackRef.current && containerRef.current) {
      const visibleItems = Math.floor(containerRef.current.offsetWidth / ITEM_WIDTH);
      const middleIndex = Math.floor(initialStrip.length / 2);
      const shift =
        middleIndex * ITEM_WIDTH -
        ((visibleItems * ITEM_WIDTH) / 2 - ITEM_WIDTH / 2);
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${shift}px)`;
    }
  }, []);

  // Resetuj pasek przy rozpoczęciu obrotu
  useEffect(() => {
    if (!spinning) return;
    setAnimating(true);
    setKey((prev) => prev + 1);
  }, [spinning]);

  // Główna animacja – przesuwanie do wylosowanej liczby zgodnie z układem ruletki
  useEffect(() => {
    if (!spinning) return;

    // Tworzymy długi pasek z powtarzaną sekwencją ruletki
    const strip = [...Array(REPEAT_COUNT)].flatMap(() => rouletteOrder);
    setStripItems(strip);

    const middleIndex = Math.floor(strip.length / 2);
    const selectedIndex = strip.indexOf(selectedNumber, middleIndex);

    requestAnimationFrame(() => {
      if (!trackRef.current || !containerRef.current) return;

      const visibleItems = Math.floor(containerRef.current.offsetWidth / ITEM_WIDTH);
      const shift =
        selectedIndex * ITEM_WIDTH -
        ((visibleItems * ITEM_WIDTH) / 2 - ITEM_WIDTH / 2);

      trackRef.current.style.transition = "transform 2.5s ease-out";
      trackRef.current.style.transform = `translateX(-${shift}px)`;
    });

    const timeout = setTimeout(() => {
      setAnimating(false);
      onEnd && onEnd();
    }, 2700);

    return () => clearTimeout(timeout);
  }, [key, spinning, selectedNumber, onEnd]);

  return (
    <div
      key={key}
      ref={containerRef}
      className="w-[360px] h-[60px] overflow-hidden border-4 border-white rounded-lg bg-gray-800 mx-auto relative"
    >
      <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white opacity-60 z-10 pointer-events-none" />

      <div ref={trackRef} className="flex items-center h-full">
        {stripItems.map((num, i) => (
          <div
            key={i + '-' + num}
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
