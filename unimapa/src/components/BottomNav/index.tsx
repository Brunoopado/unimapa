import { HelpCircle, Home, MapPin, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="bottom-nav-item">
        <Home size={28} />
      </NavLink>

      <NavLink to="/map" className="bottom-nav-item">
        <MapPin size={28} />
      </NavLink>

      <NavLink to="/search" className="bottom-nav-item">
        <Search size={28} />
      </NavLink>

      <NavLink to="/how-to-use" className="bottom-nav-item">
        <HelpCircle size={28} />
      </NavLink>
    </nav>
  );
}

export default BottomNav;