import { BrowserRouter, Routes, Route } from "react-router-dom";

import TLRoot from "./index.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<TLRoot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
