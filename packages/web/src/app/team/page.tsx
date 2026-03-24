'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, Mail, Shield, Trash2, Copy, Check, Plus, Loader2, Crown, UserCog, Eye, Pencil, ChevronDown } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Proprietario',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  EDITOR: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-gray-100 text-gray-600',
};

const ROLE_ICONS: Record<string, any> = {
  OWNER: Crown,
  ADMIN: Shield,
  EDITOR: Pencil,
  VIEWER: Eye,
};

const ALL_PAGES = [
  { slug: 'dashboard', label: 'Dashboard' },
  { slug: 'posts', label: 'Posts' },
  { slug: 'calendar', label: 'Calendario' },
  { slug: 'tasks', label: 'Tarefas' },
  { slug: 'projects', label: 'Projetos' },
  { slug: 'funnels', label: 'Funis' },
];

const PAGE_LABELS: Record<string, string> = Object.fromEntries(ALL_PAGES.map((p) => [p.slug, p.label]));

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EDITOR');
  const [invitePages, setInvitePages] = useState<string[]>(ALL_PAGES.map((p) => p.slug));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [editingPagesId, setEditingPagesId] = useState<string | null>(null);
  const [editPages, setEditPages] = useState<string[]>([]);

  const isOwner = user?.role === 'OWNER' || !user?.role;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [m, i] = await Promise.all([api.listMembers(), api.listInvitations()]);
      setMembers(m);
      setInvitations(i);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleInvitePage(slug: string) {
    setInvitePages((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  }

  function toggleEditPage(slug: string) {
    setEditPages((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await api.createInvitation(inviteEmail, inviteRole, invitePages);
      setSuccess(`Convite enviado para ${inviteEmail}`);
      setInviteEmail('');
      setInvitePages(ALL_PAGES.map((p) => p.slug));
      setShowInvite(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleRemoveMember(id: string, name: string) {
    if (!confirm(`Remover ${name} da equipe?`)) return;
    try {
      await api.removeMember(id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdateRole(id: string, role: string) {
    try {
      await api.updateMemberRole(id, role);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSavePages(id: string) {
    try {
      await api.updateMemberPages(id, editPages);
      setEditingPagesId(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteInvitation(id: string) {
    try {
      await api.deleteInvitation(id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite?token=${token}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for HTTP/insecure contexts
      const textarea = document.createElement('textarea');
      textarea.value = link;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-page-title">Equipe</h1>
          <p className="text-sm text-text-secondary mt-1">Gerencie os membros da sua equipe</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowInvite(!showInvite)} className="btn-cta">
            <Plus className="w-4 h-4" />
            Convidar Membro
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-status-failed text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Novo Convite
          </h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-field"
                  placeholder="membro@email.com"
                  required
                />
              </div>
              <div className="w-44">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Papel</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input-field"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>
            </div>

            {/* Page Permissions */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Paginas permitidas
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_PAGES.map((page) => (
                  <label
                    key={page.slug}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      invitePages.includes(page.slug)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-bg-main text-text-secondary hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={invitePages.includes(page.slug)}
                      onChange={() => toggleInvitePage(page.slug)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium">{page.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setInvitePages(ALL_PAGES.map((p) => p.slug))}
                  className="text-xs text-primary hover:underline"
                >
                  Selecionar todas
                </button>
                <span className="text-xs text-text-muted">|</span>
                <button
                  type="button"
                  onClick={() => setInvitePages([])}
                  className="text-xs text-text-muted hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={sending} className="btn-cta whitespace-nowrap">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Convite'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members */}
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Membros ({members.length})
        </h3>
        <div className="space-y-3">
          {members.map((member) => {
            const RoleIcon = ROLE_ICONS[member.role] || Eye;
            const isEditing = editingPagesId === member.id;
            const memberPages: string[] = member.allowedPages || [];
            return (
              <div key={member.id} className="p-3 rounded-lg bg-bg-main border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {(member.name || member.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{member.name || 'Sem nome'}</p>
                      <p className="text-xs text-text-muted">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'OWNER' ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[member.role]}`}>
                        <RoleIcon className="w-3 h-3" />
                        {ROLE_LABELS[member.role]}
                      </span>
                    ) : (
                      <>
                        {isOwner ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="text-xs rounded-lg border border-border px-2 py-1.5 bg-white"
                          >
                            <option value="ADMIN">Administrador</option>
                            <option value="EDITOR">Editor</option>
                            <option value="VIEWER">Visualizador</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[member.role]}`}>
                            <RoleIcon className="w-3 h-3" />
                            {ROLE_LABELS[member.role]}
                          </span>
                        )}
                        {isOwner && (
                          <>
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingPagesId(null);
                                } else {
                                  setEditPages(memberPages);
                                  setEditingPagesId(member.id);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isEditing
                                  ? 'text-primary bg-primary/10'
                                  : 'text-text-muted hover:text-primary hover:bg-primary/5'
                              }`}
                              title="Editar paginas"
                            >
                              <UserCog className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-status-failed hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Page badges */}
                {member.role !== 'OWNER' && !isEditing && memberPages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-12">
                    {memberPages.map((slug: string) => (
                      <span key={slug} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary/80 border border-primary/15">
                        {PAGE_LABELS[slug] || slug}
                      </span>
                    ))}
                  </div>
                )}

                {/* Edit pages inline */}
                {isEditing && (
                  <div className="mt-3 ml-12 p-3 rounded-lg bg-white border border-border">
                    <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Paginas permitidas</p>
                    <div className="grid grid-cols-3 gap-2">
                      {ALL_PAGES.map((page) => (
                        <label
                          key={page.slug}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-sm ${
                            editPages.includes(page.slug)
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-text-secondary hover:border-primary/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={editPages.includes(page.slug)}
                            onChange={() => toggleEditPage(page.slug)}
                            className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20"
                          />
                          <span className="text-xs font-medium">{page.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setEditingPagesId(null)}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSavePages(member.id)}
                        className="btn-cta text-xs px-3 py-1.5"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Convites Pendentes ({invitations.filter((i) => !i.usedAt).length})
          </h3>
          <div className="space-y-3">
            {invitations.map((inv) => {
              const expired = new Date(inv.expiresAt) < new Date();
              const used = !!inv.usedAt;
              const invPages: string[] = inv.allowedPages || [];
              return (
                <div key={inv.id} className="p-3 rounded-lg bg-bg-main border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{inv.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-semibold ${ROLE_COLORS[inv.role]} px-2 py-0.5 rounded-full`}>
                          {ROLE_LABELS[inv.role]}
                        </span>
                        {used ? (
                          <span className="text-xs text-green-600">Aceito</span>
                        ) : expired ? (
                          <span className="text-xs text-status-failed">Expirado</span>
                        ) : (
                          <span className="text-xs text-text-muted">
                            Expira em {Math.ceil((new Date(inv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!used && !expired && (
                        <button
                          onClick={() => copyInviteLink(inv.token)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copiar Link
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteInvitation(inv.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-status-failed hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Page badges for invitation */}
                  {invPages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {invPages.map((slug: string) => (
                        <span key={slug} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary/80 border border-primary/15">
                          {PAGE_LABELS[slug] || slug}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
