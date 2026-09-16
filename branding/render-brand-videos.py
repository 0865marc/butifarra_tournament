"""Render the authored ButiRonda scenes as four finished local MP4 files."""
from pathlib import Path
import concurrent.futures
import json
import math
import os
import struct
import subprocess
import tempfile
import wave

ROOT=Path(__file__).resolve().parent/'butironda-pack'
FFMPEG=os.environ.get('BUTIRONDA_FFMPEG','/tmp/butironda-media/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2')
SCENES=json.loads((ROOT/'videos/escenas.json').read_text())
RATE=44100

def soundtrack(duration):
    """Original quiet plucked-tone sequence; no sampled or third-party recordings."""
    total=round(duration*RATE)
    samples=[0.0]*total
    notes=[48,55,60,64,50,57,62,65,45,52,57,60,43,50,55,59,48,55,60,67]
    beat=.75
    for i in range(math.ceil(duration/beat)):
        onset=round(i*beat*RATE)
        freq=440*2**((notes[i%len(notes)]-69)/12)
        length=min(round(1.1*RATE),total-onset)
        for j in range(length):
            t=j/RATE
            attack=min(1,t/.008)
            decay=math.exp(-4.5*t)
            tone=math.sin(2*math.pi*freq*t)+.24*math.sin(4*math.pi*freq*t)+.08*math.sin(6*math.pi*freq*t)
            samples[onset+j]+=.11*attack*decay*tone
    peak=max(abs(v) for v in samples)
    assert peak<.3, peak
    path=ROOT/f'videos/fuentes/musica-original-{duration}s.wav'
    with wave.open(str(path),'wb') as out:
        out.setnchannels(2);out.setsampwidth(2);out.setframerate(RATE)
        buf=bytearray()
        for v in samples:
            n=round(v*32767)
            buf+=struct.pack('<hh',n,n)
        out.writeframes(buf)
    return path

MUSIC={15:soundtrack(15),30:soundtrack(30)}

def run(cmd):
    r=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-7000:])
    return r

def render(lang,kind):
    vertical=kind=='vertical'
    width,height=(1080,1920) if vertical else (1920,1080)
    seconds=3 if vertical else 5
    frames=seconds*30
    total=15 if vertical else 30
    name=f'{"vertical-15s" if vertical else "explicacion-30s"}-{lang}'
    output=ROOT/f'videos/{name}.mp4'
    with tempfile.TemporaryDirectory(prefix='butironda-video-') as temp:
        temp=Path(temp); clips=[]
        for i,source in enumerate(SCENES[lang][kind]):
            clip=temp/f'clip-{i:02}.mp4'
            vf=(f"zoompan=z='1.018-0.018*on/{frames-1}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={width}x{height}:fps=30,"
                f"fade=t=in:st=0:d=0.16:color=0xf6f0e3,fade=t=out:st={seconds-.16}:d=0.16:color=0xf6f0e3,format=yuv420p")
            run([FFMPEG,'-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',str(ROOT/source),'-vf',vf,'-frames:v',str(frames),'-an','-c:v','libx264','-preset','veryfast','-crf','19','-threads','2','-r','30',str(clip)])
            clips.append(clip)
        concat=temp/'clips.txt'
        concat.write_text(''.join(f"file '{p}'\n" for p in clips))
        run([FFMPEG,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-i',str(MUSIC[total]),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','128k','-af',f'afade=t=in:st=0:d=0.25,afade=t=out:st={total-.6}:d=0.6','-t',str(total),'-movflags','+faststart','-metadata',f'title=ButiRonda · {name}','-metadata:s:v:0',f'language={"cat" if lang=="ca" else "spa"}',str(output)])
    # Decode every frame and audio sample, not just the container header.
    run([FFMPEG,'-hide_banner','-loglevel','error','-i',str(output),'-f','null','-'])
    proof=ROOT/'videos/verificacion'
    proof.mkdir(exist_ok=True)
    for j,at in enumerate([1.4,total/2+0.5,total-1.5]):
        run([FFMPEG,'-hide_banner','-loglevel','error','-y','-ss',str(at),'-i',str(output),'-frames:v','1',str(proof/f'{name}-{j+1}.png')])
    print(f'{name}: {width}x{height}, {total}s, decoded OK, {output.stat().st_size} bytes',flush=True)
    return {'file':f'videos/{name}.mp4','language':lang,'width':width,'height':height,'duration':total,'fps':30,'videoCodec':'h264','audioCodec':'aac','audio':'original local tone synthesis; no narration','fullyDecoded':True}

if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        jobs=[pool.submit(render,lang,kind) for lang in ['ca','es'] for kind in ['vertical','horizontal']]
        results=[job.result() for job in jobs]
    (ROOT/'videos/verificacion.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
