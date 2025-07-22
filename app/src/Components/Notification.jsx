import { FaBell, FaTrash } from "react-icons/fa";
import {useState, useEffect,useRef} from 'react'
import {motion, AnimatePresence }from 'framer-motion';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
function Notification() {
const bellRef = useRef();
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
const [userId, setUserId] = useState('');
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
    const res = await axios.get(`https://localhost:7269/api/Notification/GetNotification/${userId}`);
    setNotifications(res.data);
    console.log(res.data);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
  }
};
useEffect(() => {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    setUserId(storedUserId);
    fetchNotifications(storedUserId);
  } else {
    console.warn("⚠️ No valid userId in localStorage");
  }
}, []);

const handleMarkAsRead = async(id) => {
  try{
    await axios.put(`https://localhost:7269/api/Notification/MarkNotificationAsRead/${id}`);
    fetchNotifications(userId);
  } catch(err) {
    console.error("failed to mark as read", err);
  }
};

const handleMarkAllAsRead = async(userId) => {
  try {
    await axios.put(`https://localhost:7269/api/Notification/MarkAllAsRead/${userId}`);
    fetchNotifications(userId);
  } catch(err){
    console.error("Failed to mark as read");
  }
} 

const handleDeleteNotification = async(id) =>{
  try{
    await axios.delete(`https://localhost:7269/api/Notification/DeleteNotification/${id}`);
    fetchNotifications(userId);
  } catch(err) {
    console.error("Failed to delete notification");
  }
}

const handleDeleteAllNotification = async(userId) => {
  try{
    await axios.delete(`https://localhost:7269/api/Notification/DeleteAllNotifications/${userId}`);
    fetchNotifications(userId);
  } catch(err){
    console.error("Failed to delete all notifications");
  }
}

    return(
      <div>
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
        {showNotifications && (
        <div className="fixed top-[160px] left-5 bg-white p-4 rounded shadow-lg z-50 w-[300px] md:h-[620px] h-[550px] ">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <div className="">
              <div className="flex h-10 gap-24 ml-2">
                <button className="text-blue-600 font-bold text-xs" onClick={() => handleMarkAllAsRead(userId)}>Mark All As Read</button>
                <button className="text-red-600 font-bold text-xs" onClick={() => handleDeleteAllNotification(userId)}>Delete All</button>
              </div>
              <div className="w-[300px] md:h-[550px] h-[490px] overflow-y-auto scrollbar-hide">
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
                onClick={() => handleMarkAsRead(n.Id)}
                className={`cursor-pointer mb-2 shadow-lg h-auto w-[260px] border-gray-100 grid gap-0 py-2
                ${ n.IsRead ? "bg-gray-100" : "bg-blue-100"}`}>
                  <h1 className="text-sm mx-4 text-black font-semibold flex gap-2 ">
                    <span className="w-[90%]">{n.Message} </span>
                    <span onClick={() => handleDeleteNotification(n.Id)}> <FaTrash/> </span>
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    );
}

export default Notification;