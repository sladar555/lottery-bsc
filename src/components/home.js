export default function Home() {
  return (
    <div className="App">
      <div>
        <div
            className="relative flex flex-col h-screen"
            id="back-image"
          >
            <p className="text-[70px] font-bold text-red-600 anim-text-flow">
              LOTTERY
            </p>
            <div className='flex-1 flex justify-center'>
              <video className='h-full' muted loop autoPlay>
                <source src="video/back.mp4" type="video/mp4"></source>
              </video>
            </div>
          </div>
      </div>
    </div>
  );
}