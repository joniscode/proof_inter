import { Brand } from './ui/Brand';
import { Icon } from './ui/Icon';
import texts from '../content/texts.json';

export function SiteHeader() {
  return (
    <header className="site-header" id="inicio">
      <div className="container-fluid page-container d-flex align-items-center justify-content-between gap-3">
        <Brand />
        <nav aria-label={texts.navigation.mainLabel}>
          <a className="nav-link punto-nav" href="#como-sumas">{texts.navigation.rewards} <Icon name="diagonal" /></a>
        </nav>
      </div>
    </header>
  );
}
