import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import Map from "./pages/Map";
import SearchDestination from "./pages/SearchDestination";
import HowToUse from "./pages/HowToUse";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/search" element={<SearchDestination />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;