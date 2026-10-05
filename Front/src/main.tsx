import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource/anton/latin-400.css';
import '@fontsource-variable/manrope';
import './styles/theme.css';
import './styles.css';
import texts from './content/texts.json';

document.title = texts.app.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', texts.app.description);

const root = document.getElementById('root');
if (!root) throw new Error(texts.errors.rootMissing);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
