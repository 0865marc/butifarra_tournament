import fs from 'node:fs';
import path from 'node:path';

// Native Higgsedit composition. PNG layers are rendered from outlined SVG masters.
export default async ({ project, media, rect }) => {
  const root = process.env.BUTIPUNT_ROOT || '/home/user/butipunt-final';
  const lang = process.env.BUTIPUNT_LANG || 'es';
  const form = process.env.BUTIPUNT_FORMAT || 'reel';
  const reel = form === 'reel';
  const w = reel ? 1080 : 1920, h = reel ? 1920 : 1080;
  const n = reel ? 5 : 6, beat = reel ? 3 : 5, duration = n * beat;
  const dir = path.join(root, 'editables', 'higgsedit', `${form}-${lang}`);
  const p = await project({ dir, size: `${w}x${h}`, fps: 30, background: '#F8F3E8' });
  for (let i = 0; i < n; i++) {
    const image = await p.add(path.join(root,'editables','escenas',`${form}-${lang}-${String(i).padStart(2,'0')}.png`));
    p.compose(media({file:image,x:0,y:0,width:w,height:h,fit:'contain',animate:[
      {property:'offsetY',from:28,to:0,duration:0.55,easing:'house'},
      {property:'opacity',keyframes:[{at:0,value:0},{at:0.30,value:1},{at:beat-0.20,value:1},{at:beat,value:0}]}
    ]}),{at:i*beat,dur:beat,name:`${form}-${lang}-scene-${i+1}`});
  }
  // A moving coral point carries the identity across each chapter.
  const left = reel ? 104 : 110, right = w-left, y = reel ? 1530 : 1014;
  p.compose([
    rect({x:left,y:y+10,width:right-left,height:2,fill:'#DDCBA8'}),
    rect({x:left-12,y,width:24,height:24,radius:12,fill:'#D7684F',animate:[
      {property:'offsetX',from:0,to:right-left,duration,easing:'linear'}
    ]})
  ],{at:0,dur:duration,name:'brand-point-progress'});
  const frames = reel ? [1.5,4.5,7.5,10.5,13.5] : [2.5,7.5,12.5,17.5,22.5,27.5];
  for (let i=0;i<frames.length;i++) await p.frame(frames[i],`renders/check-${i}.png`);
  const report = await p.render('renders/picture.mp4',{depth:8,concurrency:2,bitrate:4500000});
  fs.writeFileSync(path.join(dir,'render-report.json'),JSON.stringify(report,null,2));
  fs.copyFileSync(path.join(dir,'renders','check-0.png'),path.join(root,'videos',`${form}-${lang}-poster.png`));
  console.log(JSON.stringify({form,lang,dir,duration,report}));
};
