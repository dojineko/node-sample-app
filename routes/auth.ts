import { wrap } from '../utils/wrap'
import { v4 as uuid } from 'uuid'
import { UserEntity } from '../entities/user'
import { SessionEntity } from '../entities/session'
import { Router } from 'express'
import { makeSession } from '../utils/session'
import { getManager } from 'typeorm'
import { makeHash, encrypt } from '../utils/crypto'

export const authRouter = Router()

authRouter.post(
  '/api/signup',
  wrap(async (req, res) => {
    const email: string = req.body.email || ''
    const password: string = req.body.password || ''
    if (!email || !password) {
      res.sendStatus(400)
      return
    }

    const emailEncrypted = encrypt(email)
    const mgr = getManager()
    const user = await mgr.findOne(UserEntity, { emailEncrypted })
    if (user) {
      res.sendStatus(409)
      return
    }

    const salt = uuid()
    const result = await mgr.save(UserEntity, {
      id: uuid(),
      emailEncrypted,
      salt,
      passwordHash: makeHash(password, salt),
    })
    const token = await makeSession(result.id)

    res.status(201).json({ token })
  }),
)

authRouter.post(
  '/api/login',
  wrap(async (req, res) => {
    const email: string = req.body.email || ''
    const password: string = req.body.password || ''
    if (!email || !password) {
      res.sendStatus(400)
      return
    }

    const emailEncrypted = encrypt(email)
    const mgr = getManager()
    const user = await mgr.findOne(UserEntity, { emailEncrypted })
    if (!user) {
      res.sendStatus(404)
      return
    }
    if (user.passwordHash !== makeHash(password, user.salt)) {
      res.sendStatus(403)
      return
    }

    const token = await makeSession(user.id)

    res.status(200).json({ token })
  }),
)

authRouter.post(
  '/api/logout',
  wrap(async (req, res) => {
    if (!req.userId || !req.token) {
      res.status(403)
      return
    }
    const mgr = getManager()
    await mgr.delete(SessionEntity, { userId: req.userId, token: req.token })
    res.sendStatus(204)
  }),
)
