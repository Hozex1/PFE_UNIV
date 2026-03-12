/*
  Intent: PFE (Projet de Fin d'Études) management — the academic heartbeat of final-year work.
          Four tabs: Subjects, Groups, Subject Choices, Jury composition.
          Mock data mirrors: pfe_sujets, groups_pfe, group_sujets, group_members, pfe_jury.
  Access: Students (view/choose), Teachers (propose/manage), Admin (oversee).
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
  academic: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
    </svg>
  ),
  folder: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  users: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  search: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  plus: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  x: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  scale: (p) => (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" />
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

const SUJET_STATUS = {
  propose:  { label: 'Proposé', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-brand', border: 'border-blue-200 dark:border-blue-800/50', dot: 'bg-brand' },
  valide:   { label: 'Validé', bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-success', border: 'border-green-200 dark:border-green-800/50', dot: 'bg-success' },
  reserve:  { label: 'Réservé', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-warning', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-warning' },
  affecte:  { label: 'Affecté', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/50', dot: 'bg-violet-500' },
  termine:  { label: 'Terminé', bg: 'bg-surface-200', text: 'text-ink-muted', border: 'border-edge', dot: 'bg-ink-muted' },
};

const TYPE_CONFIG = {
  recherche:   { label: 'Recherche', color: 'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50' },
  application: { label: 'Application', color: 'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50' },
  etude:       { label: 'Étude', color: 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50' },
  innovation:  { label: 'Innovation', color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50' },
};

const CHOIX_STATUS = {
  en_attente: { label: 'En attente', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-warning', border: 'border-amber-200 dark:border-amber-800/50', dot: 'bg-warning' },
  accepte:    { label: 'Accepté', bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-success', border: 'border-green-200 dark:border-green-800/50', dot: 'bg-success' },
  refuse:     { label: 'Refusé', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-danger', border: 'border-red-200 dark:border-red-800/50', dot: 'bg-danger' },
};

const JURY_ROLES = {
  president:   { label: 'Président', color: 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50' },
  examinateur: { label: 'Examinateur', color: 'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50' },
  rapporteur:  { label: 'Rapporteur', color: 'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50' },
};

const MENTION_STYLES = {
  excellent:  'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50',
  tres_bien:  'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50',
  bien:       'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50',
  assez_bien: 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50',
  passable:   'bg-surface-200 text-ink-muted border border-edge',
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

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Tab Definitions ────────────────────────────────────────── */

const TABS = [
  { id: 'subjects', labelKey: 'pfe.tabSubjects', label: 'Subjects', Icon: icons.academic },
  { id: 'groups',   labelKey: 'pfe.tabGroups',   label: 'Groups',   Icon: icons.users },
  { id: 'choices',  labelKey: 'pfe.tabChoices',  label: 'Choices',  Icon: icons.folder },
  { id: 'jury',     labelKey: 'pfe.tabJury',     label: 'Jury',     Icon: icons.scale },
];

/* ── Mock Data — Subjects (pfe_sujets) ─────────────────────── */

