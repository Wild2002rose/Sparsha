import Nav from "./Nav";
import End from "./End";
import { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  setWishlist,
  removeFromWishlist,
  addToWishlist,
} from "../redux/slices/wishlistSlice";
import { FaHeart } from "react-icons/fa";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { addToCart } from "../redux/slices/cartSlice";

function Wishlist() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedUserId = localStorage.getItem("userId");
    if (storedName) setUserName(storedName);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchWishlist(userId);
    }
  }, [userId]);

  const fetchWishlist = async (userId) => {
    try {
      const response = await axios.get(
        `https://localhost:7269/api/Item/wishlist/${userId}`
      );
      dispatch(setWishlist(response.data));
    } catch (error) {
      console.error("Error fetching wishlist", error);
    }
  };

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
  };

  const inWishlist = (itemId) => {
    return wishlistItems.some((item) => item.ItemId === itemId);
  };

  const toggleWishlist = async (itemId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !itemId) return;

      const exists = inWishlist(itemId);

      if (exists) {
        await axios.delete(`https://localhost:7269/api/Item/wishlist/remove`, {
          data: { userId, itemId },
        });
        dispatch(removeFromWishlist(itemId));
        await fetchWishlist(userId);
        toast.success("Item is removed from wishlist!");
      } else {
        await axios.post(`https://localhost:7269/api/Item/wishlist/add`, {
          userId,
          itemId,
        });
        fetchWishlist(userId);
      }
    } catch (error) {
      console.error("Error toggling wishlist", error);
    }
  };

  const quantity = 1;

  const addItemToCart = async (userId, itemId, quantity) => {
    dispatch(addToCart({userId, itemId,quantity}));
    try {
      const response = await axios.post(
        `https://localhost:7269/api/Item/addItemToCart/${userId}`,
        {
          userId,
          itemId,
          quantity,
        }
      );
      toast.success("Item is added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
      toast.error("Error to add");
    }
  };

  return (
    <>
      <Nav />
      <Toaster
        position="bottom-left"
        reverseOrder={true}
        toastOptions={{ duration: 10000 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-tag-l2 md:h-[820px] h-[900px] md:w-full w-[456px] mt-[80px] md:p-14 p-4"
      >
        <div className="bg-tag-l4 md:h-[620px] h-[850px] md:px-20 px-6 md:py-8 py-2">
          <div className="border-b border-tag-l2">
            <h1 className="text-tag-l7 font-bold md:text-4xl text-xl text-center py-2 ">
              Your Wishlist
            </h1>
            <h2 className="text-[#12333b] font-normal md:text-md text-sm text-center mb-2">
              Your Timeless Favorites, Just a Click Away!
            </h2>
          </div>

          <Carousel responsive={responsive} infinite autoplay>
            {wishlistItems.map((wish) => (
              <motion.div
                key={wish.WishlistId || wish.ItemId}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="md:h-[400px] h-[650px] md:w-full w-[450px] bg-tag-l5 text-[#EBDDD3] dark:bg-[#EBDDD3] dark:text-[#3A1C32] md:flex grid md:gap-20 gap-0 md:p-12 p-8 mt-14 border rounded-lg"
              >
                <div className="md:w-[40%] w-[63%] text-center">
                  <motion.h1
                    initial={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-tag-lp md:text-4xl text-3xl font-serif drop-shadow-md dark:text-[#8B0000] font-semibold md:py-2 py-2"
                  >
                    {wish.Item?.Name}
                  </motion.h1>
                  <p className="px-2 py-2 text-tag-l3">
                    {wish.Item?.Description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="grid py-2">
                      <p className="text-tag-dark dark:text-tag-l2 font-bold py-2">
                        My Price: <span className="text-tag-lp">₹ {wish.Item?.Price}</span>
                      </p>
                      <p className="text-tag-dark dark:text-tag-l2 font-bold mr-8">
                        Current Bid: <span className="text-tag-lp">₹ {wish.Item?.CurrentBid}</span>
                      </p>
                    </div>
                    <div>
                      <FaHeart
                        size={24}
                        className={`cursor-pointer transition-all duration-300 ${
                          inWishlist(wish.ItemId) ? "text-red-500" : "text-white"
                        }`}
                        onClick={() => toggleWishlist(wish.ItemId)}
                      />
                    </div>
                  </div>
                  <div className="md:px-11 px-4 py-6 flex md:gap-20 gap-6 ">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="md:w-40 w-[220px] h-12 border rounded-3xl border-tag-l6 bg-tag-l7 text-tag-l3 hover:text-tag-lp font-bold dark:bg-[#3A1C32] dark:text-[#EBDDD3]"
                    >
                      Raise Bid
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => addItemToCart(userId, wish.ItemId, quantity)}
                      className="md:w-40 w-[220px] h-12 border rounded-3xl border-tag-l6 bg-tag-l7 text-tag-l3 hover:text-tag-lp font-bold dark:bg-[#3A1C32] dark:text-[#EBDDD3]"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
                <div className="md:w-[60%] w-[63%] md:h-[300px] h-[200px] border">
                  <motion.img
                    src={`https://localhost:7269${wish.Item?.ImagePath}`}
                    alt=""
                    className="h-full w-full"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            ))}
          </Carousel>
        </div>
      </motion.div>
      <End />
    </>
  );
}

export default Wishlist;
