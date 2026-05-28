import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <div className="logo-mark">▲</div>
        <span>UNIMAPA</span>
      </Link>

      <Link to="/settings" className="header-settings" aria-label="Abrir definições">
        <Settings size={28} />
      </Link>
    </header>
  );
}

export default Header;