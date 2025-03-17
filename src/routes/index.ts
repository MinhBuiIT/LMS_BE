import { Router } from 'express';
import routeAnalytic from './analytic';
import routeAuth from './auth';
import routeCourse from './course';
import routeLayout from './layout';
import routeNotification from './notification';
import routeOrder from './order';
import routeQA from './qa';
import routeReview from './review';
import routeUser from './user';

const route = Router();

route.use('/auth', routeAuth);
route.use('/user', routeUser);
route.use('/course', routeCourse);
route.use('/qa', routeQA);
route.use('/review', routeReview);
route.use('/order', routeOrder);
route.use('/notification', routeNotification);
route.use('/analytics', routeAnalytic);
route.use('/layout', routeLayout);

export default route;
