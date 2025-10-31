import * as z from "zod";

export const formSchema = z.object({
  email: z.string().min(1,{message: "Please enter an email."}).email(), 
  password: z.string().min(1,{message: "Please enter a password."}).min(8,{message: "Password must be at least 8 characters long."})
});
