import Nav from "./Nav";
import End from "./End";
import {useState, useEffect, useRef} from 'react';
import axios from "axios";
function Order() {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if(storedUserId){
            setUserId(storedUserId);
        }
    },[]);
    const fetchOrders = async (userId) => {
        try {
            const response = await axios.get(`https://localhost:7269/api/Item/track-order/${userId}`);
            setOrders(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching orders:" , error.response?.data || error.message);
        }
    };
    useEffect(() => {
        if(userId) {
            fetchOrders(userId);
        }
    }, [userId]);
    return(
        <>
        <Nav/>
        <div className="bg-tag-l2 md:h-[820px] h-[1000px] w-full mt-[80px] md:p-14 p-4">
            <div className="p-6">
            <h1 className="text-4xl font-bold text-tag-l7 mb-4">Your Orders</h1>
            {orders.length === 0 ? (
                <p className="text-tag-dark">You haven’t placed any orders yet.</p>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order.OrderId} className="border p-4 rounded bg-tag-l">
                            <p><strong>Date:</strong> {new Date(order.OrderDate).toLocaleDateString()}</p>
                            <p><strong>Payment:</strong> {order.PaymentMethod}</p>
                            <p><strong>Total:</strong> ${order.TotalPrice?.toFixed(2)}</p>

                            <div className="mt-4 grid gap-4">
                                {order.Items.map((item) => (
                                    <div key={item.OrderItemId} className="flex gap-4 items-center border-t pt-2">
                                        <img src={`https://localhost:7269${item.ImagePath}`} alt={item.Name} className="h-20 w-20 rounded" />
                                        <div>
                                            <h3 className="font-semibold text-tag-l7">{item.Name}</h3>
                                            <p>Quantity: {item.Quantity}</p>
                                            <p>Price: ${item.Price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        </div>
        <End/>
        </>
    )
}
export default Order;