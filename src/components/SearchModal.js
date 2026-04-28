import React, { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

export default function SearchModal({
  open,
  onClose,
  searchQuery,
  searchResults,
  searchLoading,
  searchError,
  searchPage,
  setSearchPage,
  pageSize,
  onSelect,
  getBookById,
  getBookIdByName,
  currentBookId,
}) {
  // Cerrar modal con Esc (manejador local)
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Helpers para resaltado (copiados y adaptados desde ChapterSelector)
  const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

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

  // función común para eliminar acentos (usada en varios lugares)
  const stripAccents = (s = '') =>
    s && s.toString && s.normalize ? s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : (s || '').toString();

  const searchTerm = (searchQuery || '').toString().trim();
  const searchNorm = stripAccents(searchTerm).toLowerCase().trim();

  const charPatternAccentInsensitive = (ch) => {
    if (!ch) return '';
    if (accentVariants[ch]) {
      const chars = accentVariants[ch];
      const escaped = chars.split('').map(c => escapeRegExp(c)).join('');
      return `[${escaped}]`;
    }
    const lower = ch.toLowerCase();
    if (accentVariants[lower]) {
      const chars = accentVariants[lower];
      const escaped = chars.split('').map(c => escapeRegExp(c)).join('');
      return `[${escaped}${escapeRegExp(ch.toUpperCase())}]`;
    }
    return escapeRegExp(ch);
  };

  const buildAccentInsensitivePattern = (phrase) => {
    if (!phrase) return '';
    const parts = [];
    for (let i = 0; i < phrase.length; i++) {
      const ch = phrase[i];
      if (ch === ' ') {
        parts.push('\\s+');
        continue;
      }
      parts.push(charPatternAccentInsensitive(ch));
    }
    return parts.join('');
  };

  const highlightMatchesMultiple = (text = "", keywords = []) => {
    if (!text) return text;
    const phrases = (Array.isArray(keywords) ? keywords.map(k => (k && k.translatedWord) ? k.translatedWord : '') : [])
      .map(p => (p || '').toString().trim())
      .filter(Boolean);

    const translitMap = {};
    if (Array.isArray(keywords)) {
      for (const k of keywords) {
        if (!k || !k.translatedWord) continue;
        const key = stripAccents(k.translatedWord).toLowerCase().trim();
        if (!translitMap[key]) translitMap[key] = k.transliteratedWord || '';
      }
    }

    const nodesFromRegex = (regex, matchGroupIndexForWord) => {
      const nodes = [];
      let lastIndex = 0;
      let m;
      let counter = 0;
      while ((m = regex.exec(text)) !== null) {
        const fullIndex = m.index;
        const prefixLength = (m[1] && matchGroupIndexForWord === 2) ? m[1].length : 0;
        const word = m[matchGroupIndexForWord];
        if (!word) continue;
        const wordStart = fullIndex + prefixLength;
        if (wordStart > lastIndex) {
          nodes.push(text.slice(lastIndex, wordStart));
        }
        const matchedText = text.slice(wordStart, wordStart + word.length);
        const keyNorm = stripAccents(matchedText).toLowerCase().trim();
        const translit = translitMap[keyNorm];

        // marcar en rojo sólo si:
        // - hay un searchNorm definido
        // - el match corresponde a una translatedWord (está en translitMap)
        // - y el translatedWord normalizado contiene searchNorm como substring
        let isSearchMatch = false;

        if (searchNorm) {
          if (translitMap[keyNorm]) {
            if (keyNorm.includes(searchNorm)) {
              isSearchMatch = true;
            }
          } else {
            // fallback: comportamiento anterior para coincidencia exacta
            if (keyNorm === searchNorm) {
              isSearchMatch = true;
            }
          }
        }

        nodes.push(
          <span key={`h-${counter++}-${wordStart}`} style={{ color: isSearchMatch ? 'red' : undefined, fontWeight: 700 }}>
            {matchedText}
            {translit ? (
              <sup style={{ fontSize: '0.8em', marginLeft: '0.25rem', fontWeight: 400 }}>{translit}</sup>
            ) : null}
          </span>
        );
        lastIndex = wordStart + word.length;
        if (regex.lastIndex === fullIndex) regex.lastIndex++;
      }
      if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
      return nodes.length === 0 ? text : nodes;
    };

    if (phrases.length === 0) {
      const fallback = searchTerm;
      if (!fallback) return text;
      const pattern = buildAccentInsensitivePattern(fallback);
      try {
        const regexFallback = new RegExp(`(${pattern})`, 'giu');
        return nodesFromRegex(regexFallback, 1);
      } catch (e) {
        const escapedFallback = escapeRegExp(fallback);
        const regexFallback = new RegExp(`(${escapedFallback})`, 'gi');
        return nodesFromRegex(regexFallback, 1);
      }
    }

    const candidatesSet = new Set(phrases);
    if (searchTerm) candidatesSet.add(searchTerm);
    const unique = Array.from(candidatesSet).sort((a, b) => b.length - a.length);
    const patterns = unique.map(p => buildAccentInsensitivePattern(p));

    const combined = patterns.join('|');
    let boundaryRegex;
    try {
      boundaryRegex = new RegExp(`(^|[^\\p{L}])(${combined})(?!\\p{L})`, 'giu');
      return nodesFromRegex(boundaryRegex, 2);
    } catch (e) {
      const lettersClass = 'A-Za-zÀ-ÖØ-öø-ÿÑñ';
      boundaryRegex = new RegExp(`(^|[^${lettersClass}])(${combined})(?![${lettersClass}])`, 'gi');
      return nodesFromRegex(boundaryRegex, 2);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="search-dialog-title"
    >
      <DialogTitle id="search-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Resultados de búsqueda
        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
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
                    const bookIdFromResponse = (r && (typeof r.idBook === 'number'
                      ? r.idBook
                      : (typeof r.idBook === 'string' && /^[0-9]+$/.test(r.idBook) ? Number(r.idBook) : null)));

                    const bookIdResolved = bookIdFromResponse != null ? bookIdFromResponse : getBookIdByName(r.book);

                    const bookInfo = getBookById(bookIdResolved) || { name: r.book || (bookIdFromResponse != null ? `Libro ${r.idBook}` : `Libro`) };

                    const keywordsForHighlight = Array.isArray(r.keywords) ? r.keywords : [];

                    return (
                      <div key={`${r.book}-${r.chapter}-${r.verseNumber}-${start + idx}`} style={{ padding: '0.8rem', borderBottom: '1px solid #aaa', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem' }}>
                            {bookInfo.name} {r.chapter}:{r.verseNumber}
                          </div>


                          <div style={{ marginTop: '0.2rem', lineHeight: 1.4 }}>{highlightMatchesMultiple(r.text, keywordsForHighlight)}</div>
                        </div>
                        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              try {
                                onClose();
                                const targetBookId = bookIdResolved || currentBookId;
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
  );
}

