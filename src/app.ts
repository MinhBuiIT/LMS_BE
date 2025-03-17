import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import instanceDb from './db/db.init';
import errorMiddleware from './middlewares/error.middleware';
import route from './routes';
import initSocket from './utils/initSocket';

const app: Express = express();

//multipart/form-data
app.use(express.urlencoded({ extended: true }));

// Body parser json
app.use(
  express.json({
    limit: '50mb'
  })
);

//Cors

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

// Cookie parser
app.use(cookieParser());

// Connect to database
instanceDb.connectMongoDB();
instanceDb.connectRedis();

//Routes

app.use('/api/v1', route);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
  return;
});

app.use('/*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Resources not found' });
  return;
});

// Error middleware
app.use(errorMiddleware);
const httpServer = createServer(app);
initSocket(httpServer);
export default httpServer;

//Flow Authentication
/**
 * Người dùng login sẽ nhận được accessToken và refreshToken từ server và lưu vào cookie với thời gian lần lượt là 1 ngày và 7 ngày; đồng thời lưu vào redis với publicKey và thông tin user với thời gian lưu là 7 ngày để tránh việc phải query database nhiều lần và đặt thời gian lưu trữ là 7 ngày để tự động logout người dùng sau 7 ngày và giảm khối lượng dữ liệu trong redis
 *
 * Khi người dùng truy cập vào tài nguyên cần authenticate, client sẽ gửi accessToken lên server để xác thực
 * sau đó sẽ lấy thông tin user từ redis, nếu không có sẽ yêu cầu người dùng login lại
 *
 * Khi accessToken hết hạn, client sẽ gửi refreshToken lên server để lấy accessToken mới và refreshToken mới
 * với thời hạn lần lượt là 1 ngày và 7 ngày
 *
 *
 */
