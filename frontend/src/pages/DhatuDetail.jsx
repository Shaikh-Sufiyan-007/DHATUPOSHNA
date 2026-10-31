import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dhatuApi, dhatvagniApi, dhatuposhanaApi } from '../api/index.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import DisclaimerBanner from '../components/common/DisclaimerBanner.jsx';
import SamhitaReferences from '../components/common/SamhitaReferences.jsx';
import { getMappingBySlug } from '../utils/dhatuMapping.js';
import {
  ArrowLeft,
  Sparkles,
  Flame,
  GitBranch,
  Activity,
  Layers,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function DhatuDetail() {
  const { id } = useParams();
  const [dhatu, setDhatu] = useState(null);
  const [dhatvagni, setDhatvagni] = useState(null);
  const [dhatuposhana, setDhatuposhana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    dhatuApi
      .getBySlugOrId(id)
      .then(async (res) => {
        const dhatuData = res.data;
        setDhatu(dhatuData);

        try {
          if (dhatuData._id) {
            const [agniRes, poshanaRes] = await Promise.all([
              dhatvagniApi.getByDhatuId(dhatuData._id).catch(() => null),
              dhatuposhanaApi.getByDhatuId(dhatuData._id).catch(() => null),
            ]);
            if (agniRes?.data) {
              setDhatvagni(Array.isArray(agniRes.data) ? agniRes.data[0] : agniRes.data);
            }
            if (poshanaRes?.data) {
              setDhatuposhana(Array.isArray(poshanaRes.data) ? poshanaRes.data[0] : poshanaRes.data);
            }
          }
        } catch {
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Dhatu detail:', err);
        setError(err.message || 'Dhatu information could not be retrieved.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading authentic Dhatu knowledge..." />
      </div>
    );
  }

  if (error || !dhatu) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Dhatu Record Not Found"
          message={error || 'The requested Dhatu does not exist in the database.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-6">
          <Link to="/dhatus" className="text-xs text-amber-400 hover:underline font-heading">
            ← Return to all Dhatus
          </Link>
        </div>
      </div>
    );
  }

  const mapping = getMappingBySlug(dhatu.slug);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-spatial-in">
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 spatial-dock p-3 sm:p-4 rounded-2xl border border-slate-700/60 shadow-lg font-heading">
        <Link
          to="/dhatus"
          className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer min-h-[44px] touch-target active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
          <span>All Sapta Dhatus</span>
        </Link>

        <Link
          to={`/explore?dhatu=${dhatu.slug}`}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:opacity-95 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] touch-target"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>View in 3D Human Body</span>
        </Link>
      </div>

      <div className="spatial-dock p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: mapping?.uiColor || '#f59e0b' }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 sm:pb-6 mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: mapping?.uiColor || '#f59e0b' }}
              />
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-amber-400">
                Dhatu #{dhatu.order || 1} of 7 • Structural Continuum
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span>{dhatu.name}</span>
              <span className="text-xl sm:text-3xl text-amber-300 font-heading">
                {typeof dhatu.sanskritName === 'object'
                  ? dhatu.sanskritName?.devanagari || dhatu.sanskritName?.iast
                  : dhatu.sanskritName}
              </span>
            </h1>
            {dhatu.sanskritName?.iast && typeof dhatu.sanskritName === 'object' && (
              <span className="text-xs text-slate-400 font-body">IAST: {dhatu.sanskritName.iast}</span>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-heading">Primary Karma</span>
            <span className="text-base sm:text-lg font-bold text-amber-300 font-heading">
              {dhatu.primaryFunction || dhatu.functions?.[0]?.meaning || dhatu.functions?.[0]?.description || 'Vital physiological function'}
            </span>
            <p className="text-xs text-slate-400 mt-2 max-w-xs font-body">
              {dhatu.modernCorrelation || 'Anatomical biological correlation'}
            </p>
          </div>
        </div>

        {dhatu.description && (
          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-4xl bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 mb-6 font-body">
            {dhatu.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dhatu.userFriendlyLayer && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4" />
                <span>Conceptual Insight</span>
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed italic font-body">
                "{dhatu.userFriendlyLayer.analogy || dhatu.userFriendlyLayer.summary || dhatu.userFriendlyLayer.oneLiner}"
              </p>
            </div>
          )}

          {dhatu.functions && Array.isArray(dhatu.functions) && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 font-heading">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Functions (Karma)</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-body">
                {dhatu.functions.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{typeof f === 'object' ? `${f.name || ''} - ${f.description || f.meaning || ''}` : f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dhatu.formationProcess && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 font-heading">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Formation Process (Dhatu Nirmana)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                {typeof dhatu.formationProcess === 'object'
                  ? dhatu.formationProcess.description || dhatu.formationProcess.mechanism || JSON.stringify(dhatu.formationProcess)
                  : dhatu.formationProcess}
              </p>
            </div>
          )}

          {dhatu.nourishmentDynamics && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 font-heading">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>Nourishment Dynamics (Poshana)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
                {typeof dhatu.nourishmentDynamics === 'object'
                  ? dhatu.nourishmentDynamics.description || JSON.stringify(dhatu.nourishmentDynamics)
                  : dhatu.nourishmentDynamics}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="glass-panel p-5 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] uppercase font-bold text-cyan-400 block mb-1 font-heading">
              Upadhatu (Secondary Tissues)
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-body">
              {Array.isArray(dhatu.upadhatus)
                ? dhatu.upadhatus.map(u => typeof u === 'object' ? u.name : u).join(', ')
                : dhatu.upadhatu || 'None specified'}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] uppercase font-bold text-amber-400 block mb-1 font-heading">
              Mala (Metabolic Byproduct)
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-body">
              {Array.isArray(dhatu.malas)
                ? dhatu.malas.map(m => typeof m === 'object' ? m.name : m).join(', ')
                : dhatu.mala || 'None specified'}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] uppercase font-bold text-purple-400 block mb-1 font-heading">
              Associated Srotas (Micro-channel)
            </span>
            <p className="text-xs sm:text-sm text-slate-200 font-body">
              {dhatu.srotas?.name || (typeof dhatu.srotas === 'string' ? dhatu.srotas : `${dhatu.name}avaha Srotas`)}
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <span className="text-[11px] uppercase font-bold text-rose-400 block mb-1 font-heading">
              Panchabhautik Composition
            </span>
            <p className="text-xs text-slate-300 line-clamp-3 font-body">
              {dhatu.panchamahabhutaComposition?.predominantElements?.join(', ') || dhatu.panchabhautikDominance || 'Balanced Mahabhuta matrix'}
            </p>
          </div>
        </div>

        {dhatu.srotas && typeof dhatu.srotas === 'object' && dhatu.srotas.mula && (
          <div className="mt-6 glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 font-heading">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Srotas Roots (Mulasthana)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-body">
              {Array.isArray(dhatu.srotas.mula) ? dhatu.srotas.mula.join(', ') : dhatu.srotas.mula}
            </p>
          </div>
        )}

        {dhatu.clinicalRelevance && (
          <div className="mt-6 glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 font-heading">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Clinical Relevance & Pathological Variations</span>
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 font-body">
              {typeof dhatu.clinicalRelevance === 'object' ? (
                <>
                  {dhatu.clinicalRelevance.kshayaLakshana && (
                    <p><span className="text-rose-400 font-semibold font-heading">Kshaya (Depletion): </span>
                      {Array.isArray(dhatu.clinicalRelevance.kshayaLakshana)
                        ? dhatu.clinicalRelevance.kshayaLakshana.map(k => typeof k === 'object' ? `${k.symptom || ''}${k.clinicalExplanation ? ` (${k.clinicalExplanation})` : ''}` : k).join('; ')
                        : String(dhatu.clinicalRelevance.kshayaLakshana)}
                    </p>
                  )}
                  {dhatu.clinicalRelevance.vriddhiLakshana && (
                    <p><span className="text-amber-400 font-semibold font-heading">Vriddhi (Excess): </span>
                      {Array.isArray(dhatu.clinicalRelevance.vriddhiLakshana)
                        ? dhatu.clinicalRelevance.vriddhiLakshana.map(v => typeof v === 'object' ? `${v.symptom || ''}${v.clinicalExplanation ? ` (${v.clinicalExplanation})` : ''}` : v).join('; ')
                        : String(dhatu.clinicalRelevance.vriddhiLakshana)}
                    </p>
                  )}
                  {dhatu.clinicalRelevance.pradoshajaVikara && (
                    <p><span className="text-cyan-400 font-semibold font-heading">Pradoshaja Vikara: </span>
                      {Array.isArray(dhatu.clinicalRelevance.pradoshajaVikara)
                        ? dhatu.clinicalRelevance.pradoshajaVikara.map(p => typeof p === 'object' ? `${p.diseaseName || ''}${p.description ? `: ${p.description}` : ''}` : p).join('; ')
                        : String(dhatu.clinicalRelevance.pradoshajaVikara)}
                    </p>
                  )}
                  {!dhatu.clinicalRelevance.kshayaLakshana && !dhatu.clinicalRelevance.vriddhiLakshana && !dhatu.clinicalRelevance.pradoshajaVikara && (
                    <p>{dhatu.clinicalRelevance.symptoms || dhatu.clinicalRelevance.pathology || ''}</p>
                  )}
                </>
              ) : (
                <p>{dhatu.clinicalRelevance}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 font-body">
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20">
          <div className="flex items-center justify-between mb-3 font-heading">
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
              <Flame className="w-4 h-4" />
              <span>Corresponding Dhatvagni</span>
            </div>
            {dhatvagni && (
              <Link
                to={`/dhatvagni/${dhatvagni.slug || dhatvagni._id}`}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Read Full Agni Dynamics</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          {dhatvagni ? (
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-1 font-heading">
                {dhatvagni.name} ({typeof dhatvagni.sanskritName === 'object' ? dhatvagni.sanskritName.devanagari || dhatvagni.sanskritName.iast : (dhatvagni.sanskritName || '')})
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {dhatvagni.userFriendlyLayer?.summary || dhatvagni.description || dhatvagni.metabolicRole || 'Specific metabolic fire for tissue transformation.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Explore the metabolic fire governing {dhatu.name} transformation in the Dhatvagni section.
            </p>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3 font-heading">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <GitBranch className="w-4 h-4" />
              <span>Dhatuposhana Process</span>
            </div>
            {dhatuposhana && (
              <Link
                to={`/dhatuposhana/${dhatuposhana.slug || dhatuposhana._id}`}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Read Full Nourishment Theory</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          {dhatuposhana ? (
            <div>
              <h4 className="text-base font-bold text-slate-100 mb-1 font-heading">
                {dhatuposhana.name || dhatuposhana.dhatuName || dhatu.name} Nourishment Dynamics
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {dhatuposhana.userFriendlyLayer?.summary || dhatuposhana.description || dhatuposhana.nourishmentDynamics || 'Process of tissue nutrient assimilation.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Examine the classical nourishment pathways and Nyaya theories for {dhatu.name}.
            </p>
          )}
        </div>
      </div>

      <SamhitaReferences
        references={dhatu.classicalReferences || dhatu.references}
        title="Classical Samhita References & Citations"
      />

      <DisclaimerBanner />
    </div>
  );
}
