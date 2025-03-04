import { useState, useEffect } from "react";
import { FaSpotify, FaSignOutAlt, FaMusic } from "react-icons/fa";

function App() {
  const [track, setTrack] = useState({
    title: "No song playing",
    artist: "",
    albumArt: "",
    progress: 0,
    duration: 0,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔑 Environment variables
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing"
  ];

  // 🟢  Verifica sesión en localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken) {
      setIsLoggedIn(true); 
    }
  }, []);

  // 🟢 Guarda el token si se autentica
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");

      if (accessToken) {
        localStorage.setItem("spotify_access_token", accessToken);
        window.location.hash = "";
        setIsLoggedIn(true); 
      }
    }
  }, []);

  // 🔑 Login con Spotify
  const loginWithSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join("%20")}`;
    window.location.href = authUrl;
  };

  // 🔑 Function to log out
  const logout = () => {
    localStorage.removeItem("spotify_access_token");
    setIsLoggedIn(false);
    setTrack({ title: "", artist: "", albumArt: "", progress: 0, duration: 0 });
    //window.location.reload(); // Reload the page to clear the state
  };

  // 🎵 Get the current song
  const fetchCurrentlyPlaying = async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.status === 204) {
        // No music playing, use the last saved
        const lastTrack = JSON.parse(localStorage.getItem("lastTrack") || "{}");
        if (lastTrack.name) {
          setTrack({
            title: "No hay música reproduciéndose 🎧",
            artist: "",
            albumArt: "",
            progress: 0,
            duration: 0,
          });
          setIsLoading(false);
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
        console.error("Error al obtener la canción:", error);
      }
    } catch (error) {
      console.error("Error fetching currently playing song:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentlyPlaying();
      const interval = setInterval(fetchCurrentlyPlaying, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);


  // Calculate song progress as a percentage
  const progressPercentage = track.duration > 0 ? (track.progress / track.duration) * 100 : 0;

  return (
    <div className="widget-container container-fluid bg-dark text-white rounded-3 shadow-lg p-3" style={{ width: "320px" }}>
      {/* Barra superior de arrastre */}
      <div className="drag-bar d-flex justify-content-between align-items-center bg-secondary px-3 py-2 rounded-3">
        <span className="text-light small widget-title">
          <FaMusic className="me-1" />  
          Spotify Widget
        </span>

        {isLoggedIn ? (
          <button className="btn btn-sm btn-outline-danger" onClick={logout}>
            <FaSignOutAlt />
          </button>
        ) : (
          <button className="btn btn-sm btn-success d-flex align-items-center gap-2" onClick={loginWithSpotify}>
            <FaSpotify /> <span>Iniciar sesión</span>
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="d-flex align-items-center mt-3 content-widget">
        {!isLoggedIn && (
          <p className="text-secondary text-center w-100">No has iniciado sesión en Spotify 🎧</p>
        )}
        {isLoggedIn && track.title && (
          <>
            {/* Portada del álbum (izquierda) */}
            <div className="rounded-3 overflow-hidden shadow-sm" style={{ width: "80px", height: "80px" }}>
              {track.albumArt ? (
              <img src={track.albumArt} alt="Album Art" className="img-fluid w-100 h-100 object-fit-cover" />
              ) : (
              <div className="d-flex justify-content-center align-items-center h-100 bg-secondary text-white">
                <FaMusic size={32} />
              </div>
              )}
            </div>

            {/* Información de la canción (derecha) */}
            <div className="ms-3 flex-grow-1">
              <h3 className="h6 mb-1">{track.title}</h3>
              <p className="text-secondary small m-0">{track.artist}</p>

              {/* Barra de progreso */}
              {track.duration > 0 && (
                <div className="mt-2">
                  <div className="progress" style={{ height: "4px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${(track.progress / track.duration) * 100}%` }}
                    ></div>
                  </div>
                  <small className="text-secondary">
                    {new Date(track.progress).toISOString().substr(14, 5)} / {new Date(track.duration).toISOString().substr(14, 5)}
                  </small>
                </div>
              )}
            </div>
          </>
        )}
        {isLoggedIn && !track.title && (
          <p className="text-secondary text-center w-100">No hay música reproduciéndose 🎧</p>
        )}
      </div>
    </div>
  );

}



export default App;
