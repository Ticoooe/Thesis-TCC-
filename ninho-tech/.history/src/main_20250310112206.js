import './app.css';
import App from './src/routes/+layout.svelte';

const t = document.getElementById('app');
console.log(`the target is, ${t}`);
const app = App({
  target: document.getElementById('app'),
});

export default app;
