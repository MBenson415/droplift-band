import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from './SiteFooter';

function Contact() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage("You're on the list.");
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav bar */}
      <header className="border-b border-gray-800 px-6 py-4 grid grid-cols-3 items-center bg-gradient-to-r from-red-700 to-brand-orange">
        <Link to="/" className="text-white font-black text-2xl tracking-widest uppercase">
          Droplift
        </Link>
        <nav className="flex items-center justify-center gap-6">
          <Link to="/about" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">About</Link>
          <Link to="/shows" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">Shows</Link>
          <Link to="/store" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">Store</Link>
          <Link to="/contact" className="text-white text-sm uppercase tracking-wider">Contact</Link>
        </nav>
        <div />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl text-brand-orange tracking-wider mb-10" style={{ fontFamily: "'Special Elite', cursive" }}>
          Contact
        </h1>

        {/* Facebook message button */}
        <div className="mb-10">
          <p className="text-gray-400 mb-4 text-sm uppercase tracking-wider">Booking &amp; general inquiries</p>
          <a
            href="https://www.facebook.com/dropliftband/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[#1877F2] text-white font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all"
          >
            <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Message us on Facebook
          </a>
          <p className="mt-4 text-gray-400 text-sm">or email us at contact@dropliftband.com.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-10" />

        {/* Email signup */}
        <div>
          <p className="text-gray-400 mb-2 text-sm uppercase tracking-wider">Join the mailing list</p>
          <p className="text-gray-500 text-sm mb-6">Be the first to hear about new music, shows, and merch.</p>

          {status === 'success' ? (
            <div className="border border-brand-orange rounded-lg p-6">
              <p className="text-brand-orange text-lg font-semibold">{message}</p>
              <p className="text-gray-400 text-sm mt-2">Check your email to confirm your signup.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                disabled={status === 'submitting'}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-6 py-3 bg-brand-orange text-black font-bold uppercase tracking-wider rounded-lg hover:bg-brand-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? '...' : 'Sign Up'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-3 text-red-500 text-sm">{message}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default Contact;
