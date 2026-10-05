import { ActionLink } from './ui/Button';
import { Icon } from './ui/Icon';
import { SectionLabel } from './ui/SectionLabel';
import { TextLines } from './ui/TextLines';
import texts from '../content/texts.json';

function ShoppingArtwork() {
  return (
    <div className="shopping-artwork" role="img" aria-label={texts.artwork.label}>
      <div className="artwork-topline" aria-hidden="true"><span>{texts.artwork.topline}</span><Icon name="spark" /></div>
      <div className="artwork-orbit" aria-hidden="true" />
      <div className="shopping-bag" aria-hidden="true">
        <div className="bag-handle" />
        <span className="bag-letter">{texts.app.initial}<span>{texts.app.mark}</span></span>
        <span className="bag-caption"><TextLines lines={texts.artwork.bagCaption} /></span>
        <div className="bag-baseline"><span>{texts.artwork.bagBaseline}</span><Icon name="diagonal" /></div>
      </div>
      <div className="points-ticket" aria-hidden="true">
        <span className="ticket-topline">{texts.artwork.ticketLabel}</span>
        <div className="ticket-value">{texts.artwork.ticketValue}<span>{texts.artwork.ticketUnit}</span></div>
        <div className="ticket-bottomline"><Icon name="spark" /><span>{texts.artwork.ticketNote}</span></div>
      </div>
      <div className="artwork-coordinate" aria-hidden="true"><span>{texts.artwork.baseline}</span><Icon name="diagonal" /></div>
    </div>
  );
}

export function DiscoveryHero() {
  return (
    <section className="discovery-hero" aria-labelledby="hero-title">
      <div className="container-fluid page-container">
        <div className="row g-0 align-items-center hero-row">
          <div className="col-lg-7 hero-copy">
            <SectionLabel number={texts.hero.number}>{texts.hero.label}</SectionLabel>
            <h1 id="hero-title">{texts.hero.title.first}<br /><span>{texts.hero.title.accent}</span><br />{texts.hero.title.last}</h1>
            <div className="hero-bottom d-flex flex-wrap align-items-end gap-4">
              <p><TextLines lines={texts.hero.description} /></p>
              <ActionLink href="#catalogo">{texts.hero.action}</ActionLink>
            </div>
          </div>
          <div className="col-lg-5 hero-art-column"><ShoppingArtwork /></div>
        </div>
      </div>
    </section>
  );
}
