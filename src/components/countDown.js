import { useEffect, useState } from 'react';

export default function Counter(props) {

  const useCountdown = () => {
    const countDownDate = new Date(props.timestamp * 1000).getTime();

    const [countDown, setCountDown] = useState(
      countDownDate - new Date().getTime() > 0 ? countDownDate - new Date().getTime() : 0
    );

    useEffect(() => {
      const interval = setInterval(() => {
        const current = countDownDate - new Date().getTime();
        if (current > 0) {
          setCountDown(current);
          // props.updater();
        }
        // else {
        //   props.finish();
        // }
      }, 1000);

      const dataInterval = setInterval(() => {
        const current = countDownDate - new Date().getTime();
        if (current > 0) {
          props.updater();
        }
        else {
          props.finish();
        }
        console.log("5 second interval")
      }, 5000);

      return () => {
        clearInterval(interval)
        clearInterval(dataInterval)
      };
    }, [countDownDate]);

    return getReturnValues(countDown);
  };


  const getReturnValues = (countDown) => {
    // calculate time left
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return [days, hours, minutes, seconds];
  };

  const [days, hours, minutes, seconds] = useCountdown();

  return (
    <div>
      <div className=
        {`${props.timestamp === "" ? "hidden" : ""
          } waviy flex justify-center absolute top-[100px] lg:top-[200px] opacity-80 px-[30%] w-full`}>
        <span className="time-1 mx-3">{hours}</span>
        <span className="time-2 mx-3">:</span>
        <span className="time-3 mx-3">{minutes}</span>
        <span className="time-4 mx-3">:</span>
        <span className="time-5 mx-3">{seconds}</span>
      </div>
    </div>
  );
}