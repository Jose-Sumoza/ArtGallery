import { createRoot } from 'react-dom/client'
import App from '@/App';
import '@fontsource-variable/inter';
import '@assets/index.css';

const root = createRoot(document.getElementById('root'));

root.render(
	<App />
);