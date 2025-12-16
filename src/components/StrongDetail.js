import React from "react";
import { useParams, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export default function StrongDetail({ strongNumber: propStrongNumber = null, initialData = null, onClose = null }) {
  // 📜 Lista de libros con IDs numéricos
  const bookMapping = [
    { id: 1, name: "Génesis" },
    { id: 2, name: "Éxodo" },
    { id: 3, name: "Levítico" },
    { id: 4, name: "Números" },
    { id: 5, name: "Deuteronomio" },
    { id: 6, name: "Josué" },
    { id: 7, name: "Jueces" },
    { id: 8, name: "Rut" },
    { id: 9, name: "1 Samuel" },
    { id: 10, name: "2 Samuel" },
    { id: 11, name: "1 Reyes" },
    { id: 12, name: "2 Reyes" },
    { id: 13, name: "1 Crónicas" },
    { id: 14, name: "2 Crónicas" },
    { id: 15, name: "Esdras" },
    { id: 16, name: "Nehemías" },
    { id: 17, name: "Ester" },
    { id: 18, name: "Job" },
    { id: 19, name: "Salmos" },
    { id: 20, name: "Proverbios" },
    { id: 21, name: "Eclesiastés" },
    { id: 22, name: "Cantares" },
    { id: 23, name: "Isaías" },
    { id: 24, name: "Jeremías" },
    { id: 25, name: "Lamentaciones" },
    { id: 26, name: "Ezequiel" },
    { id: 27, name: "Daniel" },
    { id: 28, name: "Oseas" },
    { id: 29, name: "Joel" },
    { id: 30, name: "Amós" },
    { id: 31, name: "Abdías" },
    { id: 32, name: "Jonás" },
    { id: 33, name: "Miqueas" },
    { id: 34, name: "Nahúm" },
    { id: 35, name: "Habacuc" },
    { id: 36, name: "Sofonías" },
    { id: 37, name: "Hageo" },
    { id: 38, name: "Zacarías" },
    { id: 39, name: "Malaquías" },
    { id: 40, name: "Mateo" },
    { id: 41, name: "Marcos" },
    { id: 42, name: "Lucas" },
    { id: 43, name: "Juan" },
    { id: 44, name: "Hechos" },
    { id: 45, name: "Romanos" },
    { id: 46, name: "1 Corintios" },
    { id: 47, name: "2 Corintios" },
    { id: 48, name: "Gálatas" },
    { id: 49, name: "Efesios" },
    { id: 50, name: "Filipenses" },
    { id: 51, name: "Colosenses" },
    { id: 52, name: "1 Tesalonicenses" },
    { id: 53, name: "2 Tesalonicenses" },
    { id: 54, name: "1 Timoteo" },
    { id: 55, name: "2 Timoteo" },
    { id: 56, name: "Tito" },
    { id: 57, name: "Filemón" },
    { id: 58, name: "Hebreos" },
    { id: 59, name: "Santiago" },
    { id: 60, name: "1 Pedro" },
    { id: 61, name: "2 Pedro" },
    { id: 62, name: "1 Juan" },
    { id: 63, name: "2 Juan" },
    { id: 64, name: "3 Juan" },
    { id: 65, name: "Judas" },
    { id: 66, name: "Apocalipsis" }
  ];

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

  const renderHighlightedText = (text, match) => {
    if (!text) return text;
    if (!match) return text;
    const escaped = match.replace(/[.*+?^${}()|[\\]\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const result = [];
    let lastIndex=0;
    let matchIndex=0;
    text.replace(regex, (m, offset)=>{
      result.push(text.slice(lastIndex, offset));
      result.push(<span key={'hl-'+matchIndex++} style={{color:'red'}}>{m}</span>);
      lastIndex = offset + m.length;
    });
    result.push(text.slice(lastIndex));
    return result;
  }

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
            {(detailVerses || []).map((kv, i) => {
              const bookEntry = bookMapping.find((b) => b.id === kv.idBook);
              const bookName = bookEntry ? bookEntry.name : kv.idBook;
              return (
                <li key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{kv.translatedWord} — {kv.inflectionWord} {kv.transliteratedWord ? `(${kv.transliteratedWord})` : ''}</div>
                  <div style={{ fontSize: '0.9em', color: '#555' }}>{bookName} {kv.chapter}:{kv.verseNumber} — {renderHighlightedText(kv.verseText, kv.translatedWord)}</div>
                </li>
              );
            })}
          </ul>
        </Box>
      )}

    </Box>
  );
}
