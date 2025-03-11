import App from './routes/+layout.svelte'
import { createApp } from 'svelte'
import './app.css'

const app = createApp(App, {
  target: document.getElementById('svelte'),
})

export default app
