import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, setWishlist } from '../redux/slices/wishlistSlice';

function Item() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const detailsRef = useRef(null);

    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [userId, setUserId] = useState('');
    const wishlist = useSelector((state) => state.wishlist.wishlistItems);

    const quantity = 1;

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
    }, []);

    useEffect(() => {
        axios.get('https://localhost:7269/api/Item/GetAllItems')
            .then(res => {
                const fixedPriceItems = res.data.filter(item => item.IsFixedPrice);
                setItems(fixedPriceItems);
            })
            .catch(err => console.error("Error fetching items:", err));
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 1 : 5);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!items.length) return;
        const interval = setInterval(() => {
            setStartIndex(prev => (prev + itemsPerPage >= items.length ? 0 : prev + itemsPerPage));
        }, 10000);
        return () => clearInterval(interval);
    }, [items, itemsPerPage]);

    useEffect(() => {
        const handleClickOutside = e => {
            if (detailsRef.current && !detailsRef.current.contains(e.target)) {
                setSelectedItem(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

    const fetchWishlist = async () => {
        try {
            const { data } = await axios.get(`https://localhost:7269/api/Item/wishlist/${userId}`);
            dispatch(setWishlist(data));
        } catch (err) {
            console.error("Wishlist fetch failed:", err);
        }
    };

    useEffect(() => {
        if (userId) fetchWishlist();
    }, [userId]);

    const inWishlist = itemId => wishlist.some(item => item.ItemId === itemId);

    const toggleWishlist = async (itemId) => {
        if (!userId || !itemId) return;

        const exists = inWishlist(itemId);

        try {
            if (exists) {
                await axios.delete(`https://localhost:7269/api/Item/wishlist/remove`, {
                    data: { userId, itemId }
                });
                dispatch(removeFromWishlist(itemId));
                await fetchWishlist(userId);
                toast("Item removed from wishlist", { icon: "🗑️" });
            } else {
                const { data: newItem } = await axios.post(`https://localhost:7269/api/Item/wishlist/add`, {
                    userId, itemId
                });
                dispatch(addToWishlist({ userId, itemId }));
                fetchWishlist(userId);
                toast.success("Added to wishlist 💖");
            }
        } catch (error) {
            console.error("Toggle wishlist failed:", error);
            toast.error("Oops! Something went wrong");
        }
    };

    const addItemToCart = async (userId, itemId, quantity) => {
        try {
            await axios.post(`https://localhost:7269/api/Item/addItemToCart/${userId}`, {
                userId, itemId, quantity
            });
            dispatch(addToCart({ userId, itemId, quantity }));
            toast.success("Item added to cart 🛒");
        } catch (error) {
            console.error("Cart error:", error);
            toast.error("Could not add to cart");
        }
    };

    return (
        <>
            <Toaster position="bottom-left" toastOptions={{ duration: 4000 }} />
            <div className="h-[550px] dark:bg-tag-dark bg-tag-l2 md:px-14 px-10">
                <div className="h-[480px] w-full bg-[#1C2B2D] dark:bg-pink-200 text-[#F3F0EB] dark:text-[#1C2B2D] py-10 px-14 border md:flex md:gap-6">
                    {visibleItems.map(item => (
                        <motion.div
                            key={item.ItemId}
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="h-full w-[20%] font-semibold border-2 border-[#F3F0EB] dark:border-pink-400 px-6 py-4 rounded-lg shadow-lg"
                        >
                            <img src={`https://localhost:7269${item.ImagePath}`} alt={item.Name} className="h-[72%]" />
                            <h1 className="font-serif">{item.Name}</h1>
                            <h2>Price: ₹{item.Price}</h2>
                            <div className="px-6 py-2">
                                <button onClick={() => setSelectedItem(item)} className="h-10 w-40 bg-pink-500 rounded-3xl hover:bg-tag-lp">
                                    Buy it now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <motion.div
                    ref={detailsRef}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed md:top-40 top-20 md:h-[420px] h-[650px] md:w-[94%] w-[80%] bg-[#3A1C32] text-[#EBDDD3] dark:bg-[#EBDDD3] dark:text-[#3A1C32] md:flex grid gap-6 p-8 mx-10"
                >
                    <div className="md:w-[40%] text-center">
                        <h1 className="text-[#D4AF37] text-3xl font-serif font-semibold">{selectedItem.Name}</h1>
                        <p className="py-4">{selectedItem.Description}</p>
                        <h2>Price: ₹{selectedItem.Price}</h2>
                        <div className="py-6 flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={() => addItemToCart(userId, selectedItem.ItemId, quantity)} className="w-40 h-12 rounded-3xl bg-[#EBDDD3] text-[#3A1C32] font-bold">
                                Add to Cart
                            </button>
                            <button onClick={() => toggleWishlist(selectedItem.ItemId)} className="w-40 h-12 rounded-3xl bg-[#EBDDD3] text-[#3A1C32] font-bold">
                                {inWishlist(selectedItem.ItemId) ? "Remove from Wishlist" : "Add to Wishlist"}
                            </button>
                        </div>
                    </div>
                    <div className="md:w-[60%] border">
                        <motion.img
                            src={`https://localhost:7269${selectedItem.ImagePath}`}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.03 }}
                        />
                    </div>
                </motion.div>
            )}
        </>
    );
}

export default Item;
