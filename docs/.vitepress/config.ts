import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/easse/",
  title: "Easse",
  description: "Lightweight SSE adapters for your backend",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/onboard' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Intro', link: '/intro' },
          { text: 'Quickstart', link: '/onboard' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
