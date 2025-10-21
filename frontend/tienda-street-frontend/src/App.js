import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// 1. Import all the pages you have created
import GestionAtributos from './pages/GestionAtributos';
import LoginPage from './pages/LoginPage'; // <-- Import the new login page

function App() {
  return (
    <Router>
      <div className="App">
        <Routes> {/* This component decides which page to show */}
          
          {/* 👇 Route for the Attribute Management page */}
          <Route path="/gestion-atributos" element={<GestionAtributos />} />

          {/* 👇 Route for the Login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* You can add a default route for the main page like this: */}
          {/* <Route path="/" element={<h1>Página Principal</h1>} /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;