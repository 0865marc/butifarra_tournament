"""Render deterministic production assets in the Higgsfield sandbox.
Original AI outputs are preserved; logo curves are never regenerated.
"""
from pathlib import Path
import json, io, math, html, shutil, zipfile, hashlib
import xml.etree.ElementTree as ET
import cairosvg
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path import parse_path

P = Path('/home/user/butipunt-final')
PAPER, INK, GREEN, CORAL, SAND = '#F8F3E8','#182D29','#245748','#D7684F','#DDCBA8'
FONTS={}
for short, source, axes in [('display','fraunces',{'wght':700,'opsz':72,'SOFT':0,'WONK':1}),('body','sourcesans3',{'wght':400})]:
    path=next((P/'fuentes').glob(source+'-*.ttf'))
    font=TTFont(path)
    active={a.axisTag for a in font['fvar'].axes}
    font=instantiateVariableFont(font,{k:v for k,v in axes.items() if k in active},inplace=False)
    static=P/'fuentes'/('Fraunces-700.ttf' if short=='display' else 'SourceSans3-400.ttf')
    font.save(static)
    FONTS[short]=(font,static)

def txt(s,x,y,size=40,color=INK,face='body',maxw=None):
    font,path=FONTS[face]
    ft=ImageFont.truetype(str(path),int(size*10))
    width=ft.getlength(s)/10
    if maxw and width>maxw:
        size*=maxw/width;ft=ImageFont.truetype(str(path),max(1,int(size*10)))
    gs=font.getGlyphSet(); cm=font.getBestCmap(); scale=size/font['head'].unitsPerEm
    out=[]
    for i,c in enumerate(s):
        name=cm.get(ord(c),'.notdef'); pen=SVGPathPen(gs);gs[name].draw(pen)
        dx=ft.getlength(s[:i])/10
        out.append(f'<path fill="{color}" transform="translate({x+dx:.3f} {y}) scale({scale:.6f} {-scale:.6f})" d="{pen.getCommands()}"/>')
    return '<g aria-label="'+html.escape(s,quote=True)+'">'+''.join(out)+'</g>'

root=ET.parse(P/'originales/simbolo-recraft.svg').getroot()
paths=[e for e in root if e.tag.endswith('path')]
assert len(paths)==4
shape,hole,dot=[e.attrib['d'] for e in paths[1:]]
assert hashlib.sha256((P/'originales/simbolo-recraft.svg').read_bytes()).hexdigest()=='387580371dbb5813bfe51194232e3ab93ade309260cb1bc7e613ab2f94e29d54'
bounds=[]
for d in [shape,dot]:
    pen=BoundsPen(None);parse_path(d,pen);bounds.append(pen.bounds)
BX=min(b[0] for b in bounds);BY=min(b[1] for b in bounds)
BW=max(b[2] for b in bounds)-BX;BH=max(b[3] for b in bounds)-BY
_mid=0
def symbol(x,y,h,color=GREEN,accent=CORAL):
    global _mid
    _mid+=1; mid='logo-cut-'+str(_mid);sc=h/BH
    return f'<g transform="translate({x} {y}) scale({sc}) translate({-BX} {-BY})"><path d="{shape} {hole}" fill="{color}" fill-rule="evenodd"/><path d="{dot}" fill="{accent}"/></g>'
def brand(x,y,h=80,color=GREEN,accent=CORAL):
    return symbol(x,y,h,color,accent)+txt('ButiPunt',x+h*BW/BH+h*.25,y+h*.80,h*.85,color,'display')
