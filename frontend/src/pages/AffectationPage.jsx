/*
  Intent: Specialty assignment campaign management. Students make voeux (wishes),
          admins configure campaigns and quotas. A structured, step-by-step flow.
          Mock data mirrors: campagne_affectation, campagne_specialites, voeux,
          facultes, departements, filieres, specialites, promos.
  Access: Students (make wishes), Admin/Chef (configure campaigns).
  Palette: canvas base, surface cards. Semantic colors for status.
  Depth: shadow-card + border-edge on cards.
  Typography: Inter. Section headings = text-base font-semibold. Body = text-sm.
  Spacing: 4px base. Cards p-5/p-6. gap-6 between sections.
*/

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import request from '../services/api';

/* ── Inline SVG Icons ──────────────────────────────────────── */

const icons = {
  building: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  users: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  folder: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  calendar: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  chart: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  plus: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
};

/* ── Status Configs ─────────────────────────────────────────── */

const CAMPAIGN_STATUS = {
  brouillon: { label: 'Brouillon', bg: 'bg-surface-200', text: 'text-ink-muted', border: 'border-edge', dot: 'bg-ink-muted' },
  ouverte:   { label: 'Ouverte', bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-success', border: 'border-green-200 dark:border-green-800/50', dot: 'bg-success' },
  fermee:    { label: 'Fermée', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-warning', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-warning' },
  terminee:  { label: 'Terminée', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-brand', border: 'border-blue-200 dark:border-blue-800/50', dot: 'bg-brand' },
};

const VOEU_STATUS = {
  en_attente: { label: 'En attente', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-warning', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-warning' },
  accepte:    { label: 'Accepté', bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-success', border: 'border-green-200 dark:border-green-800/50', dot: 'bg-success' },
  refuse:     { label: 'Refusé', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-danger', border: 'border-red-200 dark:border-red-800/50', dot: 'bg-danger' },
};

const NIVEAU_BADGE = {
  L1: 'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50',
  L2: 'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50',
  L3: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50',
  M1: 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50',
  M2: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
  D1: 'bg-red-50 dark:bg-red-950/40 text-danger border border-red-200 dark:border-red-800/50',
};

/* ── Shared Sub-components ──────────────────────────────────── */

function StatusBadge({ status, config }) {
  const cfg = config[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Avatar({ name, size = 'w-8 h-8 text-xs' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`${size} rounded-full bg-brand-light flex items-center justify-center shrink-0`}>
      <span className="font-bold text-brand">{initials}</span>
    </div>
  );
}

/* ── Tab Definitions ────────────────────────────────────────── */

const TABS = [
  { id: 'campaigns',    label: 'Campaigns',    Icon: icons.folder },
  { id: 'specialities', label: 'Specialities', Icon: icons.building },
  { id: 'wishes',       label: 'Student Wishes', Icon: icons.users },
];

/* ── Mock Data — Campaigns (campagne_affectation) ─────────── */

const MOCK_CAMPAIGNS = [
  { id: 1, nom: 'Affectation L2→L3', niveau_source: 'L2', niveau_cible: 'L3', annee_universitaire: '2025/2026', date_debut: '2026-04-01', date_fin: '2026-04-30', status: 'ouverte', date_affectation: null },
  { id: 2, nom: 'Affectation L3→M1', niveau_source: 'L3', niveau_cible: 'M1', annee_universitaire: '2025/2026', date_debut: '2026-05-01', date_fin: '2026-05-31', status: 'brouillon', date_affectation: null },
  { id: 3, nom: 'Affectation M1→M2', niveau_source: 'M1', niveau_cible: 'M2', annee_universitaire: '2025/2026', date_debut: '2026-06-01', date_fin: '2026-06-15', status: 'brouillon', date_affectation: null },
  { id: 4, nom: 'Affectation L2→L3 (2024)', niveau_source: 'L2', niveau_cible: 'L3', annee_universitaire: '2024/2025', date_debut: '2025-04-01', date_fin: '2025-04-30', status: 'terminee', date_affectation: '2025-05-10' },
];

/* ── Mock Data — Campaign Specialities (campagne_specialites) */

const MOCK_SPECIALITIES = [
  { id: 1, campagne_id: 1, campagne: 'Affectation L2→L3', specialite: 'SIC — Systèmes Informatiques et Communication', quota: 40, places_occupees: 28 },
  { id: 2, campagne_id: 1, campagne: 'Affectation L2→L3', specialite: 'RSI — Réseaux et Sécurité Informatique', quota: 35, places_occupees: 35 },
  { id: 3, campagne_id: 1, campagne: 'Affectation L2→L3', specialite: 'GL — Génie Logiciel', quota: 45, places_occupees: 32 },
  { id: 4, campagne_id: 1, campagne: 'Affectation L2→L3', specialite: 'IA — Intelligence Artificielle', quota: 30, places_occupees: 30 },
  { id: 5, campagne_id: 4, campagne: 'Affectation L2→L3 (2024)', specialite: 'SIC', quota: 40, places_occupees: 40 },
  { id: 6, campagne_id: 4, campagne: 'Affectation L2→L3 (2024)', specialite: 'RSI', quota: 35, places_occupees: 33 },
];

/* ── Mock Data — Voeux ─────────────────────────────────────── */

const MOCK_WISHES = [
  { id: 1, etudiant: 'Benali Ahmed', matricule: 'ETU2024001', moyenne: 14.5, campagne: 'Affectation L2→L3', specialite: 'SIC', ordre: 1, status: 'accepte' },
  { id: 2, etudiant: 'Benali Ahmed', matricule: 'ETU2024001', moyenne: 14.5, campagne: 'Affectation L2→L3', specialite: 'GL', ordre: 2, status: 'en_attente' },
  { id: 3, etudiant: 'Rahmani Nour', matricule: 'ETU2024123', moyenne: 15.2, campagne: 'Affectation L2→L3', specialite: 'IA', ordre: 1, status: 'accepte' },
  { id: 4, etudiant: 'Rahmani Nour', matricule: 'ETU2024123', moyenne: 15.2, campagne: 'Affectation L2→L3', specialite: 'SIC', ordre: 2, status: 'refuse' },
  { id: 5, etudiant: 'Bouzid Amine', matricule: 'ETU2024089', moyenne: 11.7, campagne: 'Affectation L2→L3', specialite: 'RSI', ordre: 1, status: 'en_attente' },
  { id: 6, etudiant: 'Bouzid Amine', matricule: 'ETU2024089', moyenne: 11.7, campagne: 'Affectation L2→L3', specialite: 'GL', ordre: 2, status: 'en_attente' },
  { id: 7, etudiant: 'Bouzid Amine', matricule: 'ETU2024089', moyenne: 11.7, campagne: 'Affectation L2→L3', specialite: 'SIC', ordre: 3, status: 'en_attente' },
  { id: 8, etudiant: 'Tounsi Amira', matricule: 'ETU2025001', moyenne: 16.1, campagne: 'Affectation L2→L3', specialite: 'IA', ordre: 1, status: 'accepte' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AffectationPage({ role }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cRes, sRes, wRes] = await Promise.allSettled([
          request('/api/v1/campagnes-affectation'),
          request('/api/v1/campagnes-affectation/specialites'),
          request('/api/v1/voeux'),
        ]);
        if (cancelled) return;
        if (cRes.status === 'fulfilled') setCampaigns(cRes.value.data || []);
        if (sRes.status === 'fulfilled') setSpecialities(sRes.value.data || []);
        if (wRes.status === 'fulfilled') setWishes(wRes.value.data || []);
      } catch {
        /* API not ready */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const displayCampaigns = campaigns.length ? campaigns : MOCK_CAMPAIGNS;
  const displaySpec = specialities.length ? specialities : MOCK_SPECIALITIES;
  const displayWishes = wishes.length ? wishes : MOCK_WISHES;
  const isStudentView = role === 'student';
  const currentStudentKey = displayWishes[0]?.matricule;
  const myWishes = currentStudentKey
    ? displayWishes.filter((wish) => wish.matricule === currentStudentKey)
    : [];

  const statOpen = displayCampaigns.filter(c => c.status === 'ouverte').length;
  const statTotal = displayCampaigns.length;
  const statWishes = displayWishes.length;
  const statAccepted = displayWishes.filter(w => w.status === 'accepte').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            {t('affectation.title', 'Specialty Assignment')}
          </h1>
          <p className="mt-1 text-sm text-ink-tertiary">
            {isStudentView
              ? t('affectation.subtitleStudent', 'Track active campaigns and submit your specialty wishes.')
              : t('affectation.subtitle', 'Manage assignment campaigns, quotas, and student wishes.')}
          </p>
        </div>
        {!isStudentView && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover active:bg-brand-dark focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm">
            <icons.plus className="w-4 h-4" />
            {t('affectation.newCampaign', 'New Campaign')}
          </button>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('affectation.statCampaigns', 'Total Campaigns'), value: statTotal, icon: <icons.folder className="w-5 h-5" />, accent: 'bg-blue-50 dark:bg-blue-950/40 text-brand' },
          { label: t('affectation.statOpen', 'Open'), value: statOpen, icon: <icons.calendar className="w-5 h-5" />, accent: 'bg-green-50 dark:bg-green-950/40 text-success' },
          { label: t('affectation.statWishes', 'Total Wishes'), value: statWishes, icon: <icons.users className="w-5 h-5" />, accent: 'bg-amber-50 dark:bg-amber-950/40 text-warning' },
          { label: t('affectation.statAccepted', 'Accepted'), value: statAccepted, icon: <icons.chart className="w-5 h-5" />, accent: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-lg border border-edge shadow-card p-4 flex items-center gap-3">
            <div className={`shrink-0 w-9 h-9 rounded-lg ${s.accent} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-ink tracking-tight">{s.value}</p>
              <p className="text-xs text-ink-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isStudentView ? (
        <div className="space-y-5">
          <div className="bg-surface rounded-lg border border-edge shadow-card p-5">
            <h2 className="text-base font-semibold text-ink mb-2">
              {t('affectation.studentActiveCampaigns', 'Active campaigns')}
            </h2>
            <div className="space-y-3">
              {displayCampaigns.filter((c) => c.status === 'ouverte').map((campaign) => (
                <div key={campaign.id} className="border border-edge-subtle rounded-md p-3 bg-canvas/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{campaign.nom}</p>
                    <StatusBadge status={campaign.status} config={CAMPAIGN_STATUS} />
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    {formatDate(campaign.date_debut)} — {formatDate(campaign.date_fin)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-edge shadow-card">
            <div className="px-5 py-4 border-b border-edge-subtle flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">
                {t('affectation.studentMyWishes', 'My wishes (demo UI)')}
              </h2>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors duration-150">
                <icons.plus className="w-4 h-4" />
                {t('affectation.studentSubmitWishes', 'Submit / Update wishes')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge-subtle">
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thCampaign', 'Campaign')}</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thSpeciality', 'Speciality')}</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thOrder', 'Order')}</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thStatus', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-subtle">
                  {myWishes.map((wish) => (
                    <tr key={wish.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                      <td className="px-5 py-3 text-ink-secondary">{wish.campagne}</td>
                      <td className="px-5 py-3 font-medium text-ink">{wish.specialite}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-xs font-bold text-ink">
                          {wish.ordre}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={wish.status} config={VOEU_STATUS} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="border-b border-edge-subtle">
        <div className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-edge'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═════ TAB: CAMPAIGNS ══════════════════════════════════ */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {displayCampaigns.map((c) => (
            <div key={c.id} className="bg-surface rounded-lg border border-edge shadow-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={c.status} config={CAMPAIGN_STATUS} />
                    <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${NIVEAU_BADGE[c.niveau_source] || ''}`}>
                      {c.niveau_source}
                    </span>
                    <span className="text-xs text-ink-muted">→</span>
                    <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${NIVEAU_BADGE[c.niveau_cible] || ''}`}>
                      {c.niveau_cible}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-ink">{c.nom}</h3>
                </div>
                <span className="text-xs text-ink-muted shrink-0">{c.annee_universitaire}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('affectation.startDate', 'Start')}</p>
                  <p className="font-medium text-ink">{formatDate(c.date_debut)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('affectation.endDate', 'End')}</p>
                  <p className="font-medium text-ink">{formatDate(c.date_fin)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('affectation.assignmentDate', 'Assignment')}</p>
                  <p className="font-medium text-ink">{formatDate(c.date_affectation)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('affectation.specialities', 'Specialities')}</p>
                  <p className="font-medium text-ink">{displaySpec.filter(s => s.campagne_id === c.id).length}</p>
                </div>
              </div>

              {/* Quota progress bars for this campaign */}
              {displaySpec.filter(s => s.campagne_id === c.id).length > 0 && (
                <div className="mt-4 pt-4 border-t border-edge-subtle space-y-2">
                  {displaySpec.filter(s => s.campagne_id === c.id).map((sp) => (
                    <div key={sp.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-ink w-32 truncate">{sp.specialite}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${sp.places_occupees >= sp.quota ? 'bg-danger' : sp.places_occupees >= sp.quota * 0.8 ? 'bg-warning' : 'bg-brand'}`}
                          style={{ width: `${sp.quota ? Math.min((sp.places_occupees / sp.quota) * 100, 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-muted w-16 text-right">
                        {sp.places_occupees}/{sp.quota}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═════ TAB: SPECIALITIES ═══════════════════════════════ */}
      {activeTab === 'specialities' && (
        <div className="bg-surface rounded-lg border border-edge shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-subtle">
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thSpeciality', 'Speciality')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider hidden sm:table-cell">{t('affectation.thCampaign', 'Campaign')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thQuota', 'Quota')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thOccupied', 'Occupied')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thProgress', 'Fill Rate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-subtle">
                {displaySpec.map((sp) => {
                  const pct = sp.quota ? Math.round((sp.places_occupees / sp.quota) * 100) : 0;
                  return (
                    <tr key={sp.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                      <td className="px-5 py-3 font-medium text-ink">{sp.specialite}</td>
                      <td className="px-5 py-3 text-ink-secondary hidden sm:table-cell">{sp.campagne}</td>
                      <td className="px-5 py-3 text-center text-ink-secondary">{sp.quota}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`font-medium ${sp.places_occupees >= sp.quota ? 'text-danger' : 'text-ink'}`}>
                          {sp.places_occupees}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-brand'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-ink-secondary w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════ TAB: WISHES ═════════════════════════════════════ */}
      {activeTab === 'wishes' && (
        <div className="bg-surface rounded-lg border border-edge shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-subtle">
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thStudent', 'Student')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider hidden sm:table-cell">{t('affectation.thAverage', 'Average')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thSpeciality', 'Speciality')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thOrder', 'Order')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('affectation.thStatus', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-subtle">
                {displayWishes.map((w) => (
                  <tr key={w.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={w.etudiant} />
                        <div>
                          <p className="font-medium text-ink">{w.etudiant}</p>
                          <p className="text-xs text-ink-muted">{w.matricule}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center hidden sm:table-cell">
                      <span className={`font-medium ${w.moyenne >= 14 ? 'text-success' : w.moyenne >= 10 ? 'text-ink' : 'text-danger'}`}>
                        {w.moyenne}/20
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">{w.specialite}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-xs font-bold text-ink">
                        {w.ordre}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={w.status} config={VOEU_STATUS} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
