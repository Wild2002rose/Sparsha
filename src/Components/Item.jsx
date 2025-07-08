import { div } from "framer-motion/client";
import f3 from "../Assets/f5.jpg";
import j1 from "../Assets/j2.jpg";
import m1 from "../Assets/m3.jpeg";
import {motion} from 'framer-motion';
import {useState, useEffect, useRef} from 'react';
import axios from "axios";
import {Toaster, toast} from 'react-hot-toast';
function Item() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const detailsRef = useRef(null);
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const[currentBid, setCurrentBid] = useState(null);
    const [userBid, setUserBid] = useState(0);
    const [userId, setUserId] = useState('');
    useEffect(() => {
            const storedUserId = localStorage.getItem("userId");
            if(storedUserId){
                setUserId(storedUserId);
            }
            console.log("userId:", localStorage.getItem("userId"));
        },[]);

    useEffect(() => {
        axios.get('https://localhost:7269/api/Item/GetAllItems')
        .then(response => {
            setItems(response.data);
            console.log(response.data);
        })
        .catch(error => console.error('Error fetching categories'));
    },[]);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 1 : 5);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    },[]);
    
    useEffect(() => {
        if (items.length === 0) return;
            const interval = setInterval(() => {
            setStartIndex(prev => {
                const next = prev + itemsPerPage;
                return next >= items.length ? 0 : next;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [items, itemsPerPage]);

    const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

    
    useEffect(() => {
        function handleClickOutside(event) {
            if (detailsRef.current && !detailsRef.current.contains(event.target)) {
                setSelectedItem(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [detailsRef]);
    

    return(
        <>
        <Toaster position = "bottom-left" reverseOrder = {true} className="" toastOptions={{
                        duration: 10000,
                      }}/>
        <div>

            <div className="h-[550px] dark:bg-tag-dark bg-tag-l2 md:px-14 px-10 ">
                <div className="h-[480px] w-full bg-[#1C2B2D] dark:bg-pink-200 text-[#F3F0EB] dark:text-[#1C2B2D] py-10 px-14 border md:flex md:gap-6">
                    {visibleItems.map(item => 
                    <div key={item.ItemId}
                    className="h-full font-semibold border-2 border-[#F3F0EB] dark:border-pink-400 px-6 py-4 rounded-lg shadow-lg">
                        <img src={`https://localhost:7269${item.ImagePath}`} alt={item.Name} className="h-[72%] "/>
                        <h1 className="font-serif">{item.Name}</h1>
                        <h2>Price: <span>{item.Price}</span> </h2>
                        <div className="px-14 py-2">
                            <button onClick={() => {
                                setSelectedItem(item);
                                setCurrentBid(item.currentBid);
                            }}
                            className="h-10 w-20 border border-tag-lp bg-pink-500 rounded-3xl hover:bg-tag-lp">Buy</button>
                        </div>
                    </div>
                    )}
                </div>
            </div>

        </div>

        {selectedItem && ( 
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
                            {selectedItem.Name}
                        </motion.h1>
                        <p className="px-2 py-4"> {selectedItem.Description}
                        </p>
                        <div className="text-start mt-4 flex gap-4">
                            <p className="w-[55%] text-lg font-bold">Current Bid: <span className="font-semibold ml-4">₹{selectedItem.CurrentBid}</span> </p>
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
                            axios.post("https://localhost:7269/api/Item/RaiseBid", {
                                itemId: selectedItem.ItemId,
                                newBid: userBid,
                                userId: userId
                            })
                            .then(res => {
                                const updated = { ...selectedItem, CurrentBid: res.data.newBid };
                                setSelectedItem(updated);
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
                        <motion.img src={`https://localhost:7269${selectedItem.ImagePath}`}
                        className="md:h-full h-[150px] w-full"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}/>
                    </div>
                </motion.div>
            )}

                </>
    )
}
export default Item;