def rect(x,y,w,h,fill,r=0,stroke=None):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>'
def circle(x,y,r,fill=CORAL):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'
def svg(w,h,body,bg=None,title='ButiPunt'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title>'+ (rect(0,0,w,h,bg) if bg else '')+body+'</svg>'
ASSETS=[]
def save(name,w,h,body,bg=PAPER,scale=1,title='ButiPunt'):
    dest=P/name;dest.parent.mkdir(parents=True,exist_ok=True)
    source=svg(w,h,body,bg,title)
    dest.with_suffix('.svg').write_text(source)
    cairosvg.svg2png(bytestring=source.encode(),write_to=str(dest.with_suffix('.png')),output_width=round(w*scale),output_height=round(h*scale))
    ASSETS.append({'name':name,'width':round(w*scale),'height':round(h*scale),'title':title})
    return source

# Logo family: geometry untouched, transparent counter, outlined typography.
for variant,c,a in [('color',GREEN,CORAL),('tinta',INK,INK),('blanco','#FFFFFF','#FFFFFF')]:
    save('logos/butipunt-horizontal-'+variant,1150,260,brand(54,48,164,c,a),None)
    save('logos/butipunt-simbolo-'+variant,512,512,symbol(76,48,416,c,a),None)
    save('logos/butipunt-vertical-'+variant,720,760,symbol(220,60,335,c,a)+txt('ButiPunt',82,593,112,c,'display'),None)
save('logos/butipunt-avatar',512,512,symbol(106,80,352),PAPER)
save('logos/butipunt-favicon',64,64,symbol(12,8,48),PAPER)
for sz in [16,32,48,192]:
    cairosvg.svg2png(url=str(P/'logos/butipunt-favicon.svg'),write_to=str(P/f'logos/favicon-{sz}.png'),output_width=sz,output_height=sz)
Image.open(P/'logos/favicon-48.png').save(P/'logos/favicon.ico',sizes=[(16,16),(32,32),(48,48)])

C={
 'es':{'hero':['Cada punto,','en su sitio.'],'tag':'El torneo, a punto.','desc':'Gestor de torneos de butifarra','labels':['Parejas','Rondas','Clasificación'],'steps':['Inscribe las parejas','Anota los resultados','Consulta la clasificación'],'end':'Butifarra, ronda a ronda.','explain':['Organiza tu torneo','Prepara las parejas','Sigue cada ronda','Confirma los puntos','Consulta la clasificación','El torneo, a punto.'],'details':[['Parejas, mesas y resultados.','Todo en el mismo lugar.'],['Pon nombre al torneo.','Elige las rondas e inscribe las parejas.'],['La primera ronda se sortea.','Las siguientes siguen la clasificación.'],['Anota el resultado de cada mesa.','Confírmalo para actualizar la clasificación.'],['Sigue las victorias y los puntos.','Consulta también las rondas anteriores.'],['ButiPunt','Butifarra, ronda a ronda.']]},
 'ca':{'hero':['Cada punt,','al seu lloc.'],'tag':'El torneig, a punt.','desc':'Gestor de tornejos de butifarra','labels':['Parelles','Rondes','Classificació'],'steps':['Inscriu les parelles','Anota els resultats','Consulta la classificació'],'end':'Butifarra, ronda a ronda.','explain':['Organitza el teu torneig','Prepara les parelles','Segueix cada ronda','Confirma els punts','Consulta la classificació','El torneig, a punt.'],'details':[['Parelles, taules i resultats.','Tot al mateix lloc.'],['Posa nom al torneig.','Tria les rondes i inscriu les parelles.'],['La primera ronda se sorteja.','Les següents segueixen la classificació.'],['Anota el resultat de cada taula.','Confirma’l per actualitzar la classificació.'],['Segueix les victòries i els punts.','Consulta també les rondes anteriors.'],['ButiPunt','Butifarra, ronda a ronda.']]}
}
for lang,c in C.items():
    # Square hero.
    b=brand(82,72,82)+txt(c['hero'][0],76,338,126,GREEN,'display')+txt(c['hero'][1],76,480,126,GREEN,'display')
    b+=txt(c['desc'],80,575,39)+rect(66,680,948,260,GREEN,24)
    for i,label in enumerate(c['labels']):
        x=90+i*308;b+=rect(x,707,284,140,PAPER,17)+txt(label,x+21,792,39,GREEN,'display',244)
    b+=txt('Prepara · Anota · Consulta',294,901,30,PAPER)+circle(968,1006,13)
    save(f'campana/post-{lang}',1080,1080,b,title=c['hero'][0]+' '+c['hero'][1])
    # Stories keep all content inside y=285..1625.
    b=brand(100,286,84)+txt(c['tag'].split(', ')[0]+',',95,543,107,GREEN,'display')+txt('a punt.' if lang=='ca' else 'a punto.',95,660,107,GREEN,'display')
    for i,label in enumerate(c['steps']):
        y=800+i*225
        b+=rect(94,y,892,178,SAND,24)+txt(f'0{i+1}',126,y+117,100,GREEN,'display')+txt(label,304,y+106,49,INK,'body',642)
        if i<2:b+=rect(537,y+178,3,47,GREEN)
    b+=circle(539,1472,17)+txt(c['end'],205,1592,39,GREEN)
    save(f'campana/story-{lang}',1080,1920,b,title=c['tag'])
    # Poster, A3 ratio; SVG master keeps scalable outlines.
    b=brand(95,91,104)+txt(c['hero'][0],88,446,147,GREEN,'display')+txt(c['hero'][1],88,611,147,GREEN,'display')+txt(c['desc'],94,724,45)
    for i,label in enumerate(c['steps']):
        y=875+i*171;b+=rect(94,y,1002,141,SAND,18)+txt(f'0{i+1}',127,y+97,84,GREEN,'display')+txt(label,283,y+89,48,INK,'body',775)
    b+=rect(94,1452,1002,2,GREEN)+txt(c['end'],94,1540,46,GREEN)+circle(1071,1525,24)
    save(f'campana/cartel-A3-{lang}',1191,1684,b,scale=2,title=c['tag'])
    # Wide header and social link preview.
    for name,w,h in [('cabecera',1600,600),('og',1200,630)]:
        b=brand(68,53,70)+txt(c['hero'][0],64,291,108,GREEN,'display')+txt(c['hero'][1],64,410,108,GREEN,'display')+txt(c['desc'],69,501,36)
        if w>1200:
            b+=rect(1120,77,396,446,GREEN,25)+symbol(1199,136,280,PAPER,CORAL)
        else:b+=circle(1094,512,32)
        save(f'campana/{name}-{lang}',w,h,b,title=c['tag'])
    # Three educational carousel cards. Example panels are explicitly schematic.
    for i,label in enumerate(c['steps']):
        b=brand(78,65,72)+txt(f'0{i+1} / 03',79,233,30,GREEN)+txt(label,75,362,79,GREEN,'display',930)
        b+=rect(76,447,928,539,GREEN,24)
        if i==0:
            for j in range(3):
                yy=485+j*150;b+=rect(112,yy,856,125,PAPER,12)+txt(('Parella ' if lang=='ca' else 'Pareja ')+str(j+1),141,yy+78,49,GREEN,'display')+circle(912,yy+65,15)
        elif i==1:
            b+=txt('TAULA 01' if lang=='ca' else 'MESA 01',136,533,31,PAPER)+txt('101',146,743,134,PAPER,'display')+txt('—',486,727,94,PAPER,'display')+txt('83',688,743,134,PAPER,'display')+txt('Resultat confirmat' if lang=='ca' else 'Resultado confirmado',246,888,44,PAPER)
        else:
            for j,n in enumerate([3,2,1]):
                yy=501+j*150;b+=rect(111,yy-16,857,110,PAPER,12)+txt(str(j+1),143,yy+58,67,GREEN,'display')+txt(('Parella ' if lang=='ca' else 'Pareja ')+str(j+1),256,yy+53,41)+txt(str(n)+' V',819,yy+55,45,GREEN)
        b+=txt('Esquema explicatiu · Dades d’exemple' if lang=='ca' else 'Esquema explicativo · Datos de ejemplo',80,1047,27)
        b+=txt(c['end'],79,1188,42,GREEN)+circle(971,1229,15)
        save(f'campana/carrusel-{lang}-{i+1:02}',1080,1350,b,title=label)
    # Motion assets. Separate visual layers enable native animation.
    for form,w,h in [('reel',1080,1920),('explicativo',1920,1080)]:
        count=5 if form=='reel' else 6
        for i in range(count):
            title=([c['tag']]+c['steps']+[c['end']])[i] if form=='reel' else c['explain'][i]
            if form=='reel':
                tx,ty,tw,sz=90,638,900,106
                words=title.split(); lines=[];line=''
                for word in words:
                    trial=(line+' '+word).strip()
                    if ImageFont.truetype(str(FONTS['display'][1]),sz).getlength(trial)>870 and line:lines.append(line);line=word
                    else:line=trial
                lines.append(line)
                b=brand(90,293,82)
                for j,line in enumerate(lines):b+=txt(line,90,ty+j*120,sz,GREEN,'display')
                b+=txt(c['desc'],92,1421,36,GREEN,'body',890)
                if 0<i<4:
                    b+=rect(90,1025,900,255,GREEN,25)+txt(f'0{i}',131,1205,165,PAPER,'display')+circle(857,1155,41)
                else:b+=symbol(119,1031,250)
            else:
                b=brand(100,75,72)+txt(title,97,361,102,GREEN,'display',1700)
                for j,line in enumerate(c['details'][i]):b+=txt(line,104,466+j*70,48,INK,'body',1630)
                b+=rect(104,656,1708,231,GREEN,22)
                for j,label in enumerate(c['labels']):
                    x=141+j*558;b+=rect(x,694,522,155,PAPER,18)+txt(label,x+34,793,57,GREEN,'display',458)
                b+=txt('Gestió del torneig · Partides presencials' if lang=='ca' else 'Gestión del torneo · Partidas presenciales',106,968,31)
            save(f'editables/escenas/{form}-{lang}-{i:02}',w,h,b,title=title)

# One-page identity sheet.
b=brand(100,90,110)+txt('Cada punt, al seu lloc.',100,367,81,GREEN,'display')+txt('Identidad de marca · 2026',101,434,34)
for i,(n,col) in enumerate([('Papel',PAPER),('Tinta',INK),('Tapete',GREEN),('Coral',CORAL),('Arena',SAND)]):
    x=100+i*232;b+=rect(x,530,206,141,col,12,INK if i==0 else None)+txt(n,x,721,29)+txt(col,x,765,26)
b+=txt('Fraunces 700',100,912,68,GREEN,'display')+txt('Source Sans 3 · 400',102,986,42)+txt('Parejas. Rondas. Clasificación.',100,1082,33)
b+=rect(100,1160,1080,2,GREEN)+txt('Un punto coral para señalar el siguiente paso.',100,1230,34)
save('identidad',1280,1340,b)

manifest={'brand':'ButiPunt','date':'2026-09-16','approved':{'symbol':'Punt propi · opción 1','typography':'Fraunces 700 + Source Sans 3 400 · opción 2','palette':[PAPER,INK,GREEN,CORAL,SAND]},'assets':ASSETS,'provenance':{'logo':'Recraft V4.1 en Higgsfield, 2026-09-08. Curvas originales conservadas.','original_social':'GPT Image 2 en Higgsfield, 2026-09-08.','production':'Composición, textos, contorneado tipográfico y adaptaciones por Codex; render determinista en el sandbox de Higgsfield.','video':'Animación gráfica nativa en Higgsedit; sin nuevas tomas generadas por IA.','new_generation_credits':0},'logo_bounds':[BX,BY,BW,BH]}
(P/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(P/'editables/copy.json').write_text(json.dumps(C,ensure_ascii=False,indent=2))
shutil.copy(__file__,P/'editables/build_pack.py')

# Contact sheet for visual QA, not a substitute for originals.
names=['identidad','logos/butipunt-horizontal-color','campana/post-ca','campana/post-es','campana/story-ca','campana/story-es','campana/cartel-A3-es','campana/cabecera-ca','campana/carrusel-es-02','editables/escenas/explicativo-es-03']
sheet=Image.new('RGB',(1600,2100),'#eee9df'); draw=ImageDraw.Draw(sheet)
for i,n in enumerate(names):
    x=(i%4)*400;y=(i//4)*700
    im=Image.open(P/(n+'.png')).convert('RGBA');im.thumbnail((370,630))
    sheet.paste(im,(x+(400-im.width)//2,y+32),im)
    draw.text((x+12,y+674),n,fill='#182D29')
sheet.save(P/'revision/estaticos.jpg',quality=90)
print(json.dumps({'assets':len(ASSETS),'logo_bounds':[BX,BY,BW,BH],'status':'rendered'}))
