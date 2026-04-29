import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, BookOpen, X } from 'lucide-react';

interface Book { id: string; title: string; author: string; isbn: string; category_id: string; publisher: string; publication_year: number | null; total_copies: number; available_copies: number; shelf_location: string; description: string; cover_url: string; categories: { name: string } | null; }
interface Category { id: string; name: string; }

const emptyBook = { title: '', author: '', isbn: '', category_id: '', publisher: '', publication_year: null as number | null, total_copies: 1, available_copies: 1, shelf_location: '', description: '', cover_url: '' };

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadBooks(); }, [search, filterCategory]);

  const loadCategories = async () => { const { data } = await supabase.from('categories').select('id, name').order('name'); setCategories(data ?? []); };
  const loadBooks = async () => {
    setLoading(true);
    let query = supabase.from('books').select('*, categories(name)').order('title');
    if (search) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
    if (filterCategory) query = query.eq('category_id', filterCategory);
    const { data } = await query;
    setBooks(data ?? []);
    setLoading(false);
  };

  const openAdd = () => { setEditingBook(null); setForm(emptyBook); setModalOpen(true); };
  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, category_id: book.category_id, publisher: book.publisher, publication_year: book.publication_year, total_copies: book.total_copies, available_copies: book.available_copies, shelf_location: book.shelf_location, description: book.description, cover_url: book.cover_url });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, publication_year: form.publication_year || null, category_id: form.category_id || null };
      if (editingBook) { const { error } = await supabase.from('books').update(payload).eq('id', editingBook.id); if (error) throw error; }
      else { const { error } = await supabase.from('books').insert([payload]); if (error) throw error; }
      setModalOpen(false); loadBooks();
    } catch { alert('Failed to save book. Check that ISBN is unique.'); } finally { setSaving(false); }
  };

  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('books').delete().eq('id', deleteId); if (!error) loadBooks(); setDeleteId(null); };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Books</h1><p className="text-gray-500 text-sm mt-0.5">{books.length} books in catalog</p></div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" />Add Book</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by title, author, or ISBN..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
          <option value="">All Categories</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>
      {loading ? <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div> :
       books.length === 0 ? <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No books found</p><p className="text-gray-400 text-sm mt-1">Add your first book to get started</p></div> :
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Title</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Author</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">ISBN</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Category</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Available</th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">{books.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{book.title}</p><p className="text-xs text-gray-400 md:hidden">{book.author}</p></td>
              <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono hidden md:table-cell">{book.isbn}</td>
              <td className="px-6 py-4 hidden sm:table-cell"><span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{book.categories?.name ?? 'Uncategorized'}</span></td>
              <td className="px-6 py-4"><span className={`text-sm font-medium ${book.available_copies === 0 ? 'text-rose-600' : book.available_copies <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>{book.available_copies}/{book.total_copies}</span></td>
              <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1">
                <button onClick={() => openEdit(book)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(book.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table></div></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? 'Edit Book' : 'Add New Book'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Author *</label><input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label><input type="text" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"><option value="">Select category</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label><input type="text" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label><input type="number" value={form.publication_year ?? ''} onChange={(e) => setForm({ ...form, publication_year: e.target.value ? parseInt(e.target.value) : null })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label><input type="number" min={1} value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: parseInt(e.target.value) || 1 })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Available Copies *</label><input type="number" min={0} value={form.available_copies} onChange={(e) => setForm({ ...form, available_copies: parseInt(e.target.value) || 0 })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Shelf Location</label><input type="text" value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Book">
        <p className="text-sm text-gray-600">Are you sure you want to delete this book? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
