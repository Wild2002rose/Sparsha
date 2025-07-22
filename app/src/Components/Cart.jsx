import Nav from "./Nav";
import End from "./End";
import { useState, useEffect } from 'react';
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector,useDispatch } from "react-redux";
import { setCartItems, clearCart, removeFromCart } from "../redux/slices/cartSlice";

function Cart() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isConfirmStage, setIsConfirmStage] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedUserId = localStorage.getItem("userId");
        if (storedName) setUserName(storedName);
        if (storedUserId) setUserId(storedUserId);
    }, []);
    const getCartItems = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7269/api/Item/getCartItems/${userId}`);
            dispatch(setCartItems(response.data));
            return response.data;
        } catch (error) {
            console.error("Error getting cart:", error.response?.data || error.message);
            return [];
        }
    };

    useEffect(() => {
        if (userId) {
            getCartItems(userId);
        }
    }, [userId]);

    const totalPrice = cartItems.reduce((total, item) => {
        const quantity = Number(item.Quantity) || 0;
        const price = Number(item.Price) || 0;
        return total + quantity * price;
    }, 0);

    const removeCartItem = async (userId, itemId) => {
        try {
            await axios.delete(`https://localhost:7269/api/Item/removeCartItem`, {
                headers: { "Content-Type": "application/json" },
                data: { UserId: userId, ItemId: itemId },
            });
            dispatch(removeFromCart((itemId)));
            await getCartItems(userId); 
            toast.success("Item removed from cart");
        } catch (error) {
            console.error("Error removing item", error.response?.data || error.message);
        }
    };

    const sendCode = async () => {
        try {
            await axios.post("https://localhost:7269/api/Item/Send-code", { UserId: userId });
            toast.success("Code is sent to your mail ");
        } catch (error) {
            toast.error("Error to send code");
        }
    };

    const fetchEmail = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7269/api/Auth/Profile/${userId}`);
            return response.data.Email;
        } catch (error) {
            return "";
        }
    };

    useEffect(() => {
        if (userId) {
            fetchEmail(userId).then(setEmail);
        }
    }, [userId]);

    const verifyCode = async () => {
        try {
            await axios.post("https://localhost:7269/api/Item/verify-code", {
                UserId: userId,
                Email: email,
                Code: code
            });
            toast.success("Code verified successfully");
            setIsConfirmStage(true);
        } catch (error) {
            toast.error("Invalid OTP");
        }
    };

    const placeOrder = async () => {
        try {
            const response = await axios.post("https://localhost:7269/api/Item/Place-Order", {
                UserId: userId,
                UserName: userName,
                PaymentMethod: paymentMethod,
                Address: address,
                TotalPrice: totalPrice
            });
            toast.success("Order placed successfully");
            if (response.data.paymentLink) {
                window.open(response.data.paymentLink, "_blank");
            }
            navigate('/');
        } catch (error) {
            toast.error("Error to place order");
        }
    };

    const isOtpRequired = paymentMethod === "COD" || paymentMethod === "UPI";

    return (
        <>
            <Nav />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.6, ease: "easeOut" }} className="bg-tag-l2 min-h-screen w-full mt-[80px] md:p-14 p-4">
                <div className="bg-tag-l4 min-h-[650px] md:px-20 px-0 md:py-8 py-4">
                    <h1 className="text-tag-l7 font-bold text-4xl text-center py-2 border-b border-tag-l5">Your Cart</h1>
                    {cartItems.length === 0 ? <p>Cart is empty</p> : (
                        <div className="md:flex md:gap-14 grid gap-6 p-6">
                            <div className="md:w-[60%] w-full grid gap-4 overflow-y-scroll scrollbar-hide">
                                {/* Delivery Info */}
                                <div className="bg-tag-l px-4 py-2 flex gap-10">
                                    <div className="w-[75%]">
                                        <h1>Deliver to: <span>{userName}</span></h1>
                                        <div className="flex gap-2">
                                            <h1>Address: </h1>
                                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" className="w-full h-8 p-2 border-b border-tag-l5 bg-transparent" required />
                                        </div>
                                    </div>
                                </div>

                                {!showPayment ? (
                                    <div className="bg-tag-l p-6 overflow-y-scroll">
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="border-b border-tag-l4 flex gap-6 py-2">
                                                <div className="md:w-[20%] w-[30%]">
                                                    <img src={`https://localhost:7269${item.ImagePath}`} className="h-[110px] w-[140px]" />
                                                    <h1 className="font-semibold text-lg text-tag-l7 py-2">Quantity: <span className="text-tag-dark ">{item.Quantity}</span></h1>
                                                </div>
                                                <div className="md:w-[50%] w-[40%]">
                                                    <h1 className="text-tag-l7 font-bold md:text-lg text-md border-b border-tag-l5">{item.Name}</h1>
                                                    <h2 className="text-tag-l7 font-semibold md:text-md text-sm mt-2">Price: <span className="text-tag-dark">{item.Price}</span></h2>
                                                    <div className="md:flex md:gap-20 grid gap-2 mt-10">
                                                        <button className="md:h-[40px] h-[30px] w-[130px] border-2 border-tag-l4 bg-tag-l7 rounded-3xl text-tag-l3 text-semibold md:text-md text-sm">Save for later</button>
                                                        <button onClick={() => removeCartItem(userId, item.ItemId)} 
                                                        className="md:h-[40px] h-[30px] w-[130px] border-2 border-tag-l4 bg-red-600 rounded-3xl text-tag-l3 text-semibold md:text-md text-sm">Remove</button>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        ))}
                                        <div className="h-[80px] flex items-center justify-end">
                                            <button onClick={() => setShowPayment(true)} 
                                            className="h-[50px] md:w-[150px] w-[200px] border-2 border-tag-l4 bg-tag-l7 rounded-3xl 
                                            text-tag-l3 text-semibold text-md md:ml-[70%] ml-[60%] hover:bg-tag-l3 hover:text-tag-l7">Place Order</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-tag-l shadow-md">
                                        <h2 className="text-2xl font-bold text-tag-l7 mb-2">Payment Section</h2>
                                        <div className="mb-4">
                                            <label className="flex items-center space-x-3">
                                                <input type="checkbox" className="h-5 w-5" checked={paymentMethod === "COD"} onChange={() => {
                                                    if (paymentMethod !== "COD") {
                                                        setPaymentMethod("COD");
                                                        sendCode();
                                                        setIsConfirmStage(false);
                                                    } else {
                                                        setPaymentMethod("");
                                                    }
                                                }} />
                                                <span className="text-tag-l7 font-semibold text-lg">Cash On Delivery</span>
                                            </label>
                                        </div>
                                        <div className="mb-4">
                                            <label className="flex items-center space-x-3">
                                                <input type="checkbox" className="h-5 w-5" checked={paymentMethod === "UPI"} onChange={() => {
                                                    if (paymentMethod !== "UPI") {
                                                        setPaymentMethod("UPI");
                                                        sendCode();
                                                        setIsConfirmStage(false);
                                                    } else {
                                                        setPaymentMethod("");
                                                    }
                                                }} />
                                                <span className="text-tag-l7 font-semibold text-lg">UPI Transaction</span>
                                            </label>
                                        </div>
                                        {isOtpRequired && !isConfirmStage && (
                                            <div className="mt-4">
                                                <label className="block text-tag-l7 mb-1">Verification Code</label>
                                                <input type="text" placeholder="Enter the 6-digit code" className="w-full p-2 rounded border border-tag-l4" value={code} onChange={(e) => setCode(e.target.value)} />
                                            </div>
                                        )}
                                        <div className="mt-6">
                                            {isOtpRequired ? (
                                                isConfirmStage ? (
                                                    <button onClick={placeOrder} className="w-full bg-tag-lp text-tag-l3 font-semibold py-2 rounded-3xl hover:bg-tag-l7 hover:text-tag-l3">Confirm Order</button>
                                                ) : (
                                                    <button onClick={verifyCode} className="w-full bg-tag-lp text-tag-l3 font-semibold py-2 rounded-3xl hover:bg-tag-l7 hover:text-tag-l3">Verify Code</button>
                                                )
                                            ) : (
                                                <button onClick={placeOrder} className="h-[50px] md:w-[150px] w-[200px] border-2 border-tag-l4 bg-tag-l7 rounded-3xl text-tag-l3 text-semibold text-md md:ml-[70%] ml-[60%] hover:bg-tag-l3 hover:text-tag-l7">Pay Now</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="md:w-[35%] w-full bg-tag-l px-10 py-6">
                                <h1 className="text-tag-l7 font-bold text-lg border-b border-tag-l5">Price Details:</h1>
                                <h1>Total Price : <span>{totalPrice.toFixed(2)}</span></h1>
                                <h1>Discount : <span>10.00</span></h1>
                                <h1>Delivery Charge : <span>0.00</span></h1>
                                <h1 className="text-lg font-bold mt-4">Total Amount : <span className="text-tag-lp">${totalPrice.toFixed(2)}</span></h1>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
            <End />
        </>
    );
}

export default Cart;
