import React, { useEffect, useState, useRef } from "react";
import { FaBell, FaBellSlash } from "react-icons/fa";
import {Toaster, toast} from 'react-hot-toast';
import Nav from "./Nav";
import clock1 from "../Assets/c5.webp";
import decor1 from "../Assets/d1.webp";
import furniture1 from "../Assets/f1.jpg";
import jwellery1 from "../Assets/j1.webp";
import light1 from "../Assets/l1.avif";
import m1 from "../Assets/m1.jpg";
import mc1 from "../Assets/mc1.jpg";
import p1 from "../Assets/p1.avif";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import f2 from "../Assets/f2.jpg";
import j2 from "../Assets/j2.jpg";
import p2 from "../Assets/p2.webp";
import c2 from "../Assets/c5.webp";
import l2 from "../Assets/l5.jpg";
import coin from "../Assets/coin1.jpg";
import book from "../Assets/book1.jpg";
import pottery from "../Assets/d2.webp";
import religious from "../Assets/religious2.webp";
import post from "../Assets/post.jpeg";
import sc from "../Assets/sc.webp";
import fabric from "../Assets/fabric.jpg";
import { div, h1, p } from "framer-motion/client";
import Item from "./Item";
import End from "./End";

function Home() {
  const dropDownRef = useRef(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeSent,setIsCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [sellerId, setSellerId] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const registerLink = () => {
    setShowRegister(true);
  }

  const loginLink = () => {
    setShowLogin(true);
  }

  const handleGetCode = async () => {
    try {
      const response = await axios.post('https://localhost:7269/api/Auth/sendCode', {
        Email: email,
        Name: name
      });
      if(response.status === 200){
        setIsCodeSent(true);
        setError('');
      } else {
        setError('Failed to send Code')
      }
    } catch (error) {
      setError('Failed to send Code');
    }
  }

  const handleVerifyCode = async () =>{
    try {
      const response = await axios.post('https://localhost:7269/api/Auth/checkCode', {
        email,code
      });
      if(response.status === 200){
        setIsCodeVerified(true);
        setError('');
      } else {
        setError("Invalid Code or Expired Code");
      }
    } catch (error) {
      setError('Error verifying OTP');
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password != confirmPassword){
      setError('Passwords do not match');
      return;
    }
    const registerData = {
      name, email, mobileNumber, address, storeName, businessType, pincode, password, confirmPassword
    };
    try {
      const response =
      await axios.post('https://localhost:7269/api/Auth/RegisterSeller', registerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setError('');
      toast.success("Welcome to sparsha family, Your SellerId is sent to your Email.",
        {
          duration:10000,
        }
      );
      setShowRegister(false);

    } catch(error) {
      setError(error.response?.data?.message || "Something went wrong!");
    }
  }
  const {login} = useAuth();
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const loginData = {sellerId, password};
    try{
      const response =
      await axios.post('https://localhost:7269/api/Auth/Sellerlogin', loginData,{
        headers: {
          'Content-Type' : 'application/json',
        },
      });
      login( response.data.name,response.data.sellerId);
      setError('');
      toast.success("Logged in successfully",{
        duration: 5000,
      });
      setShowLogin(false);
    } catch(error){
      const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.errors?.Password?.[0] ||
      "Something went wrong!";
      setError(errorMsg);
    }
  }


  useEffect(() => {
    function handleClickOutside(event) {
      if(dropDownRef.current && !dropDownRef.current.contains(event.target))
      {
        setShowRegister(false);
        setShowLogin(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  },[]);

  const items = [
    { id: 1, src: clock1 },
    { id: 2, src: decor1 },
    { id: 3, src: furniture1 },
    { id: 4, src: light1 },
    { id: 5, src: m1 },
    { id: 6, src: mc1 },
    { id: 7, src: p1 },
    { id: 8, src: jwellery1 },
  ];

  const cats = [
    { id: 1, src: f2, name: "Furniture" },
    { id: 2, src: j2, name: "Jewelry & Accessories" },
    { id: 3, src: p2, name: "Art & Paintings" },
    { id: 4, src: book, name: "Books & Manuscripts"},
    { id: 5, src: pottery, name: "Ceramic & Pottery" },
    { id: 6, src: c2, name: "Clocks & Watches" },
    { id: 7, src: coin, name: "Coins & Currency" },
    { id: 8, src: religious, name: "Religious Items" },
    { id: 9, src: l2, name: "Lighting"},
    { id: 10, src: sc, name: "Scientific Intruments"},
    { id: 11, src: post, name: "Photographs & Postcards"},
    { id: 12, src: fabric, name: "Textile & Fabrics"}
  ];

  const [visibleGroup, setVisibleGroup] = useState(0); 

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleGroup((prev) => (prev === 0 ? 1 : 0)); 
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  const visibleItems = items.slice(visibleGroup * 4, visibleGroup * 4 + 4);

  const [visibleCat, setVisibleCat] = useState(0);
  useEffect (() => {
    const interval = setInterval(() => {
      setVisibleCat((prev) => (prev === 0 ? 1 : 0));
    }, 10000);
    return () => clearInterval(interval);
  },[]);

  const visibleCats = cats.slice(visibleCat * 6, visibleCat * 6 + 6);
  
  const handleLogout = () => {
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  navigate("/");
};


  return (
    <>
      <Nav />
      <Toaster position = "bottom-left" reverseOrder = {true} className="" toastOptions={{
        duration: 10000,
      }}/>
      <div className="bg-gradient-to-b from-tag-l2 to-tag-l3 md:px-16 px-10 py-40 md:flex grid md:gap-20 gap-10
      dark:bg-gradient-to-b dark:from-tag-black dark:to-tag-dark md:h-[540px] h-[800px] w-full">
        <div>
          <img
            src={furniture1}
            alt=""
            className="h-[340px] md:w-[800px] w-[400px] px-14 py-8 border-2 border-white dark:bg-white bg-tag-light"
          />
        </div>
        <div className="grid md:ml-0 ml-4">
          <h1 className="md:text-4xl text-2xl dark:text-tag-light text-tag-dark font-semibold mt-6">
            Welcome to
            <span className="md:text-6xl text-4xl dark:text-tag-lp text-tag-lp ml-10 font-alex">
              Sparsha
            </span>
          </h1>
          <h1 className="md:text-2xl text-xl dark:text-white text-tag-dark md:ml-10 ml-4 font-semibold mt-10">
            <h1>“ Where elegance meets nostalgia.</h1>
            <h1 className="ml-4">One-of-a-kind pieces.</h1>
            <h1 className="ml-4">One-of-a-kind you.❤️ ”</h1>
          </h1>
        </div>
      </div>

      
      <div className="md:h-[500px] h-[450px] md:px-16 px-10 py-10 dark:bg-gradient-to-t dark:from-tag-dark 
      dark:to-tag-dark bg-gradient-to-t from-tag-l2 to-tag-l3">
        <div className="h-full bg-tag-light dark:bg-white rounded-lg shadow-inner px-6 
        md:py-10 py-5 flex justify-center gap-6 transition-all duration-700">
          {visibleItems.map(({ id, src }) => (
            <div key={id} className="md:min-w-[22%] min-w-[20%]">
              <motion.img
                src={src}
                alt={`item-${id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: id * 0.1 }}
                className="h-[300px] w-full object-cover rounded-xl shadow-lg 
                hover:scale-105 transition-transform duration-300 mt-4"
              />
              
            </div>
          ))}
        </div>
      </div>

      <div className="md:h-[700px] h-[2800px] md:px-16 px-10 py-10 dark:bg-gradient-to-b dark:from-tag-dark dark:to-black
      bg-gradient-to-b from-tag-l2 to-tag-l3">

        <div className="text-center font-semibold text-4xl dark:text-tag-l text-tag-dark">
            <h1 className="">Shop By Category</h1>
        </div>
        
        <div className="md:h-[520px] h-[2720px] dark:bg-tag-y2 bg-tag-l4 mt-10  py-12 px-10">
          <div className="h-full md:flex grid justify-center gap-6 ">
            {visibleCats.map(({id,src,name}) => (
            <div key={id} className="min-w-[10%] pz-10">
              <motion.img 
              src={src} 
              alt={`cat-${id}`} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: id * 0.1 }}
              className="h-[300px] w-full object-cover rounded-lg shadow-lg 
                hover:scale-105 transition-transform duration-300 mt-4"
              />
              <div className="mt-6 h-16 bg-tag-lp content-center rounded-lg">
                <h1 className="text-tag-l2 font-medium w-full px-2 hover:text-tag-dark
                text-lg text-center cursor-pointer">
                {name}
              </h1>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="md:h-[340px] h-[320px] md:px-16 px-10 py-10 dark:bg-gradient-to-t dark:from-tag-dark dark:to-black
      bg-gradient-to-b from-tag-l3 to-tag-l2">

        <div className="md:h-[200px] h-[240px] bg-[#5C2A3B] dark:bg-[#1C1117] p-8 rounded-xl shadow-xl text-center">
          <div className="text-[#F3E5C2] dark:text-[#FDEBD3]">
            <h1 className="font-semibold text-4xl font-alex py-2">Become a Seller </h1>
            <p>“Share your treasures with the world—list, bid, and earn from your antiques today.”</p>
          </div>
          <div className="border w-60 md:ml-[41%] ml-[10%] mt-6 h-10 rounded-3xl bg-[#F3E5C2] text-[#5C2A3B] font-semibold 
          py-1 cursor-pointer" onClick = {() => setShowRegister(!showRegister)} >
            <button 
            >Register Here</button>
          </div>
        </div>
        
      </div>
      
      <Item/>
      <End/>

      {showRegister && (

        <div>
          {!isCodeVerified ? (  
        <> 
        {!isCodeSent ? ( 
        <div ref = {dropDownRef}
        className="fixed dark:bg-pink-100 bg-tag-l3 border dark:border-pink-400 border-tag-l4  md:h-[670px] h-[660px] 
        md:w-[500px] w-[380px] md:ml-[35%] ml-9 md:top-[120px] top-20 rounded-lg z-50 p-10 grid gap-4">
          
          <div className="text-center font-bold text-2xl text-tag-dp ">
            <h1 className="border-b-2 ">Register Here</h1>
          </div>
          
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your Full Name" 
              value={name}
              onChange = {(e) => setName(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="email" 
              required 
              placeholder="Enter your Email" 
              value={email}
              onChange = {(e) => setEmail(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="email" 
              required 
              placeholder="Enter your Mobile Number" 
              value={mobileNumber}
              onChange = {(e) => setMobileNumber(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your StoreName" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your BusinessType" 
              value={businessType}
              onChange = {(e) => setBusinessType(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your Address" 
              value={address}
              onChange = {(e) => setAddress(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your Pincode" 
              value={pincode}
              onChange = {(e) => setPincode(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          {error && <p>{error}</p>}
          <div className="" onClick={handleGetCode}>
              <button className="dark:bg-pink-500 bg-tag-l4 border dark:border-tag-lp border-tag-light dark:text-white 
                text-tag-dark h-10 w-40 rounded-2xl md:ml-[35%] ml-[24%] font-bold text-lg dark:hover:text-tag-dark hover:text-tag-lp">Get Code</button>
          </div>
          <div className="text-center">
            <h1 className="text-tag-dark font-normal">Have an account already ? 
              <span className="text-tag-lp font-bold cursor-pointer ml-2" 
              onClick = {() => {setShowLogin(!showLogin); setShowRegister(false);}}>Login </span> Here
            </h1>
          </div>

        </div>
        ) : (
          <div className="fixed dark:bg-pink-100 bg-tag-l3 border dark:border-pink-400 border-tag-l4  md:h-[210px] h-[190px] 
        md:w-[500px] w-[380px] md:ml-[35%] ml-9 md:top-80 top-60 rounded-lg z-50 p-10 grid gap-4">
            <div>
              <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required 
              placeholder="Enter your Pincode" 
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
            </div>
            {Error && <p>{error}</p>}
            <div className="" >
              <button onClick={handleVerifyCode}
              className="dark:bg-pink-500 bg-tag-l4 border dark:border-tag-lp border-tag-light dark:text-white 
                text-tag-dark h-10 w-40 rounded-2xl md:ml-[35%] ml-[24%] font-bold text-lg dark:hover:text-tag-dark hover:text-tag-lp">Verify Code</button>
            </div>

          </div>
        )}
        </>
        ) : (
          <div className="fixed dark:bg-pink-100 bg-tag-l3 border dark:border-pink-400 border-tag-l4  md:h-[260px] h-[230px] 
        md:w-[500px] w-[380px] md:ml-[35%] ml-9 md:top-60 top-60 rounded-lg z-50 p-10 grid gap-4">

          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your Password" 
              value={password}
              onChange = {(e) => setPassword(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Confirm your Password" 
              value={confirmPassword}
              onChange = {(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          {error && <p>{error}</p>}
          <div className="" >
              <button onClick={handleSubmit}
              className="dark:bg-pink-500 bg-tag-l4 border dark:border-tag-lp border-tag-light dark:text-white 
                text-tag-dark h-10 w-40 rounded-2xl md:ml-[35%] ml-[24%] font-bold text-lg dark:hover:text-tag-dark hover:text-tag-lp">Register Here</button>
          </div>

          </div>
        )}
        </div>
      )}

      {showLogin && (
        <div ref={dropDownRef} className="fixed dark:bg-pink-100 bg-tag-l3 border dark:border-pink-400 border-tag-l4  md:h-[320px] h-[320px] 
        md:w-[500px] w-[380px] md:ml-[35%] ml-9 md:top-[280px] top-60 rounded-lg z-50 p-10 ">

          <form className="grid gap-4" onSubmit={handleLogSubmit}>
            <div className="text-center font-bold text-2xl text-tag-dp ">
            <h1 className="border-b-2 ">Login Here</h1>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your Seller Id" 
              value={sellerId}
              onChange = {(e) => setSellerId(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          <div>
              <input 
              type="text" 
              required 
              placeholder="Enter your Password" 
              value={password}
              onChange = {(e) => setPassword(e.target.value)}
              className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
          </div>
          {error && <p className="text-red-600 text-center font-semibold">{error}</p>}
          <div className="" onClick={handleLogSubmit}>
              <button type="submit" className="dark:bg-pink-500 bg-tag-l4 border dark:border-tag-lp border-tag-light dark:text-white 
                text-tag-dark h-10 w-40 rounded-2xl md:ml-[35%] ml-[24%] font-bold text-lg dark:hover:text-tag-dark hover:text-tag-lp">Log In</button>
          </div>
          </form>
        </div>
      )}

      <button
        className="fixed md:top-[100px] top-[100px] left-5  p-3 rounded-full shadow-lg transition"
        // onClick={() => alert('Notifications')}
      >
        <FaBell className="h-5 w-5 dark:text-tag-l2 text-dark dark:hover:text-tag-lp hover:text-tag-lp animate-ring" />
      </button>

    </>
  );
}

export default Home;
