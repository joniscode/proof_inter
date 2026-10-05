import texts from '../content/texts.json';
import { Icon } from './ui/Icon';

export function PointsBalance({ points }: { points?: number }) {
  return (
    <section className="points-balance" aria-label={texts.points.title}>
      <div className="d-flex align-items-center justify-content-between gap-3"><span>{texts.points.title}</span><Icon name="spark" /></div>
      <strong role="status" aria-live="polite">{points ?? texts.points.pending}</strong>
      <p className="mb-0">{texts.points.description}</p>
    </section>
  );
}
