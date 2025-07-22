import { div, h1, p, use } from "framer-motion/client";
import React from "react";
import {useState, useEffect, useRef} from 'react';
import { FaMoon, FaSun, FaTimes, FaBars,FaSearch, FaBell, FaHeart, FaOpencart, FaUser, FaEllipsisV } from "react-icons/fa";
import axios from 'axios';
import ItemsOfSeller from "./ItemsOfSeller";
import {Link} from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {Toaster, toast} from 'react-hot-toast';
import {motion, scale, AnimatePresence} from 'framer-motion';
import { requestNotificationPermission } from '../firebase-messaging';
import CountDownTimer from "./CountDownTimer";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { addToWishlist, removeFromWishlist, setWishlist } from "../redux/slices/wishlistSlice";

function Nav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [error, setError] = useState('');
    const dropDownRef = useRef(null);
    const navigate = useNavigate();
    useEffect (() => {
        function handleClickOutside(event) {
            if(dropDownRef.current && !dropDownRef.current.contains(event.target)){
                setAbout(false);
                setShowUser(false);
                setShowCategories(false);
                setShowRegister(false);
                setShowLogin(false);
                setShowItems(false);
            }
        }
        document.addEventListener('mousedown',handleClickOutside);
        return () => document.removeEventListener('mousedown',handleClickOutside);
    },[]);
    
    //dark mode
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    useEffect(() => {
        if(darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    //search part
    const [search, setSearch] = useState(false);
    const handleClick = () => {
        setSearch(true);
    }

    const [about, setAbout] = useState(false);
    const handleAboutClick = () => {
        setAbout(true);
    }

// item controller part
    const [globalItems, setGlobalItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const[selectedItem, setSelectedItem] = useState(null);
    const [item, setItem] = useState([1]);
    const itemsRefs = useRef({});
    const [showItems, setShowItems] = useState(false);
    const[categories, setCategories] = useState([]);
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
    const dispatch = useDispatch();
    const wishlist = useSelector((state) => state.wishlist.wishlistItems);
    const handleAddToWishlist = async () => {
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
            dispatch(setWishlist(response.data));
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
                dispatch(removeFromWishlist({userId,itemId}))
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
                dispatch(addToWishlist({userId,itemId}))
                toast.success("Item added to wishlist!");
            }
        } catch (error) {
            console.error("Error toggling wishlist",error);
            toast.error("Something went wrong. Please try again.");
        }
    };
    const cartItems = useSelector((state) => state.cart.items);
    const quantity =1;
    const addItemToCart = async (userId,itemId, quantity) => {
        try {
            const response = await axios.post(`https://localhost:7269/api/Item/addItemToCart/${userId}`,{
                userId: userId,
                itemId: itemId,
                quantity: quantity
            });
            dispatch(addToCart({userId,itemId,quantity}))
            toast.success("Item is added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error.response?.data||error.message);
            toast.error("Error to add!");
        }
    };
    
    //Register & Login part
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [pincode, setPincode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress]= useState('');
    const [accept, setAccept] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const {login} = useAuth();
    const {user,logout} = useAuth();
    const [clientId, setClientId] = useState('');
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState(null);
    const [showUser, setShowUser] = useState(false);
    const [step, setStep] = useState("register");
    const userClick = () =>{
        setShowUser(true);
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
    const handleStepSubmit = () => {
        if(!name || !email || !mobileNumber || !address || !accept) {
            alert("Please fill in all fields");
            return;
        }
        console.log("Form submitted:", {name, email, mobileNumber,address,accept});
        handleGetCode();
        setStep("verify");
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(password != confirmPassword){
        setError('Passwords do not match');
        return;
        }
        const registerData = {
         name, email, mobileNumber, address, pincode, password, confirmPassword
        };
        try {
        const response =
        await axios.post('https://localhost:7269/api/Auth/RegisterClient', registerData, {
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
        const loginData = {clientId, password};
        try{
        const response =
        await axios.post('https://localhost:7269/api/Auth/Clientlogin', loginData,{
            headers: {
            'Content-Type' : 'application/json',
            },
        });
        const {  clientId, name } = response.data;
        login( clientId, name, "Client");
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
    const handleLogout = () => {
        logout();
        navigate("/");
        setShowUser(false);
        toast.success("Logged out successfully",{
        duration: 5000,
      });
    }
    const [showRegister, setShowRegister] = useState(false);
    const registerClick = () =>{
        setShowRegister(true);
    }
    const [showLogin, setShowLogin] = useState(false);
    const loginClick = () => {
        setShowLogin(true);
    }
    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedUserId = localStorage.getItem("userId");
        if(storedUserId){
            setUserId(storedUserId);
        }
        if(storedName) {
            setUserName (storedName);
        }
        console.log("userId:", localStorage.getItem("userId"));
        console.log("userName:", localStorage.getItem("userName"));
    },[]);

    const detailsRef = useRef(null);
        const [userBid, setUserBid] = useState();
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

const listVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, 
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};
useEffect(() => {
  if (selectItemForBid) {
    setUserBid(selectItemForBid.CurrentBid || 0);
  }
}, [selectItemForBid]);

    return (
        <>
        <Toaster position = "bottom-left" reverseOrder = {true} className="" toastOptions={{
                duration: 10000,
              }}/>
        <div className="fixed z-50 w-full flex flex-row shadow-lg items-center justify-between 
            h-[80px] px-10 dark:bg-black dark:text-tag-l bg-tag-l4 text-tag-dp top-0 left-0">
          
            <div className="text-4xl font-alex w-fit font-semibold">
                <motion.h1 
                animate={{
                y: [0, -10, 0],
                }}
                transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
                }}

                style={{
                    textShadow: `
                    1px 1px 0 #bbb,
                    2px 2px 0 #aaa,
                    3px 3px 0 #999,
                    4px 4px 0 #888,
                    5px 5px 0 #777
                    `,
                }}>Sparsha</motion.h1>
            </div>

            <div className="hidden md:flex items-center space-x-10 w-[50%] font-semibold text-lg mr-4">
                <Link to="/">
                <h1 className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">Home</h1>
                </Link>
                <h1 onClick = {setAbout}
                className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">About</h1>
                <h1 className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark"
                onClick={() => setShowCategories(!showCategories)}>
                    Categories
                </h1>
                <h1 className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">Contact</h1>
                <FaSearch className="cursor-pointer h-6 w-6 dark:hover:text-tag-dp hover:text-tag-dark" 
                onClick={setSearch}/>
                <FaUser className="cursor-pointer h-6 w-6 dark:hover:text-tag-dp hover:text-tag-dark" 
                onClick={() => setShowUser(!showUser)}/>
                <FaHeart className="cursor-pointer h-6 w-6 dark:hover:text-tag-dp hover:text-tag-dark" 
                onClick = {handleWishlist}
                />
                <FaOpencart className="cursor-pointer h-8 w-8 dark:hover:text-tag-dp hover:text-tag-dark"
                onClick= {handleCart}/>
                {darkMode ? ( 
                <FaSun className="cursor-pointer h-6 w-6 text-yellow-400" 
                onClick = {() => setDarkMode(false)} />
                ):(
                <FaMoon className="cursor-pointer h-6 w-6 text-tag-dark "
                onClick = {() => setDarkMode(true)} />
                )}
            </div>

            <div className="md:hidden dark:text-brand-l text-brand-dark text-2xl cursor-pointer " 
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes/> : <FaBars /> }
            </div>


            {menuOpen && (
            <div className="fixed flex flex-col gap-6 py-10 md:hidden font-semibold text-md items-center 
            dark:bg-black bg-tag-l4 dark:text-tag-l text-tag-dp w-60 h-[480px] top-[80px] ml-[180px]">
                <div>
                    <Link to="/">
                    <h1 className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">Home</h1>
                    </Link>
                </div>
                <div><h1 onClick={setAbout}
                className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">About</h1></div>
                <div><h1 onClick={() => setShowCategories(!showCategories)}
                className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">Categories</h1></div>
                <div><h1 className="cursor-pointer dark:hover:text-tag-dp hover:text-tag-dark">Contact</h1></div>
                <FaSearch className="cursor-pointer h-6 w-6 dark:hover:text-tag-dp hover:text-tag-dark"
                onClick={setSearch}/>
                <FaUser className="cursor-pointer h-6 w-6 dark:hover:text-tag-dp hover:text-tag-dark" 
                onClick={() => setShowUser(!showUser)} />
                <FaHeart onClick={handleWishlist}
                className="cursor-pointer h-6 w-6 dark:hover:text-tag-dp hover:text-tag-dark" />
                <FaOpencart onClick={handleCart}
                className="cursor-pointer h-8 w-8 dark:hover:text-tag-dp hover:text-tag-dark" />
                {darkMode ? ( 
                <FaSun className="cursor-pointer h-6 w-6 text-yellow-400" 
                onClick = {() => setDarkMode(false)} />
                ):(
                <FaMoon className="cursor-pointer h-6 w-6 text-tag-dark "
                onClick = {() => setDarkMode(true)} />
                )}
            </div>
        )}

        { about &&
            <motion.div ref={dropDownRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed dark:bg-pink-100 bg-tag-l5 border dark:border-tag-lp border-tag-l4 h-auto md:w-[600px] w-[400px] md:mt-[23%] mt-[100%] md:ml-[38%] ml-[2px] rounded-lg shadow-md ">
                <p className="px-10 py-10 font-semibold text-md text-tag-dark">
                    <span className="text-tag-lp font-bold text-3xl mr-4">Sparsha</span> 
                    is an innovative online marketplace that connects buyers and sellers 
                    through both bidding and fixed-price listings. Whether you're looking to win 
                    an auction or shop directly, Sparsha provides a seamless and engaging experience.
                    Sellers can showcase their items, set prices or auction them, while buyers enjoy 
                    transparent bidding, real-time notifications, and secure purchasing — all in one place.
                </p>
            </motion.div>
        }

        {search && (
            <div className="fixed dark:bg-pink-100 bg-tag-l2 border dark:border-tag-lp border-tag-l4 h-[120px] md:w-[400px] w-[400px] md:mt-[50%] mt-[100%] md:ml-[38%] ml-[2px] rounded-lg shadow-md ">
                <FaTimes className="text-tag-dark cursor-pointer hover:text-tag-lp"
                onClick={()=> setSearch(false)}/>
                <div className="flex">
                    <input type="text" placeholder="Search here" className="h-10 w-[300px] ml-6 mt-6 dark:bg-pink-200 bg-tag-l4 rounded-md text-dark text-center" />
                    <FaSearch className=" ml-6 mt-6 h-10 w-8 text-tag-dark hover:text-tag-lp cursor-pointer"/>
                </div>
            </div>
        )}

        {showUser && (
            <motion.div ref={dropDownRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed md:ml-[73%] ml-[10%] h-auto w-[300px] bg-gradient-to-b from-tag-l3 to-tag-l2 
            border border-tag-l rounded-lg z-10 top-20">
                    
                    {user && user.userName ? ( 
                    <>
                    <div className="ml-6 mr-6 py-6 border-b border-tag-light">
                        <h1 className="text-gray-700 font-semibold text-xl">Welcome
                            <span className="ml-4 relative text-tag-lp font-extrabold text-xl inline-block 
                                drop-shadow-[2px_2px_0px_#d1d5db] 
                                dark:drop-shadow-[2px_2px_0px_#1f2937] 
                                transform hover:scale-105 transition duration-300 ease-in-out">
                            {user.userName}
                            </span>

                            </h1>
                        <p className="text-tag-dark text-sm mt-2">Manage your account and orders</p>
                    </div>
                    <div className="ml-6 mr-6 py-4 font-normal text-md text-tag-dark space-y-2">
                        <Link to="/order">
                        <h1 className="hover:text-tag-lp text-tag-dark cursor-pointer">Orders</h1>
                        </Link>
                        {user?.role === 'Seller' && (
                        <Link to="/itemsofseller">
                        <h1 className="hover:text-tag-lp text-tag-dark cursor-pointer">Your Products</h1>
                        </Link>
                        )}
                        <h2 className="hover:text-tag-lp text-tag-dark cursor-pointer">Contact Us</h2>
                        <button
                        onClick={handleLogout}
                        className="bg-tag-lp text-white py-2 px-4 rounded-lg font-bold hover:text-tag-dark"
                        >
                        Log Out
                        </button>
                    </div>
                    </>
                    ) :(
                    <> 
                    <div className="ml-6 mr-6 py-6 border-b border-tag-light">
                    <h1 className="text-gray-700 font-semibold text-xl">Welcome</h1>
                    <p className="text-tag-dark text-sm mt-2">To access account and manage orders</p>
                    </div>
                    <div className="flex gap-2 border border-tag-light mt-4 h-10 w-40 py-1 px-5 font-semibold ml-6 mr-6">
                        <h1 className="text-tag-lp hover:text-tag-dark cursor-pointer"
                        onClick={() => setShowLogin(!showLogin)}>LogIn </h1> 
                        <span>/</span> 
                        <h1 className="text-tag-lp hover:text-tag-dark cursor-pointer"
                        onClick={() => setShowRegister(!showRegister)}>Register </h1>
                    </div>
                    <div className="ml-6 mr-6 py-4 font-normal text-md text-tag-dark space-y-2">
                    <Link to="/order">
                    <h1 className="hover:text-tag-lp text-tag-dark cursor-pointer">Orders</h1>
                    </Link>
                    <h2 className="hover:text-tag-lp text-tag-dark cursor-pointer">Contact Us</h2>
                    </div>
                    </>
                    )}
                
                
            </motion.div>
        )}

        {showRegister && (
            <AnimatePresence>
            <motion.div ref={dropDownRef}
            initial={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.4
            }}
            className =" fixed dark:bg-pink-100 bg-tag-l3 border dark:border-pink-400 border-tag-l4 h-auto md:w-[600px] w-[380px] md:ml-[28%] 
            ml-0 md:top-40 top-20 rounded-lg z-50 p-10 grid gap-4">

                {step == "register" && ( 
                <>
                <div className="flex gap-10 ">
                    <input type="text" placeholder="Enter your Firstname" required
                    value={name}
                    onChange = {(e) => setName(e.target.value)}
                    className=" w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
                </div>
                <div>
                    <input type="email" required placeholder="Enter your Email" 
                    value={email}
                    onChange = {(e) => setEmail(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg"/>
                </div>
                <div>
                    <input type="phoneNumber" required placeholder="Enter your MobileNumber" value={mobileNumber}
                    onChange = {(e) => setMobileNumber(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg" />
                </div>
                <div>
                    <input type="text" required placeholder="Enter your Address" value={address}
                    onChange = {(e) => setAddress(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg" />
                </div>
                <div>
                    <input type="text" required placeholder="Enter your Address" value={pincode}
                    onChange = {(e) => setPincode(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg" />
                </div>
                <div className="">
                    <input type="checkbox"  name="accept"
                    checked={accept} onChange={(e) => setAccept(e.target.checked)}
                    className="h-6 w-6 mt-6 cursor-pointer"/>
                    <label className="ml-4 dark:text-tag-dark text-tag-black font-semibold">
                        By continuing, I agree to the <span className="text-tag-lp cursor-pointer">Terms of Use </span>& 
                        <span className="text-tag-lp cursor-pointer"> Privacy Policy</span> and I am above 18 years old.
                    </label>
                </div>
                <div className="">
                    <button onClick={() => handleStepSubmit()}
                    className="dark:bg-pink-500 bg-tag-l4 border dark:border-tag-lp border-tag-light dark:text-white 
                    text-tag-dark h-10 w-40 rounded-2xl md:ml-[35%] ml-[24%] font-bold text-lg dark:hover:text-tag-dark hover:text-tag-lp">Continue</button>
                </div>
                <div className="text-center text-tag-dark font-semibold"><h1>Have trouble to register ? 
                    <span className="text-tag-lp cursor-pointer"> Get Help</span></h1>
                </div>
                </>
                )}

                {step === "verify" && (
                <>
                    <h2 className="text-center font-bold text-tag-dark">Verify Your Email or Mobile</h2>
                    <input type="text" placeholder="Enter verification code" value={code}
                    onChange = {(e) => setCode(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg" />
                    <button onClick={() => {setStep("createPassword"); handleVerifyCode();}}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg h-10 font-semibold">
                    Verify
                    </button>
                </>
                )}

                {step === "createPassword" && (
                <>
                    <h2 className="text-center font-bold text-tag-dark">Create Your Password</h2>
                    <input type="password" placeholder="Enter new password" value={password}
                    onChange = {(e) => setPassword(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg" />
                    <input type="password" placeholder="Confirm password" value={confirmPassword}
                    onChange = {(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 dark:bg-pink-200 bg-tag-l text-black text-center rounded-lg" />
                    <button onClick={handleSubmit} // replace with real submit
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 font-semibold">
                    Submit
                    </button>
                </>
                )}

            </motion.div>
            </AnimatePresence>
        )}

        {showLogin && (
            <motion.div ref={dropDownRef}
            initial={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.4
            }}
            className="fixed md:h-[280px] h-[280px] md:w-[400px] w-[350px] dark:bg-pink-100 bg-tag-l3 p-10 
            md:top-80 top-60 md:ml-[34%] ml-0 rounded-lg border dark:border-pink-400 border-tag-l4 z-50">
                <div >
                    <input type="text" placeholder="Enter your Sparsha Id" required
                    value={clientId}
                    onChange = {(e) => setClientId(e.target.value)}
                    className="h-12 w-full dark:bg-pink-200 bg-tag-l rounded-lg text-tag-dark text-center"/>
                </div>
                <div>
                    <input type="password" placeholder="Enter your password" required 
                    value={password}
                    onChange = {(e) => setPassword(e.target.value)}
                    className="h-12 w-full dark:bg-pink-200 bg-tag-l rounded-lg text-tag-dark text-center mt-6"/>
                </div>
                <div>
                    <button onClick={handleLogSubmit}
                    className="dark:text-white text-tag-dark dark:hover:text-tag-dark hover:text-tag-lp dark:bg-tag-lp bg-tag-l4 font-bold text-lg w-40 h-10 
                    rounded-3xl mt-6 md:ml-[23%] ml-[20%]">Log In </button>
                </div>
                <div className="text-tag-dark mt-2 text-center">
                    <h1 >Not have an account? <span className="text-tag-lp font-semibold cursor-pointer"> Register Here</span></h1>
                </div>
            </motion.div>
        )}

        {showCategories && (
            <motion.div ref={dropDownRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute md:ml-[54%] ml-[25%] h-[450px] w-[300px] text-tag-dark font-semibold 
            bg-gradient-to-b from-tag-l3 to-tag-l2 border border-tag-l rounded-lg py-6 top-20 z-10
            fixed"
            >
            {Array.isArray(categories) && categories.map((category,index) => (
                <ul key={index}
                className="px-10">
                    <motion.li 
                    custom={index}
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.05, color: "#D4AF37" }}
                    onClick = {() => {
                        setSelectedCategory(category.Category_Name);
                        setShowCategories(false);
                        setShowItems(true);
                    }}
                    className="py-1 hover:text-tag-lp cursor-pointer border-b border-tag-l2 shadow-md text-center">{category.Category_Name}</motion.li>
                </ul>
            ))}
            </motion.div>
        )}

        {showItems && (
            <div className="fixed absolute md:h-[620px] h-[1200px] md:w-[92%] w-[95%] bg-tag-l3 top-10 md:mx-5 left-2 md:my-20 my-10">
                <div className="flex justify-between items-center px-6 py-6">
                    <h1 className="font-bold md:text-3xl text-xl md:ml-[40%] ml-[10%] border-b border-tag-l">Shop By Category</h1>
                    <FaTimes onClick={() => setShowItems(false)} className="cursor-pointer h-6 w-6 text-tag-l hover:text-tag-dark"/>
                </div>
                <div className="md:flex md:gap-20 grid gap-0">

                    <div className="md:w-[75%] w-[90%]">
                    {selectedItem ? (
                        

                        <div key={selectedItem.ItemId} className="border dark:border-tag-b2 border-tag-l5 dark:bg-black bg-tag-l5 shadow-lg md:p-10 p-4
                         rounded-xl  md:h-[450px] h-[450px] md:w-[1000px] w-[400px] md:mt-[30px] md:ml-[50px] ml-[10px] md:flex md:gap-10">
                        <div className="md:w-[580px] md:h-[480px] w-[360px] h-[180px] relative overflow-hidden ">
                            <img src={`https://localhost:7269${selectedItem.ImagePath}`} alt={selectedItem.Name} className=" object-cover w-full h-[78%]" />
                        </div>
                        <div className="md:w-[450px] w-[360px]">
                            <h2 className="text-2xl font-bold md:py-2 text-center text-tag-lp">{selectedItem.Name}</h2>
                            <p className="text-sm text-tag-dark dark:text-tag-l2 md:mt-4 mt-2 md:h-[150px] h-[80px]">
                            {selectedItem.Description} 
                            </p>
                            <p className="">
                                  { !selectedItem.IsFixedPrice && (
                                      <CountDownTimer endTime={new Date(selectedItem.BiddingEndTime)} />
                                  )}
                                  </p>
                        <div className="flex justify-between items-center">
                            <div className="grid md:py-6 py-4">
                            {selectedItem.IsFixedPrice ? (
                                <p className="text-tag-dark dark:text-tag-l2 font-bold">
                                    Price : <span className="text-tag-lp"> ₹ {selectedItem.Price}</span></p>
                            ) : ( 
                                <p className="text-tag-dark dark:text-tag-l2 font-bold">
                                    Current Bid: <span className="text-tag-lp"> ₹ {selectedItem.CurrentBid}</span></p>
                            )}
                            </div>
                            <div>
                            <FaHeart
                            size={24}
                            className={`cursor-pointer transition-all duration-300 ${
                                inWishlist(selectedItem.ItemId) ? "text-red-500" : "text-white"
                            }`}
                            onClick={() =>{ 
                                toggleWishlist(selectedItem.ItemId); 
                            }}
                            />
                            </div>
                        </div>

                        {/* <div className="flex justify-between items-center">
                            <button className="h-10 w-40 bg-tag-lp rounded-3xl text-tag-l2 font-semibold hover:bg-tag-l2 hover:text-tag-lp"
                            onClick={() => {
                            setSelectItemForBid(selectedItem);
                            }}
                            >Raise Bid</button>
                            <button className="h-10 w-40 bg-tag-lp rounded-3xl text-tag-l2 font-semibold hover:bg-tag-l2 hover:text-tag-lp"
                            onClick = {() => addItemToCart(userId,selectedItem.ItemId,quantity)}>Add to cart</button>
                        </div> */}
                        <div className="flex justify-between items-center">
                        {selectedItem.IsFixedPrice ? (
                            <>
                            <button
                                className="h-10 w-40 bg-tag-l2 rounded-3xl text-tag-dark font-semibold hover:bg-tag-l hover:text-tag-l2"
                                onClick={() => toggleWishlist(selectedItem.ItemId)}
                            >
                                {inWishlist(selectedItem.ItemId) ? "Wishlisted" : "Add to Wishlist"}
                            </button>
                            <button
                                className="h-10 w-40 bg-tag-lp rounded-3xl text-tag-l2 font-semibold hover:bg-tag-l2 hover:text-tag-lp"
                                onClick={() => addItemToCart(userId, selectedItem.ItemId, quantity)}
                            >
                                Add to Cart
                            </button>
                            </>
                        ) : (
                            <>
                            <button
                                className="h-10 w-40 bg-tag-lp rounded-3xl text-tag-l2 font-semibold hover:bg-tag-l2 hover:text-tag-lp"
                                onClick={() => {
                                setSelectItemForBid(selectedItem);
                                }}
                            >
                                Raise Bid
                            </button>
                            <button
                                className="h-10 w-40 bg-tag-l2 rounded-3xl text-tag-dark font-semibold hover:bg-tag-l hover:text-tag-l2"
                                onClick={() => toggleWishlist(selectedItem.ItemId)}
                            >
                                {inWishlist(selectedItem.ItemId) ? "Wishlisted" : "Add to Wishlist"}
                            </button>
                            </>
                        )}
                        </div>


                        </div>
                        </div>
                        
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
                                selectedItem?.ItemId === globalItem.ItemId
                                    ? 'border-tag-lp'
                                    : 'border-tag-l5'
                                }`}
                                onClick={()=> setSelectedItem(globalItem)}
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
                            disabled={!selectItemForBid}
                            onClick={() => {
                                if(!selectItemForBid) return;
                                if (String(selectItemForBid.SellerId) === String(userId)) {
                                console.log("BLOCKED: own item");
                                toast.error("You can't raise bid on your own item.");
                                return;
                                }

                                if (userBid <= 0) {
                                toast.error("Please enter a valid bid amount");
                                return;
                                }
                            //const totalBid = selectItemForBid.CurrentBid + userBid;
                            axios.post("https://localhost:7269/api/Item/RaiseBid", {
                                itemId: selectItemForBid.ItemId,
                                newBid: userBid,
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
                            .catch(err => {
                                const errData = err.response?.data;
                                const errMsg =
                                    typeof errData === "string"
                                    ? errData
                                    : errData?.message || errData?.title || "❌ Bid failed. Try again!";
                                
                                toast.error(errMsg);
                                console.error("Bid failed:", errMsg);
                                });
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

        </div>

        </>
    );
}

export default Nav;
