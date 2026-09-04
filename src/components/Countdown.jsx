import {
  useEffect,
  useState
} from "react";

import "./Countdown.css";

export default function Countdown({
  onFinish
}) {

  const [num, setNum] =
    useState(3);


  useEffect(() => {

    if (num === 0) {

      onFinish();

      return;

    }


    const timer =
      setTimeout(() => {

        setNum(current =>
          current - 1
        );

      }, 1000);


    return () =>
      clearTimeout(timer);

  }, [num, onFinish]);


  if (num === 0) {

    return (
      <div className="camera-flash" />
    );

  }


  return (
    <div
      key={num}
      className="count"
    >
      {num}
    </div>
  );
}