const MOCK_SUBJECTS = [
  { id: 1, titre: 'Système de détection d\'intrusion basé sur l\'IA', description: 'Développer un système IDS utilisant le deep learning pour détecter les attaques réseau en temps réel.', keywords: 'IA, Sécurité, Deep Learning, Réseau', enseignant: 'Prof. Kaci Sara', promo: 'M2 RSI', type_projet: 'recherche', status: 'valide', annee_universitaire: '2025/2026', max_grps: 2, created_at: '2025-10-15' },
  { id: 2, titre: 'Application mobile de gestion universitaire', description: 'Concevoir une application mobile cross-platform pour la gestion des emplois du temps et notes.', keywords: 'Mobile, React Native, API REST', enseignant: 'Dr. Boudiaf Fatima', promo: 'M2 GL', type_projet: 'application', status: 'affecte', annee_universitaire: '2025/2026', max_grps: 1, created_at: '2025-10-20' },
  { id: 3, titre: 'Étude comparative des algorithmes de clustering', description: 'Analyse et comparaison des performances de K-means, DBSCAN et clustering hiérarchique.', keywords: 'Data Mining, Clustering, Machine Learning', enseignant: 'Prof. Cherif Karim', promo: 'M2 SIC', type_projet: 'etude', status: 'propose', annee_universitaire: '2025/2026', max_grps: 1, created_at: '2025-11-01' },
  { id: 4, titre: 'Plateforme IoT pour smart campus', description: 'Système IoT intégré pour la gestion intelligente des salles, éclairage et chauffage du campus.', keywords: 'IoT, Smart Building, Arduino, MQTT', enseignant: 'Dr. Messaoudi Yasmine', promo: 'M2 RSI', type_projet: 'innovation', status: 'valide', annee_universitaire: '2025/2026', max_grps: 2, created_at: '2025-10-25' },
  { id: 5, titre: 'Analyse de sentiments des réseaux sociaux algériens', description: 'NLP appliqué à l\'analyse des sentiments en dialecte algérien (Darija) sur les réseaux sociaux.', keywords: 'NLP, Sentiment Analysis, Darija, BERT', enseignant: 'Prof. Kaci Sara', promo: 'M2 SIC', type_projet: 'recherche', status: 'reserve', annee_universitaire: '2025/2026', max_grps: 1, created_at: '2025-10-18' },
  { id: 6, titre: 'E-commerce avec recommandation IA', description: 'Plateforme e-commerce avec système de recommandation basé sur le filtrage collaboratif.', keywords: 'E-commerce, Recommandation, IA', enseignant: 'Dr. Boudiaf Fatima', promo: 'M2 GL', type_projet: 'application', status: 'termine', annee_universitaire: '2024/2025', max_grps: 1, created_at: '2024-10-15' },
];

/* ── Mock Data — Groups (groups_pfe + group_members) ────────── */

const MOCK_GROUPS = [
  { id: 1, nom: 'Groupe Alpha', sujet: 'Application mobile de gestion universitaire', encadrant: 'Dr. Boudiaf Fatima', co_encadrant: 'Dr. Messaoudi Yasmine', members: [{ name: 'Benali Ahmed', role: 'chef_groupe' }, { name: 'Rahmani Nour', role: 'membre' }], date_creation: '2025-11-15', date_soutenance: '2026-06-20', salle: 'Amphi A', note: 16.5, mention: 'tres_bien' },
  { id: 2, nom: 'Groupe Beta', sujet: 'Système de détection d\'intrusion basé sur l\'IA', encadrant: 'Prof. Kaci Sara', co_encadrant: 'Prof. Cherif Karim', members: [{ name: 'Tounsi Amira', role: 'chef_groupe' }, { name: 'Bouzid Amine', role: 'membre' }, { name: 'Saadi Omar', role: 'membre' }], date_creation: '2025-11-20', date_soutenance: null, salle: null, note: null, mention: null },
  { id: 3, nom: 'Groupe Gamma', sujet: 'Plateforme IoT pour smart campus', encadrant: 'Dr. Messaoudi Yasmine', co_encadrant: 'Prof. Kaci Sara', members: [{ name: 'Merniz Yousef', role: 'chef_groupe' }, { name: 'Hamidi Lina', role: 'membre' }], date_creation: '2025-12-01', date_soutenance: null, salle: null, note: null, mention: null },
];

/* ── Mock Data — Subject Choices (group_sujets) ────────────── */

const MOCK_CHOICES = [
  { id: 1, group: 'Groupe Alpha', sujet: 'Application mobile de gestion universitaire', ordre: 1, status: 'accepte' },
  { id: 2, group: 'Groupe Alpha', sujet: 'E-commerce avec recommandation IA', ordre: 2, status: 'refuse' },
  { id: 3, group: 'Groupe Beta', sujet: 'Système de détection d\'intrusion basé sur l\'IA', ordre: 1, status: 'accepte' },
  { id: 4, group: 'Groupe Beta', sujet: 'Analyse de sentiments des réseaux sociaux algériens', ordre: 2, status: 'en_attente' },
  { id: 5, group: 'Groupe Gamma', sujet: 'Plateforme IoT pour smart campus', ordre: 1, status: 'en_attente' },
  { id: 6, group: 'Groupe Gamma', sujet: 'Système de détection d\'intrusion basé sur l\'IA', ordre: 2, status: 'en_attente' },
  { id: 7, group: 'Groupe Gamma', sujet: 'Étude comparative des algorithmes de clustering', ordre: 3, status: 'en_attente' },
];

/* ── Mock Data — Jury (pfe_jury) ───────────────────────────── */

