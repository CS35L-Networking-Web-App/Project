import { useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "./api.js";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string()
      .min(8)
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string()
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignUp(){

    const navigate = useNavigate();
    const [signUpMessage, setSignUpMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const{
    register,
    handleSubmit, 
    formState:{errors, isSubmitting},
    setError, 
    control,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  }); 
 
 const passwordValue = useWatch({ control, name: "password", defaultValue: "" }) || "";
 const confirmValue = useWatch({ control, name: "confirmPassword", defaultValue: "" }) || "";

 const passwordChecks = [
  { label: "At least 8 characters", ok: passwordValue.length >= 8 },
  { label: "Contains uppercase letter", ok: /[A-Z]/.test(passwordValue) },
  { label: "Contains number", ok: /[0-9]/.test(passwordValue) },
  { label: "Contains special character", ok: /[^A-Za-z0-9]/.test(passwordValue) },
  { label: "Passwords match", ok: confirmValue.length > 0 && passwordValue === confirmValue },
 ];
 const statusColor = (ok) => ok ? "text-green-600" : "text-red-600";
 const statusIcon = (ok) => ok ? "✓" : "✗";

 const onSubmit = async ({ name, email, password, confirmPassword}) => {
  try {
    console.log("Sign-up Submitted:", { name, email, password, confirmPassword });
    const result = await registerUser(email, password, confirmPassword, name);
    console.log("Registered:", result);

    setSignUpMessage("Account created successfully!");
    setSuccess(true);
    setTimeout(() => navigate("/"), 1000);
    
  } catch (error) {
    console.error(error);
    setError("root", { message: "Sign-up failed" });
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

      {/* Name */}
      <div>
        <label
        htmlFor="name"
        className="text-black mb-1 font-medium text-gray-900"
        >Name</label>
        <input
        {...register("name")}
        id="name"
        type="text"
        placeholder="Your name..."
        className={`bg-gray-50 border text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary-600"}`}
        />{errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email */}
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

      {/* Password */}
      <div className="relative">
        <label
        htmlFor="password"
        className="block mb-1 font-medium text-gray-900"
        >Password</label>
        <input
        {...register("password")}
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="Password..."
        className={`bg-gray-50 border text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 ${errors.password 
          ? "border-red-500 focus:ring-red-500" 
          : "border-gray-300 focus:ring-primary-600"}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-10.5 -translate-y-1 right-3 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={23} /> : <Eye size={23} />}
        </button>
        <div className="mt-2 text-sm space-y-1">
          {passwordChecks.map((rule) => (
            <div key={rule.label} className={statusColor(rule.ok)}>
              {statusIcon(rule.ok)} {rule.label}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Password */}
        <div className="relative">
          <label
            htmlFor="confirmPassword"
            className="block mb-1 font-medium text-gray-900">
            Re-enter Password</label>
          <input
            {...register("confirmPassword")}
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter Password..."
            className={`bg-gray-50 border text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary-600" }`}/>
          <button
            type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute top-10.5 -translate-y-1 right-3 text-gray-500 hover:text-gray-700"
          tabIndex={-1}>
            {showConfirmPassword ? <EyeOff size={23} /> : <Eye size={23} />}
          </button>
        </div>

      {/* Message */}
      {signUpMessage && (<p className={`text-center ${success ? "text-indigo-700" : "text-red-500"}`}>{signUpMessage}</p>)}

      {/* Submit */}  
      <button
      type="submit"
      className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5"
      disabled={isSubmitting || success}
      >Sign Up</button>
     </form>     
    </div>
  );
};
