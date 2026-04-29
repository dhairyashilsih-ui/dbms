import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Users, X } from 'lucide-react';

interface Member { id: string; user_id: string | null; full_name: string; email: string; phone: string; address: string; membership_type: string; membership_status: string; max_borrow_limit: number; joined_at: string; expires_at: string; }
const emptyMember = { full_name: '', email: '', phone: '', address: '', membership_type: 'standard', membership_status: 'active', max_borrow_limit: 5 };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyMember);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadMembers(); }, [search, filterStatus]);

  const loadMembers = async () => {
    setLoading(true);
    let query = supabase.from('members').select('*').order('full_name');
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    if (filterStatus) query = query.eq('membership_status', filterStatus);
    const { data } = await query;
    setMembers(data ?? []);
    setLoading(false);
  };

  const openAdd = () => { setEditingMember(null); setForm(emptyMember); setModalOpen(true); };
  const openEdit = (member: Member) => {
    setEditingMember(member);
    setForm({ full_name: member.full_name, email: member.email, phone: member.phone, address: member.address, membership_type: member.membership_type, membership_status: member.membership_status, max_borrow_limit: member.max_borrow_limit });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingMember) { const { error } = await supabase.from('members').update(form).eq('id', editingMember.id); if (error) throw error; }
      else { const { error } = await supabase.from('members').insert([form]); if (error) throw error; }
      setModalOpen(false); loadMembers();
    } catch { alert('Failed to save member. Check that email is unique.'); } finally { setSaving(false); }
  };

  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('members').delete().eq('id', deleteId); if (!error) loadMembers(); setDeleteId(null); };

  const statusColor = (s: string) => s === 'active' ? 'bg-emerald-50 text-emerald-700' : s === 'expired' ? 'bg-gray-100 text-gray-600' : 'bg-rose-50 text-rose-700';
  const typeLabel = (t: string) => t === 'standard' ? 'Standard' : t === 'premium' ? 'Premium' : t === 'student' ? 'Student' : t;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Members</h1><p className="text-gray-500 text-sm mt-0.5">{members.length} registered members</p></div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" />Add Member</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <option value="">All Statuses</option><option value="active">Active</option><option value="expired">Expired</option><option value="suspended">Suspended</option>
        </select>
      </div>
      {loading ? <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div> :
       members.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No members found</p><p className="text-gray-400 text-sm mt-1">Add your first member to get started</p></div> :
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Email</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Type</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Limit</th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">{members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{member.full_name}</p><p className="text-xs text-gray-400 sm:hidden">{member.email}</p></td>
              <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{member.email}</td>
              <td className="px-6 py-4 hidden md:table-cell"><span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{typeLabel(member.membership_type)}</span></td>
              <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(member.membership_status)}`}>{member.membership_status}</span></td>
              <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{member.max_borrow_limit} books</td>
              <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1">
                <button onClick={() => openEdit(member)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(member.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingMember ? 'Edit Member' : 'Add New Member'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label><select value={form.membership_type} onChange={(e) => setForm({ ...form, membership_type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"><option value="standard">Standard</option><option value="premium">Premium</option><option value="student">Student</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.membership_status} onChange={(e) => setForm({ ...form, membership_status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"><option value="active">Active</option><option value="expired">Expired</option><option value="suspended">Suspended</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Borrow Limit</label><input type="number" min={1} value={form.max_borrow_limit} onChange={(e) => setForm({ ...form, max_borrow_limit: parseInt(e.target.value) || 5 })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Member">
        <p className="text-sm text-gray-600">Are you sure you want to delete this member? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
