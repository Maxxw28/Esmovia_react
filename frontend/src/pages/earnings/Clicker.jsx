import React from 'react'
import Batphoto from '/images/batclicker.png'
import { useState} from "react"
import ReactDOM from "react-dom/client"
import Coin  from '/images/batcoin.png'


export default function Clicker() {
  const[count, setCount] = useState(0);
  const[batCoins, setBatCoins] = useState(0);
  const[floatingText, setFloatingText] = useState(null);

const handleClick = () => {
  const reward = randomCoins();

  setCount(prevCount => {
    const newCount = prevCount + 1;

    if (newCount === 1000) {
      const totalReward = reward + 10;
      setBatCoins(prev => prev + totalReward);

      setFloatingText(`+${totalReward}`);
      setTimeout(() => setFloatingText(null), 500);

      return 0;
    }

    setBatCoins(prev => prev + reward);

    setFloatingText(`+${reward}`);
    setTimeout(() => setFloatingText(null), 500);

    return newCount;
  });
};

  function randomCoins(){
    const roll = Math.random()*100;

    if (roll < 0.001) return 100;
    if (roll < 0.5) return 5;
    if (roll < 2.501) return 2;
    if (roll < 12.501) return 1;
    return 0;
  }



  return (
    <>
    <div className='flex justify-center'>
      <img src={Batphoto} onClick={handleClick} alt="Bat" className='w-110 border-solid border-gray-200 border-4 rounded-3xl shadow-md active:scale-110 transition-transform duration-200 cursor-pointer hover:border-purple-300'/>
    {floatingText && (
      <div
        key={floatingText.id}
        className="absolute text-3xl font-bold text-black-900 animate-float flex items-center gap-2"
        style={{
        left: `${Math.random() * 40 + 30}%`, // losowe przesunięcie poziome (opcjonalne)
        top: `${Math.random() * 20 + 30}%`,  // losowe przesunięcie pionowe (opcjonalne)
        }}
      >
        {floatingText}
        <img src={Coin} alt="BatCoin" className="w-10" />
      </div>
    )}
    </div>
      <div className='w-70 h-60 p-5 border-solid border-gray-200 border-4 rounded-3xl shadow-md absolute top-50 left-10 hover:border-purple-300'>
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Percent chances:</h2>
      <ul class="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400 ">
          <li className=''>
              10 BatCoins after 1000 clicks
          </li>
          <li>
              1 Batcoin - 10%
          </li>
          <li>
              2 BatCoins - 2%
          </li>
          <li>
              5 BatCoins - 0.5%
          </li>
          <li>
              100 BatCoins - 0.001%
          </li>
      </ul>
      </div>
      <div className='flex justify-center'>
      <h1 className='text-3xl mt-10 text-purple-900 font-bold'>clicks {count} out of 1000</h1>
      </div>
      <h2 className='text-2xl mt-8 text-black-700 font-semibold text-right'>BatCoins: {batCoins}</h2>
    </>
  )
}
