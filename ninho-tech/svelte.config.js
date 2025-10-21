import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import  adapter  from '@sveltejs/adapter-vercel'

const config = {
  preprocess: vitePreprocess(),
  
  compilerOptions: {
    compatibility: {
      componentApi: 4
    }
  },

  kit: {
    alias: {
      "$lib": "src/lib"
    },
    adapter: adapter({
      runtime: 'nodejs20.x'
    }),
  }
}

export default config
