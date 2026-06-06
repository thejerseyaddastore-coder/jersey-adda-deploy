import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function BrandHeader({ onNavigatePublic }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => navigate('/')}>
        <BrandLogo showWordmark={true} />
      </button>

      <nav className="topnav">
        <button className="topnav__button" type="button" onClick={() => navigate('/settings')}>
          Phone Number
        </button>
        <button className="topnav__button" type="button" onClick={onNavigatePublic}>
          Public site
        </button>
      </nav>
    </header>
  );
}
