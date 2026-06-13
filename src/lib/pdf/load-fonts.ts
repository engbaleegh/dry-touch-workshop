import pdfMakeModule from "pdfmake";

const pdfMake = pdfMakeModule as typeof pdfMakeModule & {
  virtualfs: {
    writeFileSync: (path: string, content: Buffer) => void;
  };
};
import {
  NOTOSANSARABIC_REGULAR_TTF,
  ROBOTO_REGULAR_TTF,
  ROBOTO_MEDIUM_TTF,
  ROBOTO_ITALIC_TTF,
  ROBOTO_MEDIUMITALIC_TTF,
} from "./font-buffers";

export type PdfFontDescriptors = Record<
  string,
  {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }
>;

const VFS_FONTS = {
  "fonts/NotoSansArabic-Regular.ttf": NOTOSANSARABIC_REGULAR_TTF,
  "fonts/Roboto-Regular.ttf": ROBOTO_REGULAR_TTF,
  "fonts/Roboto-Medium.ttf": ROBOTO_MEDIUM_TTF,
  "fonts/Roboto-Italic.ttf": ROBOTO_ITALIC_TTF,
  "fonts/Roboto-MediumItalic.ttf": ROBOTO_MEDIUMITALIC_TTF,
} as const;

function registerFontsInVfs() {
  for (const [vfsPath, buffer] of Object.entries(VFS_FONTS)) {
    pdfMake.virtualfs.writeFileSync(vfsPath, buffer);
  }
}

/** Register embedded fonts in pdfmake VFS — no filesystem access (Vercel-safe). */
export function loadPdfFontDescriptors(): PdfFontDescriptors {
  registerFontsInVfs();

  return {
    Roboto: {
      normal: "fonts/Roboto-Regular.ttf",
      bold: "fonts/Roboto-Medium.ttf",
      italics: "fonts/Roboto-Italic.ttf",
      bolditalics: "fonts/Roboto-MediumItalic.ttf",
    },
    NotoSansArabic: {
      normal: "fonts/NotoSansArabic-Regular.ttf",
      bold: "fonts/NotoSansArabic-Regular.ttf",
      italics: "fonts/NotoSansArabic-Regular.ttf",
      bolditalics: "fonts/NotoSansArabic-Regular.ttf",
    },
  };
}
