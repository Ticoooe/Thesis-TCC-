import './app.css';
import App from './routes/+layout.svelte';

const target = document.getElementById('svelte');
console.log(`the target is, ${target}`);
const app = new App({
  target: document.getElementById('svelte'),
});

export default app;
