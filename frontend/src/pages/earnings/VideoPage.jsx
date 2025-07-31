import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VideoPage({ setBatCoins }) {
  const navigate = useNavigate();

 // useEffect(() => {
  //  const lastWatched = localStorage.getItem('lastWatched');
   // const today = new Date().toDateString();

   // if (lastWatched === today) {
   //   alert("You have already watched the video today.");
   //   window.location.hash = '#/dashboard/earnings';
   // }
  //}, [navigate]);

  const handleEnded = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lastWatched', today);
    setBatCoins(prev => prev + 30);
    window.location.hash = '/dashboard/earnings';
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <video
        src="/images/reward.mp4"  // umieść film w public/videos
        autoPlay
        onEnded={handleEnded}
        controls={false}
        className='w-[80%] rounded-xl shadow-lg pointer-events-none'
      />
    </div>
  );
}
