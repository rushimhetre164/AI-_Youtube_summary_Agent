import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState("");

  const videoUrl = location.state?.videoUrl || "";
  const videoName = location.state?.videoName || "Training Video";

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSummary(""); 

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: videoUrl }), 
      });

      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else if (data.error) {
        setSummary(`**Backend Error:** ${data.error}`);
      }
    } catch (error) {
      setSummary("_Failed to connect to backend._");
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}` 
      : null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="h-screen w-full bg-[#050505] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black text-white flex flex-col p-4 md:p-6 overflow-hidden">
      
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-4 relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-3 text-white/40 hover:text-blue-400 transition-all"
        >
          <span className="text-xl">←</span>
          <span className="tracking-widest uppercase text-[10px] font-black">Back to Library</span>
        </button>
      </div>

      {/* Main Glass Container - Now using max-w-7xl for more width */}
      <div className="w-full max-w-7xl mx-auto bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-full max-h-[85vh] relative z-10 overflow-hidden">
        
        {/* Title Bar */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h1 className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase">{videoName}</h1>
        </div>

        {/* 🛠️ Split Layout Container */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* LEFT SIDE: Video Player */}
          <div className={`p-6 transition-all duration-500 flex flex-col justify-center ${summary ? 'md:w-1/2 border-r border-white/5' : 'md:w-full max-w-4xl mx-auto'}`}>
            <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              {embedUrl ? (
                <iframe className="w-full h-full" src={embedUrl} title="YouTube player" allowFullScreen></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">Invalid Link</div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Summary or Action Button */}
          <div className={`p-6 flex flex-col transition-all duration-500 ${summary ? 'md:w-1/2' : 'md:w-1/3 flex justify-center items-center'}`}>
            
            {!summary ? (
              // Case 1: Initial State - Big Center Button
              <div className="w-full text-center space-y-4">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`w-full py-6 rounded-3xl font-black text-xl transition-all uppercase tracking-wider flex items-center justify-center gap-4 ${
                    isGenerating ? 'bg-blue-900/40 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] active:scale-95'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Thinking...
                    </>
                  ) : "Analyze Video"}
                </button>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Click to extract AI insights</p>
              </div>
            ) : (
              // Case 2: Result State - Scrollable Summary
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                    <span className="font-bold uppercase tracking-widest text-[10px]">AI Analysis Result</span>
                  </div>
                  <button 
                    onClick={() => setSummary("")} 
                    className="text-[10px] text-white/30 hover:text-white transition-colors uppercase font-bold"
                  >
                    ↻ New Analysis
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                  <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 leading-relaxed text-white/80 text-sm md:text-base whitespace-pre-wrap">
                    {summary}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}