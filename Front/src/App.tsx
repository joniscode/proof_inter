import { ConnectionStatus } from './components/ConnectionStatus';

export function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Tienda, inicio">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>Tienda<span className="brand-caption">Catálogo y recompensas</span></span>
        </a>
        <span className="header-note">Cada elección cuenta</span>
      </header>
      <main className="main-content">
        <section className="welcome" aria-labelledby="welcome-title">
          <span className="eyebrow">Una tienda, más posibilidades</span>
          <h1 id="welcome-title">Encuentra tus favoritos.<br /><span>Suma recompensas.</span></h1>
          <p>Productos para tu día a día y puntos que acompañan tus elecciones.</p>
        </section>
        <ConnectionStatus />
      </main>
      <footer className="site-footer">Catálogo con recompensas</footer>
    </>
  );
}
