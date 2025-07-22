import { useEffect, useState } from "react";

function CountDownTimer({ endTime }) {
    const calculateTimeLeft = () => {
        const difference = new Date(endTime) - new Date();
        if (difference <= 0) return null;

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return <span className="text-red-600 font-bold">⛔ Bidding Ended</span>;

    return (
        <span className="text-green-600 font-medium">
            ⏳ Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
    );
}

export default CountDownTimer;


