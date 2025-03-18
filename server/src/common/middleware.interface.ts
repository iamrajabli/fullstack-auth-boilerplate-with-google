import { Request, Response, NextFunction } from 'express';

export interface MiddlewareInterface {
	exec: (req: Request, res: Response, next: NextFunction) => void;
}