const MOCK_JURY = [
  { id: 1, group: 'Groupe Alpha', enseignant: 'Prof. Hamidi Lina', role: 'president' },
  { id: 2, group: 'Groupe Alpha', enseignant: 'Dr. Amrani Djamel', role: 'examinateur' },
  { id: 3, group: 'Groupe Alpha', enseignant: 'Prof. Cherif Karim', role: 'rapporteur' },
  { id: 4, group: 'Groupe Beta', enseignant: 'Prof. Hamidi Lina', role: 'president' },
  { id: 5, group: 'Groupe Beta', enseignant: 'Dr. Messaoudi Yasmine', role: 'examinateur' },
  { id: 6, group: 'Groupe Beta', enseignant: 'Dr. Boudiaf Fatima', role: 'rapporteur' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function PFEProjectsPage({ role }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [choices, setChoices] = useState([]);
  const [jury, setJury] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [sRes, gRes, cRes, jRes] = await Promise.allSettled([
          request('/api/v1/pfe/sujets'),
          request('/api/v1/pfe/groups'),
          request('/api/v1/pfe/choix-sujets'),
          request('/api/v1/pfe/jury'),
        ]);
        if (cancelled) return;
        if (sRes.status === 'fulfilled') setSubjects(sRes.value.data || []);
        if (gRes.status === 'fulfilled') setGroups(gRes.value.data || []);
        if (cRes.status === 'fulfilled') setChoices(cRes.value.data || []);
        if (jRes.status === 'fulfilled') setJury(jRes.value.data || []);
      } catch {
        /* API not ready */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const displaySubjects = subjects.length ? subjects : MOCK_SUBJECTS;
  const displayGroups = groups.length ? groups : MOCK_GROUPS;
  const displayChoices = choices.length ? choices : MOCK_CHOICES;
  const displayJury = jury.length ? jury : MOCK_JURY;
  const isStudentView = role === 'student';
  const myGroup = displayGroups[0] || null;
  const myChoices = myGroup ? displayChoices.filter((choice) => choice.group === myGroup.nom) : [];
  const openSubjects = displaySubjects.filter((subject) => ['propose', 'valide', 'reserve'].includes(subject.status));

  const filteredSubjects = displaySubjects.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterType !== 'all' && s.type_projet !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.titre.toLowerCase().includes(q) || s.enseignant.toLowerCase().includes(q) || (s.keywords && s.keywords.toLowerCase().includes(q));
    }
    return true;
  });

  /* Stats */
  const statSubjects = displaySubjects.length;
  const statGroups = displayGroups.length;
  const statValidated = displaySubjects.filter(s => s.status === 'valide' || s.status === 'affecte').length;
  const statDefended = displayGroups.filter(g => g.note !== null).length;

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
            {t('pfe.title', 'PFE — End-of-Studies Projects')}
          </h1>
          <p className="mt-1 text-sm text-ink-tertiary">
            {isStudentView
              ? t('pfe.subtitleStudent', 'Explore available subjects, track your group, and follow your choices.')
              : t('pfe.subtitle', 'Manage subjects, groups, choices, and jury composition.')}
          </p>
        </div>
        {!isStudentView && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover active:bg-brand-dark focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm">
            <icons.plus className="w-4 h-4" />
            {t('pfe.proposeSubject', 'Propose Subject')}
          </button>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('pfe.statSubjects', 'Total Subjects'), value: statSubjects, icon: <icons.academic className="w-5 h-5" />, accent: 'bg-blue-50 dark:bg-blue-950/40 text-brand' },
          { label: t('pfe.statGroups', 'Groups'), value: statGroups, icon: <icons.users className="w-5 h-5" />, accent: 'bg-green-50 dark:bg-green-950/40 text-success' },
          { label: t('pfe.statValidated', 'Validated'), value: statValidated, icon: <icons.folder className="w-5 h-5" />, accent: 'bg-amber-50 dark:bg-amber-950/40 text-warning' },
          { label: t('pfe.statDefended', 'Defended'), value: statDefended, icon: <icons.scale className="w-5 h-5" />, accent: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400' },
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
          <div className="bg-surface rounded-lg border border-edge shadow-card">
            <div className="px-5 py-4 border-b border-edge-subtle flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">{t('pfe.studentAvailableSubjects', 'Available subjects')}</h2>
              <span className="text-xs text-ink-muted">{openSubjects.length} {t('common.items', 'items')}</span>
            </div>
            <ul className="divide-y divide-edge-subtle">
              {openSubjects.slice(0, 6).map((subject) => (
                <li key={subject.id} className="px-5 py-4 hover:bg-surface-200/50 transition-colors duration-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <StatusBadge status={subject.status} config={SUJET_STATUS} />
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${TYPE_CONFIG[subject.type_projet]?.color || ''}`}>
                          {TYPE_CONFIG[subject.type_projet]?.label || subject.type_projet}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-ink">{subject.titre}</p>
                      <p className="text-xs text-ink-muted mt-1">{subject.enseignant} · {subject.promo}</p>
                    </div>
                    <button className="shrink-0 p-2 rounded-md text-ink-muted hover:text-brand hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                      <icons.eye className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-surface rounded-lg border border-edge shadow-card">
              <div className="px-5 py-4 border-b border-edge-subtle flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-ink">{t('pfe.studentMyChoices', 'My subject choices')}</h2>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover transition-colors duration-150">
                  <icons.plus className="w-4 h-4" />
                  {t('pfe.studentEditChoices', 'Edit choices')}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-edge-subtle">
                      <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.subject', 'Subject')}</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.order', 'Order')}</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.choiceStatus', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge-subtle">
                    {myChoices.map((choice) => (
                      <tr key={choice.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                        <td className="px-5 py-3 text-ink-secondary">{choice.sujet}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-xs font-bold text-ink">{choice.ordre}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <StatusBadge status={choice.status} config={CHOIX_STATUS} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-edge shadow-card p-5">
              <h2 className="text-base font-semibold text-ink mb-3">{t('pfe.studentMyGroup', 'My group')}</h2>
              {myGroup ? (
                <>
                  <p className="text-sm font-semibold text-ink">{myGroup.nom}</p>
                  <p className="text-sm text-ink-secondary mt-0.5">{myGroup.sujet}</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('pfe.supervisor', 'Supervisor')}</p>
                      <p className="font-medium text-ink">{myGroup.encadrant}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('pfe.defense', 'Defense')}</p>
                      <p className="font-medium text-ink">{myGroup.date_soutenance ? formatDate(myGroup.date_soutenance) : '—'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {myGroup.members.map((member) => (
                      <div key={member.name} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-200 border border-edge">
                        <Avatar name={member.name} size="w-5 h-5 text-[9px]" />
                        <span className="text-xs font-medium text-ink">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink-muted">{t('pfe.noGroupYet', 'No group assigned yet.')}</p>
              )}
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
              {t(tab.labelKey, tab.label)}
            </button>
          ))}
        </div>
      </div>

      {/* ═════ TAB: SUBJECTS ═══════════════════════════════════ */}
      {activeTab === 'subjects' && (
        <div className="bg-surface rounded-lg border border-edge shadow-card">
          {/* Filters */}
          <div className="px-5 py-4 border-b border-edge-subtle space-y-3">
            <div className="relative">
              <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pfe.searchSubjects', 'Search subjects, supervisors, or keywords...')}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-control-border bg-control-bg text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-ink-muted uppercase tracking-wider mr-1">{t('pfe.status', 'Status')}:</span>
                <div className="bg-surface-200 rounded-md p-1 flex items-center gap-1">
                {['all', ...Object.keys(SUJET_STATUS)].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${filterStatus === s ? 'bg-brand text-white shadow-sm' : 'text-ink-secondary hover:text-ink'}`}
                  >
                    {s === 'all' ? t('common.all', 'All') : SUJET_STATUS[s]?.label || s}
                  </button>
                ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-ink-muted uppercase tracking-wider mr-1">{t('pfe.type', 'Type')}:</span>
                <div className="bg-surface-200 rounded-md p-1 flex items-center gap-1">
                {['all', ...Object.keys(TYPE_CONFIG)].map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setFilterType(tp)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${filterType === tp ? 'bg-brand text-white shadow-sm' : 'text-ink-secondary hover:text-ink'}`}
                  >
                    {tp === 'all' ? t('common.all', 'All') : TYPE_CONFIG[tp]?.label || tp}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subjects list */}
          <ul className="divide-y divide-edge-subtle">
            {filteredSubjects.length === 0 && (
              <li className="px-5 py-12 text-center">
                <icons.academic className="w-10 h-10 mx-auto text-ink-muted mb-3" />
                <p className="text-sm font-medium text-ink-secondary">{t('pfe.noSubjects', 'No subjects found')}</p>
              </li>
            )}
            {filteredSubjects.map((s) => (
              <li key={s.id} className="px-5 py-4 hover:bg-surface-200/50 transition-colors duration-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <StatusBadge status={s.status} config={SUJET_STATUS} />
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${TYPE_CONFIG[s.type_projet]?.color || ''}`}>
                        {TYPE_CONFIG[s.type_projet]?.label || s.type_projet}
                      </span>
                      <span className="text-xs text-ink-muted">{s.annee_universitaire}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink leading-snug">{s.titre}</h3>
                    <p className="mt-1 text-sm text-ink-secondary leading-relaxed line-clamp-2">{s.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <icons.users className="w-3.5 h-3.5" />
                        {s.enseignant}
                      </span>
                      <span>·</span>
                      <span>{s.promo}</span>
                      <span>·</span>
                      <span>Max {s.max_grps} groupe(s)</span>
                    </div>
                    {s.keywords && (
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        {s.keywords.split(',').map((kw) => (
                          <span key={kw.trim()} className="px-2 py-0.5 text-[10px] font-medium rounded bg-surface-200 text-ink-tertiary border border-edge">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="shrink-0 p-2 rounded-md text-ink-muted hover:text-brand hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                    <icons.eye className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ═════ TAB: GROUPS ══════════════════════════════════════ */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {displayGroups.map((g) => (
            <div key={g.id} className="bg-surface rounded-lg border border-edge shadow-card p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-ink">{g.nom}</h3>
                  <p className="text-sm text-ink-secondary mt-0.5">{g.sujet}</p>
                </div>
                {g.mention && (
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${MENTION_STYLES[g.mention] || ''}`}>
                    {g.mention.replace('_', ' ')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('pfe.supervisor', 'Supervisor')}</p>
                  <p className="text-sm font-medium text-ink">{g.encadrant}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('pfe.coSupervisor', 'Co-Supervisor')}</p>
                  <p className="text-sm font-medium text-ink">{g.co_encadrant}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('pfe.defense', 'Defense')}</p>
                  <p className="text-sm font-medium text-ink">{g.date_soutenance ? formatDate(g.date_soutenance) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{t('pfe.grade', 'Grade')}</p>
                  <p className="text-sm font-medium text-ink">{g.note ? `${g.note}/20` : '—'}</p>
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-ink-muted uppercase tracking-wider mr-1">{t('pfe.members', 'Members')}:</span>
                {g.members.map((m) => (
                  <div key={m.name} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-200 border border-edge">
                    <Avatar name={m.name} size="w-5 h-5 text-[9px]" />
                    <span className="text-xs font-medium text-ink">{m.name}</span>
                    {m.role === 'chef_groupe' && (
                      <span className="text-[9px] font-bold text-warning uppercase">Chef</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═════ TAB: CHOICES ═════════════════════════════════════ */}
      {activeTab === 'choices' && (
        <div className="bg-surface rounded-lg border border-edge shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-subtle">
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.group', 'Group')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.subject', 'Subject')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.order', 'Order')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.choiceStatus', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-subtle">
                {displayChoices.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                    <td className="px-5 py-3 font-medium text-ink">{c.group}</td>
                    <td className="px-5 py-3 text-ink-secondary">{c.sujet}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-xs font-bold text-ink">
                        {c.ordre}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={c.status} config={CHOIX_STATUS} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════ TAB: JURY ═══════════════════════════════════════ */}
      {activeTab === 'jury' && (
        <div className="bg-surface rounded-lg border border-edge shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-subtle">
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.group', 'Group')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.juryMember', 'Jury Member')}</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-ink-muted uppercase tracking-wider">{t('pfe.juryRole', 'Role')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-subtle">
                {displayJury.map((j) => (
                  <tr key={j.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                    <td className="px-5 py-3 font-medium text-ink">{j.group}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={j.enseignant} />
                        <span className="text-ink-secondary">{j.enseignant}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${JURY_ROLES[j.role]?.color || ''}`}>
                        {JURY_ROLES[j.role]?.label || j.role}
                      </span>
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
