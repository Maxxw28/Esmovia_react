import React from 'react'
import Batphoto from '/images/batclicker.png'
import { useState} from "react"
import ReactDOM from "react-dom/client"


export default function Clicker() {
  const[count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prevCount => prevCount + 1)
      if(count === 1000){
      setCount(0);
    }
  };


  return (
    <>
    <div className='flex justify-center'>
      <img src={Batphoto} onClick={handleClick} alt="Bat" className='w-110 border-solid border-gray-200 border-4 rounded-3xl shadow-md active:scale-110 transition-transform duration-200 cursor-pointer hover:border-purple-300'/>
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
    </>
  )
}
