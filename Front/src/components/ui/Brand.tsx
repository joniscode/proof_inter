import texts from '../../content/texts.json';

export function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label={texts.app.homeLabel}>
      {texts.app.name}<span className="brand-dot">{texts.app.mark}</span>
    </a>
  );
}
