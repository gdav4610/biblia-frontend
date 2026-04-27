import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import apiFetch from "../utils/apiFetch";

export default function ChapterSelector({ onSelect }) {
  const [bookId, setBookId] = useState(() => {
    try {
      const s = localStorage.getItem("chapterSelector.bookId");
      return s ? Number(s) : 1;
    } catch (e) {
      return 1;
    }
  });

  const [chapter, setChapter] = useState(() => {
    try {
      const s = localStorage.getItem("chapterSelector.chapter");
      return s ? Number(s) : 1;
    } catch (e) {
      return 1;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  // Paginación para resultados de búsqueda
  const [searchPage, setSearchPage] = useState(0);
  const pageSize = 10; // mostrar 5 versículos por página

  // 📜 Lista de libros con IDs numéricos
  const oldTestament = [
    { id: 1, name: "Génesis", capitulos: 50 },
    { id: 2, name: "Éxodo", capitulos: 40 },
    { id: 3, name: "Levítico", capitulos: 27 },
    { id: 4, name: "Números", capitulos: 36 },
    { id: 5, name: "Deuteronomio", capitulos: 34 },
    { id: 6, name: "Josué", capitulos: 24 },
    { id: 7, name: "Jueces", capitulos: 21 },
    { id: 8, name: "Rut", capitulos: 4 },
    { id: 9, name: "1 Samuel", capitulos: 31 },
    { id: 10, name: "2 Samuel", capitulos: 24 },
    { id: 11, name: "1 Reyes", capitulos: 22 },
    { id: 12, name: "2 Reyes", capitulos: 25 },
    { id: 13, name: "1 Crónicas", capitulos: 29 },
    { id: 14, name: "2 Crónicas", capitulos: 36 },
    { id: 15, name: "Esdras", capitulos: 10 },
    { id: 16, name: "Nehemías", capitulos: 13 },
    { id: 17, name: "Ester", capitulos: 10 },
    { id: 18, name: "Job", capitulos: 42 },
    { id: 19, name: "Salmos", capitulos: 150 },
    { id: 20, name: "Proverbios", capitulos: 31 },
    { id: 21, name: "Eclesiastés", capitulos: 12 },
    { id: 22, name: "Cantares", capitulos: 8 },
    { id: 23, name: "Isaías", capitulos: 66 },
    { id: 24, name: "Jeremías", capitulos: 52 },
    { id: 25, name: "Lamentaciones", capitulos: 5 },
    { id: 26, name: "Ezequiel", capitulos: 48 },
    { id: 27, name: "Daniel", capitulos: 12 },
    { id: 28, name: "Oseas", capitulos: 14 },
    { id: 29, name: "Joel", capitulos: 3 },
    { id: 30, name: "Amós", capitulos: 9 },
    { id: 31, name: "Abdías", capitulos: 1 },
    { id: 32, name: "Jonás", capitulos: 4 },
    { id: 33, name: "Miqueas", capitulos: 7 },
    { id: 34, name: "Nahúm", capitulos: 3 },
    { id: 35, name: "Habacuc", capitulos: 3 },
    { id: 36, name: "Sofonías", capitulos: 3 },
    { id: 37, name: "Hageo", capitulos: 2 },
    { id: 38, name: "Zacarías", capitulos: 14 },
    { id: 39, name: "Malaquías", capitulos: 4 }
  ];

  const newTestament = [
    { id: 40, name: "Mateo", capitulos: 28 },
    { id: 41, name: "Marcos", capitulos: 16 },
    { id: 42, name: "Lucas", capitulos: 24 },
    { id: 43, name: "Juan", capitulos: 21 },
    { id: 44, name: "Hechos", capitulos: 28 },
    { id: 45, name: "Romanos", capitulos: 16 },
    { id: 46, name: "1 Corintios", capitulos: 16 },
    { id: 47, name: "2 Corintios", capitulos: 13 },
    { id: 48, name: "Gálatas", capitulos: 6 },
    { id: 49, name: "Efesios", capitulos: 6 },
    { id: 50, name: "Filipenses", capitulos: 4 },
    { id: 51, name: "Colosenses", capitulos: 4 },
    { id: 52, name: "1 Tesalonicenses", capitulos: 5 },
    { id: 53, name: "2 Tesalonicenses", capitulos: 3 },
    { id: 54, name: "1 Timoteo", capitulos: 6 },
    { id: 55, name: "2 Timoteo", capitulos: 4 },
    { id: 56, name: "Tito", capitulos: 3 },
    { id: 57, name: "Filemón", capitulos: 1 },
    { id: 58, name: "Hebreos", capitulos: 13 },
    { id: 59, name: "Santiago", capitulos: 5 },
    { id: 60, name: "1 Pedro", capitulos: 5 },
    { id: 61, name: "2 Pedro", capitulos: 3 },
    { id: 62, name: "1 Juan", capitulos: 5 },
    { id: 63, name: "2 Juan", capitulos: 1 },
    { id: 64, name: "3 Juan", capitulos: 1 },
    { id: 65, name: "Judas" , capitulos: 1 },
    { id: 66, name: "Apocalipsis", capitulos: 22 }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // submit ya no hace nada porque onSelect se invoca desde el useEffect al cambiar bookId/capítulo
  };

  // Helper: obtiene el libro por ID desde OT o NT
  const getBookById = (id) => {
    return oldTestament.find((b) => b.id === id) || newTestament.find((b) => b.id === id);
  };

  // Cuando cambia el bookId o chapter, clampea, guarda en localStorage y notifica con onSelect
  useEffect(() => {
    const book = getBookById(bookId);
    const maxChapters = book ? book.capitulos : 1;
    let clamped = Math.max(1, Math.min(chapter, maxChapters));
    if (clamped !== chapter) {
      setChapter(clamped);
      return; // espera al siguiente ciclo para invocar onSelect con el capítulo clampeado
    }

    try {
      localStorage.setItem("chapterSelector.bookId", String(bookId));
      localStorage.setItem("chapterSelector.chapter", String(clamped));
    } catch (e) {
      // ignore
    }

    onSelect(bookId, clamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter]);

  const handlePrev = () => {
    if (chapter > 1) {
      const newChapter = chapter - 1;
      setChapter(newChapter);
    }
  };

  const handleNext = () => {
    const book = getBookById(bookId);
    const maxChapters = book ? book.capitulos : Infinity;
    const newChapter = Math.min(chapter + 1, maxChapters);
    setChapter(newChapter);
  };

  // Búsqueda: llama al endpoint y abre modal con resultados
  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const q = (searchQuery || "").trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);

    // --- Real request to backend using apiFetch ---
    try {
      const encoded = encodeURIComponent(q);
      // Asumimos un endpoint REST en /api/bible/search?q=... que devuelve { verses: [...] }
      const url = `/api/bible/search?q=${encoded}`;
      const resp = await apiFetch(url, { method: 'GET' });

      if (!resp.ok) {
        const text = await resp.text().catch(() => null);
        throw new Error(`Error ${resp.status}${text ? `: ${text}` : ''}`);
      }

      const json = await resp.json().catch(() => null);

      // Normalizar la estructura esperada: preferimos json.verses o json
      const source = (json && (Array.isArray(json.verses) ? json.verses : (Array.isArray(json) ? json : (json && json.results) ? json.results : []))) || [];

      // Normalizar/flatten por si la respuesta tiene objetos de verso anidados dentro de `keywords`
      const normalizeVerses = (input) => {
        const out = [];
        const walk = (item) => {
          if (!item) return;
          // Si parece un verso (contiene text y verseNumber)
          if (item.text && (typeof item.verseNumber === 'number' || typeof item.verseNumber === 'string')) {
            // Filtrar keywords que sean verdaderos keywords (no versos anidados)
            const kws = Array.isArray(item.keywords)
              ? item.keywords.filter(k => !(k && (k.text || k.verseNumber)))
              : [];
            out.push({ ...item, keywords: kws });
            // Si en keywords hay objetos que en realidad son versos, recorrerlos también
            if (Array.isArray(item.keywords)) {
              item.keywords.forEach(k => {
                if (k && (k.text || k.verseNumber)) walk(k);
              });
            }
            return;
          }

          // Si es un array, recorrerlo
          if (Array.isArray(item)) {
            item.forEach(walk);
            return;
          }

          // Si es un objeto con 'verses' o 'keywords', recorrerlos
          if (item && typeof item === 'object') {
            if (Array.isArray(item.verses)) walk(item.verses);
            if (Array.isArray(item.keywords)) walk(item.keywords);
          }
        };

        walk(input);
        return out;
      };

      const normalized = normalizeVerses(source || []);
      setSearchResults(normalized);
      setSearchPage(0); // resetear paginación al recibir nuevos resultados
      setIsSearchModalOpen(true);
    } catch (err) {
      setSearchError(String(err));
      setIsSearchModalOpen(true);
    } finally {
      setSearchLoading(false);
    }
  };

  // Cerrar modal con Esc
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape" && isSearchModalOpen) setIsSearchModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSearchModalOpen]);

  // Helper to escape regex special chars y para resaltar coincidencias (palabras completas)
  const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Mapa simple de vocales a sus variantes con acentos (añadir más si es necesario)
  const accentVariants = {
    a: 'aáàâäãåā',
    e: 'eéèêëē',
    i: 'iíìîïī',
    o: 'oóòôöõō',
    u: 'uúùûüū',
    A: 'AÁÀÂÄÃÅĀ',
    E: 'EÉÈÊËĒ',
    I: 'IÍÌÎÏĪ',
    O: 'OÓÒÔÖÕŌ',
    U: 'UÚÙÛÜŪ'
  };

  // Construye un fragmento de patrón regex que sea insensible a acentos para un caracter
  const charPatternAccentInsensitive = (ch) => {
    if (!ch) return '';
    // Si el caracter tiene variantes listadas, crear una clase con ellas
    if (accentVariants[ch]) {
      const chars = accentVariants[ch];
      // escapar cualquier posible char especial aunque en las listas no debería haber
      const escaped = chars.split('').map(c => escapeRegExp(c)).join('');
      return `[${escaped}]`;
    }

    // Si es una letra ASCII base minúscula que tiene variantes en la tabla (ej: 'a'), usar también la mayúscula y variantes
    const lower = ch.toLowerCase();
    if (accentVariants[lower]) {
      const chars = accentVariants[lower];
      const escaped = chars.split('').map(c => escapeRegExp(c)).join('');
      // incluir también la versión mayúscula básica si no está
      return `[${escaped}${escapeRegExp(ch.toUpperCase())}]`;
    }

    // Por defecto, escapar el caracter
    return escapeRegExp(ch);
  };

  // Construye un patrón regex para una frase completa donde cada vocal es insensible a acentos
  const buildAccentInsensitivePattern = (phrase) => {
    if (!phrase) return '';
    // Construir patrón caracter por caracter
    const parts = [];
    for (let i = 0; i < phrase.length; i++) {
      const ch = phrase[i];
      // Si es espacio, mantener como \s+ para que coincida con cualquier espacio en el texto
      if (ch === ' ') {
        parts.push('\\s+');
        continue;
      }
      parts.push(charPatternAccentInsensitive(ch));
    }
    return parts.join('');
  };

  // Resalta cualquiera de las translatedWords proporcionadas (coincidencias de palabra completa)
  const highlightMatchesMultiple = (text = "", translatedWords = []) => {
    if (!text) return text;
    const phrases = (Array.isArray(translatedWords) ? translatedWords : [])
      .map(p => (p || '').toString().trim())
      .filter(Boolean);

    // Helper para construir nodos a partir de un regex con captura del match completo
    const nodesFromRegex = (regex, matchGroupIndexForWord) => {
      const nodes = [];
      let lastIndex = 0;
      let m;
      let counter = 0;
      while ((m = regex.exec(text)) !== null) {
        // m.index es el índice del inicio del match completo
        // la parte que nos interesa está en m[matchGr oupIndexForWord]
        const fullIndex = m.index;
        const prefixLength = (m[1] && matchGroupIndexForWord === 2) ? m[1].length : 0; // si usamos grupo 1 como prefijo
        const word = m[matchGroupIndexForWord];
        if (!word) continue;
        const wordStart = fullIndex + prefixLength;
        // push texto antes de la palabra
        if (wordStart > lastIndex) {
          nodes.push(text.slice(lastIndex, wordStart));
        }
        // push palabra resaltada
        nodes.push(
          <span key={`h-${counter++}-${wordStart}`} style={{ color: 'red', fontWeight: 700 }}>
            {text.slice(wordStart, wordStart + word.length)}
          </span>
        );
        lastIndex = wordStart + word.length;
        // prevenir loops con matches de longitud 0
        if (regex.lastIndex === fullIndex) regex.lastIndex++;
      }
      if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
      return nodes.length === 0 ? text : nodes;
    };

    // Si no hay phrases, usar el término de búsqueda como fallback para resaltar (coincidencias parciales)
    if (phrases.length === 0) {
      const fallback = (searchQuery || '').toString().trim();
      if (!fallback) return text;

      const pattern = buildAccentInsensitivePattern(fallback);
      try {
        // Buscar el patrón en cualquier parte (coincidencia parcial). Usamos 'u' para Unicode y 'g' para iterar.
        const regexFallback = new RegExp(`(${pattern})`, 'giu');
        return nodesFromRegex(regexFallback, 1);
      } catch (e) {
        // fallback seguro
        const escapedFallback = escapeRegExp(fallback);
        const regexFallback = new RegExp(`(${escapedFallback})`, 'gi');
        return nodesFromRegex(regexFallback, 1);
      }
    }

    // Cuando hay translatedWords: queremos coincidencias completas, pero sin distinguir acentos.
    // Construir patrones insensibles a acentos por cada palabra/frase
    const unique = Array.from(new Set(phrases)).sort((a, b) => b.length - a.length);
    const patterns = unique.map(p => buildAccentInsensitivePattern(p));

    // Usamos un límite personalizado que considera letras Unicode: (^|[^\p{L}]) (?!\p{L})
    // Capturamos el posible prefijo en el grupo 1 y la palabra en el grupo 2.
    const combined = patterns.join('|');
    let boundaryRegex;
    try {
      boundaryRegex = new RegExp(`(^|[^\\p{L}])(${combined})(?!\\p{L})`, 'giu');
      return nodesFromRegex(boundaryRegex, 2);
    } catch (e) {
      // Si el motor no soporta \p{L} o la construcción falla, caemos a una alternativa más amplia usando caracteres latinos comunes.
      const lettersClass = 'A-Za-zÀ-ÖØ-öø-ÿÑñ';
      boundaryRegex = new RegExp(`(^|[^${lettersClass}])(${combined})(?![${lettersClass}])`, 'gi');
      return nodesFromRegex(boundaryRegex, 2);
    }
  };

  // Helper: obtiene bookId por nombre (case-insensitive)
  const getBookIdByName = (name) => {
    if (!name) return null;
    const lower = name.toString().toLowerCase();
    const fromOld = oldTestament.find(b => b.name.toString().toLowerCase() === lower);
    if (fromOld) return fromOld.id;
    const fromNew = newTestament.find(b => b.name.toString().toLowerCase() === lower);
    if (fromNew) return fromNew.id;
    return null;
  };

  return (
    <>
      {/* Buscador de palabras */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar palabras en toda la Biblia (ej: En el principio)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" disabled={searchLoading} style={{ padding: '0.5rem 1rem' }}>
          {searchLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Modal de resultados usando MUI Dialog (visualmente igual al modal StrongDetail) */}
      <Dialog
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby="search-dialog-title"
      >
        <DialogTitle id="search-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Resultados de búsqueda
          <IconButton onClick={() => setIsSearchModalOpen(false)} size="small" aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {searchError && <div style={{ color: 'red' }}>Error: {searchError}</div>}

          {!searchError && searchResults && searchResults.length === 0 && (
            <div>No se encontraron resultados para: {searchQuery}</div>
          )}

          {!searchError && !searchResults && <div>Sin resultados.</div>}

          {!searchError && searchResults && searchResults.length > 0 && (
            <div>
              {(() => {
                const total = (searchResults || []).length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const start = searchPage * pageSize;
                const end = Math.min(start + pageSize, total);
                const pageItems = (searchResults || []).slice(start, end);

                return (
                  <div>

                    {pageItems.map((r, idx) => {
                      // Resolver ID del libro: preferimos el campo numérico `idBook` en la respuesta
                      // Si `idBook` existe y es numérico (o string numérico), lo usamos; si no, cae a resolver por nombre.
                      const bookIdFromResponse = (r && (typeof r.idBook === 'number'
                        ? r.idBook
                        : (typeof r.idBook === 'string' && /^[0-9]+$/.test(r.idBook) ? Number(r.idBook) : null)));

                      const bookIdResolved = bookIdFromResponse != null ? bookIdFromResponse : getBookIdByName(r.book);

                      const bookInfo = getBookById(bookIdResolved) || { name: r.book || (bookIdFromResponse != null ? `Libro ${r.idBook}` : `Libro`) };

                      const translatedWords = Array.isArray(r.keywords) ? r.keywords.map(k => k.translatedWord).filter(Boolean) : [];
                      const inflections = Array.isArray(r.keywords) ? r.keywords.map(k => k.inflectionWord).filter(Boolean).join(', ') : '';
                      const translits = Array.isArray(r.keywords) ? r.keywords.map(k => k.transliteratedWord).filter(Boolean).join(', ') : '';

                      return (
                        <div key={`${r.book}-${r.chapter}-${r.verseNumber}-${start + idx}`} style={{ padding: '0.8rem', borderBottom: '1px solid #aaa', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem' }}>
                              {bookInfo.name} {r.chapter}:{r.verseNumber}
                            </div>

                            <div style={{ fontSize: '1rem' , marginTop: '0.25rem'}}>
                              {inflections || ''} {translits ? `(${translits})` : ''} {translatedWords.length > 0 ? `— ${translatedWords.join(', ')}` : ''}
                            </div>

                            <div style={{ marginTop: '0.2rem', lineHeight: 1.4 }}>{highlightMatchesMultiple(r.text, translatedWords)}</div>
                          </div>
                          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                try {
                                  setIsSearchModalOpen(false);
                                  const targetBookId = bookIdResolved || bookId; // si no se resuelve, usar bookId actual
                                  onSelect(targetBookId, r.chapter);
                                } catch (e) {
                                  // ignore
                                }
                              }}
                            >
                              Ir
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Controles de paginación */}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>

                      <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#666' }}>
                          Mostrando {start + 1} - {end} de {total}
                      </div>
                      <div>
                        <Button
                          size="small"
                          onClick={() => setSearchPage((p) => Math.max(0, p - 1))}
                          disabled={searchPage <= 0}
                        >
                          Anterior
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setSearchPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={searchPage >= totalPages - 1}
                          style={{ marginLeft: '0.5rem' }}
                        >
                          Siguiente
                        </Button>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Página {searchPage + 1} de {totalPages}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <label>
          Libro:
          <select
            value={bookId}
            onChange={(e) => setBookId(Number(e.target.value))}
            style={{ marginLeft: "0.5rem", minWidth: "180px" }}
          >
            <optgroup label="Antiguo Testamento">
              {oldTestament.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="Nuevo Testamento">
              {newTestament.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <label>
          Capítulo:
          {/* reemplazamos el input por un select dinámico basado en el libro seleccionado */}
          <select
            value={chapter}
            onChange={(e) => {
              const newChapter = Number(e.target.value);
              setChapter(newChapter);
            }}
            style={{ marginLeft: "0.5rem", width: "80px" }}
          >
            {(() => {
              const book = getBookById(bookId);
              const max = book ? book.capitulos : 1;
              return Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ));
            })()}
          </select>
        </label>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={handlePrev} disabled={chapter <= 1}>
            ⬅️ Anterior
          </button>
          <button type="button" onClick={handleNext}>
            Siguiente ➡️
          </button>
        </div>
      </form>
    </>
  );
}
