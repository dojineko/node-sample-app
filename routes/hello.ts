import { wrap } from '../utils/wrap'
import { UserEntity } from '../entities/user'
import { Router } from 'express'
import { getManager } from 'typeorm'
import { decrypt } from '../utils/crypto'

export const helloRouter = Router()

helloRouter.get(
  '/api/hello',
  wrap(async (req, res) => {
    const mgr = getManager()
    const user = await mgr.findOne(UserEntity, { id: req.userId })
    if (!user) {
      res.sendStatus(404)
      return
    }
    res.json({ hello: decrypt(user.emailEncrypted) })
  }),
)
