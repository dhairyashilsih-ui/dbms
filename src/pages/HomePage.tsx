import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, Search, Shield, Clock, Star, Library } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">LibraVault</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#stats" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors">Sign In</Link>
            <Link to="/login" className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg transition-colors shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              <Star className="w-3.5 h-3.5" /> Trusted by 500+ Libraries
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              The Modern Way to
              <span className="text-emerald-600 block mt-1">Manage Your Library</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              A complete library management system built for the digital age. Track books, manage members, handle borrowings, and gain powerful insights -- all from one elegant interface.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 px-8 py-4 rounded-xl transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5">
                Start Managing Now <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-8 py-4 rounded-xl transition-all">
                See Features
              </a>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent rounded-3xl" />
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-100 rounded-lg px-4 py-1.5 text-xs text-gray-500 font-medium">dashboard.libravault.app</div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Books', value: '12,847', change: '+234' },
                    { label: 'Active Members', value: '3,421', change: '+89' },
                    { label: 'Books Borrowed', value: '1,205', change: '-12' },
                    { label: 'Overdue Returns', value: '43', change: '-8' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className={`text-xs font-medium mt-1 ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-gray-400'}`}>{stat.change} this month</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5 h-48">
                    <p className="text-sm font-semibold text-gray-900">Borrowing Trends</p>
                    <div className="mt-4 flex items-end gap-2 h-28">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-100 rounded-t-sm relative group">
                          <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600" style={{ height: `${h}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 h-48">
                    <p className="text-sm font-semibold text-gray-900">Popular Categories</p>
                    <div className="mt-4 space-y-3">
                      {[{ name: 'Fiction', pct: 35 }, { name: 'Science', pct: 25 }, { name: 'Technology', pct: 20 }, { name: 'History', pct: 12 }].map((cat) => (
                        <div key={cat.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{cat.name}</span>
                            <span className="text-gray-400">{cat.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything you need to run a library</h2>
            <p className="mt-4 text-gray-500 text-lg">From cataloging to circulation, LibraVault handles every aspect of library management with precision and elegance.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Book Catalog', description: 'Comprehensive book management with ISBN tracking, category classification, and real-time availability status.' },
              { icon: Users, title: 'Member Management', description: 'Handle memberships, track borrowing limits, and manage member profiles with different membership tiers.' },
              { icon: Clock, title: 'Circulation Control', description: 'Streamlined borrowing and returning process with automatic due date tracking and fine calculation.' },
              { icon: Search, title: 'Smart Search', description: 'Find any book instantly by title, author, ISBN, or category. Advanced filters for precise results.' },
              { icon: Shield, title: 'Secure Access', description: 'Google OAuth authentication ensures secure access. Role-based permissions protect sensitive operations.' },
              { icon: Star, title: 'Reservations', description: 'Allow members to reserve books that are currently borrowed, with automatic notification when available.' },
            ].map((feature) => (
              <div key={feature.title} className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Get started in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign In with Google', description: 'One-click authentication with your Google account. No separate passwords to remember.' },
              { step: '02', title: 'Set Up Your Library', description: 'Add your book catalog, register members, and configure borrowing rules to match your needs.' },
              { step: '03', title: 'Start Managing', description: 'Handle checkouts, returns, reservations, and track everything from your dashboard.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-6xl font-bold text-gray-100">{item.step}</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ value: '500+', label: 'Libraries Worldwide' }, { value: '2M+', label: 'Books Managed' }, { value: '99.9%', label: 'Uptime' }, { value: '50K+', label: 'Active Members' }].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 mt-2 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Ready to transform your library?</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Join hundreds of libraries that have already modernized their operations with LibraVault.</p>
          <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Library className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-900">LibraVault</span>
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} LibraVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
