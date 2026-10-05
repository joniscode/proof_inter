import { Icon } from './ui/Icon';
import { SectionLabel } from './ui/SectionLabel';
import texts from '../content/texts.json';

function CategoryRibbon() {
  return (
    <div className="category-ribbon" aria-label={texts.rewards.categoriesLabel}>
      <div className="container-fluid page-container d-flex align-items-center justify-content-between flex-wrap">
        {Object.entries(texts.categories).map(([id, label]) => <span className="ribbon-item" key={id}>{label}<Icon name="spark" /></span>)}
      </div>
    </div>
  );
}

export function RewardExplainer() {
  return (
    <>
      <CategoryRibbon />
      <section className="reward-section" id="como-sumas" aria-labelledby="reward-title">
        <div className="container-fluid page-container">
          <div className="reward-heading d-flex flex-wrap align-items-end justify-content-between gap-3">
            <div><SectionLabel number={texts.rewards.number}>{texts.rewards.label}</SectionLabel><h2 id="reward-title">{texts.rewards.title} <span>{texts.rewards.titleAccent}</span></h2></div>
            <span className="reward-heading-note">{texts.rewards.note}</span>
          </div>
          <div className="row g-0 reward-grid">
            {texts.rewards.steps.map((step, index) => (
              <article className="col-md-4 reward-step" key={step.number}>
                <div className="step-topline"><span>{step.number}</span><Icon name={index === 1 ? 'spark' : 'diagonal'} /></div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
