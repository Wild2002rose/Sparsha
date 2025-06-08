import Nav from "./Nav";
import End from "./End";
import {useState, useEffect, useRef} from 'react';
import axios from "axios";
import toast from "react-hot-toast";
import { use } from "framer-motion/client";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState(null);
    const [isCodeSelected, setIsCodeSelected] = useState(false);
    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedUserId = localStorage.getItem("userId");
        if(storedName) {
            setUserName (storedName);
        }
        if(storedUserId){
            setUserId(storedUserId);
        }
    },[]);
    const addItemToCart = async (userId, itemId, quantity) => {
        try {
            const response = await axios.post(`https://localhost:7269/api/Item/addItemToCart/${userId}`,{
                itemId: itemId,
                quantity: quantity
            });
            console.log("Item added:", response.data);
        } catch (error) {
            console.error("Error adding to cart:", error.response?.data||error.message);
        }
    };
    const getCartItems = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7269/api/Item/getCartItems/${userId}`);
            console.log("Cart items:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error getting cart:", error.response?.data||error.message);
            return [];
        }
    }
    useEffect(() => {
        if(userId) {
            const fetchCart = async () => {
            const items = await getCartItems(userId);
            setCartItems(items);
            console.log(items);
        };
        fetchCart();
        }
    },[userId]);
    const totalPrice = cartItems.reduce((total, item) => {
    const quantity = Number(item.Quantity) || 0;
    const price = Number(item.Price) || 0;
    return total + (quantity * price);
    }, 0);
    const removeCartItem = async(userId,itemId) => {
        try{
            const response = await axios.delete(`https://localhost:7269/api/Item/removeCartItem`,
                {
                    headers: {
                    "Content-Type": "application/json",
                    },
                    data: {
                    UserId: userId,
                    ItemId: itemId,
                    },
                } 
            );
            const refreshedCart = await getCartItems(userId);
            setCartItems(refreshedCart);
        } catch(error) {
            console.error("Error removing item", error.response?.data||error.message);
        }
    }
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    const sendCode = async () => {
        try {
            const response = await axios.post("https://localhost:7269/api/Item/Send-code",
                {
                    UserId: userId,
                }
            );
            toast.success("Code is sent to your mail ");
        } catch (error) {
            toast.error("Error to send code");
            console.error(error.response?.data?.message || "error sending code");
        }
    }

    const fetchEmail = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7269/api/Auth/GetEmail/${userId}`);
            return response.data.email;
        } catch(error) {
            console.error("error fetching email");
            return "";
        }
    };

    useEffect(() => {
        if(userId) {
            fetchEmail(userId).then(email => {
                setEmail(email);
            });
        }
    },[userId]);

    const verifyCode = async () => {
        try{
            const response = await axios.post("https://localhost:7269/api/Item/verify-code",{
                UserId: userId,
                Email: email,
                Code: code
            });
            toast.success("Code verified successfully");
        } catch(error){
            toast.error("Invalid OTP");
            console.error("Error verifying otp");
        }
    };

    const placeOrder = async () => {
        try{
            const response = await axios.post("https://localhost:7269/api/Item/Place-Order",{
                UserId: userId,
                PaymentMethod: paymentMethod,
                Address: address
            });
            toast.success("Order placed successfully");
            console.log("Order placed successfully");
        } catch(error) {
            toast.error("Error to place order");
            console.error(error.response?.data?.message || "error sending code");
        }
    };

    return(
        <>
        <Nav/>
        <div className="bg-tag-l2 md:h-[820px] h-[1000px] w-full mt-[80px] md:p-14 p-4">
            <div className="bg-tag-l4 md:h-[650px] h-[900px] md:px-20 px-0 md:py-8 py-4">
                <h1 className="text-tag-l7 font-bold text-4xl text-center py-2 border-b border-tag-l5">Your Cart</h1>
                {cartItems.length === 0 ? (
                <p>Cart is empty</p>
                ) : (
                <div className=" md:flex md:gap-14 grid gap-6 p-6">
                    <div className=" md:w-[60%] w-full grid gap-4 overflow-y-scroll scrollbar-hide">

                        <div className="bg-tag-l md:h-[80px] h-[100px] px-4 py-2 flex gap-10">
                            <div className="w-[75%]">
                                <h1>Deliver to: <span>Kupnandan</span></h1>
                                <h1>Address: <span>Kupnandan</span></h1>
                            </div>
                            <div className="border-2 border-tag-l5 h-10 w-40 mt-3 mr-2 flex items-center justify-center 
                            rounded-md text-tag-lp font-semibold hover:text-tag-l7">
                                <button className="">Change</button>
                            </div>
                        </div>
                        
                        {!showPayment ? ( 
                        <div className="bg-tag-l h-[400px] p-6 overflow-y-scroll">
                            {cartItems.map((item, index) => (
                            <div key={index}
                            className="h-[190px] border-b border-tag-l4 flex gap-6 py-2 ">

                                <div className="md:w-[20%] w-[30%]">
                                    <img src={`https://localhost:7269${item.ImagePath}`} className="h-[110px] w-[140px]"/>
                                    <div>
                                        <h1 className="font-semibold text-lg text-tag-l7 py-2">Quantity: <span className="text-tag-dark ">{item.Quantity}</span></h1>
                                    </div>
                                </div>
                                <div className="md:w-[50%] w-[40%]">
                                    <div className="md:h-[60%] h-[50%]">
                                    <h1 className="text-tag-l7 font-bold md:text-lg text-md border-b border-tag-l5">{item.Name}</h1>
                                    <h2 className="text-tag-l7 font-semibold md:text-md text-sm mt-2">Price: <span className="text-tag-dark">{item.Price}</span></h2>
                                    </div>
                                    <div className="md:flex md:gap-20 grid gap-2">
                                        <button className="md:h-[40px] h-[30px] w-[130px] border-2 border-tag-l4 bg-tag-l7 rounded-3xl text-tag-l3 text-semibold md:text-md text-sm">Save for later</button>
                                        <button onClick={() => removeCartItem(userId,item.ItemId)}
                                        className="md:h-[40px] h-[30px] w-[130px] border-2 border-tag-l4 bg-red-600 rounded-3xl text-tag-l3 text-semibold md:text-md text-sm">Remove</button>
                                    </div>
                                </div>

                                <div className="w-[30%]">
                                    <h1 className="text-tag-l7 font-semibold text-md mt-2">Address:</h1>
                                    <h2 className="text-tag-dark font-normal md:text-md text-sm md:mt-2">Bagnan</h2>
                                </div>
                                
                            </div>
                            ))}
                            <div className="h-[80px] flex items-center justify-between">
                                <button onClick={() => setShowPayment(true)}
                                className="h-[50px] md:w-[150px] w-[200px] border-2 border-tag-l4 bg-tag-l7 rounded-3xl text-tag-l3 text-semibold text-md md:ml-[70%] ml-[60%] hover:bg-tag-l3 hover:text-tag-l7">Place Order</button>
                            </div>
                        </div>

                        ) : (
                        <div className=" p-6 bg-tag-l shadow-md">
                            <h2 className="text-2xl font-bold text-tag-l7 mb-2">Payment Section</h2>
                            <div className="grid gap-2">
                            <div>
                                <label className="block text-tag-l7 mb-1">Card Number</label>
                                <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className="w-full p-2 rounded border border-tag-l4"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                <label className="block text-tag-l7 mb-1">Expiry</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full p-2 rounded border border-tag-l4"
                                />
                                </div>
                                <div className="flex-1">
                                <label className="block text-tag-l7 mb-1">CVV</label>
                                <input
                                    type="password"
                                    placeholder="123"
                                    className="w-full p-2 rounded border border-tag-l4"
                                />
                                </div>
                            </div>

                            <div className="mt-2 mb-2">
                                <input type="checkbox" className="h-5 w-5 mr-4" checked={isCodeSelected} 
                                onChange={() => {setIsCodeSelected(!isCodeSelected); sendCode();}}/>
                                <label htmlFor="" className="font-semibold text-lg text-tag-l7 cursor-pointer">Cash On Delivery</label>
                                {isCodeSelected && (
                                <div className="mt-2">
                                    <label className="block text-tag-l7 mb-1">Verification Code</label>
                                    <input
                                    type="text"
                                    placeholder="Enter the 6-digit code"
                                    className="w-full p-2 rounded border border-tag-l4"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    />
                                </div>
                                )}

                            </div>
                            <button 
                            onClick = {() =>{
                                placeOrder(userId, paymentMethod, address);
                                verifyCode();
                            }}
                            className="w-full bg-tag-lp text-tag-l3 font-semibold py-2 rounded-3xl hover:bg-tag-l7 hover:text-tag-l3 ">
                                {isCodeSelected ? "Confirm Order" : "Pay Now"}
                            </button>
                            </div>
                        </div>
                        )}


                    </div>
                    <div className="md:w-[35%] w-[380px] md:h-[300px] h-[220px] bg-tag-l px-10 py-6 ">
                        <h1 className="text-tag-l7 font-bold text-lg border-b border-tag-l5">Price Details:</h1>
                        <h1 className="md:text-lg text-md text-bg-l7 md:mt-4 mt-2">Total Price : <span>${totalPrice.toFixed(2)}</span></h1>
                        <h1 className="md:text-lg text-md text-bg-l7 md:mt-4">Discount : <span>$10.00</span></h1>
                        <h1 className="md:text-lg text-md text-bg-l7 md:mt-4">Delivary Charge : <span>${totalPrice.toFixed(2)}</span></h1>
                        <h1 className="text-lg text-bg-l7 mt-4 font-bold">Total Amount : <span className="text-tag-lp">${totalPrice.toFixed(2)}</span></h1>
                    </div>
                    
                </div>
                )}
            </div>
        </div>
        <End/>
        </>
    )
}
export default Cart;