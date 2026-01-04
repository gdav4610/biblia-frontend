import React, { useState, useEffect } from "react";

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

  return (
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
  );
}
