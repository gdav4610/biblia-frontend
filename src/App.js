import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import BibleChapter from "./components/BibleChapter";
import StrongDetail from "./components/StrongDetail";
import ChapterSelector from "./components/ChapterSelector";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from "@mui/icons-material/LightMode";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
	return (
		<Router>
		  <Routes>
			<Route path="/" element={<BibleChapterPage />} />
			<Route path="/strongs/:strongCode" element={<StrongDetail />} />
		  </Routes>
		</Router>
	  );
}


// Componente que obtiene el JSON del backend y pasa a BibleChapter
function BibleChapterPage() {
	
  const [book, setBook] = useState("1"); //Genesis
  const [chapter, setChapter] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const s = localStorage.getItem("app.darkMode");
      return s === "true";
    } catch (e) {
      return false;
    }
  });

  // Persistir la preferencia al cambiar
  useEffect(() => {
    try {
      localStorage.setItem("app.darkMode", darkMode ? "true" : "false");
    } catch (e) {
      // ignore
    }
  }, [darkMode]);

  const handleSelect = (newBook, newChapter) => {
    setBook(newBook);
    setChapter(newChapter);
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#90caf9" : "#1976d2",
      },
      background: {
        default: darkMode ? "#121212" : "#fafafa",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ margin: "2rem" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1>📖 Lectura Bíblica</h1>

          <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"} arrow>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </header>

        <ChapterSelector onSelect={handleSelect} />
        <BibleChapter book={book} chapter={chapter} />
      </div>
    </ThemeProvider>
  );
}
  
  
export default App;
