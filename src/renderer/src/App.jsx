import { useState, useEffect } from "react";
import { FaPause, FaPlay, FaSpotify, FaSignOutAlt } from "react-icons/fa";

function App() {
  const [track, setTrack] = useState({
    title: "No song playing",
    artist: "",
    albumArt: "",
    progress: 0,
    duration: 0,
    isPlaying: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchCurrentlyPlaying = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) return;

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 204) return;
      const data = await res.json();

      if (data?.item) {
        setTrack({
          title: data.item.name,
          artist: data.item.artists.map(a => a.name).join(", "),
          albumArt: data.item.album.images[0]?.url || "",
          progress: data.progress_ms || 0,
          duration: data.item.duration_ms || 0,
          isPlaying: data.is_playing,
        });
      }
    } catch (error) {
      console.error("Error fetching song:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchCurrentlyPlaying, 5000);
    return () => clearInterval(interval);
  }, []);

 
  console.log('link de la caratura del album', track.albumArt);

  return (
    <div className="widget-container">
      <div className="widget">
        <div className="drag-bar">
          <span className="drag-placeholder"></span>
          {isLoggedIn ? (
            <button className="logout-button" onClick={() => { localStorage.removeItem("spotify_access_token"); setIsLoggedIn(false); }}>
              <FaSignOutAlt />
            </button>
          ) : (
            <button className="login-button" onClick={() => window.location.href = `https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=token&redirect_uri=YOUR_REDIRECT_URI&scope=user-read-playback-state user-modify-playback-state`}>
              <FaSpotify /> Iniciar sesión
            </button>
          )}
        </div>

        <div className="content">

          <div className="album-art">
            <img src={track.albumArt} alt="Album Art" />
          </div>

          <div className="info">
            <h3>{track.title}</h3>
            <p>{track.artist}</p>
          </div>

          {track.duration > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(track.progress / track.duration) * 100}%` }}></div>
              </div>
              <span className="time">
                {new Date(track.progress).toISOString().substr(14, 5)} / {new Date(track.duration).toISOString().substr(14, 5)}
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
