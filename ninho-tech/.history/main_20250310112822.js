import './app.css';
import App from './src/routes/+layout.svelte';

const target = document.getElementById('svelte');

// In Svelte 5, components are instantiated differently
const app = new App({
  target,
});

export default app;
