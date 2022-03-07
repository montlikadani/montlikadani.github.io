import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import TLRoot from "./index.jsx";

const history = createBrowserHistory();

function App() {
  return (
    <BrowserRouter history={history}>
      <Routes>
        <Route exact path="/" element={<TLRoot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
