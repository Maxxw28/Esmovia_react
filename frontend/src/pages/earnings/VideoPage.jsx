import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VideoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const video = document.getElementById('reward-video');

    // useEffect(() => {
    //  const lastWatched = localStorage.getItem('lastWatched');
    // const today = new Date().toDateString();

    // if (lastWatched === today) {
    //   alert("You have already watched the video today.");
    //   window.location.hash = '#/dashboard/earnings';
    // }
    //}, [navigate]);



    const handleEnded = () => {
      // Zapisz datę obejrzenia (opcjonalnie)
      const today = new Date().toDateString();
      localStorage.setItem('lastWatched', today);

      // Opóźnienie daje czas na zakończenie filmu i przerywnik
      setTimeout(() => {
        navigate('/dashboard/earnings');
      }, 500);
    };

    if (video) {
      video.addEventListener('ended', handleEnded);
    }

    return () => {
      if (video) {
        video.removeEventListener('ended', handleEnded);
      }
    };
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <video
        id="reward-video"
        src="/images/reward.mp4"
        autoPlay
        controls={false}
        className="w-[80%] rounded-xl shadow-lg pointer-events-none"
      />
    </div>
  );
}
