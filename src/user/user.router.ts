import express from "express";
import type { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import * as UserService from "./user.service";
import * as TokenService from "../token/token.service";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../utils/email_sender";
import bcrypt from "bcrypt";
export const userRouter = express.Router();

const ACCESS_SECRET_KEY: string = process.env.ACCESS_SECRET_KEY!;
const MAX = 9999;
const MIN = 1000;

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is not provided" });
  }

  let id;

  jwt.verify(token, ACCESS_SECRET_KEY, async (err, decoded) => {
    if (err) {
      err.message;

      return res.status(403).json({ message: "Token is not valid" });
    }

    id = (decoded as JwtPayload).id;

    const tokenExist = await TokenService.chekExist(token);

    if (!tokenExist) {
      return res.status(403).json({ message: "Token is not valid" });
    }

    req.body.userId = id;
    next(); // Call next() to pass control to the next middleware/route handler
  });
};

userRouter.post(
  "/register",
  body("username").isString(),
  body("email").isEmail(),
  body("password").isString(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    try {
      const userWrite = req.body;
      const userCheck = await UserService.readUser(req.body.email);
      if (!userCheck) {
        try {
          const code = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
          const userRead = await UserService.signUp(userWrite, code);
          sendEmail({
            from: "bahrimohamedelamine22esi@gmail.com",
            to: userWrite.email,
            subject: "ECOMMERCE VERIFICATION",
            text: `YOUR ACOUNT VERIFICATION CODE IS : ${code}`,
          });
          return res.status(201).json({message:"User created with success"});
        } catch (e: any) {
          return res.status(500).json({ message: e.message });
        }
      } else {
        return res.status(409).json({ mesage: "User already exist" });
      }
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }
);
userRouter.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    try {
      const user = await UserService.readUser(req.body.email);
      if (!user) {
        return res.status(404).json({ message: "User does not exist" });
      }
      bcrypt.compare(req.body.password, user.hashedPassword, (berr, bres) => {
        if (berr || !bres) {
          return res.status(401).json({ error: "Authentication failed" });
        }
        //   const token = jwt.sign({id:user.id,email:user.email},ACCESS_SECRET_KEY);
      });
      const token = await TokenService.createToken({
        id: user.id,
        email: user.email,
      });
      return res.status(200).json({ message: "Login successful", token });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }
);

// protected route
userRouter.get("/profile", verifyToken, (req: Request, res: Response) => {
  res.json({
    message: "Profile route - Authorized user",
    userId: req.body.userId,
  });
});

userRouter.get(
  "/verification",
  body("code").isInt(),
  verifyToken,
  async (req: Request, res: Response) => {
    
    const code = await UserService.readVerifyCodeById(req.body.userId);
    if (!code) {
      return res.status(500).json({ message: "Unexpected Error" });
    }
    const inputCode = parseInt(req.body.code);
    console.log(code.verifyCode);
    console.log(inputCode);
    if (inputCode != code.verifyCode) {
      return res.status(400).json({ message: "Code is not valid" });
    }
    return res.status(200).json({ message: "Valid code" });
  }
);
