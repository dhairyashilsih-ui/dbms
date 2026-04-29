import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Users, ArrowRightLeft, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats { totalBooks: number; totalMembers: number; activeBorrowings: number; overdueCount: number; availableBooks: number; newMembersThisMonth: number; }
interface RecentBorrowing { id: string; book_title: string; member_name: string; borrow_date: string; due_date: string; status: string; }
interface PopularBook { id: string; title: string; author: string; available_copies: number; total_copies: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalBooks: 0, totalMembers: 0, activeBorrowings: 0, overdueCount: 0, availableBooks: 0, newMembersThisMonth: 0 });
  const [recentBorrowings, setRecentBorrowings] = useState<RecentBorrowing[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [booksRes, membersRes, borrowingsRes, overdueRes, recentRes, popularRes] = await Promise.all([
        supabase.from('books').select('id, available_copies, total_copies', { count: 'exact' }),
        supabase.from('members').select('id, joined_at', { count: 'exact' }),
        supabase.from('borrowings').select('id', { count: 'exact' }).eq('status', 'borrowed'),
        supabase.from('borrowings').select('id', { count: 'exact' }).eq('status', 'overdue'),
        supabase.from('borrowings').select('id, book:books(title), member:members(full_name), borrow_date, due_date, status').order('borrow_date', { ascending: false }).limit(5),
        supabase.from('books').select('id, title, author, available_copies, total_copies').order('total_copies', { ascending: false }).limit(5),
      ]);
      const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const newMembers = (membersRes.data ?? []).filter((m) => new Date(m.joined_at) >= oneMonthAgo).length;
      setStats({
        totalBooks: booksRes.count ?? 0, totalMembers: membersRes.count ?? 0,
        activeBorrowings: borrowingsRes.count ?? 0, overdueCount: overdueRes.count ?? 0,
        availableBooks: (booksRes.data ?? []).reduce((sum, b) => sum + b.available_copies, 0), newMembersThisMonth: newMembers,
      });
      setRecentBorrowings((recentRes.data ?? []).map((b) => ({
        id: b.id, book_title: (b.book as unknown as { title: string })?.title ?? 'Unknown',
        member_name: (b.member as unknown as { full_name: string })?.full_name ?? 'Unknown',
        borrow_date: b.borrow_date, due_date: b.due_date, status: b.status,
      })));
      setPopularBooks(popularRes.data ?? []);
    } catch (err) { console.error('Failed to load dashboard data:', err); } finally { setLoading(false); }
  };

  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'emerald', detail: `${stats.availableBooks} available` },
    { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'blue', detail: `${stats.newMembersThisMonth} this month` },
    { label: 'Active Borrowings', value: stats.activeBorrowings, icon: ArrowRightLeft, color: 'amber', detail: 'Currently borrowed' },
    { label: 'Overdue Returns', value: stats.overdueCount, icon: AlertTriangle, color: 'rose', detail: 'Needs attention' },
  ];
  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', text: 'text-rose-600' },
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your library operations</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const colors = colorMap[card.color];
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value.toLocaleString()}</p>
                  <p className={`text-xs font-medium mt-1 ${colors.text}`}>{card.detail}</p>
                </div>
                <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><h2 className="text-sm font-semibold text-gray-900">Recent Borrowings</h2></div>
            <Link to="/borrowings" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View all</Link>
          </div>
          {recentBorrowings.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No borrowings yet</div> : (
            <div className="divide-y divide-gray-50">
              {recentBorrowings.map((b) => (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-900">{b.book_title}</p><p className="text-xs text-gray-400 mt-0.5">by {b.member_name}</p></div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.status === 'borrowed' ? 'bg-blue-50 text-blue-700' : b.status === 'overdue' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{b.status}</span>
                    <span className="text-xs text-gray-400">{new Date(b.borrow_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /><h2 className="text-sm font-semibold text-gray-900">Top Books</h2></div>
            <Link to="/books" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View all</Link>
          </div>
          {popularBooks.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No books yet</div> : (
            <div className="divide-y divide-gray-50">
              {popularBooks.map((book) => (
                <div key={book.id} className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{book.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(book.available_copies / book.total_copies) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{book.available_copies}/{book.total_copies}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
