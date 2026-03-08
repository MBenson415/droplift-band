import { useState } from 'react';

const splashVideo = '/droplift-splash.mov';

function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

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
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background video loop (muted, no controls = acts like a GIF) */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        src={splashVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* Band logo */}
        <img
          src="/droplift-logo.png"
          alt="Droplift"
          className="w-64 md:w-96 mb-2 drop-shadow-lg"
        />
        <p className="text-lg md:text-xl text-gray-400 tracking-[0.3em] uppercase mb-12">
          Post-Grunge
        </p>

        {/* Email signup */}
        <div className="w-full max-w-md">
          {status === 'success' ? (
            <div className="border border-brand-orange rounded-lg p-6">
              <p className="text-brand-orange text-lg font-semibold">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-black/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
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

        {/* Contact */}
        <div className="mt-10">
          <a
            href="https://www.facebook.com/dropliftband/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-orange transition-colors text-sm uppercase tracking-widest"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Message us on Facebook
          </a>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5]" />
    </div>
  );
}

export default App;
