import React, { useState, useEffect } from 'react';
import LikeButton from './components/LikeButton';
import './App.css';

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  location?: string;
  date_created: string;
  tags: string[];
  likes_count: number;
}

function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/entries');
      const data = await response.json();
      setEntries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setLoading(false);
    }
  };

  // BUG 13: Function never updates the entries state when likes change
  const handleLikeChange = (entryId: number, newCount: number) => {
    console.log(`Entry ${entryId} now has ${newCount} likes`);
    // Missing: setEntries to update the likes count in the main state
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Journify - Your Travel Journal</h1>
      </header>
      <main>
        <div className="entries-container">
          {entries.map(entry => (
            <div key={entry.id} className="entry-card">
              <h3>{entry.title}</h3>
              <p>{entry.content}</p>
              {entry.location && <p className="location">📍 {entry.location}</p>}
              <div className="tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="entry-footer">
                <small>{new Date(entry.date_created).toLocaleDateString()}</small>
                <LikeButton 
                  entryId={entry.id}
                  initialLikesCount={entry.likes_count}
                  onLikeChange={(newCount) => handleLikeChange(entry.id, newCount)}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;