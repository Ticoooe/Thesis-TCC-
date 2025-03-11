import './app.css';
import App from './src/routes/+layout.svelte';

const target = document.getElementById('svelte');

const app = new App({
  target,
});

export default app;
