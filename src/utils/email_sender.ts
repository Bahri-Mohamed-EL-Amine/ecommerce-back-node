import { error } from 'console';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bahrimohamedelamine22esi@gmail.com",
    pass: "wasebvjrvsmxapvv",
  },
});
type MailOptions = {
    from:string;
    to:string;
    subject:string;
    text:string;
}

export const sendEmail = (options:MailOptions)  =>{
    transporter.sendMail(options,(error,_)=>{
        if(error){
            throw new Error(error.message);
        }
    });
}