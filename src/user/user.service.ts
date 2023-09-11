import {db} from '../utils/db.server';
import bcrypt from 'bcrypt';
type UserWrite = {
    username:string;
    email:string;
    password:string;
    
}
type UserRead = {
  id: number;
  username: string;
  email: string;
  hashedPassword: string;
  verifyCode: number;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
};
type UserCheck = {
    id:number;
    username: string;
    email: string;
    hashedPassword: string;
}
export  const  signUp = async (userWrite:UserWrite,verifyCode:number) : Promise<UserRead>=> {
    const {email,password,username} = userWrite;
    const hashedPassword = await bcrypt.hash(password,10);
    return db.user.create({
        data:{
            email,
            username,
            hashedPassword,
            verifyCode,
        }
    });
}


export const readUser = async(email:string) : Promise<UserCheck | null> =>{
   const user =  await db.user.findUnique({
        where:{
            email
        }
        ,select:{
            username:true,
            hashedPassword:true,
            email:true,
            id:true,
        }
    });
    return user;
}


type VerifyCode = {
    verifyCode:number;
}
export const readVerifyCodeById = async (id: number): Promise<VerifyCode | null> => {
  const code = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      verifyCode: true,
    },
  });
  return code;
};