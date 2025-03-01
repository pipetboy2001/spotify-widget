import { useState, useEffect } from "react";
import { FaBackward, FaPlay, FaForward, FaSpotify, FaSignOutAlt } from "react-icons/fa";

function App() {
  const [track, setTrack] = useState({
    title: "No song playing",
    artist: "",
    albumArt: "",
    progress: 0,
    duration: 0,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to check if logged in

  // 🔑 Environment variables
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing"
  ];

  // 🟢 Check if already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken) {
      setIsLoggedIn(true); // If token exists, logged in
    }
  }, []);

  // 🟢 Save access token in localStorage
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");

      if (accessToken) {
        localStorage.setItem("spotify_access_token", accessToken);
        window.location.hash = ""; // Clear the URL
        setIsLoggedIn(true); // Mark user as logged in
      }
    }
  }, []);

  // 🔑 Function to log in with Spotify
  const loginWithSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join("%20")}`;
    window.location.href = authUrl;
  };

  // 🔑 Function to log out
  const logout = () => {
    localStorage.removeItem("spotify_access_token");
    setIsLoggedIn(false);
    window.location.reload(); // Reload the page to clear the state
  };

  // 🎵 Get the current song
  const fetchCurrentlyPlaying = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) return;

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.status === 204) {
        // No music playing, use the last saved
        const lastTrack = JSON.parse(localStorage.getItem("lastTrack") || "{}");
        if (lastTrack.name) {
          setTrack({
            title: lastTrack.name,
            artist: lastTrack.artists.map(a => a.name).join(", "),
            albumArt: "", // We won't use the image
            progress: 0,
            duration: lastTrack.duration_ms || 0,
          });
        }
        return;
      }

      const data = await res.json();
      if (data?.item) {
        //console.log("Track data:", data); // Debug: Show current song data
        localStorage.setItem("lastTrack", JSON.stringify(data.item)); // Save the last song
        setTrack({
          title: data.item.name,
          artist: data.item.artists.map(a => a.name).join(", "),
          albumArt: data.item.album.images[0].url,
          progress: data.progress_ms || 0,
          duration: data.item.duration_ms || 0,
        });
      } else {
        console.log("No song currently playing");
      }
    } catch (error) {
      console.error("Error fetching currently playing song:", error);
    }
  };

  // ⏯️ Start playback if Spotify is closed
  const startPlayback = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) return;

    const res = await fetch("https://api.spotify.com/v1/me/player", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();

    if (!data?.is_playing) {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    }
  };

  // ⏳ Auto-update the song every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchCurrentlyPlaying, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate song progress as a percentage
  const progressPercentage = (track.progress / track.duration) * 100;

  return (
    <div className="widget-container">
      <div className="widget">
        {/* Barra superior de arrastre */}
        <div className="drag-bar">
          <span className="drag-placeholder"></span> {/* Para mantener el botón alineado */}
          {isLoggedIn ? (
            <button className="logout-button" onClick={logout}>
              <FaSignOutAlt />
            </button>
          ) : (
            <button className="login-button" onClick={loginWithSpotify}>
              <FaSpotify /> Iniciar sesión
            </button>
          )}
        </div>

        <div className="content">
          <div className="info">
            <h3>{track.title}</h3>
            <p>{track.artist}</p>
          </div>

          {track.duration > 0 && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  }



export default App;
