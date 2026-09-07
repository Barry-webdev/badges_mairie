import { useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import type { Agent, Badge } from '../../types';
import { agentService } from '../../services/agent.service';
import { formatDate } from '../../utils/format';
import api from '../../services/api';
import { Button } from '../ui/Button';

interface BadgePreviewProps {
  agent: Agent;
  badge: Badge;
  onDownload: () => void;
}

const statutColor: Record<string, string> = {
  ACTIF:    '#16a34a',
  SUSPENDU: '#d97706',
  EXPIRÉ:   '#ea580c',
  RÉVOQUÉ:  '#dc2626',
};

export const BadgePreview = ({ agent, badge, onDownload }: BadgePreviewProps) => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const photoUrl = agent.photo ? agentService.getPhotoUrl(agent.photo) : null;
  const effectiveStatut = badge.statut;
  const validite = `Du ${formatDate(badge.dateEmission)} au ${formatDate(badge.dateExpiration)}`;
  const sColor = statutColor[effectiveStatut] || '#6b7280';

  useEffect(() => {
    api.get(`/badges/${badge._id}`).then((res) => {
      if (res.data.data?.qrImage) setQrImage(res.data.data.qrImage);
    }).catch(() => {});
  }, [badge._id]);

  // Dimensions d'affichage — ratio carte ISO (85.6 / 54 = 1.585)
  const W = 380;
  const H = Math.round(W / 1.585); // ~240px

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">

        {/* ─── RECTO ─── */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recto</p>
          <div
            style={{
              width: W, height: H,
              background: 'linear-gradient(145deg, #1a3560 0%, #2255a4 58%, #1a3560 100%)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div style={{
              background: 'rgba(0,0,0,0.28)', padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
            }}>
              <img
                src="/logo.jpeg"
                alt="Logo Mairie de Pita"
                style={{
                  width: 38,
                  height: 38,
                  objectFit: 'contain',
                  borderRadius: 4,
                  flexShrink: 0,
                  mixBlendMode: 'lighten' as const,
                  filter: 'brightness(1.05) contrast(1.1)',
                }}
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = 'none';
                  const flag = document.createElement('div');
                  flag.style.cssText = 'display:flex;width:18px;height:28px;border-radius:2px;overflow:hidden;flex-shrink:0;';
                  flag.innerHTML = '<div style="flex:1;background:#ce1126;"></div><div style="flex:1;background:#fcd116;"></div><div style="flex:1;background:#009a44;"></div>';
                  el.parentNode?.insertBefore(flag, el);
                }}
              />
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:'bold', color:'#fcd116', textTransform:'uppercase', letterSpacing:0.6 }}>
                  République de Guinée
                </div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.72)', margin:'1px 0' }}>
                  Préfecture de Pita · Commune de Pita
                </div>
                <div style={{ fontSize:13, fontWeight:'bold', color:'#fcd116', textTransform:'uppercase', letterSpacing:0.8 }}>
                  Garde Communale
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex:1, display:'flex', padding:'8px 10px', gap:8, minHeight:0 }}>

              {/* Photo */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0 }}>
                <div style={{
                  width:72, height:86,
                  border:'2.5px solid #fcd116', borderRadius:5,
                  overflow:'hidden', background:'#3a5a8a'
                }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b8fb5', fontSize:32, fontWeight:'bold' }}>
                        {agent.prenom[0]}{agent.nom[0]}
                      </div>
                  }
                </div>
                <div style={{
                  background:'#fcd116', color:'#1a3560',
                  fontSize:8.5, fontWeight:'bold',
                  padding:'2px 6px', borderRadius:4, whiteSpace:'nowrap'
                }}>
                  {agent.matricule}
                </div>
              </div>

              {/* Infos */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5, minWidth:0 }}>
                <div style={{
                  fontSize:14, fontWeight:'bold', color:'white', textTransform:'uppercase',
                  borderBottom:'1px solid rgba(252,209,22,0.4)', paddingBottom:4,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                }}>
                  {agent.prenom} {agent.nom}
                </div>
                <div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:0.4 }}>Fonction</div>
                  <div style={{ fontSize:11, color:'white', fontWeight:500, lineHeight:1.2 }}>{agent.fonction}</div>
                </div>
                <div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:0.4 }}>Affectation</div>
                  <div style={{ fontSize:11, color:'white', fontWeight:500, lineHeight:1.2 }}>{agent.affectation}</div>
                </div>
                <div style={{
                  background:'rgba(0,0,0,0.22)', borderRadius:4, padding:'4px 6px', marginTop:'auto'
                }}>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:0.4 }}>Validité</div>
                  <div style={{ fontSize:9.5, color:'#fcd116', fontWeight:'bold' }}>{validite}</div>
                </div>
                <div style={{
                  fontSize:9, fontWeight:'bold', color:sColor,
                  background:'rgba(255,255,255,0.1)',
                  border:`1px solid ${sColor}`,
                  borderRadius:4, padding:'2px 6px', display:'inline-block'
                }}>
                  ● {effectiveStatut}
                </div>
              </div>

              {/* QR */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, flexShrink:0 }}>
                <div style={{
                  width:68, height:68,
                  background:'white', padding:3,
                  borderRadius:5, border:'1px solid rgba(255,255,255,0.25)'
                }}>
                  {qrImage
                    ? <img src={qrImage} alt="QR" style={{ width:'100%', height:'100%', display:'block' }}/>
                    : <div style={{ width:'100%', height:'100%', background:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#9ca3af' }}>QR</div>
                  }
                </div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.65)', textAlign:'center', lineHeight:1.3 }}>
                  Scannez<br/>pour vérifier
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              background:'rgba(0,0,0,0.28)', padding:'5px 12px',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              flexShrink:0
            }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:52, height:1, background:'#fcd116', marginBottom:2 }}/>
                <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.65)' }}>Le Maire</span>
              </div>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.38)' }}>Proximité · Sécurité · Service</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:52, height:1, background:'#fcd116', marginBottom:2 }}/>
                <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.65)' }}>Resp. de la Garde</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── VERSO ─── */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verso</p>
          <div
            style={{
              width: W, height: H,
              background: 'linear-gradient(145deg, #1a3560 0%, #2255a4 58%, #1a3560 100%)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div style={{
              background:'rgba(0,0,0,0.28)', padding:'8px 14px', textAlign:'center', flexShrink:0
            }}>
              <div style={{ fontSize:14, fontWeight:'bold', color:'#fcd116', textTransform:'uppercase', letterSpacing:0.8 }}>
                Garde Communale de Pita
              </div>
              <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.72)', marginTop:2 }}>
                Mairie de Pita — République de Guinée
              </div>
            </div>

            {/* Body */}
            <div style={{ flex:1, padding:'8px 14px', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{
                fontSize:9.5, color:'rgba(255,255,255,0.9)', lineHeight:1.55,
                textAlign:'justify',
                borderLeft:'2.5px solid #fcd116',
                padding:'5px 7px 5px 9px',
                background:'rgba(0,0,0,0.14)', borderRadius:'0 4px 4px 0'
              }}>
                Ce badge est strictement personnel et professionnel. Il donne droit à son porteur
                d'exercer ses fonctions dans le cadre de ses missions officielles au sein de la
                Garde Communale de Pita.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  ['Adresse :', 'Mairie de Pita, Pita, Préfecture de Pita'],
                  ['Tél :', '+224 621 00 00 00'],
                  ['Email :', 'mairie.pita@commune.gn'],
                  ['Web :', 'www.commune-pita.gn'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display:'flex', gap:8, fontSize:9.5, color:'rgba(255,255,255,0.82)', alignItems:'baseline' }}>
                    <span style={{ color:'#fcd116', fontWeight:'bold', minWidth:50, flexShrink:0 }}>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              background:'rgba(0,0,0,0.28)', padding:'6px 12px',
              display:'flex', justifyContent:'space-between', alignItems:'flex-end',
              flexShrink:0
            }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:62, height:1, background:'rgba(255,255,255,0.42)', margin:'0 auto 3px' }}/>
                <div style={{ fontSize:9, fontWeight:'bold', color:'white' }}>Le Maire de Pita</div>
                <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.52)' }}>Autorité émettrice</div>
              </div>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.45)', textAlign:'center', lineHeight:1.45 }}>
                En cas de perte ou<br/>de vol, contacter<br/>la Mairie de Pita.
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:62, height:1, background:'rgba(255,255,255,0.42)', margin:'0 auto 3px' }}/>
                <div style={{ fontSize:9, fontWeight:'bold', color:'white' }}>Resp. de la Garde</div>
                <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.52)' }}>Chef de la Garde</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        <Button onClick={onDownload} icon={<Download className="w-4 h-4" />}>
          Télécharger PDF
        </Button>
        <Button variant="outline" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
          Imprimer
        </Button>
      </div>
    </div>
  );
};
