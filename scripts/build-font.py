"""Builds 'Shinobi Display', the Japanese-style display face used for the name and the nav wordmark.

Usage: pip install fonttools brotli && python3 scripts/build-font.py src/assets/fonts/shinobi-display.woff2
Covers A-Z (lowercase maps to the caps), 0-9 and . , - ' & ? ! and space."""
import sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

H, S, G, C = 700, 168, 40, 44   # cap height, stroke, gap, chamfer
M = H // 2                       # middle bar centre

def area(p):
    return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2

def cw(p):   # TrueType outer contours run clockwise
    return p if area(p) < 0 else p[::-1]
def ccw(p):
    return p if area(p) > 0 else p[::-1]

def rect(x0, y0, x1, y1):
    return [cw([(x0,y0),(x0,y1),(x1,y1),(x1,y0)])]

def hbar(x0, x1, top, cl=0, cr=0, s=S):
    """Horizontal bar; cl/cr slant its ends (positive: top longer than bottom)."""
    return [cw([(x0 + max(cl, 0), top-s), (x0 + max(-cl, 0), top),
                (x1 - max(-cr, 0), top), (x1 - max(cr, 0), top-s)])]

def vbar(x0, y0, y1, ct=0, cb=0, s=S):
    """Vertical bar; ct slants the top (positive: right side lower), cb the bottom (positive: left side higher)."""
    return [cw([(x0, y0 + (cb if cb>0 else 0)), (x0, y1 - (-ct if ct<0 else 0)),
                (x0+s, y1 - (ct if ct>0 else 0)), (x0+s, y0 + (-cb if cb<0 else 0))])]

def poly(*pts):
    return [cw(list(pts))]

def ring(x0, y0, x1, y1, tl=0, tr=0, br=0, bl=0, s=S, inner=True):
    def corners(a0, b0, a1, b1, k):
        t = list(k)
        pts = [(a0+t[3], b0)] if t[3] else []
        pts.append((a0, b0+t[3]))
        pts.append((a0, b1-t[0]))
        if t[0]: pts.append((a0+t[0], b1))
        pts.append((a1-t[1], b1))
        if t[1]: pts.append((a1, b1-t[1]))
        pts.append((a1, b0+t[2]))
        if t[2]: pts.append((a1-t[2], b0))
        return pts
    out = [cw(corners(x0, y0, x1, y1, (tl, tr, br, bl)))]
    if inner:
        k = lambda v: max(v - s*0.4, 0) if v else 0
        out.append(ccw(corners(x0+s, y0+s, x1-s, y1-s, (k(tl), k(tr), k(br), k(bl)))))
    return out

def diamond(cx, cy, r):
    return poly((cx-r, cy), (cx, cy+r), (cx+r, cy), (cx, cy-r))

GL = {}
def g(ch, w, *shapes):
    GL[ch] = (w, [c for sh in shapes for c in sh])

# ---- letters -----------------------------------------------------------
w = 640
g('A', w,
  poly((0,0), (w/2-S*0.55, H), (w/2+S*0.55, H), (w,0), (w-S*1.15,0), (w/2, H-S*1.9), (S*1.15,0)),
  diamond(w/2, S*0.62, S*0.55))
w = 600
g('B', w, ring(0, 0, w, M+S/2, br=110, tr=60), ring(0, M-S/2, w-50, H, tr=100, br=50))
w = 590
g('C', w, poly((0,C*2), (0,H-C*2), (C*2,H), (w,H), (w-40,H-S), (S,H-S), (S,S), (w-40,S), (w,0), (C*2,0)))
w = 610
g('D', w, ring(0, 0, w, H, tr=170, br=170))
w = 580
g('E', w, hbar(0, w, H, cr=40), vbar(0, 0, H-S-G, ct=0), hbar(S, w-60, M+S/2, cr=40), hbar(0, w, S, cr=-40))
g('F', w, hbar(0, w, H, cr=40), vbar(0, 0, H-S-G, cb=60), hbar(S, w-60, M+S/2, cr=40))
w = 620
g('G', w, poly((0,C*2), (0,H-C*2), (C*2,H), (w,H), (w-40,H-S), (S,H-S), (S,S), (w-S,S), (w-S,M-S/2), (w,M-S/2), (w,C*2), (w-C*2,0), (C*2,0)),
  hbar(w/2-20, w, M+S/2, cl=-40))
w = 620
g('H', w, vbar(0, 0, H, ct=50), vbar(w-S, 0, H, ct=50), hbar(S, w-S, M+S/2))
w = 400
g('I', w, hbar(0, w, H, cl=-40, cr=40), vbar(w/2-S/2, S+G, H-S-G), hbar(0, w, S, cl=40, cr=-40))
w = 560
g('J', w, hbar(60, w, H, cl=60), vbar(w-S, S, H-S-G),
  poly((0,250), (C*2,S*0.4), (C*2+60,0), (w-C,0), (w,C), (w,S), (C*2+S*0.6,S), (S*1.1,250)))
