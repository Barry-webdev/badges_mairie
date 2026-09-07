import path from 'path';
import fs from 'fs';
import { IAgentDocument } from '../models/Agent';
import { IBadgeDocument } from '../models/Badge';
import { generateQrCodeImage } from './qrcode.service';
import { format } from '../utils/dateUtils';
import { logger } from '../utils/logger';

// Dimensions badge ISO 85.6mm × 54mm à 96dpi
// 1mm = 3.7795px à 96dpi
// 85.6mm = 323px  |  54mm = 204px
const CARD_W = 323;
const CARD_H = 204;
const GAP    = 12;   // espace entre recto et verso
const PAGE_W = CARD_W * 2 + GAP + 40; // padding gauche+droite 20px chacun

export const generateBadgePdf = async (
  agent: IAgentDocument,
  badge: IBadgeDocument
): Promise<Buffer> => {
  const qrCodeImage = await generateQrCodeImage(badge.qrToken);
  const photoBase64 = await getPhotoBase64(agent.photo);
  const logoBase64 = getLogoBase64();
  const html = buildBadgeHtml(agent, badge, qrCodeImage, photoBase64, logoBase64);

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer');
    const executablePath = findChromePath();

    const launchOptions: Record<string, unknown> = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    if (executablePath) launchOptions.executablePath = executablePath;

    const browser = await puppeteer.launch(launchOptions);
    try {
      const page = await browser.newPage();

      // Viewport exact = largeur de la page HTML
      await page.setViewport({ width: PAGE_W, height: CARD_H + 60, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // PDF dont les dimensions = contenu réel, pas de marges
      const pdf = await page.pdf({
        width: `${PAGE_W}px`,
        height: `${CARD_H + 60}px`,   // 60px = labels + padding vertical
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  } catch (err) {
    logger.warn('Puppeteer non disponible :', err);
    throw new Error('Génération PDF impossible. Installez Chrome : npx puppeteer browsers install chrome');
  }
};

function findChromePath(): string | null {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

async function getPhotoBase64(photoPath?: string): Promise<string> {
  if (!photoPath) return getDefaultPhotoBase64();
  const fullPath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'photos', path.basename(photoPath));
  if (fs.existsSync(fullPath)) {
    const buf = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${buf.toString('base64')}`;
  }
  return getDefaultPhotoBase64();
}

function getLogoBase64(): string {
  const logoPaths = [
    path.join(__dirname, '../assets/logo.jpeg'),
    path.join(process.cwd(), 'src/assets/logo.jpeg'),
    path.join(process.cwd(), 'dist/assets/logo.jpeg'),
  ];
  for (const p of logoPaths) {
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    }
  }
  return ''; // pas de logo — on n'affiche rien
}

function getDefaultPhotoBase64(): string {
  const svg = `<svg width="120" height="140" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="140" fill="#2a4a7f"/>
    <circle cx="60" cy="52" r="26" fill="#4a6fa5"/>
    <ellipse cx="60" cy="110" rx="40" ry="30" fill="#4a6fa5"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function buildBadgeHtml(
  agent: IAgentDocument,
  badge: IBadgeDocument,
  qrCodeImage: string,
  photoBase64: string,
  logoBase64: string
): string {
  const validite = `Du ${format(badge.dateEmission)} au ${format(badge.dateExpiration)}`;
  const effectiveStatut = badge.getEffectiveStatut();
  const sColor = effectiveStatut === 'ACTIF' ? '#16a34a'
    : effectiveStatut === 'RÉVOQUÉ' ? '#dc2626' : '#d97706';

  // Tout en pixels — dimensionné pour correspondre exactement aux CARD_W × CARD_H
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  html, body {
    width: ${PAGE_W}px;
    background: #d0d0d0;
    font-family: Arial, Helvetica, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    padding: 10px 20px 10px 20px;
    display: flex;
    flex-direction: row;
    gap: ${GAP}px;
    align-items: flex-start;
  }

  .face-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .face-label {
    font-size: 9px;
    font-weight: bold;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    text-align: center;
  }

  /* ── Carte ISO 323 × 204 px ── */
  .card {
    width: ${CARD_W}px;
    height: ${CARD_H}px;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(145deg, #1a3560 0%, #2255a4 58%, #1a3560 100%);
    color: white;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    flex-shrink: 0;
  }

  /* ─ RECTO header ─ */
  .hdr {
    background: rgba(0,0,0,0.3);
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }
  .flag { display:flex; width:16px; height:26px; border-radius:2px; overflow:hidden; flex-shrink:0; }
  .fr { flex:1; background:#ce1126; }
  .fy { flex:1; background:#fcd116; }
  .fg { flex:1; background:#009a44; }
  .ht { flex:1; text-align:center; }
  .h1 { font-size:8px; font-weight:bold; color:#fcd116; text-transform:uppercase; letter-spacing:0.5px; }
  .h2 { font-size:7px; color:rgba(255,255,255,0.72); margin: 1px 0; }
  .h3 { font-size:11px; font-weight:bold; color:#fcd116; text-transform:uppercase; letter-spacing:0.8px; }

  /* ─ RECTO body ─ */
  .body {
    flex: 1;
    display: flex;
    padding: 7px 8px;
    gap: 7px;
    min-height: 0;
  }

  /* Photo */
  .pcol { display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0; }
  .pframe {
    width: 62px;
    height: 74px;
    border: 2.5px solid #fcd116;
    border-radius: 4px;
    overflow: hidden;
    background: #3a5a8a;
  }
  .pframe img { width:100%; height:100%; object-fit:cover; display:block; }
  .mat {
    background: #fcd116;
    color: #1a3560;
    font-size: 7.5px;
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 3px;
    white-space: nowrap;
    text-align: center;
  }

  /* Infos */
  .icol { flex:1; display:flex; flex-direction:column; gap:4px; min-width:0; }
  .aname {
    font-size: 12px;
    font-weight: bold;
    color: white;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(252,209,22,0.4);
    padding-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
  .iblk { display:flex; flex-direction:column; gap:0; }
  .ilbl { font-size: 6.5px; color:rgba(255,255,255,0.55); text-transform:uppercase; letter-spacing:0.4px; }
  .ival { font-size: 9px; color:white; font-weight:500; line-height:1.2; }
  .vbox {
    background: rgba(0,0,0,0.22);
    border-radius: 3px;
    padding: 3px 5px;
    margin-top: auto;
  }
  .vval { font-size: 8px; color:#fcd116; font-weight:bold; }
  .schip {
    font-size: 7.5px;
    font-weight: bold;
    background: rgba(255,255,255,0.1);
    border: 1px solid ${sColor};
    color: ${sColor};
    border-radius: 3px;
    padding: 1px 5px;
    display: inline-block;
    margin-top: 2px;
  }

  /* QR */
  .qcol {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex-shrink: 0;
  }
  .qbox {
    width: 58px;
    height: 58px;
    background: white;
    padding: 2px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.25);
  }
  .qbox img { width:100%; height:100%; display:block; }
  .qlbl { font-size:6.5px; color:rgba(255,255,255,0.65); text-align:center; line-height:1.3; }

  /* RECTO footer */
  .ftr {
    background: rgba(0,0,0,0.3);
    padding: 4px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .sig { display:flex; flex-direction:column; align-items:center; }
  .sig span { font-size:7px; color:rgba(255,255,255,0.65); }
  .sline { width:50px; height:1px; background:#fcd116; margin-bottom:2px; }
  .motto { font-size:6.5px; color:rgba(255,255,255,0.38); }

  /* ─ VERSO ─ */
  .vhdr {
    background: rgba(0,0,0,0.28);
    padding: 7px 12px;
    text-align: center;
    flex-shrink: 0;
  }
  .vtitle { font-size:12px; font-weight:bold; color:#fcd116; text-transform:uppercase; letter-spacing:0.8px; }
  .vsub   { font-size:8px; color:rgba(255,255,255,0.72); margin-top:2px; }

  .vbody { flex:1; padding:7px 12px; display:flex; flex-direction:column; gap:6px; }
  .vtxt {
    font-size:8px;
    color:rgba(255,255,255,0.9);
    line-height:1.55;
    text-align:justify;
    border-left:2.5px solid #fcd116;
    padding: 4px 5px 4px 7px;
    background:rgba(0,0,0,0.14);
    border-radius:0 3px 3px 0;
  }
  .vcontacts { display:flex; flex-direction:column; gap:3px; }
  .crow { display:flex; gap:6px; font-size:8px; color:rgba(255,255,255,0.82); align-items:baseline; }
  .cl { color:#fcd116; font-weight:bold; min-width:44px; flex-shrink:0; }

  .vftr {
    background: rgba(0,0,0,0.28);
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .sblk { text-align:center; }
  .sline2 { width:58px; height:1px; background:rgba(255,255,255,0.42); margin:0 auto 2px; }
  .sname  { font-size:7.5px; font-weight:bold; color:white; }
  .stitle { font-size:6px; color:rgba(255,255,255,0.52); }
  .lnote  { font-size:6.5px; color:rgba(255,255,255,0.45); text-align:center; line-height:1.45; }
</style>
</head>
<body>
<div class="page">

  <!-- RECTO -->
  <div class="face-wrap">
    <div class="face-label">Recto</div>
    <div class="card">

      <div class="hdr">
        ${logoBase64
          ? `<img src="${logoBase64}" alt="Logo Mairie" style="
              width:34px;
              height:34px;
              object-fit:contain;
              border-radius:3px;
              flex-shrink:0;
              mix-blend-mode:lighten;
              filter:brightness(1.05) contrast(1.1);
             " />`
          : `<div style="display:flex;width:16px;height:26px;border-radius:2px;overflow:hidden;flex-shrink:0;">
               <div style="flex:1;background:#ce1126;"></div>
               <div style="flex:1;background:#fcd116;"></div>
               <div style="flex:1;background:#009a44;"></div>
             </div>`
        }
        <div class="ht">
          <div class="h1">République de Guinée</div>
          <div class="h2">Préfecture de Pita · Commune de Pita</div>
          <div class="h3">Garde Communale</div>
        </div>
      </div>

      <div class="body">
        <div class="pcol">
          <div class="pframe"><img src="${photoBase64}" alt=""/></div>
          <div class="mat">${agent.matricule}</div>
        </div>
        <div class="icol">
          <div class="aname">${agent.prenom} ${agent.nom}</div>
          <div class="iblk"><div class="ilbl">Fonction</div><div class="ival">${agent.fonction}</div></div>
          <div class="iblk"><div class="ilbl">Affectation</div><div class="ival">${agent.affectation}</div></div>
          <div class="vbox">
            <div class="ilbl">Validité</div>
            <div class="vval">${validite}</div>
          </div>
          <div class="schip">● ${effectiveStatut}</div>
        </div>
        <div class="qcol">
          <div class="qbox"><img src="${qrCodeImage}" alt="QR"/></div>
          <div class="qlbl">Scannez<br/>pour vérifier</div>
        </div>
      </div>

      <div class="ftr">
        <div class="sig"><div class="sline"></div><span>Le Maire</span></div>
        <div class="motto">Proximité · Sécurité · Service</div>
        <div class="sig"><div class="sline"></div><span>Resp. de la Garde</span></div>
      </div>

    </div>
  </div>

  <!-- VERSO -->
  <div class="face-wrap">
    <div class="face-label">Verso</div>
    <div class="card">

      <div class="vhdr">
        <div class="vtitle">Garde Communale de Pita</div>
        <div class="vsub">Mairie de Pita — République de Guinée</div>
      </div>

      <div class="vbody">
        <div class="vtxt">
          Ce badge est strictement personnel et professionnel. Il donne droit à son porteur
          d'exercer ses fonctions dans le cadre de ses missions officielles au sein de la
          Garde Communale de Pita.
        </div>
        <div class="vcontacts">
          <div class="crow"><span class="cl">Adresse :</span><span>Mairie de Pita, Pita, Préfecture de Pita</span></div>
          <div class="crow"><span class="cl">Tél :</span><span>+224 621 00 00 00</span></div>
          <div class="crow"><span class="cl">Email :</span><span>mairie.pita@commune.gn</span></div>
          <div class="crow"><span class="cl">Web :</span><span>www.commune-pita.gn</span></div>
        </div>
      </div>

      <div class="vftr">
        <div class="sblk">
          <div class="sline2"></div>
          <div class="sname">Le Maire de Pita</div>
          <div class="stitle">Autorité émettrice</div>
        </div>
        <div class="lnote">En cas de perte ou<br/>de vol, contacter<br/>la Mairie de Pita.</div>
        <div class="sblk">
          <div class="sline2"></div>
          <div class="sname">Resp. de la Garde</div>
          <div class="stitle">Chef de la Garde</div>
        </div>
      </div>

    </div>
  </div>

</div>
</body>
</html>`;
}
