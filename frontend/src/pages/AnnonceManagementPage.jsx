/*
  Intent: Admin CRUD for announcements. The read-only student/teacher view
          already exists in ActualitesPage.jsx; this page is the admin/editor
          panel for managing annonce types and announcements with documents.
          Mock data mirrors: annonce_types, annonces, annonces_documents.
  Access: Admin / Chef de département.
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
  megaphone: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 0 1.569-6.938c0-2.483-.518-4.846-1.569-6.938m0 13.876c.293-.25.55-.517.77-.813a18.16 18.16 0 0 0 0-12.25c-.22-.296-.477-.563-.77-.813M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  newspaper: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  tag: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  ),
  paperclip: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
    </svg>
  ),
  plus: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  pencil: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  trash: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  eye: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
};

/* ── Status Configs ─────────────────────────────────────────── */

const VISIBILITY_STATUS = {
  published:   { label: 'Published', bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-success', border: 'border-green-200 dark:border-green-800/50', dot: 'bg-success' },
  draft:       { label: 'Draft', bg: 'bg-surface-200', text: 'text-ink-muted', border: 'border-edge', dot: 'bg-ink-muted' },
  archived:    { label: 'Archived', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-warning', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-warning' },
};

const TYPE_COLORS = {
  info:    'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50',
  urgent:  'bg-red-50 dark:bg-red-950/40 text-danger border border-red-200 dark:border-red-800/50',
  event:   'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50',
  academic:'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50',
  general: 'bg-surface-200 text-ink-muted border border-edge',
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

function Avatar({ name, size = 'w-8 h-8 text-xs' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`${size} rounded-full bg-brand-light flex items-center justify-center shrink-0`}>
      <span className="font-bold text-brand">{initials}</span>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Tab Definitions ────────────────────────────────────────── */

const TABS = [
  { id: 'announcements', label: 'Announcements', Icon: icons.newspaper },
  { id: 'types',         label: 'Annonce Types',  Icon: icons.tag },
];

/* ── Mock Data — Annonce Types ─────────────────────────────── */

const MOCK_TYPES = [
  { id: 1, nom: 'Information générale', description: 'General information for all users', icon: 'info', couleur: '#3B82F6' },
  { id: 2, nom: 'Urgent / Important', description: 'Critical announcements requiring immediate attention', icon: 'urgent', couleur: '#EF4444' },
  { id: 3, nom: 'Événement', description: 'Events, conferences, seminars', icon: 'event', couleur: '#8B5CF6' },
  { id: 4, nom: 'Académique', description: 'Academic calendars, exam schedules, deadlines', icon: 'academic', couleur: '#10B981' },
  { id: 5, nom: 'Divers', description: 'Miscellaneous announcements', icon: 'general', couleur: '#6B7280' },
];

/* ── Mock Data — Announcements ─────────────────────────────── */

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    titre: 'Rentrée universitaire 2025/2026',
    contenu: 'La rentrée universitaire pour l\'année 2025/2026 est fixée au 15 septembre. Les inscriptions administratives commenceront le 1er septembre via la plateforme Progres.',
    type: 'Académique',
    type_icon: 'academic',
    auteur: 'Admin Khelifi',
    date_publication: '2025-06-15',
    date_expiration: '2025-09-20',
    status: 'published',
    documents: [{ nom: 'calendrier_rentree.pdf', taille: '245 KB' }],
    vues: 1245,
  },
  {
    id: 2,
    titre: 'Maintenance du serveur — 22 juin',
    contenu: 'Le serveur principal sera en maintenance samedi 22 juin de 02h00 à 06h00. Les services en ligne seront temporairement indisponibles.',
    type: 'Urgent / Important',
    type_icon: 'urgent',
    auteur: 'Admin Khelifi',
    date_publication: '2025-06-18',
    date_expiration: '2025-06-23',
    status: 'published',
    documents: [],
    vues: 892,
  },
  {
    id: 3,
    titre: 'Conférence IA & Éducation',
    contenu: 'Le département informatique organise une conférence sur l\'intelligence artificielle et son impact sur l\'éducation, le 5 juillet 2025 à l\'amphithéâtre A.',
    type: 'Événement',
    type_icon: 'event',
    auteur: 'Prof. Saidi Naima',
    date_publication: '2025-06-20',
    date_expiration: '2025-07-06',
    status: 'published',
    documents: [
      { nom: 'programme_conference.pdf', taille: '180 KB' },
      { nom: 'affiche_ia_education.png', taille: '1.2 MB' },
    ],
    vues: 356,
  },
  {
    id: 4,
    titre: 'Résultats examens S2 — Brouillon',
    contenu: 'Les résultats du second semestre seront publiés prochainement. Ce message sera mis à jour avec les liens.',
    type: 'Académique',
    type_icon: 'academic',
    auteur: 'Admin Khelifi',
    date_publication: null,
    date_expiration: null,
    status: 'draft',
    documents: [],
    vues: 0,
  },
  {
    id: 5,
    titre: 'Fermeture bibliothèque — Période estivale',
    contenu: 'La bibliothèque centrale sera fermée du 1er au 31 août pour la période estivale. Le service en ligne restera accessible.',
    type: 'Information générale',
    type_icon: 'info',
    auteur: 'Admin Khelifi',
    date_publication: '2025-05-01',
    date_expiration: '2025-08-01',
    status: 'archived',
    documents: [],
    vues: 2100,
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AnnonceManagementPage({ role }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('announcements');
  const [annonceTypes, setAnnonceTypes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tRes, aRes] = await Promise.allSettled([
          request('/api/v1/annonce-types'),
          request('/api/v1/annonces'),
        ]);
        if (cancelled) return;
        if (tRes.status === 'fulfilled') setAnnonceTypes(tRes.value.data || []);
        if (aRes.status === 'fulfilled') setAnnonces(aRes.value.data || []);
      } catch {
        /* API not ready */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const displayTypes = annonceTypes.length ? annonceTypes : MOCK_TYPES;
  const displayAnnonces = annonces.length ? annonces : MOCK_ANNOUNCEMENTS;

  const filteredAnnonces = filter === 'all' ? displayAnnonces : displayAnnonces.filter(a => a.status === filter);

  /* Stats */
  const totalAnnonces = displayAnnonces.length;
  const publishedCount = displayAnnonces.filter(a => a.status === 'published').length;
  const draftCount = displayAnnonces.filter(a => a.status === 'draft').length;
  const totalViews = displayAnnonces.reduce((sum, a) => sum + (a.vues || 0), 0);

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
            {t('annonces.adminTitle', 'Announcement Management')}
          </h1>
          <p className="mt-1 text-sm text-ink-tertiary">
            {t('annonces.adminSubtitle', 'Create, edit, and manage announcements and their types.')}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover active:bg-brand-dark focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm">
          <icons.plus className="w-4 h-4" />
          {activeTab === 'announcements' ? t('annonces.newAnnonce', 'New Announcement') : t('annonces.newType', 'New Type')}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('annonces.statTotal', 'Total'), value: totalAnnonces, icon: <icons.newspaper className="w-5 h-5" />, accent: 'bg-blue-50 dark:bg-blue-950/40 text-brand' },
          { label: t('annonces.statPublished', 'Published'), value: publishedCount, icon: <icons.megaphone className="w-5 h-5" />, accent: 'bg-green-50 dark:bg-green-950/40 text-success' },
          { label: t('annonces.statDrafts', 'Drafts'), value: draftCount, icon: <icons.pencil className="w-5 h-5" />, accent: 'bg-surface-200 text-ink-muted' },
          { label: t('annonces.statViews', 'Total Views'), value: totalViews.toLocaleString(), icon: <icons.eye className="w-5 h-5" />, accent: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400' },
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

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="border-b border-edge-subtle">
        <div className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFilter('all'); }}
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

      {/* ── Filter Pills ───────────────────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="bg-surface-200 rounded-md p-1 flex gap-1 flex-wrap">
          {['all', 'published', 'draft', 'archived'].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                filter === k
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {k === 'all' ? 'All' : VISIBILITY_STATUS[k]?.label || k}
            </button>
          ))}
        </div>
      )}

      {/* ═════ TAB: ANNOUNCEMENTS ══════════════════════════════ */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {filteredAnnonces.length === 0 && (
            <div className="bg-surface rounded-lg border border-edge shadow-card py-16 text-center">
              <icons.newspaper className="w-10 h-10 mx-auto mb-3 text-ink-muted/40" />
              <p className="text-base font-semibold text-ink">No announcements found</p>
              <p className="text-sm text-ink-tertiary mt-1">Adjust your filters or create a new announcement.</p>
            </div>
          )}

          {filteredAnnonces.map((a) => (
            <div key={a.id} className="bg-surface rounded-lg border border-edge shadow-card p-5">
              {/* Top row: type + status + actions */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${TYPE_COLORS[a.type_icon] || TYPE_COLORS.general}`}>
                    {a.type}
                  </span>
                  <StatusBadge status={a.status} config={VISIBILITY_STATUS} />
                  {a.documents.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                      <icons.paperclip className="w-3 h-3" />
                      {a.documents.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setDetailModal(a)}
                    className="p-1.5 rounded-md hover:bg-surface-200 text-ink-muted hover:text-ink transition-colors"
                    title="View"
                  >
                    <icons.eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-surface-200 text-ink-muted hover:text-ink transition-colors" title="Edit">
                    <icons.pencil className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-ink-muted hover:text-danger transition-colors" title="Delete">
                    <icons.trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-ink mb-1">{a.titre}</h3>
              <p className="text-sm text-ink-secondary line-clamp-2 mb-3">{a.contenu}</p>

              {/* Meta row */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                <div className="flex items-center gap-1">
                  <Avatar name={a.auteur} size="w-5 h-5 text-[9px]" />
                  <span>{a.auteur}</span>
                </div>
                <span>Published: {formatDate(a.date_publication)}</span>
                <span>Expires: {formatDate(a.date_expiration)}</span>
                <span className="flex items-center gap-1">
                  <icons.eye className="w-3 h-3" />
                  {a.vues.toLocaleString()} views
                </span>
              </div>

              {/* Attached documents */}
              {a.documents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-edge-subtle flex flex-wrap gap-2">
                  {a.documents.map((doc, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded bg-surface-200 text-ink-secondary border border-edge">
                      <icons.paperclip className="w-3 h-3" />
                      {doc.nom}
                      <span className="text-ink-muted">({doc.taille})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═════ TAB: ANNONCE TYPES ══════════════════════════════ */}
      {activeTab === 'types' && (
        <div className="bg-surface rounded-lg border border-edge shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-subtle">
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">Color</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider hidden sm:table-cell">Description</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-subtle">
                {displayTypes.map((dt) => (
                  <tr key={dt.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                    <td className="px-5 py-3">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: dt.couleur }} />
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">{dt.nom}</td>
                    <td className="px-5 py-3 text-ink-secondary hidden sm:table-cell">{dt.description}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-surface-200 text-ink-muted hover:text-ink transition-colors" title="Edit">
                          <icons.pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-ink-muted hover:text-danger transition-colors" title="Delete">
                          <icons.trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detail / Preview Modal ─────────────────────────── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailModal(null)} />
          <div className="relative bg-surface rounded-xl border border-edge shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Announcement Preview</h2>
              <button onClick={() => setDetailModal(null)} className="text-ink-muted hover:text-ink transition-colors text-lg font-bold leading-none">&times;</button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${TYPE_COLORS[detailModal.type_icon] || TYPE_COLORS.general}`}>
                {detailModal.type}
              </span>
              <StatusBadge status={detailModal.status} config={VISIBILITY_STATUS} />
            </div>

            <h3 className="text-lg font-bold text-ink">{detailModal.titre}</h3>
            <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-line">{detailModal.contenu}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Author</p>
                <p className="font-medium text-ink">{detailModal.auteur}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Views</p>
                <p className="font-medium text-ink">{detailModal.vues.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Published</p>
                <p className="text-ink-secondary">{formatDate(detailModal.date_publication)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Expires</p>
                <p className="text-ink-secondary">{formatDate(detailModal.date_expiration)}</p>
              </div>
            </div>

            {detailModal.documents.length > 0 && (
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {detailModal.documents.map((doc, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded bg-surface-200 text-ink-secondary border border-edge">
                      <icons.paperclip className="w-3 h-3" />
                      {doc.nom} ({doc.taille})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