w = 620
g('K', w, vbar(0, 0, H, ct=50), poly((S+G, M+S/2), (w-S*1.3, H), (w, H), (S+G+S*1.25, M-S/2+20), (S+G, M-S/2+20)),
  poly((S+G+S*0.55, M-S/2-G+20), (w-S*1.1, 0), (w, 0), (S+G+S*1.65, M-S/2-G+20)))
w = 540
g('L', w, vbar(0, S, H, ct=50), hbar(0, w, S, cr=-50))
w = 760
g('M', w, vbar(0, 0, H-S-G, cb=50), hbar(0, w, H, cl=-40, cr=40), vbar(w/2-S/2, 0, H-S-G), vbar(w-S, 0, H-S-G, cb=-50))
w = 640
g('N', w, vbar(0, 0, H, ct=50), vbar(w-S, 0, H),
  poly((S, H), (S+S*0.9, H), (w-S, S*1.6), (w-S, S*1.6-S*1.4), (S, H-S*1.5)))
w = 640
g('O', w, ring(0, 0, w, H, tl=120, tr=120, br=120, bl=120))
w = 600
g('P', w, vbar(0, 0, M+S/2, cb=50), ring(0, M-S/2, w, H, tr=120, br=60))
w = 660
g('Q', w, ring(0, 0, w-40, H, tl=120, tr=120, br=60, bl=120), poly((w/2, S*1.2), (w/2+S, S*1.2), (w, -60), (w-S*1.1, -60)))
w = 620
g('R', w, vbar(0, 0, M+S/2, cb=50), ring(0, M-S/2, w-40, H, tr=120, br=60),
  poly((S+G+30, M-S/2-G), (S+G+30+S*1.05, M-S/2-G), (w, 0), (w-S*1.1, 0)))
w = 590
g('S', w, poly((C*2, H), (w, H), (w-40, H-S), (S, H-S), (S, M+S/2), (w-C*2, M+S/2), (w, M+S/2-C*2), (w, C*2), (w-C*2, 0),
               (0, 0), (40, S), (w-S, S), (w-S, M-S/2), (C*2, M-S/2), (0, M-S/2+C*2), (0, H-C*2)))
w = 620
g('T', w, hbar(0, w, H, cl=-50, cr=50), vbar(w/2-S/2, 0, H-S-G, cb=50))
w = 620
g('U', w, poly((0, H-50), (0, C*2), (C*2, 0), (w-C*2, 0), (w, C*2), (w, H), (w-S, H-50), (w-S, S), (S, S), (S, H)))
w = 640
g('V', w, poly((0, H), (S*1.15, H), (w/2, S*1.9), (w-S*1.15, H), (w, H), (w/2+S*0.55, 0), (w/2-S*0.55, 0)))
w = 860
g('W', w, vbar(0, S, H, ct=50), vbar(w/2-S/2, S, H-S-G), vbar(w-S, S, H, ct=-50), hbar(0, w, S, cl=-40, cr=40))
w = 660
g('X', w, poly((0, H), (S*1.2, H), (w, 0), (w-S*1.2, 0)), poly((w-S*1.2, H), (w, H), (S*1.2, 0), (0, 0)))
w = 640
g('Y', w, poly((0, H), (S*1.15, H), (w/2, M+S*0.6), (w-S*1.15, H), (w, H), (w/2+S/2, M-S*0.2), (w/2+S/2, 0), (w/2-S/2, 0), (w/2-S/2, M-S*0.2)))
w = 600
g('Z', w, hbar(0, w, H, cl=-50), poly((w-S*1.2, H-S-G), (w, H-S-G), (S*1.2, S+G), (0, S+G)), hbar(0, w, S, cr=-50))

# ---- digits -----------------------------------------------------------
w = 580
g('0', w, ring(0, 0, w, H, tl=110, tr=110, br=110, bl=110), diamond(w/2, M, S*0.5))
g('1', 380, poly((0, H-S*1.1), (S*1.0, H), (S*1.0+S, H), (S*1.0+S, S+G), (S*1.0, S+G), (S*1.0, H-S*1.3), (S*0.5, H-S*0.75)), hbar(0, 380, S, cl=40, cr=-40))
g('2', w, poly((C*2, H), (w-C*2, H), (w, H-C*2), (w, M+S/2), (w-C, M-S/2), (S, M-S/2), (S, S), (w, S), (w-40, 0), (0, 0), (0, M+S/2-C), (C, M+S/2),
               (w-S, M+S/2), (w-S, H-S), (40, H-S)))
