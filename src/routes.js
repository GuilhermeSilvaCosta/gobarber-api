import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import Redis from 'ioredis';

import multerConfig from './config/multer';
import redisOptions from './config/redis';

import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import validatorAppointmentStore from './app/validators/AppointmentStore';
import validatorSessionStore from './app/validators/SessionStore';
import validatorUserStore from './app/validators/UserStore';
import validatorUserUpdate from './app/validators/UserUpdate';

const routes = new Router();
const upload = multer(multerConfig);

const client = new Redis(redisOptions);
const bruteStore = new BruteRedis({ client });

const bruteForce = new Brute(bruteStore);

routes.post('/users', validatorUserStore, UserController.store);
routes.post('/sessions', bruteForce.prevent, validatorSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.put('/users', validatorUserUpdate, UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/appointments', validatorAppointmentStore, AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedules', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default routes;
