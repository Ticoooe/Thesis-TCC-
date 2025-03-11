import { createApp } from 'svelte'
import './app.css'
import App from './routes/+layout.svelte'

const app = createApp(App, {
  target: document.getElementById('app'),
})

export default app
