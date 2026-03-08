import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(null);

  const videoHistory = [
    { name: "Training Video 1", url: "https://youtu.be/aDWg5v-k2k8?si=mAQ2uYRoC3EqEdc0" },
    { name: "Training Video 2", url: "https://youtu.be/fWQcjeFri7c?si=VDbLohG6KxDsygUI" },
    { name: "Training Video 3", url: "https://youtu.be/wLGdHWN22t8?si=HIWjF9Znivuu55r0" },


  ];

  const handleVideoClick = (video) => {
    // This now receives the whole object {name, url}
    navigate('/summary', { state: { videoUrl: video.url, videoName: video.name } });
  };

  return (
    <div 
      className="flex h-screen w-full bg-cover bg-center bg-fixed items-center justify-center text-white"
      style={{ backgroundImage: `url('/bgimg.jpg')` }}
    >
      <div className="w-[500px] min-h-[550px] bg-black/60 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-10 bg-blue-600/40 border-b border-white/10 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter">My Video</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {videoHistory.map((item, index) => (
            <div 
              key={index} 
              onMouseEnter={() => setActiveVideo(index)}
              onMouseLeave={() => setActiveVideo(null)}
              // FIXED: Passing 'item' (the object) instead of 'item.url' (the string)
              onClick={() => handleVideoClick(item)} 
              className={`
                p-8 border-b border-white/5 cursor-pointer transition-all duration-300 flex items-center justify-between
                ${activeVideo === index ? 'bg-blue-600/30 pl-12' : 'bg-transparent'}
              `}
            >
              <span className={`text-xl font-bold ${activeVideo === index ? 'text-white' : 'text-white/70'}`}>
                {item.name}
              </span>
              
              <span className={`text-2xl transition-all duration-300 ${activeVideo === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                →
              </span>
            </div>
          ))}
          
          {videoHistory.length < 5 && (
            <div className="p-8 text-white/10 text-sm italic font-light">
              End of list...
            </div>
          )}
        </div>

        <div className="p-6 bg-black/20 text-center border-t border-white/5">
           <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
             Select a session to play
           </span>
        </div>
      </div>
    </div>
  );
}