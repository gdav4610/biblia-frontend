import React, { useEffect, useState, useMemo } from "react";
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


  // Calcular los 4 keywords más repetidos por strongNumber
  const topKeywords = useMemo(() => {
    if (!data || !data.verses) return [];
    const counts = {};
    data.verses.forEach((v) => {
      (v.keywords || []).forEach((k) => {
        const sn = (k.strongNumber || "").toString();
        if (!sn) return;
        // No contar el strongNumber H1961
        if (sn === "H1961") return;
        // Solo contar si sourceTransliteration no es nulo/empty
        if (!k.sourceTransliteration) return;
        if (!counts[sn]) {
          counts[sn] = {
            strongNumber: sn,
            sourceTransliteration: k.sourceTransliteration || "",
              sourceMeaning: k.sourceMeaning || "",
            count: 0,
          };
        }
        counts[sn].count += 1;
        // preferir sourceTransliteration no vacío
        if (!counts[sn].sourceTransliteration && k.sourceTransliteration) {
          counts[sn].sourceTransliteration = k.sourceTransliteration;
        }
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [data]);


  // Calcular los 4 compoundKeywords más repetidos por strongNumber
    const topCompoundKeywords = useMemo(() => {
      if (!data || !data.verses) return [];
      const counts = {};
      data.verses.forEach((v) => {
        (v.keywords || []).forEach((k) => {
          const sn = (k.strongNumber || "").toString();
          if (!sn) return;
          if (sn === "G5547 G2424") return;
          if (sn === "G2424 G5547") return;
          // Solo contar si compoundTransliteration no es nulo/empty
          if (!k.compoundTransliteration) return;
          if (!counts[sn]) {
            counts[sn] = {
              strongNumber: sn,
              compoundTransliteration: k.compoundTransliteration || "",
              compoundMeaning: k.compoundMeaning || "",
              count: 0,
            };
          }
          counts[sn].count += 1;
          // preferir compoundTransliteration no vacío
          if (!counts[sn].compoundTransliteration && k.compoundTransliteration) {
            counts[sn].compoundTransliteration = k.compoundTransliteration;
          }
        });
      });

      return Object.values(counts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 7);
    }, [data]);

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
        <p style={{ marginTop: "1rem" }}>Cargando capítulo...</p>
      </Box>
    );

  if (!data) return null;

  const { verses } = data;

  const renderVerse = (verse) => {

    const keywordMap = Object.fromEntries(
        (verse.keywords || []).map((k) => {
          const key = (k.translatedWord.trim() || "").toString();

          const normalized = {
            translatedWord: k.translatedWord.trim(),
            inflectionWord: k.inflectionWord,
            transliteratedWord: k.transliteratedWord,
            strongNumber: k.strongNumber,
            sourceTransliteration: k.sourceTransliteration,
            sourceInflection: k.sourceInflection,
            sourceMeaning: k.sourceMeaning,
            color: k.color,
            compoundTransliteration: k.compoundTransliteration,
            compoundInflection: k.compoundInflection,
            compoundMeaning: k.compoundMeaning,
          };

          return [key, normalized];
        })
    );

    const words = verse.text.split(" ");

    // Procesar texto: dividir y detectar frases
    const tokens = [];
    let i = 0;

    while (i < words.length) {
        // Si la palabra es el placeholder de salto de párrafo, insertar un salto de línea
        if (words[i] === '\\par' || words[i] === '\\\\par') {
          tokens.push(<br key={`br-${i}`} />);
          // mantener el espacio después del salto para consistencia visual
          tokens.push(" ");
          i++;
          continue;
        }

        // Intentar emparejar una frase clave (puede ser de varias palabras)
        const nextFew = words.slice(i, i + 5).join(" "); // mirar hasta 5 palabras

        const trimSpaces = (s = "") => s.toString().trim();

        // Intentar emparejar una palabra clave que traducida consiste de varias palabras
        const matchKeyword = Object.keys(keywordMap).find((kw) => {
          const kwLen = kw.split(" ").length;
          const candidate = words.slice(i, i + kwLen).join(" ");
          // Si el candidato termina en un signo de puntuación específico, quitar ese último carácter antes de comparar
          const removeTrailingPunctuation = (str = "") => {
            if (!str) return str;
            const last = str.charAt(str.length - 1);
            // quitar solo si el último carácter es uno de: punto, coma, dos puntos o punto y coma
            return ".,:;!?".includes(last) ? str.slice(0, -1) : str;
          };
          const candidateClean = trimSpaces(candidate); // solo trim de espacios
          // aplicar la eliminación condicional del punto final y comparar exactamente
          const candidateNoPunct = trimSpaces(removeTrailingPunctuation(candidateClean));
          return candidateNoPunct === kw; // comparación exacta
        });


        if (matchKeyword) {  //palabras clave que traducidas son varias palabras

          const wordInfo = keywordMap[matchKeyword];
          const keywordsLength = matchKeyword.split(" ").length;

          // Fallbacks para mostrar en el tooltip: si no viene sourceInflection usar compoundInflection,
          // si no viene sourceTransliteration usar compoundTransliteration
          const inflectionDisplay = wordInfo.sourceInflection || wordInfo.compoundInflection || '';
          const transliterationDisplay = wordInfo.sourceTransliteration || wordInfo.compoundTransliteration || '';

          tokens.push(
            <Tooltip
              key={`kw-${i}`}
              title={
                <div style={{ fontSize: "0.9rem" }}>
                   - Morfema: <span style={{ fontSize: "1.1em", marginTop: "0px"}}>{wordInfo.transliteratedWord}</span> ({wordInfo.inflectionWord ? <em>{wordInfo.inflectionWord}</em> : null}) <br />
                   - Lexema: <span style={{ fontSize: "1.1em", marginTop: "0px", wordBreak: 'break-word'}}>{transliterationDisplay}</span> ({inflectionDisplay ? <em>{inflectionDisplay}</em> : null}) <br />
                   { /* show sourceMeaning, or compoundMeaning if sourceMeaning is null/empty */ }
                   - Significado usual: {(wordInfo.sourceMeaning || wordInfo.compoundMeaning) ? (wordInfo.sourceMeaning || wordInfo.compoundMeaning) : ''} <br />
                   <Button
                     onClick={() => openStrong(wordInfo)}
                     size="small"
                     style={{ color: '#e0f2ff', textTransform: 'none', padding: 5, minWidth: 0 }}
                   >
                     Ver detalle (Strong {wordInfo.strongNumber})
                   </Button>
                 </div>
               }
               arrow
             >
             <i>
              <span
                data-strong={wordInfo.strongNumber}
                data-llave={`strong-${wordInfo.strongNumber}`}
                onMouseEnter={() => setHoveredStrong(wordInfo.strongNumber)}
                onMouseLeave={() => setHoveredStrong(null)}
                style={{
                  color: wordInfo.compoundMeaning ? '#60ba20' : "#3386d4",
                  cursor: "help",
                  fontWeight: hoveredStrong === wordInfo.strongNumber ? 700 : 500,
                  textDecoration: hoveredStrong === wordInfo.strongNumber ? "underline" : "none",
                }}
              >
                   {wordInfo.transliteratedWord} | {words.slice(i, i + keywordsLength).join(" ")}
              </span>
              </i>
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
      <div key={verse.verseNumber} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.3rem', marginTop: '0.3rem' }}>
        <div style={{ flex: '0 0 1rem', textAlign: 'right', paddingRight: '0.4rem', lineHeight: '1.6' }}>
          <strong>{verse.verseNumber}</strong>
        </div>
        <div style={{ flex: '1 1 auto', lineHeight: '1.6' }}>
          {tokens}
        </div>
      </div>
    );
  };


  return (
    <Fade in={!loading} timeout={500}>
      <Box>

        {/* Mostrar top 4 keywords en la parte superior */}
        {topKeywords && topKeywords.length > 0 && (() => {
            const filteredTopKeywords = topKeywords.filter(k => (k.count || 0) > 2);
            if (!filteredTopKeywords.length) return null;
            return (
              <Box mb={1}>
                <strong>Palabras clave:</strong>{' '}
                {filteredTopKeywords.map((k) => {
                   const isActive = hoveredStrong === k.strongNumber;
                   const handleActivate = () => {
                     if (isActive) {
                       // si ya está activo, simplemente quitar subrayado
                       setHoveredStrong(null);
                       return;
                     }

                     // limpiar cualquier subrayado previo
                     setHoveredStrong(null);
                     // en el siguiente tick fijar el strong seleccionado
                     setTimeout(() => setHoveredStrong(k.strongNumber), 0);
                   };

                   const handleKeyDown = (e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                       e.preventDefault();
                       handleActivate();
                     }
                   };

                   return (
                     <span
                       key={k.strongNumber}
                       onClick={handleActivate}
                       onKeyDown={handleKeyDown}
                       role="button"
                       tabIndex={0}
                       aria-pressed={isActive}
                       style={{
                         display: 'inline-block',
                         marginRight: '0.6rem',
                         padding: '0.18rem 0.45rem',
                         background: isActive ? '#c78c50' : '#dbb186',
                         borderRadius: '12px',
                         fontSize: '0.95rem',
                         cursor: 'pointer',
                         textDecoration: isActive ? 'underline' : 'none',
                         outline: 'none'
                       }}
                     >
                       {k.sourceTransliteration || `Strong ${k.strongNumber}`} | {k.sourceMeaning} ({k.count})
                     </span>
                   );
                 })}
               </Box>
            );
        })()}

        {/* Mostrar top keywords en la parte superior */}
        {topCompoundKeywords && topCompoundKeywords.length > 0 && (() => {
            const filteredTopCompound = topCompoundKeywords.filter(k => (k.count || 0) > 1);
            if (!filteredTopCompound.length) return null;
            return (
              <Box mb={1}>
                <strong>Frases clave:</strong>{' '}
                {filteredTopCompound.map((k) => {
                   const isActive = hoveredStrong === k.strongNumber;
                   const handleActivate = () => {
                     if (isActive) {
                       // si ya está activo, simplemente quitar subrayado
                       setHoveredStrong(null);
                       return;
                     }

                     // limpiar cualquier subrayado previo
                     setHoveredStrong(null);
                     // en el siguiente tick fijar el strong seleccionado
                     setTimeout(() => setHoveredStrong(k.strongNumber), 0);
                   };

                   const handleKeyDown = (e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                       e.preventDefault();
                       handleActivate();
                     }
                   };

                   return (
                     <span
                       key={k.strongNumber}
                       onClick={handleActivate}
                       onKeyDown={handleKeyDown}
                       role="button"
                       tabIndex={0}
                       aria-pressed={isActive}
                       style={{
                         display: 'inline-block',
                         marginRight: '0.6rem',
                         padding: '0.18rem 0.45rem',
                         background: isActive ? '#d19b64' : '#e3b88d',
                         borderRadius: '12px',
                         fontSize: '0.95rem',
                         cursor: 'pointer',
                         textDecoration: isActive ? 'underline' : 'none',
                         outline: 'none'
                       }}
                     >
                       {k.compoundTransliteration || `Strong ${k.strongNumber}`} - {k.compoundMeaning} ({k.count})
                     </span>
                   );
                 })}
               </Box>
            );
        })()}



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
                strongCode={selectedStrongInfo.strongNumber}
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
