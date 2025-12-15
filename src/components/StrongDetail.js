import React from "react";
import { useParams, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function StrongDetail() {
  const { strongCode } = useParams();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/strongs/${strongCode}/stats`)
      .then((res) => res.json())
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
        <Link to="/">Volver al capítulo</Link>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {data.transliteration} (Strong {strongCode})
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Significado:</strong> {data.meaning}
      </Typography>
      <Typography variant="body2" gutterBottom>
        <strong>Inflexion:</strong> {data.inflection}
      </Typography>
      <Typography variant="body2" gutterBottom>
        <strong>Origen:</strong> {data.idParent}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Ocurrencias en la Biblia:</strong>
      </Typography>
      <ul>
        {data.keywordStats.map((ex, idx) => (
          <li key={idx}>{ex.translatedWord} ({ex.count})</li>
        ))}
      </ul>
    </Box>
  );
}
