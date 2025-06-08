import { div } from "framer-motion/client";
import f3 from "../Assets/f5.jpg";
import j1 from "../Assets/j2.jpg";
import m1 from "../Assets/m3.jpeg";
import {motion} from 'framer-motion';
function Item() {
    return(
        <div>

            <div className="md:h-[1050px] h-[1500px] dark:bg-gradient-to-b dark:from-tag-dark dark:to-black bg-tag-l2 py-14 md:px-14 px-10">
        
                <motion.div 
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="md:h-[420px] h-[650px] bg-[#1E2A3A] dark:bg-tag-l2 text-[#F0E9E0] shadow-2xl md:p-12 p-8 border border-[#3B4D63] md:flex grid md:gap-20 gap-10">
                    
                    <div className=" md:w-[60%] w-[63%] border h-full">
                        <motion.img src={f3} alt="" 
                        className="h-full md:w-full" 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}/>
                    </div>

                    <div className="md:w-[40%] w-[63%]">
                        <motion.h1 
                        initial={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="dark:text-[#1E2A3A] bg-gradient-to-r from-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent font-semibold md:text-4xl text-3xl text-center md:py-4 py-2 font-serif">
                            Product Name
                        </motion.h1>
                        <p className="px-2 py-4 dark:text-tag-dark">Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis assumenda non sint quaerat saepe repellat consequatur 
                            fuga sunt deserunt quos, minima consectetur numquam, et eum officia natus ullam vel ducimus!
                        </p>
                        <h1 className="px-2 text-xl dark:text-tag-dark font-semibold">Current Bid : <span>$1000</span></h1>
                        <div className="md:px-11 md:px-6 px-4 py-10 flex md:gap-20 gap-6 ">
                            <motion.button 
                            whileHover={{ scale: 1.05 }}
                            className="md:w-40 w-[220px] h-12 border rounded-3xl bg-[#F0E9E0] text-[#1E2A3A] font-bold dark:bg-[#1E2A3A] dark:text-[#F0E9E0]">Contact Sellor</motion.button>
                            <motion.button 
                            whileHover={{ scale: 1.05 }}
                            className="md:w-40 w-[220px] h-12 border rounded-3xl bg-[#F0E9E0] text-[#1E2A3A] font-bold dark:bg-[#1E2A3A] dark:text-[#F0E9E0]">Raise Bid</motion.button>
                        </div>

                    </div>
                </motion.div>

                <motion.div 
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="md:h-[420px] h-[650px] bg-[#3A1C32] text-[#EBDDD3] accent-[#F7E7CE] dark:bg-[#EBDDD3] dark:text-[#3A1C32] md:flex grid md:gap-20 gap-10 md:p-12 p-8 mt-20">
                    
                    <div className="md:w-[40%] w-[63%] text-center">
                        <motion.h1 
                        initial={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-[#D4AF37] md:text-4xl text-3xl font-serif drop-shadow-md dark:text-[#8B0000] font-semibold md:py-4 py-2">
                            Product Name
                        </motion.h1>
                        <p className="px-2 py-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis assumenda non sint quaerat saepe repellat consequatur 
                            fuga sunt deserunt quos, minima consectetur numquam, et eum officia natus ullam vel ducimus!
                        </p>
                        <div className="md:px-11 px-4 py-10 flex md:gap-20 gap-6 ">
                            <motion.button 
                            whileHover={{ scale: 1.05 }}
                            className="md:w-40 w-[220px] h-12 border rounded-3xl bg-[#EBDDD3] text-[#3A1C32] font-bold dark:bg-[#3A1C32] dark:text-[#EBDDD3]">Contact Sellor</motion.button>
                            <motion.button 
                            whileHover={{ scale: 1.05 }}
                            className="md:w-40 w-[220px] h-12 border rounded-3xl bg-[#EBDDD3] text-[#3A1C32] font-bold dark:bg-[#3A1C32] dark:text-[#EBDDD3]">Raise Bid</motion.button>
                        </div>
                    </div>
                    <div className="md:w-[60%] w-[63%] border">
                        <motion.img src={j1} alt="" 
                        className="h-full w-full"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.4 }}/>
                    </div>
                </motion.div>

            </div>

            <div className="h-[550px] dark:bg-gradient-to-b from-black to-tag-dark bg-tag-l2 md:px-14 px-10 ">
                <div className="h-[480px] bg-[#1C2B2D] dark:bg-pink-200 text-[#F3F0EB] dark:text-[#1C2B2D] py-10 px-14 border">
                    <div className="h-full font-semibold border-2 border-[#F3F0EB] dark:border-pink-400 px-6 py-4 rounded-lg shadow-lg">
                        <img src={m1} alt="" className="h-[72%] "/>
                        <h1 className="font-serif">Product Name</h1>
                        <h2>Price: <span>$500</span> </h2>
                        <div className="px-14 py-2">
                            <button className="h-10 w-20 border border-tag-lp bg-pink-500 rounded-3xl hover:bg-tag-lp">Buy</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default Item;