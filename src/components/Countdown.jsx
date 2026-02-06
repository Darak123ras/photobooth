
import "./Countdown.css";
import { useEffect, useState } from "react";

export default function Countdown({ onFinish }) {
  const [num, setNum] = useState(3);

  useEffect(() => {
    if (num === 0) {
      const video = document.querySelector(".photo-slot video");
      onFinish(video);
      return;
    }

    const t = setTimeout(() => {
      setNum(n => n - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [num]);

  return <div className="count">{num}</div>;
}
