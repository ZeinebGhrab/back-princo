import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
}

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;

    const token = authorizationHeader?.split(' ')[1]; // take after bearer
    if (!token) {
      return res
        .status(403)
        .send({ message: 'Authorization token not provided' });
    }

    const decodedToken = jwtDecode(token) as DecodedToken;
    const userId = '65f135d4652f699946a08002';

    if (decodedToken.id !== userId && req.method === 'POST') {
      return res
        .status(403)
        .send({ message: 'Only admin can Add, Update, and Delete' });
    }

    if (
      (req.method === 'PUT' || req.method === 'DELETE') &&
      decodedToken.id !== userId
    ) {
      const requestedUserId = req.params.id;

      if (!requestedUserId || decodedToken.id !== requestedUserId) {
        return res
          .status(403)
          .send({ message: 'You are not authorized to perform this action' });
      }
    }

    next();
  }
}
