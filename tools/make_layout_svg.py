import json, sys, math
dims = json.load(open(sys.argv[1]))
out = sys.argv[2]
S = 16.0          # px per metre
OX, OY = 50, 120  # origin offset
def X(x): return OX + x*S
def Z(z): return OY + z*S
els = []
def rect(x0,z0,x1,z1,fill,stroke="#5F5E5A",sw=0.75,rx=2,extra=""):
    els.append(f'<rect x="{X(x0):.1f}" y="{Z(z0):.1f}" width="{(x1-x0)*S:.1f}" height="{(z1-z0)*S:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')
def text(x,z,t,size=11,fill="#444441",anchor="middle",weight="400",extra=""):
    els.append(f'<text x="{X(x):.1f}" y="{Z(z):.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{t}</text>')
def circle(x,z,r,fill,stroke="#5F5E5A",sw=0.75,extra=""):
    els.append(f'<circle cx="{X(x):.1f}" cy="{Z(z):.1f}" r="{r*S:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')
def line(x0,z0,x1,z1,stroke,sw=1,extra=""):
    els.append(f'<line x1="{X(x0):.1f}" y1="{Z(z0):.1f}" x2="{X(x1):.1f}" y2="{Z(z1):.1f}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')
def poly(pts,fill,stroke="#0F6E56",sw=1):
    p=" ".join(f"{X(a):.1f},{Z(b):.1f}" for a,b in pts)
    els.append(f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

A = dims["auditorium"]; L, D = A["length_x"], A["depth_z"]
zones = {z["id"]: z for z in dims["zones"]}
# room (top portion only: z 0..16.4)
ZMAX = 16.4
rect(0,0,L,ZMAX,"#FAFAF7","#888780",1,4)
els.append(f'<line x1="{X(0)}" y1="{Z(ZMAX)}" x2="{X(L)}" y2="{Z(ZMAX)}" stroke="#888780" stroke-dasharray="4 4"/>')
text(L/2, ZMAX+0.9, "Zone B (party side) continues below, not drawn", 11, "#888780")
st = zones["stage"]; rect(st["x"][0]+0.2,0.3,st["x"][1]-0.2,ZMAX-0.1,"#F1EFE8")
text(3.0, 8.0, "Stage?", 13, weight="500")
tw = zones["top_wall_features"]; rect(6.0,0.0,L,1.2,"#E7E5DE","#B4B2A9",0.5,0)
za = zones["zone_a"]; rect(za["x"][0],za["z"][0],za["x"][1],za["z"][1],"#E1F5EE","#0F6E56",0.5,3)
cs = zones["central_strip"]; rect(cs["x"][0],cs["z"][0],cs["x"][1],cs["z"][1],"#F1EFE8")
text((cs["x"][0]+cs["x"][1])/2, cs["z"][0]+1.55, "Central strip (runway?)", 11)
bo = zones["booth"]; rect(bo["x"][0],bo["z"][0],bo["x"][1],min(bo["z"][1],ZMAX-0.1),"#F1EFE8")
text(53.3, 11.3, "Booth?", 11, anchor="middle")

# walkway / queue / exit
rect(6.2,1.3,51.8,4.0,"#FFF6E0","#BA7517",0.75,3)
text(28.5, 2.15, "One-way walkway  ←  (cable run under: flat cable ramps / matting)", 11, "#854F0B")
for xx in [47.0-k*3.9 for k in (1,3,5,7,9)]:
    els.append(f'<path d="M{X(xx)+9:.1f},{Z(3.45):.1f} L{X(xx)-9:.1f},{Z(3.45):.1f}" stroke="#BA7517" stroke-width="1.5" marker-end="url(#ar)"/>')
rect(47.5,4.2,51.8,12.6,"#FDEEE8","#993C1D",0.75,3)
text(49.65, 7.6, "Queue", 12, "#712B13", weight="500")
text(49.65, 8.6, "+ putter &amp;", 10, "#712B13")
text(49.65, 9.4, "ball desk", 10, "#712B13")
text(49.65, 10.6, "Entry", 10, "#712B13")
text(7.1, 5.6, "Exit to", 10, "#712B13"); text(7.1, 6.4, "party", 10, "#712B13")
els.append(f'<path d="M{X(8.2):.1f},{Z(3.3):.1f} L{X(6.6):.1f},{Z(4.9):.1f}" stroke="#993C1D" stroke-width="1.5" marker-end="url(#ar2)"/>')

# north cable run
for c in dims["cable_runs_simplified"]:
    if c["id"]=="north_run":
        line(c["x"][0],c["z"],c["x"][1],c["z"],"#E24B4A",1.5)
# ND18 + clearance
for p in dims["power_flags"]:
    if p["node"]=="ND18":
        px,pz=p["approx_position"]["x"],p["approx_position"]["z"]
        circle(px,pz,1.0,"none","#A32D2D",0.75,'stroke-dasharray="3 3"')
        circle(px,pz,0.3,"#FCEBEB","#A32D2D",1)
        text(px+1.2,12.55,"ND18 distro, 101% load: keep clear",10,"#791F1F",anchor="start")

# holes
XE, XW = 47.0, 8.0
pitch = (XE-XW)/10
hero = {8,4,2,1}
T0 = 4.35
names = {10:"Warm-Up",9:"Bank Shot",8:"Windmill",7:"Pinball",6:"Split",5:"Ramp",4:"Barn",3:"Island",2:"Clock",1:"Midnight"}
for n in range(10,0,-1):
    i = 10-n
    x1 = XE - i*pitch; x0 = x1 - pitch; cx = (x0+x1)/2
    rect(x0+0.1,4.15,x1-0.1,11.9,"none","#9FCFBF",0.5,2,'stroke-dasharray="2 3"')
    f = "#9FE1CB" if n in hero else "#CDEFE3"
    st_ = "#0F6E56"
    cup=None
    if n==10:
        rect(cx-0.6,T0,cx+0.6,T0+5.0,f,st_,1); line(cx-0.6,T0+2.5,cx+0.6,T0+2.5,"#0F6E56",1,'stroke-dasharray="2 2"'); cup=(cx,T0+4.4)
    elif n==9:
        poly([(cx-1.2,T0),(cx,T0),(cx,T0+3.8),(cx+1.2,T0+3.8),(cx+1.2,T0+5.0),(cx-1.2,T0+5.0)],f); line(cx-1.2,T0+4.2,cx-0.6,T0+5.0,"#0F6E56",1.5); cup=(cx+0.7,T0+4.4)
    elif n==8:
        rect(cx-0.6,T0,cx+0.6,T0+6.0,f,st_,1)
        for a in [45,135]:
            r=0.9; dx=r*math.cos(math.radians(a)); dz=r*math.sin(math.radians(a))
            line(cx-dx,T0+3.0-dz,cx+dx,T0+3.0+dz,"#04342C",2)
        cup=(cx,T0+5.4)
    elif n==7:
        rect(cx-0.9,T0,cx+0.9,T0+5.0,f,st_,1)
        for r_ in range(5):
            for c_ in range(5 if r_%2==0 else 4):
                off = -0.6 + c_*0.3 + (0.15 if r_%2 else 0)
                circle(cx+off, T0+1.6+r_*0.45, 0.05, "#04342C", "none", 0)
        cup=(cx,T0+4.5)
    elif n==6:
        poly([(cx-0.5,T0),(cx+0.5,T0),(cx+0.5,T0+2.0),(cx+1.2,T0+2.0),(cx+1.2,T0+5.5),(cx-1.2,T0+5.5),(cx-1.2,T0+2.0),(cx-0.5,T0+2.0)],f)
        line(cx-1.2,T0+2.6,cx+1.2,T0+2.6,"#04342C",2.5,'stroke-dasharray="10 6"'); cup=(cx+0.6,T0+4.9)
    elif n==5:
        rect(cx-0.6,T0,cx+0.6,T0+6.0,f,st_,1); rect(cx-0.6,T0+2.6,cx+0.6,T0+3.8,"#5DCAA5","#0F6E56",0.5,0); cup=(cx,T0+5.4)
        text(cx,T0+3.35,"ramp",8,"#04342C")
    elif n==4:
        poly([(cx-1.0,T0),(cx+0.2,T0),(cx+0.2,T0+3.0),(cx+1.0,T0+3.0),(cx+1.0,T0+5.0),(cx-1.0,T0+5.0)],f)
        rect(cx-1.0,T0+2.6,cx+0.2,T0+3.4,"#D85A30","#712B13",0.75,1); cup=(cx+0.5,T0+4.4)
    elif n==3:
        circle(cx,T0+3.8,1.5,"#B5D4F4","#185FA5",0.75); circle(cx,T0+3.8,1.2,f,st_,1)
        rect(cx-0.3,T0,cx+0.3,T0+2.6,f,st_,1); cup=(cx+0.3,T0+4.0)
    elif n==2:
        rect(cx-0.5,T0,cx+0.5,T0+2.1,f,st_,1); circle(cx,T0+3.5,1.5,f,st_,1)
        line(cx,T0+3.5,cx-0.15,T0+2.2,"#04342C",2); line(cx,T0+3.5,cx+0.9,T0+3.3,"#04342C",2); cup=(cx-0.6,T0+4.3)
    elif n==1:
        rect(cx-0.6,T0,cx+0.6,T0+6.0,f,st_,1); line(cx-0.9,T0+1.6,cx+0.9,T0+1.6,"#993C1D",3); cup=(cx,T0+5.4)
        text(cx+1.0,T0+1.45,"2027",8,"#993C1D",anchor="start")
    if cup: circle(cup[0],cup[1],0.13,"#FFFFFF","#04342C",1)
    circle(cx,3.45,0.42,"#04342C","none",0)
    text(cx,3.45+0.17,str(n),10,"#FFFFFF",weight="600")
    if n==3:
        text(x0+0.15,11.55,names[n],10,"#085041",anchor="start",weight="500")
    else:
        text(cx,11.55,names[n],10,"#085041",weight="500")

W = int(X(L)+OX); H = int(Z(ZMAX)+130)
legend_y = Z(ZMAX)+52
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W*2}" height="{H*2}" viewBox="0 0 {W} {H}" role="img" font-family="Helvetica, Arial, sans-serif">
<title>Draft layout: 10 holes in Zone A</title>
<desc>Draft only. Linear one-way course in Zone A of the auditorium, 16 px per metre, coordinates from floorplan/auditorium-dimensions.json. Holes numbered 10 to 1 from the booth end toward the stage. Generated by a script; regenerate after changes to the dimensions file.</desc>
<defs>
<marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#BA7517" stroke-width="1.5"/></marker>
<marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#993C1D" stroke-width="1.5"/></marker>
</defs>
<rect x="0" y="0" width="{W}" height="{H}" fill="#FFFFFF"/>
<text x="{OX}" y="40" font-size="17" font-weight="600" fill="#2C2C2A">Draft layout v1: 10 holes in Zone A, played 10 → 1 toward the stage</text>
<text x="{OX}" y="62" font-size="12" fill="#5F5E5A">DRAFT for discussion. Hole shapes are design targets. Zone, cable and ND18 positions are estimates from the planning-tool screenshots (≈ ±1 m).</text>
<text x="{OX}" y="80" font-size="12" fill="#5F5E5A">Scale 16 px = 1 m. Each plot ≈ 3.9 × 7.7 m. Course footprint incl. walkway and queue ≈ 46 × 11.4 m. Vertical cable drops not shown: confirm before fixing positions.</text>
''' + "\n".join(els) + f'''
<rect x="{OX}" y="{legend_y-11}" width="14" height="14" rx="2" fill="#9FE1CB" stroke="#0F6E56"/><text x="{OX+20}" y="{legend_y}" font-size="11" fill="#444441">Hero hole</text>
<rect x="{OX+100}" y="{legend_y-11}" width="14" height="14" rx="2" fill="#CDEFE3" stroke="#0F6E56"/><text x="{OX+120}" y="{legend_y}" font-size="11" fill="#444441">Simple / mid hole</text>
<circle cx="{OX+243}" cy="{legend_y-4}" r="4" fill="#fff" stroke="#04342C"/><text x="{OX+253}" y="{legend_y}" font-size="11" fill="#444441">Cup</text>
<line x1="{OX+300}" y1="{legend_y-4}" x2="{OX+322}" y2="{legend_y-4}" stroke="#E24B4A" stroke-width="2"/><text x="{OX+328}" y="{legend_y}" font-size="11" fill="#444441">North cable run (est.)</text>
<rect x="{OX+465}" y="{legend_y-11}" width="14" height="14" rx="2" fill="#FFF6E0" stroke="#BA7517"/><text x="{OX+485}" y="{legend_y}" font-size="11" fill="#444441">Walkway</text>
<rect x="{OX+550}" y="{legend_y-11}" width="14" height="14" rx="2" fill="#FDEEE8" stroke="#993C1D"/><text x="{OX+570}" y="{legend_y}" font-size="11" fill="#444441">Queue / entry / exit</text>
<text x="{OX}" y="{legend_y+26}" font-size="11" fill="#5F5E5A">Source: floorplan/auditorium-dimensions.json · docs/03-hole-spec-sheet.md · regenerate with the script in tools/ after changes.</text>
</svg>'''
open(out,"w").write(svg)
print("ok", W, H)
