/**
 * Printable communication cards (brief §12). The PDF is generated on the
 * device by expo-print from local HTML; images are embedded as data URIs.
 */
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { symbolSource, type SkinTone } from '@/data/symbols';
import type { Button } from '@/db/types';
import { buttonLabel } from '@/i18n/labels';
import { readMediaBase64 } from './media';
import { WORD_COLORS } from '@/theme/colors';

export type CardSize = 'small' | 'medium' | 'large';

const LAYOUT: Record<CardSize, { cols: number; rows: number; img: number; font: number }> = {
  small: { cols: 3, rows: 4, img: 30, font: 13 },
  medium: { cols: 2, rows: 3, img: 42, font: 18 },
  large: { cols: 1, rows: 2, img: 70, font: 30 },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function imageDataUri(btn: Button, tone: SkinTone): Promise<string | null> {
  try {
    if (btn.photo) {
      const b64 = await readMediaBase64(btn.photo);
      if (b64) return `data:image/jpeg;base64,${b64}`;
    }
    const src = symbolSource(btn.symbol, tone);
    if (!src) return null;
    const asset = Asset.fromModule(src);
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (Platform.OS === 'web') return uri;
    const b64 = await new File(uri).base64();
    return `data:image/webp;base64,${b64}`;
  } catch {
    return null;
  }
}

export async function buildCardsHtml(title: string, buttons: Button[], size: CardSize, tone: SkinTone, colorCoded: boolean) {
  const L = LAYOUT[size];
  const perPage = L.cols * L.rows;
  const cards: string[] = [];
  for (const b of buttons) {
    const img = await imageDataUri(b, tone);
    const sw = colorCoded ? WORD_COLORS[b.type] : WORD_COLORS.misc;
    cards.push(`<div class="card" style="background:${sw.bg};border-color:${sw.edge}">
      ${img ? `<img src="${img}" />` : ''}
      <div class="label">${esc(buttonLabel(b))}</div>
    </div>`);
  }
  const pages: string[] = [];
  for (let i = 0; i < cards.length; i += perPage) {
    pages.push(`<section class="page"><h1>${esc(title)}</h1><div class="grid">${cards.slice(i, i + perPage).join('')}</div></section>`);
  }
  return `<!doctype html><html><head><meta charset="utf-8" />
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1F1B4D; margin: 0; }
  .page { page-break-after: always; height: 270mm; display: flex; flex-direction: column; }
  .page:last-child { page-break-after: auto; }
  h1 { font-size: 14pt; margin: 0 0 4mm; color: #5C5986; }
  .grid { flex: 1; display: grid; grid-template-columns: repeat(${L.cols}, 1fr); grid-template-rows: repeat(${L.rows}, 1fr); gap: 5mm; }
  .card { border: 1.2mm solid; border-radius: 6mm; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3mm; overflow: hidden; }
  .card img { width: ${L.img}mm; height: ${L.img}mm; object-fit: contain; }
  .label { font-size: ${L.font}pt; font-weight: 800; text-align: center; margin-top: 2mm; }
</style></head><body>${pages.join('')}</body></html>`;
}

export async function printCards(html: string) {
  await Print.printAsync({ html });
}

export async function savePdf(html: string, name: string) {
  const { uri } = await Print.printToFileAsync({ html });
  if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: name, UTI: 'com.adobe.pdf' });
  }
}
