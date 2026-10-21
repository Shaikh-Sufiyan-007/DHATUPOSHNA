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
          <Link to="/dhatus" className="text-xs text-amber-400 hover:underline">
            ← Return to all Dhatus
          </Link>
        </div>
      </div>
    );
  }

  const mapping = getMappingBySlug(dhatu.slug);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-spatial-in">
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 spatial-dock p-3 sm:p-4 rounded-2xl border border-slate-700/60 shadow-lg">
        <Link
          to="/dhatus"
          className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition px-3.5 py-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer min-h-[44px] touch-target"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
          <span>All Sapta Dhatus</span>
        </Link>

        <Link
          to={`/explore?dhatu=${dhatu.slug}`}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:opacity-95 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer min-h-[44px] touch-target"
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
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Dhatu #{dhatu.order || mapping?.sequence || '1'} • Sequential Parinama
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span>{dhatu.name}</span>
              {dhatu.sanskritName && (
                <span className="text-xl sm:text-2xl lg:text-3xl font-classical text-amber-300">
                  ({typeof dhatu.sanskritName === 'object'
                    ? dhatu.sanskritName.devanagari || dhatu.sanskritName.iast
                    : dhatu.sanskritName})
                </span>
              )}
            </h1>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm">
              {typeof dhatu.classification === 'object'
                ? dhatu.classification.category || 'Sapta Dhatu'
                : (dhatu.classification || 'Sapta Dhatu')}
            </span>
            {mapping && (
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Educational 3D Focus: {mapping.educationalFocus}
              </p>
            )}
          </div>
        </div>

        {dhatu.generalDescription && (
          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-4xl bg-slate-900/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
            {dhatu.generalDescription}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dhatu.dhatuLakshana && (
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Classical Lakshana (Essential Definition)</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed italic">
              "{Array.isArray(dhatu.dhatuLakshana)
                ? dhatu.dhatuLakshana.map(l => typeof l === 'object' ? `${l.characteristic}${l.explanation ? `: ${l.explanation}` : ''}` : l).join(' • ')
                : (typeof dhatu.dhatuLakshana === 'object' ? dhatu.dhatuLakshana.characteristic || '' : dhatu.dhatuLakshana)}"
            </p>
          </div>
        )}

        {dhatu.functions && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Dhatu Karma (Physiological Actions)</span>
            </h3>
            {Array.isArray(dhatu.functions) ? (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {dhatu.functions.map((fn, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{typeof fn === 'object' ? fn.description || fn.name : fn}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300">
                {typeof dhatu.functions === 'object'
                  ? dhatu.functions.primaryFunction || JSON.stringify(dhatu.functions)
                  : dhatu.functions}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dhatu.location && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Dhatu Sthana (Physiological Seats)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {Array.isArray(dhatu.location)
                ? dhatu.location.join(', ')
                : (typeof dhatu.location === 'object'
                  ? dhatu.location.primaryLocation || dhatu.location.description
                  : dhatu.location)}
            </p>
          </div>
        )}

        {dhatu.formation && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span>Formation & Metabolic Synthesis</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {typeof dhatu.formation === 'object'
                ? dhatu.formation.processDescription || dhatu.formation.description || dhatu.formation.precursorDhatu || dhatu.formation.precursor
                : dhatu.formation}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dhatu.upadhatus && (
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-cyan-400 block mb-1">
              Upadhatu (Secondary Tissues)
            </span>
            <p className="text-xs sm:text-sm text-slate-200">
              {Array.isArray(dhatu.upadhatus)
                ? dhatu.upadhatus.map((u) => (typeof u === 'object' ? u.name : u)).join(', ')
                : String(dhatu.upadhatus)}
            </p>
          </div>
        )}

        {dhatu.malas && (
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-amber-400 block mb-1">
              Dhatu Mala (Byproducts)
            </span>
            <p className="text-xs sm:text-sm text-slate-200">
              {Array.isArray(dhatu.malas)
                ? dhatu.malas.map((m) => (typeof m === 'object' ? m.name : m)).join(', ')
                : String(dhatu.malas)}
            </p>
          </div>
        )}

        {dhatu.srotas && (
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-purple-400 block mb-1">
              Srotas (Channel Nexus)
            </span>
            <p className="text-xs sm:text-sm text-slate-200">
              {typeof dhatu.srotas === 'object'
                ? dhatu.srotas.name || (Array.isArray(dhatu.srotas.moolasthana) ? dhatu.srotas.moolasthana.join(', ') : dhatu.srotas.mula)
                : String(dhatu.srotas)}
            </p>
          </div>
        )}

        {dhatu.ojasRelationship && (
          <div className="glass-panel p-5 rounded-xl border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-emerald-400 block mb-1">
              Ojas Relationship
            </span>
            <p className="text-xs text-slate-200 line-clamp-3">
              {typeof dhatu.ojasRelationship === 'object'
                ? dhatu.ojasRelationship.description
                : String(dhatu.ojasRelationship)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dhatu.sarata && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Dhatu Sarata (Tissue Excellence Characteristics)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {Array.isArray(dhatu.sarata)
                ? dhatu.sarata.map(s => typeof s === 'object' ? `${s.featureCategory ? `${s.featureCategory}: ` : ''}${Array.isArray(s.characteristics) ? s.characteristics.join('; ') : s.characteristics || s.clinicalSignificance || ''}` : s).join(' • ')
                : (typeof dhatu.sarata === 'object'
                  ? dhatu.sarata.characteristics || dhatu.sarata.description || ''
                  : dhatu.sarata)}
            </p>
          </div>
        )}

        {dhatu.clinicalRelevance && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-300 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Clinical Relevance (Vriddhi / Kshaya / Dushti)</span>
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
              {typeof dhatu.clinicalRelevance === 'object' ? (
                <>
                  {dhatu.clinicalRelevance.kshayaLakshana && (
                    <p><span className="text-rose-400 font-semibold">Kshaya (Depletion): </span>
                      {Array.isArray(dhatu.clinicalRelevance.kshayaLakshana)
                        ? dhatu.clinicalRelevance.kshayaLakshana.map(k => typeof k === 'object' ? `${k.symptom || ''}${k.clinicalExplanation ? ` (${k.clinicalExplanation})` : ''}` : k).join('; ')
                        : String(dhatu.clinicalRelevance.kshayaLakshana)}
                    </p>
                  )}
                  {dhatu.clinicalRelevance.vriddhiLakshana && (
                    <p><span className="text-amber-400 font-semibold">Vriddhi (Excess): </span>
                      {Array.isArray(dhatu.clinicalRelevance.vriddhiLakshana)
                        ? dhatu.clinicalRelevance.vriddhiLakshana.map(v => typeof v === 'object' ? `${v.symptom || ''}${v.clinicalExplanation ? ` (${v.clinicalExplanation})` : ''}` : v).join('; ')
                        : String(dhatu.clinicalRelevance.vriddhiLakshana)}
                    </p>
                  )}
                  {dhatu.clinicalRelevance.pradoshajaVikara && (
                    <p><span className="text-cyan-400 font-semibold">Pradoshaja Vikara: </span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20">
          <div className="flex items-center justify-between mb-3">
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
              <h4 className="text-base font-bold text-slate-100 mb-1">
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
          <div className="flex items-center justify-between mb-3">
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
              <h4 className="text-base font-bold text-slate-100 mb-1">
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
