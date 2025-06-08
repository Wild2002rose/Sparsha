import Nav from "./Nav";
import End from "./End";
import {useState, useEffect, useRef} from 'react';
import axios from "axios";
import {Toaster, toast} from 'react-hot-toast';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

function ItemsOfSeller() {
    const dropDownRef = useRef(null);
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const formLink = () => {
        setShowForm(true);
    }
    useEffect(() => {
        const sellerId= localStorage.getItem("sellerId");
        if(!sellerId) {
            console.error("SellerId is not found in localstorage");
        }
        const fetchItems = async () => {
            try{
                const response = await axios.get(`https://localhost:7269/api/Item/seller/${sellerId}`);
                setItems(response.data);
                
            }catch(error){
                console.error("error fetching items:", error);
            }
        };
        fetchItems();
    },[]);
    useEffect(() => {
        function handleClickOutside(event) {
            if(dropDownRef.current && !dropDownRef.current.contains(event.target))
            {
                setShowForm(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    },[]);
    const userId = localStorage.getItem("sellerId");
    const [formData, setFormData] = useState({
        sellerId: '',
        name: '',
        categoryName: '',
        description: '',
        myPrice: '',
        currentBid: '',
    });
    const [image, setImage] = useState(null);
    const handleChange = (e) => {
        setFormData({...formData,[e.target.name]:e.target.value});
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        } else {
            console.warn("No image selected");
        }
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('SellerId', formData.sellerId);
        data.append('Name', formData.name);
        data.append('CategoryName', formData.categoryName);
        data.append('Description', formData.description);
        data.append('MyPrice', formData.myPrice);
        data.append('CurrentBid', formData.currentBid);
        data.append('Image', image);

        try {
        const response = await axios.post('https://localhost:7269/api/Item/upload', data, {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        });
        setError('');
        toast.success("Your item is uploaded successfully , you can see the bids now.",
        {
            duration:10000,
        }
        );
        setShowForm(false);
        console.log(response.data);
        
        } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Something went wrong!");
        
        }
    }
    const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 3,
    },
    tablet: {
        breakpoint: { max: 1024, min: 640 },
        items: 2,
    },
    mobile: {
        breakpoint: { max: 640, min: 0 },
        items: 1,
    },
    };
    const [selectedCategory, setSelectedCategory] = useState('');

    const [categories, setCategories] =useState([]);
    useEffect(() => {
        axios.get('https://localhost:7269/api/Item/GetCategory')
        .then(response => setCategories(response.data))
        .catch(error => console.error('Error fetching categories'));
    },[]);
    
    return (
        <>
        <Nav/>
        <Toaster position = "bottom-left" reverseOrder = {true} className="" toastOptions={{
                duration: 10000,
              }}/>
        <div className="h-[840px]  md:px-[110px] px-6 dark:bg-tag-dark bg-tag-l2 grid ">

            <Carousel responsive={responsive} infinite autoplay>

            {items.map((item) => (
            
            <div className="p-6" key={item.id}>
                <div key={item.id} className="border dark:border-tag-b2 border-tag-l5 dark:bg-black bg-tag-l5 shadow-lg p-5 rounded-xl  h-[550px] w-[400px] mt-[120px]">
                <div className="w-full h-[300px] relative overflow-hidden px-5">
                    <img src={`https://localhost:7269${item.ImagePath}`} alt={item.Name} className=" object-cover" />
                </div>
                <h2 className="text-xl font-bold py-2 px-2 text-tag-lp">{item.Name}</h2>
                <p className="text-sm px-2 text-tag-dark dark:text-tag-l2">
                    {item.Description} 
                </p>
                <div className="flex gap-10 px-2 py-6">
                    <p className="text-tag-dark dark:text-tag-l2 font-bold">My Price: <span className="text-tag-lp"> ₹ {item.MyPrice}</span></p>
                    <p className="text-tag-dark dark:text-tag-l2 font-bold">Current Bid: <span className="text-tag-lp"> ₹ {item.CurrentBid}</span></p>
                </div>
                </div>
                
            </div>
            
            ))}
            </Carousel>

            <div className="md:ml-[43%] ml-[25%]">
                <button className=" text-tag-lp font-bold text-xl text-center dark:bg-tag-l2 bg-tag-l5 
                w-[200px] h-[50px] rounded-3xl hover:bg-tag-lp hover:text-tag-l5"
                onClick = {() => setShowForm(!showForm)}>
                    Upload an item
                </button>
            </div>
        </div>
        <End/>

        {showForm && (
            <form onSubmit={handleFormSubmit} ref={dropDownRef}
            className="fixed dark:bg-tag-l2 bg-tag-l2 border-2 dark:border-tag-light border-tag-light md:h-[600px] h-[600px] 
            md:w-[500px] w-[380px] md:ml-[35%] ml-9 md:top-[120px] top-20 rounded-lg z-50 md:p-10 p-6 grid gap-4">
            <div className="font-bold text-2xl text-tag-lp border-b-2 border-tag-light text-center h-10">
                <h1 className="">Upload Your Item</h1>
            </div>
            <input type="text" name="sellerId" placeholder="Seller ID" onChange={handleChange} className="text-center border border-tag-l4"/>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} className="text-center border border-tag-l4"/>
            <select className="text-center border border-tag-l4" value={selectedCategory}
            onChange={(e) => {
                const selected = e.target.value;
                setSelectedCategory(selected);
                setFormData((prev) => ({ ...prev, categoryName: selected }));
            }}>
                <option value="">Select category</option>
                {categories.map((category,id) => (
                    <option value={category.Category_Name}>{category.Category_Name} </option>
                ))}
            </select>
            <input type="text" name="description" placeholder="Description" onChange={handleChange} className="text-center border border-tag-l4"/>
            <input type="number" name="myPrice" placeholder="My Price" onChange={handleChange} className="text-center border border-tag-l4"/>
            <input type="file" name="image" onChange={handleImageChange} accept="image/*" className="mt-4"/>
            <button type="submit" className="h-10 w-60 bg-tag-l5 text-center text-white hover:text-tag-lp font-bold rounded-3xl md:ml-[90px] ml-[40px] mt-4">Upload</button>
            </form>
        )}
        </>
    )
}
export default ItemsOfSeller;