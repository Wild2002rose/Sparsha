import './App.css';
import Home from './Components/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ItemsOfSeller from './Components/ItemsOfSeller';
import Wishlist from './Components/Wishlist';
import Cart from './Components/Cart';
import Order from './Components/Order';
import {useEffect} from 'react';
import * as signalR from '@microsoft/signalr';
import { requestNotificationPermission } from "./firebase-messaging"; 
import { useAuth } from './Components/AuthContext';

function App() {
const { user } = useAuth();
useEffect(() => {
  const getAndSendToken = async () => {
    //if (!user || !user.token) return; 
    const token = await requestNotificationPermission();
    if (token && user?.userId) {
      console.log("📲 Firebase token:", token);
      const res = await fetch("https://localhost:7269/api/Auth/save-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          UserId: user.userId,
          //role: user.role,
          DeviceToken: token,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("❌ Token save failed:", res.status, error);
      } else {
        console.log("✅ Device token saved");
      }
    } else {
      console.warn("🚫 No token generated.");
    }
  };

  getAndSendToken();
}, [user]); 

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7269/hub/notification", {
      accessTokenFactory: () => localStorage.getItem("jwt"),
    })
    .withAutomaticReconnect()
    .build();

    connection
    .start()
    .then(() => console.log("ws connected"))
    .catch((er) => console.error("ws connection failed"));

    connection.on("ReceiveNotification", (message) => {
      const event = new CustomEvent("play-notification",{
        detail: message
      });
      window.dispatchEvent(event);
    });
   return () => {
    connection.stop();
   };
  },[]);

  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/itemsofseller' element={<ItemsOfSeller/>}/>
        <Route path='/wishlist' element={<Wishlist/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<Order/>} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
