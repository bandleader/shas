import * as HardCoded from './hardCodedTexts'

function toComparer<T>(keyer: (i: T)=>string|number) { return (a: T, b: T) => { const ka = keyer(a), kb = keyer(b); return ka > kb ? 1 : ka < kb ? -1 : 0  } }

function getPeirushOrderFromRef(ref: string) { return parseInt(ref.split(":")[1]) || 0 }

export async function fetchText(ref: string): Promise<TextAndCommentaries> {
  const sefariaResp = JSON.parse(HardCoded.getStoredJson())
  console.log("RESP", sefariaResp)
  const heLines = sefariaResp.he as string[]
  const mainText = new Text(
      String(sefariaResp.heTitle), 
      heLines.map((x,i) => new TextLine(String(x), sefariaResp.ref + ":" + (i+1)))
    )
  const peirushim = (sefariaResp.commentary as any[])
    .sort(toComparer(c => getPeirushOrderFromRef(c.ref))) // silly Sefaria API missorts "Rashi on Shabbat 47b:11:1" before "Rashi on Shabbat 47b:2:1"
    .map((c,i) => {
      const text = new Text(c.collectiveTitle.he, deepFlatten(c.he).map((lineText,i) => new TextLine(lineText, `${c.ref}#LINE#${i}`, c.anchorRef || null)))
      return { text }
  }) // x.heTitle || x.index_title
  const listOfPeirushim = Array.from(new Set(peirushim.map(x => x.text.titleHe)))
  const peirushimConsolidated = listOfPeirushim.map(x => new Text(x, peirushim.filter(p => p.text.titleHe === x).flatMap(y => y.text.lines)))
  return new TextAndCommentaries(mainText, peirushimConsolidated.map(text => ({ text })))
}

function deepFlatten(x: any): string[] {
  return Array.isArray(x) ? x.flatMap(y => deepFlatten(y)) : [String(x)]
}

export class TextAndCommentaries {
  constructor(public text: Text, public commentaries: {text: Text}[]) {}
  find(ind: number) {    
    return this.commentaries.find(x => x.text.titleHe === 'רש"י|תוספות'.split("|")[ind])!.text
  }
}

export class Text {
  constructor(public titleHe: string, public lines: TextLine[]) {}
}
export class TextLine {
  constructor(public html: string, public ref: string, public anchoredTo: string|null = null) {
    this.html = processTextStr(html)
  }
}

export class LangString {
  constructor (public he: string, public en: string) {}
}

export function expandRangeStr(str: string): number[] {
  // Accepts "3-5" and returns [3, 4, 5]. Also accepts "3" and returns [3].
  const parts = str.split("-")
  if (parts.length > 2) throw "Cannot contain more than one hyphen"
  if (!parts.every(x => !isNaN(Number(x)))) throw "Must be numeric"
  if (parts.length === 1) return [Number(str)]
  const start = Number(parts[0]), end = Number(parts[1]), len = end - start
  if (len < 0) throw "End must be more than start"
  return Array.from(Array(len)).map((_,i) => start + i)
}

function processTextStr(text: string) {
  const textNoHtml = text.replace(/<.+?>/g, "");

  // Mark hypenated beginnings as bold
  if (
    !text.startsWith("<b") &&
    textNoHtml.indexOf("-") >= 0 &&
    textNoHtml.indexOf("-") < 50
  ) {
    text = `<b>${text.split("-", 2)[0]}</b>-${text.split("-", 2)[1]}`;
  }

  // Mark bold beginnings as Dibur Maschil
  if (text.startsWith("<b>"))
    text = "<b class='diburMaschil'>" + text.substr(3);

  // Mark ומ"ש beginnings in bold
  if (
    text.startsWith('ומ"ש ') &&
    textNoHtml.indexOf("כו'") >= 0 &&
    textNoHtml.indexOf("כו'") < 50
  ) {
    text =
      'ומ"ש ' +
      "<b>" +
      text.substr(5, text.indexOf("כו'") + 3 - 5) +
      "</b>" +
      text.substr(text.indexOf("כו'") + 3);
  }

  // Mark quotes
  text = text.replace(
    /וז"ל (.+?) (ע"כ|עכ"ד|עכ"ל|וכ"כ|עוד כתב|ועוד כתב)/g,
    (whole, quoted, ending) => {
      if (quoted.length > 300) return whole;
      return `וז"ל <u class='quote'>${quoted}</u> ${ending}`;
    }
  );

  // If no Dibur Maschil, make the first word bold
  if (!text.startsWith("<b"))
    text =
      "<b>" + text.split(" ", 2)[0] + "</b>" + text.substr(text.indexOf(" "));

  // Ois-at-the-beginning should be a badge
  if (textNoHtml.startsWith("("))
    text = text.replace(
      /\(([א-ת]+?)\)/,
      (whole, ois) => `<span class='badge badge-secondary'>${ois}</span>`
    );

  return text;
}