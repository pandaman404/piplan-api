import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { REQUEST_LIMIT_EXCEEDED } from './responses/apiMessages';
import userRoutes from './routes/user.router';
import projectRoutes from './routes/project.router';
import departmentRoutes from './routes/department.router';
import projectGoalRoutes from './routes/projectGoal.router';
import userProjectRoutes from './routes/userProject.router';
import errorHandlerMiddleware from './middlewares/errorHandler';
import notFoundMiddleware from './middlewares/notFound';
import { validateToken } from './middlewares/auth';
//import swagger from 'swagger-ui-express';
//import YAML from "yamljs";
dotenv.config();
const app = express();

// swagger
// const swaggerDocument = YAML.load("./swagger.yaml");

// security
app.set('trust proxy', 1);

if (process.env.NODE_ENV !== 'test') {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 100 requests cada 15 min por cliente
      max: 100,
      message: REQUEST_LIMIT_EXCEEDED,
    })
  );
}
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

//routes

// app.use("/", swagger.serve, swagger.setup(swaggerDocument));
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/project', validateToken, projectRoutes);
app.use('/api/v1/project-goal', validateToken, projectGoalRoutes);
app.use('/api/v1/user_project', validateToken, userProjectRoutes);
app.use('/api/v1/department', validateToken, departmentRoutes);

// custom errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
