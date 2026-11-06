# Dessine le dos (4e de couverture) du livre imaginaire avec un vrai code EAN-13 (ISBN fictif),
# posé sur la photo de livres : src/identite.jpg -> src/identite-dos.jpg
from PIL import Image, ImageDraw, ImageFont
L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
G=[s.translate(str.maketrans('01','10'))[::-1] for s in L]
R=[s.translate(str.maketrans('01','10')) for s in L]
PAR=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']
def ean(d12):
    s=sum(int(c)*(3 if i%2 else 1) for i,c in enumerate(d12)); d=d12+str((10-s%10)%10)
    bits='101'+''.join((L if p=='L' else G)[int(c)] for p,c in zip(PAR[int(d[0])],d[1:7]))+'01010'+''.join(R[int(c)] for c in d[7:])+'101'
    return d,bits
code,bits=ean('978295123450')
bg=Image.open('src/identite.jpg').convert('RGB')
r=max(1600/bg.width,900/bg.height); bg=bg.resize((round(bg.width*r),round(bg.height*r))).crop((0,0,1600,900))
card=Image.new('RGB',(470,660),(250,246,236)); d=ImageDraw.Draw(card)
B=lambda s:ImageFont.truetype('fonts/BebasNeue.ttf',s); I=lambda s:ImageFont.truetype('fonts/Inter-ExtraBold.ttf',s)
d.rectangle([0,0,469,659],outline=(30,40,70),width=4)
d.text((30,28),'LE SECRET DU PHARE',font=B(54),fill=(20,40,90))
d.text((30,92),'Inès Moreau',font=I(22),fill=(120,60,20))
for i,w in enumerate([400,390,410,360,400,380,250]): d.rectangle([30,150+i*28,30+w,162+i*28],fill=(190,185,175))
d.text((30,365),'Éditions Imaginaires',font=I(18),fill=(80,80,80))
d.text((30,395),'Prix : 7,90 €',font=I(26),fill=(20,20,20))
# code-barres
x0,y0,m=40,450,3
d.rectangle([x0-10,y0-30,x0+95*m+10,y0+150],fill='white')
d.text((x0,y0-26),'ISBN '+code[:3]+'-'+code[3]+'-'+code[4:11]+'-'+code[11]+'-'+code[12],font=I(15),fill='black')
for i,b in enumerate(bits):
    if b=='1': d.rectangle([x0+i*m,y0,x0+i*m+m-1,y0+120],fill='black')
d.text((x0,y0+122),code,font=I(18),fill='black')
card=card.convert('RGBA').rotate(4,expand=True,resample=Image.BICUBIC)
bg.paste(card,(1020,110),card)
bg.save('src/identite-dos.jpg',quality=90); print(code)
