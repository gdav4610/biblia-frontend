import React, { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Link from "@mui/material/Link";

export default function BibleChapter({ book, chapter }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Estado para controlar qué strongNumber está siendo hoverizado
  const [hoveredStrong, setHoveredStrong] = useState(null);

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
        // alert(words + "("+ i + ","+ (i+kwLen)*1+"): " + words.slice(i, i + kwLen));
        // alert(kw  +" === " + candidateClean);
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
                  <span style={{ fontSize: "1.6em", marginTop: "0px"}}>{wordInfo.inflectionWord}</span>  (de <span style={{ fontSize: "1.6em", marginTop: "0px"}}>{wordInfo.sourceInflection}</span>) <br />
                  {wordInfo.transliteratedWord ? <em>{wordInfo.transliteratedWord}</em> : null} (de {wordInfo.sourceTransliteration ? <em>{wordInfo.sourceTransliteration}</em> : null}) <br />
                  {wordInfo.sourceMeaning} <br />
                  <Link
                    href={`/strongs/${wordInfo.strongNumber}`}
                    target="_blank"
                    underline="hover"
                    color="inherit"
                    style={{ fontSize: "1em", marginTop: "5px", display: "inline-block" }}
                  >
                    Ver detalle (Strong {wordInfo.strongNumber})
                  </Link>
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
      </Box>
    </Fade>
  );
}
