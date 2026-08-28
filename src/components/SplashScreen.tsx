import React, { useEffect, useState } from 'react';
import nirnayLogo from '../assets/nirnay-logo.png';

const SPLASH_IMAGES = [
  'https://sc0.blr1.digitaloceanspaces.com/large/890727-bxivrwaivt-1534423494.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS81SMZEXkncYJXUOkZbgRxm1PYwV83oDSAdFE0jvvZ0xEwzSipoanzF_9a&s=10',
  'https://w.ndtvimg.com/sites/3/2023/06/16124036/thumbnail_660-58.jpg',
  'https://static.vecteezy.com/system/resources/thumbnails/057/364/663/small/cracked-asphalt-road-and-rubble-in-earthquake-aftermath-landscape-photo.jpg',
  'https://www.unicef.org/thailand/sites/unicef.org.thailand/files/styles/press_release_feature/public/UNI772814_UNICEF_Htet.webp?itok=UqvHf4RX',
];

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const imageTimer = window.setInterval(() => {
      setIsImageVisible(false);
      window.setTimeout(() => {
        setImageIndex((current) => (current + 1) % SPLASH_IMAGES.length);
        setIsImageVisible(true);
      }, 250);
    }, 1500);

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
      window.setTimeout(onComplete, 700);
    }, SPLASH_IMAGES.length * 1500);

    return () => {
      window.clearInterval(imageTimer);
      window.clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <main
      aria-label="Loading Nirnay emergency command system"
      className={`relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center transition-opacity duration-500 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(5,8,10,.42),rgba(5,8,10,.8)),url('${SPLASH_IMAGES[imageIndex]}')`,
          opacity: isImageVisible ? 1 : 0,
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,217,255,.12),transparent_38%),linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.28))]" />

      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="relative flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52">
          <div className="absolute inset-0 rounded-full border border-cyan-300/30 animate-logo-orbit" />
          <div className="absolute inset-3 rounded-full border border-white/15 border-dashed animate-logo-orbit-reverse" />
          <img src={nirnayLogo} alt="Nirnay" className="relative z-10 w-36 object-contain drop-shadow-[0_0_28px_rgba(0,217,255,.55)] sm:w-44" />
        </div>
        <div className="h-1 w-40 overflow-hidden bg-white/20">
          <div className="h-full w-1/3 bg-cyan-300 animate-splash-progress" />
        </div>
      </div>
    </main>
  );
};
