import { Router } from 'express';
import { createLayoutController, getLayoutController, updateLayoutController } from '~/controllers/layout.controller';
import { authenticationMiddleware } from '~/middlewares/auth.middleware';
import permissionMiddleware from '~/middlewares/permission.middleware';
import catchError from '~/utils/catchError';

const routeLayout = Router();

routeLayout.get('/:type', catchError(getLayoutController));
routeLayout.use(authenticationMiddleware, permissionMiddleware('admin'));
routeLayout.post('/', catchError(createLayoutController));
routeLayout.put('/', catchError(updateLayoutController));

export default routeLayout;
