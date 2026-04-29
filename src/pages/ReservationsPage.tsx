import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { Plus, Search, BookmarkCheck, X, Check, Ban } from 'lucide-react';

interface Reservation { id: string; book_id: string; member_id: string; reservation_date: string; expiry_date: string; status: string; notes: string; books: { title: string } | null; members: { full_name: string; email: string } | null; }
interface BookOption { id: string; title: string; available_copies: number; }
interface MemberOption { id: string; full_name: string; email: string; }
const emptyForm = { book_id: '', member_id: '', hold_days: '7', notes: '' };

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadOptions(); }, []);
  useEffect(() => { loadReservations(); }, [search, filterStatus]);

  const loadOptions = async () => {
    const [booksRes, membersRes] = await Promise.all([
      supabase.from('books').select('id, title, available_copies').order('title'),
      supabase.from('members').select('id, full_name, email').eq('membership_status', 'active').order('full_name'),
    ]);
    setBooks(booksRes.data ?? []); setMembers(membersRes.data ?? []);
  };

  const loadReservations = async () => {
    setLoading(true);
    let query = supabase.from('reservations').select('*, books(title), members(full_name, email)').order('reservation_date', { ascending: false });
    if (filterStatus) query = query.eq('status', filterStatus);
    const { data } = await query;
    let filtered = data ?? [];
    if (search) { const s = search.toLowerCase(); filtered = filtered.filter((r) => (r.books as unknown as { title: string })?.title?.toLowerCase().includes(s) || (r.members as unknown as { full_name: string })?.full_name?.toLowerCase().includes(s)); }
    setReservations(filtered); setLoading(false);
  };

  const handleReserve = async () => {
    setSaving(true);
    try {
      const expiryDate = new Date(); expiryDate.setDate(expiryDate.getDate() + parseInt(form.hold_days));
      const { error } = await supabase.from('reservations').insert([{ book_id: form.book_id, member_id: form.member_id, expiry_date: expiryDate.toISOString(), status: 'pending', notes: form.notes }]);
      if (error) throw error;
      setModalOpen(false); setForm(emptyForm); loadReservations();
    } catch { alert('Failed to create reservation.'); } finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => { const { error } = await supabase.from('reservations').update({ status }).eq('id', id); if (!error) loadReservations(); };

  const statusBadge = (s: string) => s === 'pending' ? 'bg-amber-50 text-amber-700' : s === 'fulfilled' ? 'bg-emerald-50 text-emerald-700' : s === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-rose-50 text-rose-700';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Reservations</h1><p className="text-gray-500 text-sm mt-0.5">{reservations.length} reservations</p></div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true); }} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" />New Reservation</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by book title or member name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <option value="">All Statuses</option><option value="pending">Pending</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option>
        </select>
      </div>
      {loading ? <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div> :
       reservations.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No reservations found</p><p className="text-gray-400 text-sm mt-1">Create a new reservation to get started</p></div> :
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Book</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Member</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Reserved</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Expires</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">{reservations.map((r) => {
            const bookTitle = (r.books as unknown as { title: string })?.title ?? 'Unknown';
            const memberName = (r.members as unknown as { full_name: string })?.full_name ?? 'Unknown';
            return (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{bookTitle}</p></td>
                <td className="px-6 py-4 text-sm text-gray-600">{memberName}</td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{new Date(r.reservation_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{new Date(r.expiry_date).toLocaleDateString()}</td>
                <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(r.status)}`}>{r.status}</span></td>
                <td className="px-6 py-4 text-right">{r.status === 'pending' && (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => updateStatus(r.id, 'fulfilled')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark fulfilled"><Check className="w-4 h-4" /></button>
                    <button onClick={() => updateStatus(r.id, 'cancelled')} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Cancel reservation"><Ban className="w-4 h-4" /></button>
                  </div>
                )}</td>
              </tr>
            );
          })}</tbody>
        </table></div></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Reservation">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Book *</label><select value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required><option value="">Select a book</option>{books.map((b) => (<option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>))}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Member *</label><select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required><option value="">Select a member</option>{members.map((m) => (<option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>))}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Hold Duration (days)</label><input type="number" min={1} value={form.hold_days} onChange={(e) => setForm({ ...form, hold_days: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleReserve} disabled={saving || !form.book_id || !form.member_id} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Processing...' : 'Reserve Book'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
