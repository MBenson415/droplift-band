import { useState, useEffect } from 'react';

const ALLOWED_EMAIL = 'marshall@clinedge.io';

function buildDevPrincipal(email) {
  return btoa(
    JSON.stringify({
      identityProvider: 'aad',
      userId: 'dev_user_id',
      userDetails: email,
      userRoles: ['authenticated'],
    })
  );
}

function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function getUserInfo() {
      try {
        const response = await fetch('/.auth/me');
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const payload = await response.json();
        const principal = payload?.clientPrincipal;
        if (principal) {
          setUser({
            name: principal.userDetails,
            email: principal.userDetails?.toLowerCase(),
          });
        }
      } catch {
        // Local Vite-only dev can fall back to manual mock login.
      } finally {
        setLoading(false);
      }
    }

    getUserInfo();
  }, []);

  const handleLogin = (event) => {
    if (import.meta.env.DEV) {
      event.preventDefault();
      setUser({
        name: ALLOWED_EMAIL,
        email: ALLOWED_EMAIL,
      });
      return;
    }
  };

  const handleLogout = (event) => {
    if (import.meta.env.DEV) {
      event.preventDefault();
      setUser(null);
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl text-white tracking-widest mb-8" style={{ fontFamily: "'Special Elite', cursive" }}>
          DROPLIFT ADMIN
        </h1>
        <a
          href="/.auth/login/aad?post_login_redirect_uri=/admin"
          onClick={handleLogin}
          className="px-6 py-3 bg-brand-orange text-black font-bold uppercase tracking-wider rounded-lg hover:bg-brand-orange-light transition-colors"
        >
          Continue with Microsoft
        </a>
      </div>
    );
  }

  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl text-white tracking-widest mb-4" style={{ fontFamily: "'Special Elite', cursive" }}>
          ACCESS DENIED
        </h1>
        <p className="text-gray-400 mb-6">Signed in as {user.email}</p>
        <a
          href="/.auth/logout?post_logout_redirect_uri=/admin"
          onClick={handleLogout}
          className="text-brand-orange hover:underline text-sm uppercase tracking-widest"
        >
          Sign out
        </a>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('sending');
    setResult(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (import.meta.env.DEV && user?.email) {
        headers['x-ms-client-principal'] = buildDevPrincipal(user.email);
      }

      const res = await fetch('/api/mgmt/generate-download', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('sent');
        setResult(data);
        setEmail('');
      } else {
        setStatus('error');
        setResult(data);
      }
    } catch {
      setStatus('error');
      setResult({ error: 'Connection failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl text-white tracking-widest mb-2" style={{ fontFamily: "'Special Elite', cursive" }}>
        DROPLIFT ADMIN
      </h1>
      <p className="text-gray-500 text-sm mb-10">Signed in as {user.email}</p>

      <div className="w-full max-w-md">
        <h2 className="text-white text-lg font-semibold mb-4">Send Download Link</h2>
        <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Recipient email"
            className="flex-1 px-4 py-3 bg-black/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
            disabled={status === 'sending'}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-6 py-3 bg-brand-orange text-black font-bold uppercase tracking-wider rounded-lg hover:bg-brand-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? '…' : 'Send'}
          </button>
        </form>

        {status === 'sent' && result && (
          <div className="mt-4 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 text-sm font-semibold">{result.message}</p>
            <p className="text-gray-500 text-xs mt-1">Expires: {new Date(result.expiresAt).toLocaleString()}</p>
          </div>
        )}

        {status === 'error' && result && (
          <p className="mt-3 text-red-500 text-sm">{result.error}</p>
        )}
      </div>

      <a
        href="/.auth/logout?post_logout_redirect_uri=/admin"
        onClick={handleLogout}
        className="mt-12 text-gray-500 hover:text-brand-orange text-sm uppercase tracking-widest transition-colors"
      >
        Sign out
      </a>
    </div>
  );
}

export default Admin;
