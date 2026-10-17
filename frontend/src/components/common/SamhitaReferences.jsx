import React from 'react';
import { BookMarked, Quote } from 'lucide-react';


export default function SamhitaReferences({
  references,
  title = 'Classical Samhita References & Citations',
  className = '',
}) {
  const rawList = Array.isArray(references)
    ? references
    : references
      ? [references]
      : [];

  const normalizedList = rawList
    .map((refItem, idx) => {
      if (!refItem) return null;

      if (typeof refItem === 'string') {
        const trimmed = refItem.trim();
        if (!trimmed) return null;
        return {
          id: `ref-str-${idx}`,
          samhita: trimmed,
          location: '',
          verse: '',
          commentary: '',
          originalSanskrit: '',
          transliteration: '',
          translation: '',
          context: '',
        };
      }

      const refObj = refItem.reference && typeof refItem.reference === 'object'
        ? refItem.reference
        : refItem;

      const samhitaName =
        refObj.classicalDetails?.samhita ||
        refObj.samhita ||
        refObj.samhitaName ||
        refObj.title ||
        refItem.context ||
        'Classical Samhita Source';

      const sthana = refObj.classicalDetails?.sthana || refObj.sthana || '';
      const adhyaya =
        refObj.classicalDetails?.adhyayaName ||
        (refObj.classicalDetails?.adhyayaNumber != null
          ? `Adhyaya ${refObj.classicalDetails.adhyayaNumber}`
          : '') ||
        (refObj.chapter != null ? `Ch. ${refObj.chapter}` : '') ||
        '';
      const location = [sthana, adhyaya].filter(Boolean).join(' • ');

      const verse =
        refItem.specificVerse ||
        (refObj.classicalDetails?.shlokaNumber != null
          ? `Shloka ${refObj.classicalDetails.shlokaNumber}`
          : '') ||
        (refObj.verse != null ? `Verse ${refObj.verse}` : '') ||
        '';

      const commentator = refObj.classicalDetails?.commentator || refObj.commentator || '';
      const commentaryTitle = refObj.classicalDetails?.commentaryTitle || refObj.commentaryTitle || '';
      const commentary = commentator
        ? commentaryTitle
          ? `${commentaryTitle} (${commentator})`
          : commentator
        : commentaryTitle;

      const originalSanskrit =
        refObj.content?.originalSanskrit ||
        refItem.excerpt ||
        refObj.shloka ||
        refObj.citation ||
        '';

      const transliteration = refObj.content?.transliteration || refObj.transliteration || '';

      const translation =
        refObj.content?.englishTranslation ||
        refObj.translation ||
        refItem.context ||
        '';

      const commentarySummary =
        refObj.content?.commentarySummary ||
        refObj.commentarySummary ||
        '';

      const context = refItem.context && refItem.context !== translation ? refItem.context : '';

      return {
        id: refItem._id || refObj._id || `ref-${idx}`,
        samhita: samhitaName,
        location,
        verse,
        commentary,
        originalSanskrit,
        transliteration,
        translation,
        commentarySummary,
        context,
      };
    })
    .filter(Boolean);

  return (
    <div className={`glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
        <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{title}</span>
      </h3>

      {normalizedList.length === 0 ? (
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 italic">No references available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {normalizedList.map((ref) => (
            <div
              key={ref.id}
              className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 text-xs text-slate-300 transition-all hover:border-slate-700/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-amber-300 text-sm">
                  {ref.samhita}
                </span>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                  {ref.location && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                      {ref.location}
                    </span>
                  )}
                  {ref.verse && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      {ref.verse}
                    </span>
                  )}
                </div>
              </div>

              {ref.context && (
                <div className="mb-2 text-[11px] text-cyan-400/90 font-medium">
                  Context: {ref.context}
                </div>
              )}

              {ref.originalSanskrit && (
                <div className="my-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 relative">
                  <Quote className="w-3.5 h-3.5 text-amber-400/40 absolute top-2 right-2 pointer-events-none" />
                  <p className="font-classical text-amber-100/95 text-xs sm:text-sm leading-relaxed pr-5">
                    {ref.originalSanskrit}
                  </p>
                </div>
              )}

              {ref.transliteration && (
                <p className="text-[11px] text-slate-400 font-mono italic mb-2">
                  {ref.transliteration}
                </p>
              )}

              {ref.translation && (
                <div className="mt-2 text-slate-300 text-xs leading-relaxed">
                  <span className="text-slate-400 font-semibold">Translation: </span>
                  {ref.translation}
                </div>
              )}

              {(ref.commentary || ref.commentarySummary) && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex flex-col gap-1">
                  {ref.commentary && (
                    <div>
                      <span className="text-slate-500 font-medium">Commentary: </span>
                      <span className="text-slate-300">{ref.commentary}</span>
                    </div>
                  )}
                  {ref.commentarySummary && (
                    <p className="text-slate-400 italic">
                      {ref.commentarySummary}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
