import os
import yt_dlp
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ✅ ENSURE THIS PATH POINTS TO YOUR FFMPEG FOLDER
FFMPEG_PATH = "C:/ffmpeg-8.0.1-essentials_build/bin" 

class VideoRequest(BaseModel):
    link: str

def get_video_id(link: str):
    if "youtu.be/" in link: return link.split("youtu.be/")[1].split("?")[0]
    if "watch?v=" in link: return link.split("watch?v=")[1].split("&")[0]
    return None

def get_transcript_universal(video_id, video_url):
    try:
        print(f"Checking captions for {video_id}...")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        try:
            transcript = transcript_list.find_transcript(['en', 'hi'])
        except:
            transcript = transcript_list.find_generated_transcript(['en', 'hi'])

        if transcript.language_code != 'en':
            transcript = transcript.translate('en')

        data = transcript.fetch()
        return " ".join([snippet['text'] for snippet in data])
    
    except Exception:
        print(f"Fallback: Extracting audio...")
        final_mp3 = f"temp_{video_id}.mp3"
        
        ydl_opts = {
            'ffmpeg_location': FFMPEG_PATH,
            'format': 'bestaudio/best',
            'outtmpl': f'temp_{video_id}.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '64',
            }],
            'quiet': False,
            'nocheckcertificate': True,
            # ✅ ARRANGED FOR 2026 SECURITY
            'extractor_args': {
                'youtube': {
                    'player_client': ['ios', 'android'],
                    'remote_components': ['ejs:github']
                }
            },
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])

            with open(final_mp3, "rb") as file:
                transcription = client.audio.transcriptions.create(
                    file=(final_mp3, file.read()),
                    model="whisper-large-v3-turbo",
                    response_format="text"
                )
            
            if os.path.exists(final_mp3): os.remove(final_mp3) 
            return transcription

        except Exception as e:
            if os.path.exists(final_mp3): os.remove(final_mp3)
            raise Exception(f"Extraction failed: {str(e)}")

@app.post("/generate-summary")
def generate_summary(data: VideoRequest):
    video_id = get_video_id(data.link)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube link")

    try:
        transcript_text = get_transcript_universal(video_id, data.link)
        prompt = f"Provide a detailed summary in English with bullet points: {transcript_text[:15000]}"
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return {"summary": chat_completion.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}