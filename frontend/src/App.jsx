import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function App(){
  return(
    <div className='flex items-center justify-center min-h-screen'>
      <div className='flex flex-col w-full max-w-xs mx-auto'>
      <SignInForm/> 
      <SignUpButton/> 
      </div>
    </div>
  );
}

const SignUpButton = () =>{
const navigate = useNavigate();
  return (
      <button className='w-full text-white bg-indigo-500 hover:bg-indigo-700 rounded-lg px-5 py-2.5 mt-10'
      onClick={() => navigate("/signup")}
      >Sign Up
      </button>
  );
};

const SignInForm = () =>{

  const{
    register,
    handleSubmit, 
    formState:{errors, isSubmitting},
    setValue,
    setError, 
  } = useForm(); 

  const onSubmit = async({email, password}) => {

    try{
      console.log("Form Submitted:", {email, password});
      const response = await fetch("https://jsonplaceholder.typicode.com/posts",{
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({email, password}),
      });

    if (!response.ok) throw new Error("Failed to submit data.");
    setValue("email", "");
    setValue("password","");
  } catch (error){
    setError("root", { message: "Data could not be submitted."});
  }};
  
  return (
     <form
     className="p-6 space-y-4 bg-white rounded-lg shadow w-full max-w-sm"
     onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <div>
        <label
        htmlFor="email"
        className="text-black mb-1 font-medium text-gray-900"
        >Email</label>
        <input
        {...register("email",{required: "Please enter an email address."})}
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
        {...register("password",{required: "Please enter a password.", minLength:{value: 8, message: "Password must be at least 8 characters long",},})}
        id="password"
        type="password"
        placeholder="Password..."
        className={`bg-gray-50 border text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary-600"}`}
        />{errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <button
      type="submit"
      className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5"
      disabled={isSubmitting || success}
      >Sign in</button>
     </form>  
  );
};