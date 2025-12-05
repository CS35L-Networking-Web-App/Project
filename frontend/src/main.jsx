import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./SignUp.jsx";
import './styles.css'
import SignIn from './SignIn.jsx'
import Home from './Home.jsx'
import Messages from './Messages.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />}/>
      <Route path="/home" element={<Home/>} />
      <Route path="/messages" element={<Messages />} />  
    </Routes>
    </BrowserRouter>
  </StrictMode>,
);
