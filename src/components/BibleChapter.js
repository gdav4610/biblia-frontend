import React, { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import StrongDetail from "./StrongDetail";

export default function BibleChapter({ book, chapter }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Estado para controlar qué strongNumber está siendo hoverizado
  const [hoveredStrong, setHoveredStrong] = useState(null);
  // Estado para el modal de detalle Strong
  const [openStrongModal, setOpenStrongModal] = useState(false);
  const [selectedStrongInfo, setSelectedStrongInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/bible/chapter/${book}/${chapter}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el capítulo");
        return res.json();
      })
      .then((json) => {
        // Pequeño retraso para ver el efecto de fade
        setTimeout(() => {
          setData(json);
          setLoading(false);
        }, 400);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [book, chapter]);

  const openStrong = (wordInfo) => {
    setSelectedStrongInfo(wordInfo);
    setOpenStrongModal(true);
  };

  const closeStrong = () => {
    setOpenStrongModal(false);
    setSelectedStrongInfo(null);
  };

  if (error)
    return <p style={{ color: "red" }}>❌ Error al cargar: {error}</p>;

  if (loading)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
        <CircularProgress color="primary" />
        <p style={{ marginTop: "1rem" }}>Cargando {book} {chapter}...</p>
      </Box>
    );

  if (!data) return null;

  const { verses } = data;

  const renderVerse = (verse) => {

    const keywordMap = Object.fromEntries(
        (verse.keywords || []).map((k) => {
          const key = (k.translatedWord || "").toString();

          const normalized = {
            translatedWord: k.translatedWord,
            inflectionWord: k.inflectionWord,
            transliteratedWord: k.transliteratedWord,
            strongNumber: k.strongNumber,
            sourceTransliteration: k.sourceTransliteration,
            sourceInflection: k.sourceInflection,
            sourceMeaning: k.sourceMeaning,
            color: k.color,
          };

          return [key, normalized];
        })
    );

    const words = verse.text.split(" ");

    // Procesar texto: dividir y detectar frases
    const tokens = [];
    let i = 0;

    while (i < words.length) {
        // Intentar emparejar una frase clave (puede ser de varias palabras)
        const nextFew = words.slice(i, i + 5).join(" "); // mirar hasta 5 palabras

        const trimSpaces = (s = "") => s.toString().trim();

        // Intentar emparejar una palabra clave que traducida consiste de varias palabras
        const matchKeyword = Object.keys(keywordMap).find((kw) => {
          const kwLen = kw.split(" ").length;
          const candidate = words.slice(i, i + kwLen).join(" ");
          const candidateClean = trimSpaces(candidate); // solo trim de espacios
          return candidateClean === kw; // comparación exacta normalizada
        });


        if (matchKeyword) {  //palabras clave que traducidas son varias palabras

          const wordInfo = keywordMap[matchKeyword];
          const keywordsLength = matchKeyword.split(" ").length;

          tokens.push(
            <Tooltip
              key={`kw-${i}`}
              title={
                <div style={{ fontSize: "1.02rem" }}>
                  <span style={{ fontSize: "1.5em", marginTop: "0px"}}>{wordInfo.inflectionWord}</span>  (de <span style={{ fontSize: "1.5em", marginTop: "0px"}}>{wordInfo.sourceInflection}</span> ) <br />
                  {wordInfo.transliteratedWord ? <em>{wordInfo.transliteratedWord}</em> : null} (de {wordInfo.sourceTransliteration ? <em>{wordInfo.sourceTransliteration}</em> : null}) <br />
                  {wordInfo.sourceMeaning} <br />
                  <Button
                    onClick={() => openStrong(wordInfo)}
                    size="small"
                    style={{ color: '#a7e6a9', textTransform: 'none', padding: 0, minWidth: 0 }}
                  >
                    Ver detalle (Strong {wordInfo.strongNumber})
                  </Button>
                </div>
              }
              arrow
            >
              <span
                data-strong={wordInfo.strongNumber}
                data-llave={`strong-${wordInfo.strongNumber}`}
                onMouseEnter={() => setHoveredStrong(wordInfo.strongNumber)}
                onMouseLeave={() => setHoveredStrong(null)}
                style={{
                  color: "#36a33b",
                  cursor: "help",
                  fontWeight: hoveredStrong === wordInfo.strongNumber ? 700 : 500,
                  textDecoration: hoveredStrong === wordInfo.strongNumber ? "underline" : "none",
                }}
              >
                   {words.slice(i, i + keywordsLength).join(" ")}
              </span>
            </Tooltip>
          );

          i += keywordsLength; // saltar la serie de palabras completa

          tokens.push(" "); // espacio
          continue;

        }

        tokens.push(words[i]);

        tokens.push(" "); // espacio
        i++;
    }

    return (
      <p key={verse.verseNumber} style={{ marginBottom: "0.3rem", lineHeight: "1.6", marginTop: "0.3rem",}}>
        <strong>{verse.verseNumber} </strong>
        {tokens}
      </p>
    );
  };


  return (
    <Fade in={!loading} timeout={500}>
      <Box>
        <h2>
          {data.book} {data.chapter}
        </h2>
        {verses.map(renderVerse)}

        {/* Dialog para mostrar StrongDetail en modal */}
        <Dialog
          open={openStrongModal}
          onClose={closeStrong}
          fullWidth
          maxWidth="md"
          aria-labelledby="strong-dialog-title"
        >
          <DialogTitle id="strong-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {selectedStrongInfo ? `Strong ${selectedStrongInfo.strongNumber}` : 'Detalle Strong'}
            <IconButton onClick={closeStrong} size="small" aria-label="Cerrar">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedStrongInfo ? (
              <StrongDetail
                strongNumber={selectedStrongInfo.strongNumber}
                initialData={selectedStrongInfo}
                onClose={closeStrong}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
}
