import { db } from "../utils/db.server";
import  jwt  from "jsonwebtoken";




const ACCESS_SECRET_KEY: string = process.env.ACCESS_SECRET_KEY!;



type UserPayload = {
    id:number;
    email:string;
}


export const createToken =async (userPayload:UserPayload) : Promise<string> =>{
    const accessToken = jwt.sign(userPayload,ACCESS_SECRET_KEY,{expiresIn: '1h'});
    const {id} = userPayload;
    const expiresAt = new Date(Date.now() + 1* 60 * 60 * 1000); // expires after 1h
    await db.token.create({
        data:{
            userId:id,
            token:accessToken,
            expiresAt:expiresAt,
        }
    })
    return accessToken;
}

export const chekExist = async (token:string) : Promise<boolean>=> {
    const Token = await db.token.findUnique({
        where:{
            token
        }
    })
    return Token != null;
}