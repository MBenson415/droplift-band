import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/shows', label: 'Shows' },
  { to: '/store', label: 'Store' },
];

function SiteNav({ activePage }) {
  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-red-700 to-brand-orange">
      <Link to="/" className="text-white font-black text-2xl tracking-widest uppercase">
        Droplift
      </Link>
      <nav className="flex items-center gap-6">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm uppercase tracking-wider transition-colors ${
              activePage === label.toLowerCase()
                ? 'text-white'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default SiteNav;
