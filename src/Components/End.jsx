import { FaFacebook, FaInstagram, FaPhone,FaYoutube,  } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
function End() {
    const links = [
        {
            id: 1,
            src: <FaFacebook/>,
        },
        {
            id: 2,
            src: <FaInstagram/>,
        },
        {
            id: 3,
            src: <FaPhone/>
        },
        {
            id: 4,
            src: <FaYoutube/>
        },
        {
            id: 5,
            src: <HiOutlineMail/>
        }
    ]
    return(
        <div className="h-[400px] dark:bg-black bg-tag-l md:p-[40px] p-6">
            <div className="md:h-[80px] h-[100px] dark:bg-tag-dark bg-tag-l4 rounded-lg flex md:gap-40 gap-8 md:px-20 px-4 
            text-tag-dark dark:text-tag-l2 md:text-xl text-md font-bold text-center md:py-6 py-4 md:ml-10 ml-0">
                <h1 className="cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp hover:scale-110">Be a seller</h1>
                <h1 className="cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp hover:scale-110">Raise Bid</h1>
                <h1 className="cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp hover:scale-110">Buy Antiques</h1>
                <h1 className="cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp hover:scale-110">Track Your Orders</h1>
                <h1 className="cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp hover:scale-110">Contact Us</h1>
            </div>

            <div className="flex md:gap-40 gap-20 mt-10 justify-center">
                <div className="dark:text-tag-l2 text-tag-dark font-semibold ">
                    <h1 className="hover:scale-105 cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp">Home</h1>
                    <h1 className="hover:scale-105 cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp">About</h1>
                    <h1 className="hover:scale-105 cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp">Categories</h1>
                    <h1 className="hover:scale-105 cursor-pointer dark:hover:text-tag-lp hover:text-tag-lp">Contact Us</h1>
                </div>
                <div>
                    <h1 className="font-bold text-xl text-tag-lp">Sparsha</h1>
                    <p className="dark:text-tag-l2 text-tag-dark font-normal">Bagnan, Howrah, 711312</p>
                    <h3 className="dark:text-tag-l2 text-tag-dark font-normal">sparshaofficial@gmail.com</h3>
                </div>
            </div>

            <div className="flex gap-4 md:ml-[40%] ml-[18%]">
                <ul className="flex items-center jutify-center space-x-5 py-12">
                    {links.map(({ id, src, href }) => (
                    <li
                    key={id}
                    className="py-2.5 md:py-3 px-2.5 md:px-3 rounded-full border-2 border-tag-dark  cursor-pointer text-tag-dark hover:scale-105 
                    hover:border-tag-lp hover:text-tag-lp dark:hover:text-tag-lp dark:hover:border-tag-lp dark:text-tag-l2 dark:border-tag-l2 "
                    >
                    <a href={href} target="blank">
                        <>{src}</>
                    </a>
                    </li>
                ))}
                </ul>
            </div>
        </div>
    )
}
export default End;