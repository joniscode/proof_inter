import { ConnectionStatus } from './components/ConnectionStatus';
import { DiscoveryHero } from './components/DiscoveryHero';
import { RewardExplainer } from './components/RewardExplainer';
import { SiteHeader } from './components/SiteHeader';
import { ShopSection } from './components/ShopSection';
import texts from './content/texts.json';

export function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">{texts.navigation.skipContent}</a>
      <SiteHeader />
      <main id="contenido" tabIndex={-1}>
        <ConnectionStatus />
        <DiscoveryHero />
        <ShopSection />
        <RewardExplainer />
      </main>
    </>
  );
}
