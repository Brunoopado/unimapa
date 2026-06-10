import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import logoUnifafibe from "../../assets/images/logo-unifafibe.png";


function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <img
          src={logoUnifafibe}
          alt="Logo UNIFAFIBE"
          className="header-logo-image"
        />
        <span>UNIMAPA</span>
      </Link>

      <Link to="/settings" className="header-settings" aria-label="Abrir definições">
        <Settings size={28} />
      </Link>
    </header>
  );
}

export default Header;