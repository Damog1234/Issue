import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

export default function GenLayerRankCheck() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const LOGO_URL = "https://files.oaiusercontent.com/file-afS1w3m1mUisKqGvTzK3Wv?se=2025-12-27T16%3A22%3A01Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D0f3938be-238d-4be7-8314-998845014f34.webp&sig=G/V7K99q13qf0V2XUbe/w%2BrvQ%2BOf7eJvG6%2BUz0/u7uA%3D";

  const getRankData = (lvl) => {
    if (lvl >= 54) return { label: 'SINGULARITY 🎖️🎊', color: '#22C55E' };
    if (lvl >= 36) return { label: 'BRAIN', color: '#A855F7' };
    if (lvl >= 18) return { label: 'SYNAPSE', color: '#3B82F6' };
    if (lvl >= 7)  return { label: 'NEURON', color: '#FB923C' };
    return { label: 'MOLECULE', color: '#FACC15' };
  };

  const getNextXP = (lvl) => 5 * (lvl ** 2) + 50 * lvl + 100;

  const handleSearch = useCallback(async (targetName, isSilent = false) => {
    const searchTarget = targetName || query;
    if (!searchTarget) return;
    
    if (isSilent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const controller = new AbortController();
      // INCREASED TO 60 SECONDS FOR 2G/3G STABILITY
      const timeoutId = setTimeout(() => controller.abort(), 60000); 

      const res = await fetch(`/api/stats?username=${encodeURIComponent(searchTarget)}`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setError('');
        setLastUpdated(new Date().toLocaleTimeString());
      } else if (!isSilent) {
        setError("User not in Top 2000.");
      }
    } catch (e) {
      if (!isSilent) {
        setError(e.name === 'AbortError' ? "Network too slow. Waiting..." : "Connection error.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => handleSearch(user.username, true), 120000);
    return () => clearInterval(interval);
  }, [user, handleSearch]);

  const activeColor = user ? getRankData(user.level).color : '#333';

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <Head>
        <title>GenLayer Rank Check</title>
        <meta name="theme-color" content={activeColor} />
      </Head>

      {/* BACKGROUND LOGO */}
      <img src={LOGO_URL} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '900px', opacity: '0.04', pointerEvents: 'none', zIndex: '0' }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: '1' }}>
        
        {/* HEADER LOGO */}
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <img src={LOGO_URL} style={{ width: '120px', marginBottom: '15px' }} alt="GenLayer Logo" />
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '3px' }}>GENLAYER RANK CHECK</h1>
          {isRefreshing && <div style={{ color: '#22C55E', fontSize: '10px' }}>● LIVE REFRESHING</div>}
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          
          <div style={{ flex: '1', minWidth: '320px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                style={{ flex: 1, padding: '16px', borderRadius: '12px', border: `2px solid ${activeColor}`, backgroundColor: '#111', color: '#fff' }}
                placeholder="Username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={() => handleSearch()} style={{ padding: '0 25px', backgroundColor: '#fff', color: '#000', borderRadius: '12px', fontWeight: 'bold' }}>
                {loading ? 'WAIT' : 'SCAN'}
              </button>
            </div>

            {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}

            {user && (
              <div style={{ background: 'rgba(15,15,15,0.9)', padding: '40px', borderRadius: '40px', border: `3px solid ${getRankData(user.level).color}`, textAlign: 'center' }}>
                <img 
                  src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`} 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', border: `3px solid ${getRankData(user.level).color}`, marginBottom: '15px' }}
                />
                <h2 style={{ color: getRankData(user.level).color, fontSize: '36px', fontWeight: '900' }}>{user.username.toUpperCase()}</h2>
                <p style={{ color: '#666', fontSize: '12px' }}>RANK #{user.rank}</p>

                <div style={{ margin: '20px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                    <span>LEVEL {user.level}</span>
                    <span>{user.message_xp} XP</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#222', borderRadius: '10px', marginTop: '5px' }}>
                    <div style={{ width: `${(user.message_xp / getNextXP(user.level)) * 100}%`, height: '100%', background: getRankData(user.level).color, borderRadius: '10px' }}></div>
                  </div>
                </div>

                <h1 style={{ color: getRankData(user.level).color, fontStyle: 'italic' }}>{getRankData(user.level).label}</h1>
                <p style={{ fontSize: '9px', color: '#444' }}>LAST UPDATED: {lastUpdated}</p>
              </div>
            )}
          </div>

          {/* RANK STRUCTURE LIST */}
          <div style={{ width: '300px', background: '#0a0a0a', padding: '30px', borderRadius: '30px', border: '1px solid #222' }}>
            <h3 style={{ fontSize: '10px', color: '#444', letterSpacing: '2px' }}>CLASSIFICATION</h3>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 'bold' }}>
              <div style={{ color: '#FACC15' }}>Molecule level 1-6</div>
              <div style={{ color: '#FB923C' }}>Neuron level 7-17</div>
              <div style={{ color: '#3B82F6' }}>Synapse level 18-35</div>
              <div style={{ color: '#A855F7' }}>Brain level 36-53</div>
              <div style={{ color: '#22C55E' }}>Singularity level 54+</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
