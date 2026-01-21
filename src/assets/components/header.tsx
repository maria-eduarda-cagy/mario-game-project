import "./header.css";
export function Header() {
  return (
    <header className="app-header">
      <nav className="nav">
        <span className="logo">Mario Game - Study Project</span>

        <ul className="nav-links">
          <li>
            <a
              href="https://www.linkedin.com/in/maria-eduarda-cagy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>

          <li>
            <a
              href="https://github.com/maria-eduarda-cagy"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>

          <li>
            <a
              href="https://front-end-cv-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CV
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
