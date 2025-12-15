import React from "react";
import { useParams, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export default function StrongDetail({ strongNumber: propStrongNumber = null, initialData = null, onClose = null }) {
  // Si no se proporciona como prop, intentar leer de la ruta
  const routeParams = useParams();
  const routeStrong = routeParams.strongCode || routeParams.strongNumber || routeParams.id || null;
  // Asegurarse de derivar el código Strong también desde initialData si se pasó
  const strongCode = propStrongNumber || (initialData && initialData.strongNumber) || routeStrong;

  const [data, setData] = React.useState(initialData || null);
  // Si se pasó initialData, empezar con loading=false para mostrarla mientras refrescamos en background.
  const [loading, setLoading] = React.useState(initialData ? false : true);
  const [error, setError] = React.useState(false);

  // Nueva lógica para detalles: cuando el usuario hace click en el contador
  const [view, setView] = React.useState("stats"); // 'stats' | 'details'
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState(false);
  const [detailVerses, setDetailVerses] = React.useState(null);

  React.useEffect(() => {
    if (!strongCode) {
      setError(true);
      setLoading(false);
      return;
    }

    setError(false);

    // Obtener estadísticas del strong. Usar ruta relativa para evitar problemas de CORS en desarrollo.
    fetch(`/api/strongs/${encodeURIComponent(strongCode)}/stats`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          setError(true);
        } else {
          setData(json);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [strongCode]);

  const onCountClick = (translatedWord) => {
    if (!strongCode) return;
    setDetailsLoading(true);
    setDetailsError(false);
    setDetailVerses(null);

    // Usar ruta relativa para respetar proxy/deployment
    const url = `/api/strongs/${encodeURIComponent(strongCode)}/details?translatedWord=${encodeURIComponent(translatedWord)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => {
        // Se espera que el JSON contenga `keywordsWithVerse` (array)
        if (json && Array.isArray(json.keywordsWithVerse)) {
          setDetailVerses(json.keywordsWithVerse);
          setView("details");
        } else {
          setDetailsError(true);
        }
      })
      .catch(() => setDetailsError(true))
      .finally(() => setDetailsLoading(false));
  };

  const backToStats = () => {
    setView("stats");
    setDetailVerses(null);
    setDetailsError(false);
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h6">Cargando información...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={3}>
        <Typography variant="h5">Código Strong no encontrado</Typography>
        {onClose ? (
          <Button variant="contained" color="primary" onClick={onClose} style={{ marginTop: 12 }}>
            Cerrar
          </Button>
        ) : (
          <Link to="/">Volver al capítulo</Link>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom data-testid="strong-title">
          {data.transliteration || data.transliteration === 0 ? data.transliteration : ""} (Strong {strongCode})
        </Typography>
        {onClose ? (
          <Button onClick={onClose} size="small" variant="outlined">Cerrar</Button>
        ) : null}
      </Box>

      <Typography variant="body2" gutterBottom>
        <strong>Significado:</strong> {data.meaning}
      </Typography>
      <Typography variant="body2" gutterBottom>
        <strong>Inflexion:</strong> {data.inflection}
      </Typography>
      <Typography variant="body2" gutterBottom>
        <strong>Origen:</strong> {data.idParent}
      </Typography>

      <Typography variant="body1" gutterBottom style={{ marginTop: 10 }}>
        <strong>Ocurrencias en la Biblia:</strong>
      </Typography>

      {/* Vista: estadísticas (lista original) */}
      {view === "stats" && (
        <ul>
          {(data.keywordStats || []).map((ex, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              <span style={{ marginRight: 8 }}>{ex.translatedWord}</span>
              <button
                onClick={() => onCountClick(ex.translatedWord)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '0.95em'
                }}
                title={`Ver detalles para "${ex.translatedWord}"`}
              >
                {ex.count}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Vista: detalles (keywordsWithVerse) */}
      {view === "details" && (
        <Box>
          <Box mb={1}>
            <Button size="small" onClick={backToStats} style={{ marginRight: 8 }}>Volver</Button>
            {detailsLoading ? <CircularProgress size={18} /> : null}
            {detailsError ? <Typography color="error" variant="body2" component="span" style={{ marginLeft: 8 }}>Error al cargar detalles</Typography> : null}
          </Box>

          {detailVerses && detailVerses.length === 0 && (
            <Typography variant="body2">No se encontraron ocurrencias detalladas.</Typography>
          )}

          <ul>
            {(detailVerses || []).map((kv, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{kv.translatedWord} — {kv.inflectionWord} {kv.transliteratedWord ? `(${kv.transliteratedWord})` : ''}</div>
                <div style={{ fontSize: '0.9em', color: '#555' }}>{kv.verseText}</div>
                <div style={{ fontSize: '0.85em', color: '#777' }}>Libro: {kv.idBook}, Capítulo: {kv.chapter}, Versículo: {kv.verseNumber}</div>
              </li>
            ))}
          </ul>
        </Box>
      )}

    </Box>
  );
}
