import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { userRouter } from "./user/user.router";
import crypto from 'crypto';


dotenv.config();
const app = express();

// middllwares
app.use(express.json());

app.use(cors());



// routes
app.use('/api/user',userRouter);





// starting the server
const PORT: number = parseInt(process.env.PORT!);

app.listen(PORT, () => {
  console.log(`Server is Rocking on Port ${PORT}`);
});
