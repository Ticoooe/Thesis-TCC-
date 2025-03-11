import { createApp } from 'svelte';
import './app.css';

const target = document.getElementById('svelte');
console.log(`the target is, ${target}`);
const app = createApp(App, {
  target: document.getElementById('svelte'),
})

export default app