g('3', w, poly((0, H), (w-C*2, H), (w, H-C*2), (w, C*2), (w-C*2, 0), (0, 0), (40, S), (w-S, S), (w-S, M-S/2), (S*1.4, M-S/2), (S*1.4, M+S/2),
               (w-S, M+S/2), (w-S, H-S), (40, H-S)))
g('4', w, vbar(0, M-S/2, H, cb=0, ct=50), hbar(S, w, M+S/2, cr=40), vbar(w-S*1.9, 0, H, ct=-50))
g('5', w, hbar(0, w, H, cr=40), vbar(0, M-S/2, H-S), poly((0, M+S/2), (w-C*2, M+S/2), (w, M+S/2-C*2), (w, C*2), (w-C*2, 0), (0, 0), (40, S), (w-S, S),
               (w-S, M-S/2), (0, M-S/2)))
g('6', w,
  poly((0, C*2), (0, H-C*2), (C*2, H), (w, H), (w-40, H-S), (S, H-S), (S, C*2)), ring(0, 0, w, M+S/2, tr=60, br=110, bl=110))
g('7', w, hbar(0, w, H, cl=-40), poly((w-S, H-S), (w, H-S), (w/2-S*0.1, 0), (w/2-S*1.2, 0)))
g('8', w, ring(0, 0, w, M+S/2, tl=60, tr=60, br=110, bl=110), ring(30, M-S/2, w-30, H, tl=100, tr=100, br=0, bl=0))
g('9', w, ring(0, M-S/2, w, H, tl=110, tr=60, bl=60), poly((w, H-C*2), (w, C*2), (w-C*2, 0), (0, 0), (40, S), (w-S, S), (w-S, H-C*2)))
# ---- signs -----------------------------------------------------------
g('.', 260, diamond(130, S*0.55, S*0.55))
g(',', 260, poly((40, -130), (210, S*1.1), (70, S*1.1), (70, 30)))
g('-', 420, hbar(30, 390, M+S/2, cl=40, cr=40))
g("'", 220, poly((40, H), (180, H), (110, H-S*1.6)))
g('&', 660, ring(0, 0, 520, M+S/2, tl=60, br=110, bl=110), ring(40, M-S/2, 440, H, tl=90, tr=90), hbar(400, 660, M+S/2, cl=40, cr=40))
g('?', 560, poly((0, H-C), (C, H), (560-C*2, H), (560, H-C*2), (560, M), (560-C*2, M-S*0.8), (560/2+S/2, M-S*0.8), (560/2+S/2, S*1.4), (560/2-S/2, S*1.4),
               (560/2-S/2, M), (560-S, M+S*0.2), (560-S, H-S), (S*0.6, H-S)), diamond(280, S*0.5, S*0.5))
g('!', 260, vbar(60, S*1.4, H), diamond(130, S*0.5, S*0.5))
g(' ', 300)

SB = 50
names = {c: ('space' if c == ' ' else ('uni%04X' % ord(c))) for c in GL}
order = ['.notdef'] + [names[c] for c in GL]
glyphs, metrics, cmap = {}, {}, {}

def draw(contours):
    pen = TTGlyphPen(None)
    for c in contours:
        pts = [(round(x), round(y)) for x, y in c]
        pen.moveTo(pts[0])
        for p in pts[1:]:
            pen.lineTo(p)
        pen.closePath()
    return pen.glyph()

glyphs['.notdef'] = draw(rect(50, 0, 450, H)[0:1] + [ccw([(110, 60), (390, 60), (390, H-60), (110, H-60)])])
metrics['.notdef'] = (500, 50)
for ch, (w, contours) in GL.items():
    n = names[ch]
    shifted = [[(x + SB, y) for x, y in c] for c in contours]
    glyphs[n] = draw(shifted)
    xmin = min((x for c in shifted for x, _ in c), default=0)
    metrics[n] = (w + SB * 2, round(xmin))
    cmap[ord(ch)] = n
    if ch.isalpha():
        cmap[ord(ch.lower())] = n   # lowercase maps to the same caps

fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=900, descent=-200)
fam = 'Shinobi Display'
fb.setupNameTable({'familyName': fam, 'styleName': 'Regular', 'uniqueFontIdentifier': fam + ' Regular',
                   'fullName': fam, 'psName': 'ShinobiDisplay-Regular', 'version': 'Version 1.000',
                   'licenseDescription': 'Drawn for this portfolio. Free to use.'})
fb.setupOS2(sTypoAscender=900, sTypoDescender=-200, sTypoLineGap=0, usWinAscent=900, usWinDescent=200,
            sCapHeight=H, sxHeight=H, achVendID='NONE')
fb.setupPost()
if sys.argv[1].endswith('.woff2'):
    fb.font.flavor = 'woff2'
fb.save(sys.argv[1])
print('glyphs', len(order))
