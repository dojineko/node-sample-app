import { Request, Response, NextFunction } from 'express'

type routeHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>
export const wrap = (fn: routeHandler): routeHandler => (req, res, next) => fn(req, res, next).catch(next)
