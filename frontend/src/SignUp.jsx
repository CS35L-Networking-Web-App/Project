import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./utilities";

export default function SignUp(){

    const navigate = useNavigate();
    const [signUpMessage, setSignUpMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const{
    register,
    handleSubmit, 
    formState:{errors, isSubmitting},
    setError, 
  } = useForm({resolver: zodResolver(formSchema)}); 

  const onSubmit = async({email, password}) => {

    try{
      console.log("Sign-up Submitted:", {email, password});
      const response = await fetch("https://jsonplaceholder.typicode.com/posts",{
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({email, password}),
      });

    const result = await response.json();

    if (!response.ok) throw new Error("Failed to submit data.");

    setSignUpMessage("Account created successfully!");
    setSuccess(true);
    setTimeout(()=> {navigate("/");}, 3000);

} catch (error){
    setError("root", { message: "Data could not be submitted."});
    setSignUpMessage(error.message);
    setSuccess(false);
    }
};
    return (
    <div className='flex items-center justify-center min-h-screen'>
    <form
     className="p-6 space-y-4 bg-white rounded-lg shadow w-full max-w-sm"
     onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-semibold mb-4">Join now!</h1>
      <div>
        <label
        htmlFor="email"
        className="text-black mb-1 font-medium text-gray-900"
        >Email</label>
        <input
        {...register("email")}
        id="email"
        type="email"
        placeholder="Email..."
        className={`bg-gray-50 border text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary-600"}`}
        />{errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label
        htmlFor="password"
        className="block mb-1 font-medium text-gray-900"
        >Password</label>
        <input
        {...register("password")}
        id="password"
        type="password"
        placeholder="Password..."
        className={`bg-gray-50 border text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary-600"}`}
        />{errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      {signUpMessage && (<p className={`text-center ${success ? "text-indigo-700" : "text-red-500"}`}>{signUpMessage}</p>)}
      <button
      type="submit"
      className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5"
      disabled={isSubmitting || success}
      >Sign Up</button>
     </form>     
    </div>
  );
};