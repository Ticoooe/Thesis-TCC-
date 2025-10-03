import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

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
    }
  }
}

export default config
