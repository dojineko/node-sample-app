import 'reflect-metadata'
import express from 'express'
import bodyParser from 'body-parser'
import { initTypeOrm } from './config/typeorm'
import { authMiddleware } from './middleware/auth'
import { authRouter, helloRouter, notesRouter } from './routes'

void (async () => {
  const app = express()
  const port = process.env.NODE_ENV === 'production' ? 80 : 3000

  await initTypeOrm()

  app.use(bodyParser.json())
  app.use(authMiddleware)
  app.use(authRouter)
  app.use(helloRouter)
  app.use(notesRouter)

  app.listen(port, () => console.log(`ready http://localhost:${port}`))
})()
