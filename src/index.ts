import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
import { Request, Response } from 'express';

app.get('/', (_req: Request, res: Response) => {
  res.send('Server is running');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started');
});
