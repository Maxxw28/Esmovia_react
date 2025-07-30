import React from 'react'
import Minerphoto from '/images/batminer.png'
import { useState} from "react"
import ReactDOM from "react-dom/client"
import Coin  from '/images/batcoin.png'

export default function Miner() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  function startMining() {
  if (loading) return;

  setLoading(true);
  setProgress(0);

  const interval = 30000 / 100; // 30s podzielone na 100 kroków (czyli 1% = 300ms)

  let current = 0;
  const timer = setInterval(() => {
    current += 1;
    setProgress(current);

    if (current >= 100) {
      clearInterval(timer);
      setLoading(false);
      // tutaj możesz dodać losowanie nagrody!
    }
  }, interval);
}

  return (
    <>
    <div className='flex justify-center'>
        <div className='w-110 border-solid border-gray-200 border-4 rounded-3xl shadow-md cursor-pointer hover:border-purple-300 flex flex-col items-center'>
          <img src={Minerphoto} alt="Bat" className='mb-4' />
          <button
            onClick={startMining}
            disabled={loading}
            className={`text-xl text-white rounded-xl w-40 h-10 mb-2 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Mining...' : 'Start Mining'}
          </button>
          {loading && (
            <div className='w-40 h-4 bg-gray-300 rounded-full mt-2 mb-4 overflow-hidden'>
              <div
                className='h-full bg-purple-500 transition-all duration-300'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
        </div>
          <div className='w-70 h-60 p-5 border-solid border-gray-200 border-4 rounded-3xl shadow-md absolute top-50 left-10 hover:border-purple-300'>
            <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Percent chances:</h2>
          <ul class="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400 ">
              <li className=''>
                  1 BatPoint 100%
              </li>
              <li>
                  2 BatPoints - 50%
              </li>
              <li>
                  10 BatPoints - 5%
              </li>
              <li>
                  50 BatCoins - 0.5%
              </li>
              <li>
                  100 BatCoins - 0.1%
              </li>
          </ul>
          </div>
          <h2 className='text-2xl mt-8 text-black-700 font-semibold text-right'>BatCoins: </h2>
        </>
  )
}
