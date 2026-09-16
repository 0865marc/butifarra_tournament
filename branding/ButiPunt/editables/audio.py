"""Original quiet tonal score, composed deterministically; no sampled music or voice."""
from pathlib import Path
import math, wave, array
root=Path('/home/user/butipunt-final')
rate=48000; duration=30
samples=array.array('f',[0.0])*(rate*duration)
melody=[60,64,67,69,67,64,62,64,60,67,64,62,57,60,64,67]
for k in range(40):
    start=int(k*.75*rate); freq=440*2**((melody[k%len(melody)]-69)/12)
    for i in range(int(.7*rate)):
        if start+i>=len(samples):break
        t=i/rate; env=min(1,t/.016)*math.exp(-t*5)
        samples[start+i]+=.075*env*(math.sin(2*math.pi*freq*t)+.22*math.sin(4*math.pi*freq*t))
for sec in [15,30]:
    pcm=array.array('h')
    for i,s in enumerate(samples[:sec*rate]):
        fade=min(1,i/(rate*.1),(sec*rate-1-i)/(rate*.7))
        pcm.append(round(s*fade*32767))
    target=root/'editables'/f'butipunt-tonos-{sec}s.wav'
    with wave.open(str(target),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(pcm.tobytes())

