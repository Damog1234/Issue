import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

export default function GenLayerRankCheck() {
  const [query, setQuery] = useState('');
  const [allMembers, setAllMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const LOGO_URL = "https://www.genlayer.com/favicon.ico"; // Fast direct link

  const getRankData = (lvl) => {
    if (lvl >= 54) return { label: 'SINGULARITY 🎖️🎊', color: '#22C55E' };
    if (lvl >= 36) return { label: 'BRAIN', color: '#A855F7' };
    if (lvl >= 18) return { label: 'SYNAPSE', color: '#3B82F6' };
    if (lvl >= 7)  return { label: 'NEURON', color: '#FB923C' };
    return { label: 'MOLECULE', color: '#FACC15' };
  };

  // Load all 5000 members once on page load
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setAllMembers(data);
        setLoading(false);
      });
  }, []);

  // AUTO-SUGGEST LOGIC (Type "Gem" -> see "Gemini")
  useEffect(() => {
    if (query.length > 1) {
      const filtered = allMembers
        .filter(m => m.username.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, allMembers]);

  const selectUser = (selectedUser) => {
    setUser({ ...selectedUser, rank: allMembers.findIndex(m => m.id === selectedUser.id) + 1 });
    setQuery(selectedUser.username);
    setSuggestions([]);
  };

  const activeColor = user ? getRankData(user.level).color : '#333';

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <Head><title>GenLayer Rank Check</title></Head>

      {/* BACKGROUND LOGO */}
      <img src={LOGO_URL} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', opacity: '0.05', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: '10' }}>
        
        {/* BOLD TOP LOGO */}
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={LOGO_URL} style={{ width: '100px', marginBottom: '10px', filter: 'drop-shadow(0 0 10px #fff)' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '2px' }}>GENLAYER RANK CHECK</h1>
          {loading && <p style={{ color: '#555', fontSize: '12px' }}>Syncing 5,000 members...</p>}
        </header>

        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <input 
            style={{ width: '100%', padding: '20px', borderRadius: '15px', border: `2px solid ${activeColor}`, backgroundColor: '#111', color: '#fff', fontSize: '18px' }}
            placeholder="Type username (e.g. Gem...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          {/* SUGGESTION DROPDOWN */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', width: '100%', backgroundColor: '#111', borderRadius: '0 0 15px 15px', border: '1px solid #333', zIndex: '20' }}>
              {suggestions.map(s => (
                <div key={s.id} onClick={() => selectUser(s)} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #222', color: getRankData(s.level).color }}>
                  {s.username} (Level {s.level})
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <div style={{ background: 'rgba(10,10,10,0.9)', padding: '40px', borderRadius: '40px', border: `3px solid ${getRankData(user.level).color}`, textAlign: 'center' }}>
            <h2 style={{ color: getRankData(user.level).color, fontSize: '42px', fontWeight: '900', margin: '0' }}>{user.username.toUpperCase()}</h2>
            <p style={{ color: '#666' }}>GLOBAL RANK #{user.rank}</p>
            
            <div style={{ margin: '30px 0', textAlign: 'left' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: getRankData(user.level).color }}>
                  <span>LEVEL {user.level}</span>
                  <span>{user.message_xp} XP</span>
               </div>
               <div style={{ width: '100%', height: '12px', background: '#222', borderRadius: '10px', marginTop: '10px' }}>
                  <div style={{ width: `${(user.message_xp / (5 * (user.level ** 2) + 50 * user.level + 100)) * 100}%`, height: '100%', background: getRankData(user.level).color, borderRadius: '10px' }}></div>
               </div>
            </div>

            <h1 style={{ color: getRankData(user.level).color, fontSize: '32px', fontStyle: 'italic' }}>{getRankData(user.level).label}</h1>
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: '#FACC15' }}>Molecule 1-6</span>
            <span style={{ color: '#FB923C' }}>Neuron 7-17</span>
            <span style={{ color: '#3B82F6' }}>Synapse 18-35</span>
            <span style={{ color: '#A855F7' }}>Brain 36-53</span>
            <span style={{ color: '#22C55E' }}>Singularity 54+</span>
        </div>
      </div>
    </div>
  );
  }
