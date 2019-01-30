import App from './app'
import { BLOG_ID } from './secrets'
;(async () => {
  const o = new App(BLOG_ID)
  await o.run()
})()
