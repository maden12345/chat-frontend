import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import MainRoutes from "./routes/MainRoutes";  // doğru yol belirtildiğinden emin ol

function App() {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
}

export default App;
