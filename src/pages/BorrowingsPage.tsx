import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { Plus, Search, ArrowRightLeft, X, RotateCcw } from 'lucide-react';

interface Borrowing { id: string; book_id: string; member_id: string; borrow_date: string; due_date: string; return_date: string | null; status: string; fine_amount: number; fine_paid: boolean; notes: string; books: { title: string; available_copies: number } | null; members: { full_name: string; email: string } | null; }
interface BookOption { id: string; title: string; available_copies: number; }
interface MemberOption { id: string; full_name: string; email: string; }
const emptyForm = { book_id: '', member_id: '', due_days: '14', notes: '' };

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [returnModalId, setReturnModalId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadOptions(); }, []);
  useEffect(() => { loadBorrowings(); }, [search, filterStatus]);

  const loadOptions = async () => {
    const [booksRes, membersRes] = await Promise.all([
      supabase.from('books').select('id, title, available_copies').gt('available_copies', 0).order('title'),
      supabase.from('members').select('id, full_name, email').eq('membership_status', 'active').order('full_name'),
    ]);
    setBooks(booksRes.data ?? []); setMembers(membersRes.data ?? []);
  };

  const loadBorrowings = async () => {
    setLoading(true);
    let query = supabase.from('borrowings').select('*, books(title, available_copies), members(full_name, email)').order('borrow_date', { ascending: false });
    if (filterStatus) query = query.eq('status', filterStatus);
    const { data } = await query;
    let filtered = data ?? [];
    if (search) { const s = search.toLowerCase(); filtered = filtered.filter((b) => (b.books as unknown as { title: string })?.title?.toLowerCase().includes(s) || (b.members as unknown as { full_name: string })?.full_name?.toLowerCase().includes(s)); }
    setBorrowings(filtered); setLoading(false);
  };

  const handleBorrow = async () => {
    setSaving(true);
    try {
      const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + parseInt(form.due_days));
      const { error } = await supabase.from('borrowings').insert([{ book_id: form.book_id, member_id: form.member_id, due_date: dueDate.toISOString(), status: 'borrowed', notes: form.notes }]);
      if (error) throw error;
      const book = books.find((b) => b.id === form.book_id);
      if (book) await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', form.book_id);
      setModalOpen(false); setForm(emptyForm); loadBorrowings(); loadOptions();
    } catch { alert('Failed to create borrowing.'); } finally { setSaving(false); }
  };

  const handleReturn = async () => {
    if (!returnModalId) return; setSaving(true);
    try {
      const borrowing = borrowings.find((b) => b.id === returnModalId); if (!borrowing) return;
      const now = new Date(); const dueDate = new Date(borrowing.due_date); let fine = 0;
      if (now > dueDate) { const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)); fine = daysOverdue * 1.00; }
      const { error } = await supabase.from('borrowings').update({ return_date: now.toISOString(), status: fine > 0 ? 'overdue' : 'returned', fine_amount: fine }).eq('id', returnModalId);
      if (error) throw error;
      const bookData = borrowing.books as unknown as { available_copies: number };
      if (bookData) await supabase.from('books').update({ available_copies: bookData.available_copies + 1 }).eq('id', borrowing.book_id);
      setReturnModalId(null); loadBorrowings(); loadOptions();
    } catch { alert('Failed to process return.'); } finally { setSaving(false); }
  };

  const statusBadge = (s: string) => s === 'borrowed' ? 'bg-blue-50 text-blue-700' : s === 'returned' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Borrowings</h1><p className="text-gray-500 text-sm mt-0.5">{borrowings.length} records</p></div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true); }} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" />New Borrowing</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by book title or member name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <option value="">All Statuses</option><option value="borrowed">Borrowed</option><option value="returned">Returned</option><option value="overdue">Overdue</option>
        </select>
      </div>
      {loading ? <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div> :
       borrowings.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No borrowings found</p><p className="text-gray-400 text-sm mt-1">Create a new borrowing to get started</p></div> :
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Book</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Member</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Borrowed</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Due Date</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Fine</th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">{borrowings.map((b) => {
            const bookTitle = (b.books as unknown as { title: string })?.title ?? 'Unknown';
            const memberName = (b.members as unknown as { full_name: string })?.full_name ?? 'Unknown';
            return (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{bookTitle}</p></td>
                <td className="px-6 py-4 text-sm text-gray-600">{memberName}</td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{new Date(b.borrow_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{new Date(b.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>{b.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{b.fine_amount > 0 ? `$${Number(b.fine_amount).toFixed(2)}` : '--'}</td>
                <td className="px-6 py-4 text-right">{b.status === 'borrowed' && (
                  <button onClick={() => setReturnModalId(b.id)} className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"><RotateCcw className="w-3.5 h-3.5" />Return</button>
                )}</td>
              </tr>
            );
          })}</tbody>
        </table></div></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Borrowing">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Book *</label><select value={form.book_id} onChange={(e) => setForm({ ...form, book_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required><option value="">Select a book</option>{books.map((b) => (<option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>))}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Member *</label><select value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required><option value="">Select a member</option>{members.map((m) => (<option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>))}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Borrow Duration (days)</label><input type="number" min={1} value={form.due_days} onChange={(e) => setForm({ ...form, due_days: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleBorrow} disabled={saving || !form.book_id || !form.member_id} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Processing...' : 'Borrow Book'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!returnModalId} onClose={() => setReturnModalId(null)} title="Return Book">
        <p className="text-sm text-gray-600">Confirm that this book is being returned. Late returns will incur a fine of $1.00 per day.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setReturnModalId(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleReturn} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Processing...' : 'Confirm Return'}</button>
        </div>
      </Modal>
    </div>
  );
}
