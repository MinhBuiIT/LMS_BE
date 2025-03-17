import { Router } from 'express';
import {
  createQAController,
  deleteQAController,
  getQAListChildrenController,
  getQAListLevelZeroController
} from '~/controllers/qa.controller';
import { authenticationMiddleware, disableMiddleware } from '~/middlewares/auth.middleware';
import catchError from '~/utils/catchError';

const routeQA = Router();

routeQA.post('/', authenticationMiddleware, disableMiddleware, catchError(createQAController));
routeQA.get(
  '/list/:courseDataId',
  authenticationMiddleware,
  disableMiddleware,
  catchError(getQAListLevelZeroController)
);
routeQA.get('/child/:qaId', authenticationMiddleware, disableMiddleware, catchError(getQAListChildrenController));
routeQA.delete('/:qaId', authenticationMiddleware, disableMiddleware, catchError(deleteQAController));

export default routeQA;
