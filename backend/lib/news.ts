export const UA = { 'user-agent': 'Mozilla/5.0 SentinelaBot/1.0' };

export async function fetchText(url: string) {
  const res = await fetch(url, { headers: UA, next: { revalidate: 600 } });
  if (!res.ok) throw new Error(url + ' -> ' + res.status);
  return res.text();
}

export async function fromG1() {
  const xml = await fetchText('https://g1.globo.com/dynamo/sp/vale-do-paraiba-regiao/rss2.xml');
  const items: any[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const tag = (t: string) => {
      const rr = new RegExp('<' + t + '>([\\s\\S]*?)<\\/' + t + '>', 'i');
      const mm = rr.exec(block);
      return mm ? mm[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
    };
    const title = tag('title');
    const link = tag('link');
    const desc = tag('description').replace(/<[^>]+>/g, '');
    let image = '';
    const mt = block.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
    if (mt) image = mt[1];
    const me = block.match(/<enclosure[^>]*url="([^"]+)"/i);
    if (!image && me) image = me[1];
    if (title && link) items.push({ title, link, image, description: desc, tag: 'G1 Vale' });
  }
  return items;
}

export async function fromBand() {
  const html = await fetchText('https://www.band.com.br/band-vale');
  const items: any[] = [];
  const re = /<a[^>]+href="(https?:\/\/www\.band\.com\.br\/band-vale\/[^"]+)"[^>]*>(.*?)<\/a>/gi;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const link = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text.length < 28) continue;
    const key = link + '|' + text;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ title: text, link, image: '', description: '', tag: 'Band Vale' });
    if (items.length >= 15) break;
  }
  return items;
}
