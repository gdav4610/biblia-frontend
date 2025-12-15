import React, { useState } from "react";

export default function ChapterSelector({ onSelect }) {
  const [bookId, setBookId] = useState(1);
  const [chapter, setChapter] = useState(1);

  // 📜 Lista de libros con IDs numéricos
  const oldTestament = [
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
    { id: 39, name: "Malaquías" }
  ];

  const newTestament = [
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelect(bookId, Number(chapter));
  };

  const handlePrev = () => {
    if (chapter > 1) {
      const newChapter = chapter - 1;
      setChapter(newChapter);
      onSelect(bookId, newChapter);
    }
  };

  const handleNext = () => {
    const newChapter = chapter + 1;
    setChapter(newChapter);
    onSelect(bookId, newChapter);
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
        <input
          type="number"
          min="1"
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          style={{ width: "60px", marginLeft: "0.5rem" }}
        />
      </label>

      <button type="submit">Cargar</button>

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
