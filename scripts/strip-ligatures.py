"""Strip OpenType ligature features from Playfair Display TTFs.

Why: @react-pdf/renderer writes a ToUnicode CMap that maps each emitted glyph
back to a single codepoint. For ligature glyphs (e.g. "fi"/"fl"/"Th") fontkit
reports only the first codepoint of the cluster, so PDF text extraction and
accessibility tools receive "defne", "Whitfeld", "Toughtful" etc. — even
though the glyphs render correctly on screen.

Dropping the `liga`, `dlig`, and `rlig` feature records from GSUB prevents
fontkit from substituting ligature glyphs in the first place, so each
logical character keeps its own glyph and the ToUnicode mapping stays
faithful.

Usage:
    python3 scripts/strip-ligatures.py public/fonts/PlayfairDisplay-*.ttf

Requires: fontTools (pip install fonttools)
"""
import sys
from fontTools.ttLib import TTFont

LIGATURE_FEATURES = {"liga", "dlig", "clig", "hlig", "rlig"}


def strip(path: str) -> None:
    font = TTFont(path)
    if "GSUB" not in font:
        return
    gsub = font["GSUB"].table
    if not gsub.FeatureList:
        return

    old_to_new = {}
    kept = []
    dropped = set()
    for idx, rec in enumerate(gsub.FeatureList.FeatureRecord):
        if rec.FeatureTag in LIGATURE_FEATURES:
            dropped.add(rec.FeatureTag)
            continue
        old_to_new[idx] = len(kept)
        kept.append(rec)

    gsub.FeatureList.FeatureRecord = kept
    gsub.FeatureList.FeatureCount = len(kept)

    def remap(indices):
        return [old_to_new[i] for i in indices if i in old_to_new]

    for script_rec in gsub.ScriptList.ScriptRecord:
        s = script_rec.Script
        if s.DefaultLangSys:
            s.DefaultLangSys.FeatureIndex = remap(s.DefaultLangSys.FeatureIndex)
            s.DefaultLangSys.FeatureCount = len(s.DefaultLangSys.FeatureIndex)
        for lang_rec in s.LangSysRecord:
            ls = lang_rec.LangSys
            ls.FeatureIndex = remap(ls.FeatureIndex)
            ls.FeatureCount = len(ls.FeatureIndex)

    font.save(path)
    if dropped:
        print(f"{path}: dropped {sorted(dropped)}", file=sys.stderr)


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        strip(arg)
