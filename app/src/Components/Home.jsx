import React, { useEffect, useState, useRef } from "react";
import { FaBell, FaBellSlash, FaTimes, FaHeart } from "react-icons/fa";
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
import { motion, AnimatePresence, delay } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { requestNotificationPermission } from "../firebase-messaging"; // path must match your filename
import * as signalR from '@microsoft/signalr';

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
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 80,
      },
    }),
    exit: { opacity: 0, x: -50, scale: 0.9 },
  };
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
  const {login} = useAuth();
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
      const {  sellerId, name } = response.data;
      login( sellerId, name, "Seller");
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
        setSelectItemForBid(false);
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

    const [globalItems, setGlobalItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const[selectedItem, setSelectedItem] = useState(null);
    const [item, setItem] = useState([1]);
    const itemsRefs = useRef({});
    const [showItems, setShowItems] = useState(false);
    const[categories, setCategories] = useState([]);
    const [userId, setUserId] = useState('');
    const [showCategories, setShowCategories] = useState(false);
    const categoryClick = () => {
        setShowCategories(true);
    }
    const itemsClick = () => {
        setShowItems(true);
    }
    useEffect(() => {
        axios.get('https://localhost:7269/api/Item/GetCategory')
        .then(response => {
            setCategories(response.data);
            console.log(response.data);
        })
        .catch(error => console.error('Error fetching categories'));
    },[]);
    useEffect(() => {
        if(!selectedCategory) return;
        const fetchItems = async() =>{
            try{
            const response = await axios.get(`https://localhost:7269/api/Item/GlobalItems/ByCategory/${selectedCategory}`);
            setGlobalItems(response.data);
            console.log(response.data);
            } catch(error) {
                console.error("Error fetching items:", error);
            }
        };
        fetchItems();
    },[selectedCategory]);
    useEffect(() => {
        if(!selectedItem) return;
        const fetchItem = async() => {
            try {
                const response = await axios.get(`https://localhost:7269/api/Item/GlobalItems/ById/${selectedItem}`);
                setItem(response.data);
                console.log(response.data);
            } catch(error) {
                console.error("Error fetching item", error);
            }
        };
        fetchItem();
    },[selectedItem]);
    useEffect(() => {
        if(selectedItem && itemsRefs.current[selectedItem]){
            itemsRefs.current[selectedItem].scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    },[selectedItem]);

    //Wishlist & Cartlish
    const handleWishlist = () => {
        navigate('/wishlist');
    };
    const handleCart = () => {
        navigate('/cart');
    }
    const [wishlist, setWishlist] = useState([]);
    const addToWishlist = async () => {
    try {
        const userId = localStorage.getItem("userId"); 
        if (!userId || !selectedItem) {
            console.warn("User ID or selected item is missing");
            return;
        }

        const response = await axios.post("https://localhost:7269/api/Item/wishlist/add", {
            userId: userId,
            itemId: selectedItem 
        });

        console.log("Item added to wishlist");
        toast.success("Your item is uploaded successfully, you can see the bids now.", {
            duration: 10000,
        });
    } catch (error) {
        console.error("Failed to add:", error.response?.data || error.message);
        toast.error("Failed to add to wishlist");
    }
    };
    const fetchWishlist = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7269/api/Item/wishlist/${userId}`);
            setWishlist(response.data);
            console.log(response.data);
        } catch(error) {
            console.error("Error fetching wishlist", error);
        }
    };
    useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
        fetchWishlist(userId);}
    }, []);
    const inWishlist = (itemId) => {
        return wishlist.some(item => item.ItemId == itemId);
    };
    const toggleWishlist = async (itemId) => {
        const userId = localStorage.getItem("userId");
        if(!userId || !itemId) return;
        const itemExists = inWishlist(itemId);
        try {
            
            if(itemExists){
                await axios.delete(`https://localhost:7269/api/Item/wishlist/remove`, {
                    data: {userId,itemId}
                });
                setWishlist((prevWishlist) => {
                    const updated = prevWishlist.filter(item => item.ItemId !== itemId);
                    return updated;
                });
                toast.info("Item removed from wishlist!");
            } else {
                const {data: newItem} = await axios.post("https://localhost:7269/api/Item/wishlist/add",
                    {
                        userId, itemId
                    }
                );
                const added = newItem || {ItemId: itemId};
                setWishlist(prevWishlist => {
                    const updated = [...prevWishlist, added];
                    return updated;
                });
                toast.success("Item added to wishlist!");
            }
        } catch (error) {
            console.error("Error toggling wishlist",error);
            toast.error("Something went wrong. Please try again.");
        }
    };
    const [cartItems, setCartItems] = useState([]);
    const quantity =1;
    const addItemToCart = async (userId,itemId, quantity) => {
        try {
            const response = await axios.post(`https://localhost:7269/api/Item/addItemToCart/${userId}`,{
                userId: userId,
                itemId: itemId,
                quantity: quantity
            });
            console.log("Item added:", response.data);
            toast.success("Item is added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error.response?.data||error.message);
            toast.info("Error to add!");
        }
    };


    const detailsRef = useRef(null);
    const [userBid, setUserBid] = useState(0);
    const [currentBid, setCurrentBid] = useState(null);
    const [selectItemForBid, setSelectItemForBid] = useState(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (detailsRef.current && !detailsRef.current.contains(event.target)) {
                setSelectItemForBid(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [detailsRef]);
    
    const bellRef = useRef();

  useEffect(() => {
    const handleNotification = (e) => {
      const msg = e.detail;
      const audio = new Audio("/notification.mp3");
      audio.volume = 1.0;
      audio.play().catch(err => console.warn("🔇 Sound error:", err));

      if (bellRef.current) {
        bellRef.current.classList.add("animate-ping-bell");
        setTimeout(() => bellRef.current.classList.remove("animate-ping-bell"), 3000);
      }
    };

    window.addEventListener("play-notification", handleNotification);
    return () => window.removeEventListener("play-notification", handleNotification);
  }, []);

const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const fetchNotifications = async (userId) => {
  try {
    const res = await axios.get(`https://localhost:7269/api/Auth/GetNotification/${userId}`);
    setNotifications(res.data);
    console.log(res.data);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
  }
};
useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    fetchNotifications(userId); 
  } else {
    console.warn("⚠️ No valid userId in localStorage");
  }
}, []);

  

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
                text-lg text-center cursor-pointer"
                onClick = {() => {
                  setSelectedCategory(name);
                  setShowItems(true);
                }}
                >
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
        <motion.div ref = {dropDownRef}
        initial={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.4
        }}
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

        </motion.div>
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
        <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.4
        }}
        ref={dropDownRef} className="fixed dark:bg-pink-100 bg-tag-l3 border dark:border-pink-400 border-tag-l4  md:h-[320px] h-[320px] 
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
        </motion.div>
      )}

      <button 
      ref = {bellRef} 
      className="fixed md:top-[100px] top-[100px] left-5  p-3 rounded-full shadow-lg transition"
      >
        <FaBell 
        id="notification-bell"
        onClick={() => {
        console.log("🔔 userId:", userId);
      setShowNotifications(!showNotifications);
      fetchNotifications(userId); 
      }}
        className="h-5 w-5 dark:text-tag-l2 text-dark dark:hover:text-tag-lp hover:text-tag-lp animate-ring" />
      </button>

      {showItems && (
                  <div className="fixed md:h-[620px] h-[1200px] md:w-[92%] w-[95%] bg-tag-l3 top-10 md:mx-5 left-2 md:my-20 my-10">
                      <div className="flex justify-between items-center px-6 py-6">
                          <h1 className="font-bold md:text-3xl text-xl md:ml-[40%] ml-[10%] border-b border-tag-l">Shop By Category</h1>
                          <FaTimes onClick={() => setShowItems(false)} className="cursor-pointer h-6 w-6 text-tag-l hover:text-tag-dark"/>
                      </div>
                      <div className="md:flex md:gap-20 grid gap-0">
      
                          <div className="md:w-[75%] w-[90%]">
                          {Array.isArray(item) && item.length > 0 ? (
                              item.map((i,index) => (
      
                              <div key={i.ItemId} className="border dark:border-tag-b2 border-tag-l5 dark:bg-black bg-tag-l5 shadow-lg md:p-10 p-4
                               rounded-xl  md:h-[450px] h-[450px] md:w-[1000px] w-[400px] md:mt-[30px] md:ml-[50px] ml-[10px] md:flex md:gap-10">
                              <div className="md:w-[580px] md:h-[480px] w-[360px] h-[180px] relative overflow-hidden ">
                                  <img src={`https://localhost:7269${i.ImagePath}`} alt={i.Name} className=" object-cover w-full h-[78%]" />
                              </div>
                              <div className="md:w-[450px] w-[360px]">
                                  <h2 className="text-2xl font-bold md:py-2 text-center text-tag-lp">{i.Name}</h2>
                                  <p className="text-sm text-tag-dark dark:text-tag-l2 md:mt-4 mt-2 md:h-[150px] h-[80px]">
                                  {i.Description} 
                                  </p>
                              <div className="flex justify-between items-center">
                                  <div className="grid md:py-6 py-4">
                                  <p className="text-tag-dark dark:text-tag-l2 font-bold">Current Bid: <span className="text-tag-lp"> ₹ {i.CurrentBid}</span></p>
                                  </div>
                                  <div>
                                  <FaHeart
                                  size={24}
                                  className={`cursor-pointer transition-all duration-300 ${
                                      inWishlist(i.ItemId) ? "text-red-500" : "text-white"
                                  }`}
                                  onClick={() =>{ 
                                      toggleWishlist(i.ItemId); 
                                      // addToWishlist(i.ItemId);
                                  }}
                                  />
                                  </div>
                              </div>
                              <div className="flex justify-between items-center">
                                  <button className="h-10 w-40 bg-tag-lp rounded-3xl text-tag-l2 font-semibold hover:bg-tag-l2 hover:text-tag-lp"
                                  onClick = {() =>{
                                    setSelectItemForBid(i);
                                    setCurrentBid(i.currentBid);
                                  }}>Raise Bid</button>
                                  <button className="h-10 w-40 bg-tag-lp rounded-3xl text-tag-l2 font-semibold hover:bg-tag-l2 hover:text-tag-lp"
                                  onClick = {() => addItemToCart(userId,i.ItemId,quantity)}>Add to cart</button>
                              </div>
                              </div>
                              </div>
                              
                                  ))
                              ) : (
                                  <p className="text-center font-semibold p-10">No items found</p>
                              )}
                          
                          </div>
      
                          <div className="md:mt-[30px] mt-[10px] md:bg-tag-l bg-tag-l3 md:w-[200px] md:h-[450px] h-[130px] w-[400px] md:overflow-y-scroll overflow-x-scroll scrollbar-hide md:grid md:gap-[0px] flex gap-0 mx-4">
                              {Array.isArray(globalItems) && globalItems.length>0 ? (
                                  globalItems.map((globalItem, index) => (
                                      <motion.div 
                                      key={globalItem.ItemId} 
                                      ref = {(el) => (itemsRefs.current[globalItem.ItemId] = el)}
                                      className={`mx-2 my-4 px-2 py-2 shadow-lg cursor-pointer border-2 transition-all duration-200 ${
                                      selectedItem === globalItem.ItemId
                                          ? 'border-tag-lp'
                                          : 'border-tag-l5'
                                      }`}
                                      onClick={()=> setSelectedItem(globalItem.ItemId)}
                                      whileTap={{scale:0.95}}
                                      whileHover = {{scale:1.05, boxShadow:"0px,0px,10px rgba(0,0,0,0.3)"}}
                                      transition={{type: "spring", stiffness: 300}}>
                                          <img src={`https://localhost:7269${globalItem.ImagePath}`} alt={globalItem.Name} className="md:h-[100px] h-[60px] w-full object-cover "/>
                                          <h1 className="md:text-center md:font-semibold font-normal text-sm md:mt-2">{globalItem.Name}</h1>
                                      </motion.div>
                                  ))
                              ):(
                                  <p>No items found</p>
                              )}
                          </div>
                      </div>
                  </div>
              )}
      
      {selectItemForBid && ( 
            <motion.div 
                ref = {detailsRef}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className=" fixed md:top-40 top-20  md:h-[420px] h-[620px] md:w-[94%] w-[80%] bg-[#3A1C32] text-[#EBDDD3] accent-[#F7E7CE] dark:bg-[#EBDDD3] dark:text-[#3A1C32] md:flex grid md:gap-20 gap-0 md:p-12 p-8 mx-10">
                    
                    <div className="md:w-[40%] w-[63%] text-center">
                        <motion.h1 
                        initial={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-[#D4AF37] md:text-4xl text-3xl font-serif drop-shadow-md dark:text-[#8B0000] font-semibold md:py-4 py-2">
                            {selectItemForBid.Name}
                        </motion.h1>
                        <p className="px-2 py-4"> {selectItemForBid.Description}
                        </p>
                        <div className="text-start mt-4 flex gap-4">
                            <p className="w-[55%] text-lg font-bold">Current Bid: 
                              <span className="font-semibold ml-4">₹{selectItemForBid.CurrentBid}</span> </p>
                            <input
                            type="number"
                            placeholder="Enter your bid"
                            value={userBid}
                            onChange={(e) => setUserBid(Number(e.target.value))}
                            className="w-[40%] px-4 py-2 border-b bg-transparent text-center h-8 "
                            />

                        </div>
                        <div className="md:px-11 px-2 py-10 flex md:gap-20 gap-6 ">
                            <motion.button 
                            whileHover={{ scale: 1.05 }}
                            className="md:w-40 w-[220px] h-12 border rounded-3xl bg-[#EBDDD3] text-[#3A1C32] font-bold dark:bg-[#3A1C32] dark:text-[#EBDDD3]">Contact Sellor</motion.button>
                            <motion.button 
                            whileHover={{ scale: 1.05 }}
                            onClick={() => {
                            const totalBid = selectItemForBid.CurrentBid + userBid;
                            axios.post("https://localhost:7269/api/Item/RaiseBid", {
                                itemId: selectItemForBid.ItemId,
                                newBid: totalBid,
                                userId: userId
                            })
                            .then(res => {
                                const updated = { ...selectItemForBid, CurrentBid: res.data.newBid };
                                setSelectItemForBid(updated);
                                setCurrentBid(res.data.newBid);
                                setUserBid(0);
                                toast.success("Bid is raised successfully.",
                                        {
                                          duration:10000,
                                        });
                            })
                            .catch(err => console.error("Bid failed", err));
                            }}

                            className="md:w-40 w-[220px] h-12 border rounded-3xl bg-[#EBDDD3] text-[#3A1C32] font-bold dark:bg-[#3A1C32] dark:text-[#EBDDD3]">Raise Bid</motion.button>
                        </div>
                    </div>
                    <div className="md:w-[60%] w-[63%]  border">
                        <motion.img src={`https://localhost:7269${selectItemForBid.ImagePath}`}
                        className="md:h-full h-[150px] w-full"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}/>
                    </div>
                </motion.div>
            )}

      {showNotifications && (
        <div className="fixed top-[160px] left-5 bg-white p-4 rounded shadow-lg z-50 w-[300px]">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul>
              <AnimatePresence>
                {notifications.map((n,index) => (
                <motion.li 
                key={n.Id} 
                custom={index}
                variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
                className=" mb-2 shadow-lg h-12 w-[260px] border-gray-100 grid gap-0 ">
                  <h1 className="text-sm mx-4 text-black font-semibold">
                    {n.Message} 
                  </h1>
                  <h1 className="mx-4 flex justify-center gap-[100px]">
                    <span className="text-xs text-gray-500">
                    {n.CreatedAt.slice(0,10)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {n.CreatedAt.slice(11,19)}
                    </span>
                  </h1>
                </motion.li>
              ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}

    </>
  );
}

export default Home;
