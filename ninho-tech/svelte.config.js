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
    files: {
      assets: "static"
    },
    adapter: adapter(),
  }
}

export default config
