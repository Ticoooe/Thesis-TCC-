import './app.css';
import App from './src/routes/+layout.svelte';

const target = document.getElementById('svelte');
console.log(`the target is, ${target}`);
const app = App({
  target: document.getElementById('svelte'),
});

export default app;
