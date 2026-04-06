import React from "react";
import { useParams, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function StrongDetail({ strongCode = null, strongNumber: propStrongNumber = null, initialData = null, onClose = null }) {
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
  // Valor inicial del strong: priorizar prop strongCode, luego strongNumber prop, luego initialData, luego ruta
  const initialStrong = strongCode || propStrongNumber || (initialData && initialData.strongNumber) || routeStrong;
  const [currentStrongCode, setCurrentStrongCode] = React.useState(initialStrong);

  const [data, setData] = React.useState(initialData || null);
  // Si se pasó initialData y corresponde al strong inicial, empezar con loading=false para mostrarla mientras refrescamos en background.
  const [loading, setLoading] = React.useState(initialData ? false : true);
  const [error, setError] = React.useState(false);

  // Nueva lógica para detalles: cuando el usuario hace click en el contador
  const [view, setView] = React.useState("stats"); // 'stats' | 'details'
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState(false);
  const [detailVerses, setDetailVerses] = React.useState(null);
  // Paginación
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  // Estado para mostrar el capítulo de la primera aparición
  const [chapterData, setChapterData] = React.useState(null);
  const [chapterLoading, setChapterLoading] = React.useState(false);
  const [chapterError, setChapterError] = React.useState(false);
  // Estado para incluir resultados de la Septuaginta (LXX). Persistido en localStorage.
  const [includeLXX, setIncludeLXX] = React.useState(() => {
    try {
      const s = localStorage.getItem('strongDetail.includeLXX');
      // Por defecto NO incluir LXX si no hay valor en localStorage
      return s === null ? false : s === 'true';
    } catch (e) {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('strongDetail.includeLXX', includeLXX ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [includeLXX]);

  // Última palabra seleccionada para ver detalles (para recargar si toggle LXX cambia)
  const [lastSelectedTransliteratedWord, setLastSelectedTransliteratedWord] = React.useState(null);
  // Flag para indicar que includeLXX fue toggled por el usuario y requiere recarga adicional
  const [includeLXXToggled, setIncludeLXXToggled] = React.useState(false);

  // Handler que limpia el modal y cambia includeLXX; la recarga la realiza el useEffect de stats
  const handleIncludeLXXChange = (checked) => {
    // limpiar vistas y datos del modal inmediatamente
    setData(null);
    setLoading(true);
    setError(false);
    setView('stats');
    setDetailVerses(null);
    setDetailsError(false);
    setDetailsLoading(false);
    setPage(1);
    // marcar que se hizo toggle para que la useEffect dispare la recarga de detalles si aplica
    setIncludeLXXToggled(true);
    setIncludeLXX(checked);
  };

  // Stack para recordar historial de strongs en el modal (para botón VOLVER)
  const [previousStack, setPreviousStack] = React.useState([]);
  // Flag para evitar realizar un fetch cuando restauramos un estado desde el historial
  const [skipNextFetch, setSkipNextFetch] = React.useState(false);
  // Ref para recordar el último texto que se resaltó (para detectar cambios entre llamadas)
  const lastHighlightedTextRef = React.useRef(null);

  // Si el currentStrongCode contiene un espacio, dividirlo en partes para mostrarlo separado
  const strongParts = currentStrongCode && String(currentStrongCode).includes(' ') ? String(currentStrongCode).split(' ') : [currentStrongCode];

  // Dividir data.transliteration en partes si contiene espacios (para mostrarlo en dos líneas)
  const transliterationParts = data && data.transliteration && String(data.transliteration).includes(' ') ? String(data.transliteration).split(' ') : [(data && (data.transliteration || data.transliteration === 0)) ? data.transliteration : ''];

  // Etiqueta dinámica: 'Desglose:' sólo si no hay parts (length < 2), de lo contrario 'Strong:'
  const displayLabel = (strongParts && strongParts.length < 2) ? 'Strong: ' : 'Composición: ';

  const displayTitle = (strongParts && strongParts.length < 2) ? 'Lexema: ' : 'Frase: ';

  // añadir cerca de otras constantes derivadas de currentStrongCode
  const isGreek = currentStrongCode && String(currentStrongCode).startsWith('G');

  // Nombre del libro de la primera aparición (mapear id a bookMapping)
  const firstAppBookName = (data && data.firstAppBook !== undefined && data.firstAppBook !== null)
    ? (bookMapping.find(b => b.id === Number(data.firstAppBook)) || {}).name || String(data.firstAppBook)
    : null;

  // Mostrar "LXX" antes del nombre del libro en la primera aparición si es griego y el libro es del A.T.
  const displayFirstAppBookName = (isGreek && data && data.firstAppBook !== undefined && data.firstAppBook !== null && Number(data.firstAppBook) <= 39)
    ? `(LXX) ${firstAppBookName}`
    : firstAppBookName;

  // Abrir el capítulo de la primera aparición y reemplazar el contenido del modal
  const openFirstAppearanceChapter = (bookId, chapter, verse) => {
    if (!bookId || chapter === undefined || chapter === null) return;

    // Guardar snapshot para poder volver
    try {
      const snapshot = {
        strongCode: currentStrongCode,
        data: data,
        view: view,
        detailVerses: detailVerses,
        page: page,
        detailsError: detailsError,
        chapterData: chapterData,
        chapterLoading: chapterLoading,
        chapterError: chapterError
      };
      setPreviousStack((s) => [...s, snapshot]);
    } catch (e) {
      // no bloquear
    }

    setChapterLoading(true);
    setChapterError(false);
    setChapterData(null);

    // Usar ID numérico del libro en la URL y agregar idVerse como query param si está disponible
    let url = `/api/bible/chapter/${encodeURIComponent(String(bookId))}/${encodeURIComponent(String(chapter))}`;
    if (verse !== undefined && verse !== null && String(verse) !== 'null') {
      url += `?idVerse=${encodeURIComponent(String(verse))}`;
    }

    // Si se solicita incluir resultados de la Septuaginta (LXX), agregar el query param apropiado
    if (includeLXX) {
      const sep = url.includes('?') ? '&' : '?';
//      url = `${url}${sep}includeLXX=${includeLXX ? 'true' : 'false'}`;
      url = `${url}${sep}includeLXX=${includeLXX ? 'false' : 'false'}`;
    }

    // Ejecutar fetch
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => {
        setChapterData(json);
        setView('chapter');
      })
      .catch(() => setChapterError(true))
      .finally(() => setChapterLoading(false));
  };

  React.useEffect(() => {
    if (!currentStrongCode) {
      setError(true);
      setLoading(false);
      return;
    }

    // Si hemos indicado saltar el siguiente fetch (porque restauramos desde el historial), limpiarlo y no hacer fetch
    if (skipNextFetch) {
      setSkipNextFetch(false);
      setLoading(false);
      return;
    }

    setError(false);

    // Obtener estadísticas del strong activo (currentStrongCode), incluyendo el filtro includeLXX.
    let statsUrl = `/api/strongs/${encodeURIComponent(currentStrongCode)}/stats`;
    try {
      const sep = statsUrl.includes('?') ? '&' : '?';
//      statsUrl = `${statsUrl}${sep}includeLXX=${includeLXX ? 'true' : 'false'}`;
      statsUrl = `${statsUrl}${sep}includeLXX=${includeLXX ? 'false' : 'false'}`;
    } catch (e) {
      // ignore
    }

    fetch(statsUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          setError(true);
        } else {
          setData(json);
          // Si includeLXXToggled está activo, volver a cargar los detalles con la última palabra seleccionada
          if (includeLXXToggled) {
            if (lastSelectedTransliteratedWord) {
              onCountClick(lastSelectedTransliteratedWord);
            }
            // independientemente de si había una palabra seleccionada, limpiar el flag para evitar recargas repetidas
            setIncludeLXXToggled(false);
          }
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [currentStrongCode, includeLXX]);

  // Resetear la página cada vez que cambian los detailVerses
  React.useEffect(() => {
    setPage(1);
  }, [detailVerses]);

  const totalPages = detailVerses ? Math.max(1, Math.ceil(detailVerses.length / pageSize)) : 0;
  const pagedVerses = detailVerses ? detailVerses.slice((page - 1) * pageSize, page * pageSize) : [];

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onCountClick = (transliteratedWord) => {
    if (!currentStrongCode) return;
    setDetailsLoading(true);
    setDetailsError(false);
    setDetailVerses(null);
    setLastSelectedTransliteratedWord(transliteratedWord); // Guardar la última palabra seleccionada

    // Construir URL: incluir includeLXX y opcionalmente transliteratedWord (si no es null)
    let url = `/api/strongs/${encodeURIComponent(currentStrongCode)}/details`;
    const params = [];
    if (transliteratedWord !== null && transliteratedWord !== undefined && transliteratedWord !== 'null') {
      params.push(`transliteratedWord=${encodeURIComponent(transliteratedWord)}`);
    }
//    params.push(`includeLXX=${includeLXX ? 'true' : 'false'}`);
    params.push(`includeLXX=${includeLXX ? 'false' : 'false'}`);
    if (params.length > 0) url = `${url}?${params.join('&')}`;

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


  const onCountClickTranslated = (translatedWord) => {
    if (!currentStrongCode) return;
    setDetailsLoading(true);
    setDetailsError(false);
    setDetailVerses(null);
    setLastSelectedTransliteratedWord(translatedWord); // Guardar la última palabra seleccionada

    // Construir URL: incluir includeLXX y opcionalmente translatedWord (si no es null)
    let url = `/api/strongs/${encodeURIComponent(currentStrongCode)}/details`;
    const params = [];
    if (translatedWord !== null && translatedWord !== undefined && translatedWord !== 'null') {
      params.push(`translatedWord=${encodeURIComponent(translatedWord)}`);
    }
//    params.push(`includeLXX=${includeLXX ? 'true' : 'false'}`);
    params.push(`includeLXX=${includeLXX ? 'false' : 'false'}`);
    if (params.length > 0) url = `${url}?${params.join('&')}`;

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

  // Cambiar el strongCode activo y recargar el modal con ese newStrong
  const changeStrong = (newStrong) => {
    if (!newStrong) return;

    // Guardar estado actual en el stack para permitir volver
    try {
      const snapshot = {
        strongCode: currentStrongCode,
        data: data,
        view: view,
        detailVerses: detailVerses,
        page: page,
        detailsError: detailsError
      };
      setPreviousStack((s) => [...s, snapshot]);
    } catch (e) {
      // en caso de error no bloquear el cambio
    }

    // reset estados relevantes
    setData(null);
    setLoading(true);
    setError(false);
    setView("stats");
    setDetailVerses(null);
    setDetailsError(false);
    setDetailsLoading(false);
    setPage(1);
    setCurrentStrongCode(newStrong);
  };

  // Restaurar el último strong del stack
  const goBackStrong = () => {
    setPreviousStack((stack) => {
      if (!stack || stack.length === 0) return stack;
      const newStack = [...stack];
      const last = newStack.pop();

      // Restaurar valores
      if (last) {
        // Evitar que el efecto haga un fetch adicional al restaurar valores desde el stack
        setSkipNextFetch(true);
        setCurrentStrongCode(last.strongCode);
        setData(last.data || null);
        setView(last.view || 'stats');
        setDetailVerses(last.detailVerses || null);
        setPage(last.page || 1);
        setDetailsError(last.detailsError || false);
        // Restaurar estado del capítulo si viene en el snapshot
        setChapterData(last.chapterData || null);
        setChapterLoading(last.chapterLoading || false);
        setChapterError(last.chapterError || false);
        setLoading(false);
      }

      return newStack;
    });
  };

  const renderHighlightedText = (text, match, appearanceIndex) => {
    if (!text) return text;
    if (!match) return text;
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const escaped = escapeRegExp(match);
    const regex = new RegExp(escaped, 'gi');

    const parts = [];
    let lastIndex = 0;
    let m;
    let count = 0;

    // Parseo seguro del appearanceIndex provisto por el caller
    const parsed = appearanceIndex != null ? parseInt(String(appearanceIndex).trim(), 10) : NaN;
    const providedTarget = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

    // Si el texto actual es distinto al último texto evaluado, forzar appearanceIndex = 1
    const forceFirstIfTextChanged = lastHighlightedTextRef.current !== text;

    while ((m = regex.exec(text)) !== null) {
      const matched = m[0];
      const idx = m.index;
      // push text before match
      if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));

      count += 1;
      // decidir objetivo: si forzamos por cambio de texto usar 1, sino usar el valor provisto (o null para resaltar todo)
      const target = forceFirstIfTextChanged ? 1 : providedTarget;
      const shouldHighlight = target === null ? true : (count === target);

      if (shouldHighlight) {
        parts.push(<span key={`hl-${count}`} style={{ color: 'red' }}>{matched}</span>);
      } else {
        parts.push(matched);
      }

      lastIndex = idx + matched.length;

      // avoid infinite loop on zero-length matches
      if (matched.length === 0) regex.lastIndex++;
    }

    // push remaining text
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));

    // actualizar el registro del último texto evaluado
    lastHighlightedTextRef.current = text;

    return parts;
  }

  // Reemplaza apariciones de "\\par" o "\par" por saltos de línea '\n'
  const replaceParWithNewline = (text) => {
    if (!text || typeof text !== 'string') return text;
    // Primero reemplazar '\\par' (doble barra) luego '\par' (simple)
    return text.replace(/\\\\par/g, '\n').replace(/\\par/g, '\n');
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
            <span>{displayTitle} {data.transliteration}</span> ({data.inflection})
        </Typography>
        <div>
          {previousStack && previousStack.length > 0 ? (
            <Button size="small" onClick={goBackStrong} style={{ marginRight: 8 }}>VOLVER</Button>
          ) : null}

        </div>
      </Box>

      <Typography variant="body2" gutterBottom>
          <strong>{displayLabel}</strong>{' '}
        {strongParts && strongParts.length > 1 ? (
          <span>
            {strongParts.map((part, idx) => (
              <Button
                key={`strong-part-${idx}`}
                size="small"
                variant="text"
                onClick={() => changeStrong(part)}
                style={{ padding: '2px 5px', minWidth: 0, marginRight: 5, textTransform: 'none' }}
              >
                {transliterationParts[idx]}
              </Button>
            ))}
          </span>
        ) : (
          <span>
        <a
                              href={`https://www.blueletterbible.org/lexicon/${encodeURIComponent(String(currentStrongCode))}/rvr60/tr/0-1/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginLeft: 12, fontSize: '0.9em' }}
                            >{strongParts[0]}
                            </a>
      </span>
    )}
      </Typography>

      {/* Mostrar 'Primera aparición' si viene en la respuesta */}
      {data && (data.firstAppBook !== undefined && data.firstAppBook !== null) && (
        <Typography variant="body2" gutterBottom>
          <strong>Primera aparición: </strong>
          <Button size="small" variant="text" onClick={() => openFirstAppearanceChapter(data.firstAppBook, data.firstAppChapter, data.firstAppVerse)} style={{ padding: '2px 6px', minWidth: 0, marginRight: 6, textTransform: 'none' }}>
            {firstAppBookName} {String(data.firstAppChapter)}:{String(data.firstAppVerse)}
          </Button>
        </Typography>
      )}


      <Typography variant="body2" gutterBottom>
        <strong>Significado usual:</strong>{' '}
        <span>{data.meaning}</span>
      </Typography>



      {strongParts && strongParts.length < 2 && (
        <Typography variant="body2" gutterBottom>
          <strong>Raíz: </strong>{isGreek && !String(data.idParent).startsWith("H") ? 'Griego — ' : 'Hebreo — '}
          {data && typeof data.idParent === 'string' && data.idParent === "" ? (
            (typeof data.parentMeaning === 'string' && data.parentMeaning === "") ? (
              <span>primaria</span>
            ) : (
              <span><i>{data.parentMeaning}</i></span>
            )
          ) : data && data.idParent ? (
            <Button size="small" onClick={() => changeStrong(data.idParent)} style={{ textTransform: 'none' }}>
              {data.parentMeaning}
            </Button>
          ) : (
            data && data.idParent
          )}
          {/* Si existe idParentSec y no es cadena vacía, mostrar un segundo botón con la misma funcionalidad */}
          {data && typeof data.idParentSec === 'string' && data.idParentSec !== "" ? (
            <Button size="small" onClick={() => changeStrong(data.idParentSec)} style={{ marginLeft: 10, textTransform: 'none' }}>
              {data.parentSecMeaning}
            </Button>
          ) : null}
        </Typography>
      )}


      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 10 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Morfemas individuales en la Biblia:</strong>
        </Typography>


        {/* Checkbox para incluir/excluir resultados

        {isGreek && (
          <FormControlLabel
            control={
              <Checkbox
                checked={includeLXX}
                onChange={(e) => handleIncludeLXXChange(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label="Incluir resultados de la Septuaginta (LXX)"
            style={{ marginLeft: 'auto', marginTop: 3 }}
          />
        )}
de la Septuaginta (LXX) - solo para Strongs griegos */}

      </Box>

      {/* Vista del capítulo obtenido (reemplaza el contenido del modal) */}
      {view === 'chapter' && (
        <Box>
          <Box mb={1}>
            <Button size="small" onClick={goBackStrong} style={{ marginRight: 8 }}>Volver</Button>
            {chapterLoading ? <CircularProgress size={18} /> : null}
            {chapterError ? <Typography color="error" variant="body2" component="span" style={{ marginLeft: 8 }}>Error al cargar capítulo</Typography> : null}
          </Box>

          {chapterData ? (
            <Box>
              {Array.isArray(chapterData.verses) ? (
                <ul>
                  {chapterData.verses.map((v, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      <Typography variant="h6">{displayFirstAppBookName} {String(data.firstAppChapter)}:{v.verseNumber}</Typography>{' '}
                      {(() => {
                        // Buscar en v.keywords el primer objeto cuyo strongNumber coincida con currentStrongCode
                        let translated = null;
                        if (v && Array.isArray(v.keywords)) {
                          const found = v.keywords.find(k => k && (String(k.strongNumber) === String(currentStrongCode) || String(k.idWord) === String(currentStrongCode)));
                          if (found) translated = found.transliteratedWord || null;
                        }
                        // Reemplazar '\\par' / '\par' por saltos de línea y respetar el white-space
                        const verseText = replaceParWithNewline(v.text);
                        return <div style={{ whiteSpace: 'pre-wrap' }}>{renderHighlightedText(verseText, translated, 1)}</div>;
                      })()}
                    </li>
                  ))}
                </ul>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(chapterData, null, 2)}</pre>
              )}
            </Box>
          ) : (
            !chapterLoading && <Typography variant="body2">No hay datos del capítulo.</Typography>
          )}
        </Box>
      )}


      {/* Vista: estadísticas (Transliterated) */}
      {view === "stats" && (
        <ul>
          {(data.keywordStats || []).map((ex, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              <span style={{ marginRight: 8 }}>{ex.transliteratedWord === "" ? "(Sin transliteración)" : ex.transliteratedWord}</span>
              <button
                onClick={() => onCountClick(ex.transliteratedWord)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: '0.95em'
                }}
                title={`Ver detalles para "${ex.transliteratedWord}"`}
              >
                {ex.count}
              </button>
            </li>
          ))}
        </ul>
      )}


      {/* Vista: estadísticas (Transliterated) */}
      {view === "stats" &&    (strongParts && strongParts.length < 2) &&
                              (data?.compoundRelatedList?.length > 0) && (
        <span>
        <p  style={{textIndent: 5 }}><strong>{data.transliteration}</strong> como parte de una frase importante:</p>
        <ul>
          {(data.compoundRelatedList || []).map((item, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              <Button
                key={`strong-item-${idx}`}
                size="small"
                variant="text"
                onClick={() => changeStrong(item.idWord)}
                style={{ padding: '0px 5px', minWidth: 0, marginRight: 10, textTransform: 'none' }}
              >
                {item.transliteratedWord} - {item.meaning}
              </Button>
              </li>
            ))}
        </ul>
        </span>
      )}


    <br />


      {/* Vista: estadísticas (Translated) */}
      {view === "stats" && (
          <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 10 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Traducciones en la Biblia:</strong>
            </Typography>
          </Box>
      )}


      {/* Vista: estadísticas (Translated) */}
      {view === "stats" && (
        <ul>
          {(data.keywordStatsTranslated || []).map((ex, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              <span style={{ marginRight: 8 }}>{ex.translatedWord === "" ? "(Sin traducción)" : ex.translatedWord}</span>
              <button
                onClick={() => onCountClickTranslated(ex.translatedWord)}
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
            {(pagedVerses || []).map((kv, i) => {
              const bookEntry = bookMapping.find((b) => b.id === kv.idBook);
              const bookName = bookEntry ? bookEntry.name : kv.idBook;
              // Si el strong actual es griego y el libro es del Antiguo Testamento (id <= 39), anteponer "LXX "
              const displayBookName = (isGreek && kv.idBook != null && Number(kv.idBook) <= 39) ? `(LXX) ${bookName}` : bookName;
               return (
                 <li key={i} style={{ marginBottom: 8 }}>
                   <div style={{ fontWeight: 600 }}>{kv.transliteratedWord === "" ? "(Sin transliteración)" : kv.transliteratedWord} ({kv.inflectionWord}) —  {kv.translatedWord ? `${kv.translatedWord}` : ''}</div>
                  <div style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap' }}>{displayBookName} {kv.chapter}:{kv.verseNumber} — {renderHighlightedText(replaceParWithNewline(kv.verseText), kv.translatedWord, kv.appearanceInVerse)}</div>
                 </li>
               );
             })}
          </ul>
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={1}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="small" />
            </Box>
          )}
        </Box>
      )}



      {/* Vista: estadísticas (Transliterated) */}
      {view === "stats" &&  (strongParts && strongParts.length >= 2) && (data?.compoundRelatedList?.length > 0) && (
        <span>
        <br />
        <strong>Frases relacionadas:</strong>
        <ul>
          {(data.compoundRelatedList || []).map((item, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>
              <Button
                key={`strong-item-${idx}`}
                size="small"
                variant="text"
                onClick={() => changeStrong(item.idWord)}
                style={{ padding: '0px 5px', minWidth: 0, marginRight: 10, textTransform: 'none' }}
              >
                {item.transliteratedWord} - {item.meaning}
              </Button>
              </li>
            ))}
        </ul>
        </span>
      )}


    </Box>
  );
}
