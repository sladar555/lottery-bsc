import React, { useEffect, useState } from "react";
import Counter from "./countDown";
import LogoImg from "../assets/image/logo.png";
import * as Web3Utils from 'web3-utils';
import Web3Modal from "web3modal";
import Web3 from "web3";
import WalletConnect from "@walletconnect/web3-provider";
import contractInstance from '../contracts/lotteryInstance';

export default function Ticket() {
  //const [currentSelected, setCurrentSelected] = useState(-1);
  const number = [];
  for (let i = 0; i < 65; i++) number[i] = i;
  let randomnum = [];
  for (let i = 0; i < 6; i++) randomnum[i] = -1;
  const [randomwidth, setRandomWidth] = useState([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const defaultDice = number.map((i) => false);
  const [dice, setDice] = useState(defaultDice);
  const defaultDices = [];
  const [finalDices, setFinalDices] = useState(defaultDices);
  const [ticketBuyed, setBuy] = useState(0);
  const [ticketCount, setTicketCount] = useState(1);
  const [round, setRound] = useState(1);
  const [totalRound, setTotalRound] = useState(1);
  const [firstTicketCount, setFirstTicketCount] = useState(0);
  const [currentWinningNumber, setCurrentWinningNumber] = useState([]);
  const [bnbPrice, setBnbPrice] = useState(229);
  const [lotteryFinished, setLotteryFinish] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState(0);
  const [claimableTicketId, setClaimableTicketId] = useState([]);
  const [isClaimed, setIsClaimed] = useState(false);
  const [web3Data, setWeb3Data] = useState({
    fetching: false,
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 1,
    networkId: 1,
    contract: null,
    lotteryInfo: []
  });
  const INITIAL_STATE = {
    fetching: false,
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 1,
    networkId: 1,
    contract: null,
    lotteryInfo: []
  };


  // const getNetwork = () => getChainData(this.state.chainId).network;
  const getProviderOptions = () => {
    const infuraId = "00ca1859789d4b40bce01f4104844224";
    const providerOptions = {
      walletconnect: {
        package: WalletConnect,
        options: {
          network: "binance",
          rpc: {
            56: "https://bsc-dataseed1.binance.org"
          }
        }
      },
      "custom-binancechainwallet": {
        display: {
          logo: "https://lh3.googleusercontent.com/rs95LiHzLXNbJdlPYwQaeDaR_-2P9vMLBPwaKWaQ3h9jNU7TOYhEz72y95VidH_hUBqGXeia-X8fLtpE8Zfnvkwa=w128-h128-e365-rj-sc0x00ffffff",
          name: "Binance Chain Wallet",
          description: "Connect to your Binance Chain Wallet"
        },
        package: true,
        connector: async () => {
          let provider = null;
          if (typeof window.BinanceChain !== 'undefined') {
            provider = window.BinanceChain;
            try {
              const account = await provider.request({ method: 'eth_requestAccounts' })
              console.log(account);
            } catch (error) {
              throw new Error("User Rejected");
            }
          } else {
            throw new Error("No Binance Chain Wallet found");
          }
          return provider;
        }
      },
      "custom-safepal": {
        display: {
          logo: "https://lh3.googleusercontent.com/QW00mbAVyzdfmjpDy6DGRU-qlIRNMGA-DZpGTYfTp1X1ISWb6NNyXhR2ss2iiqmLp9KYkRiWDrPrvL3224HkUtJbIQ=w128-h128-e365-rj-sc0x00ffffff",
          name: "SafePal Wallet",
          description: "Connect to your SafePal Wallet"
        },
        package: true,
        connector: async () => {
          let provider = null;
          if (typeof window.safepal !== 'undefined') {
            provider = window.safepal;
            try {
              const account = await provider.request({ method: 'eth_requestAccounts' })
              console.log(account);
            } catch (error) {
              throw new Error("User Rejected");
            }
          } else {
            throw new Error("No Binance Chain Wallet found");
          }
          return provider;
        }
      }
    };
    return providerOptions;
  };

  const web3Modal = darkMode ? new Web3Modal({
    network: "Binance",
    cacheProvider: true,
    providerOptions: getProviderOptions(),
    theme: "dark"
  }) : new Web3Modal({
    network: "Binance",
    cacheProvider: true,
    providerOptions: getProviderOptions(),
  });

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      // onConnect();
      resetApp();
    }
  }, []);

  function ellipseAddress(
    address = "",
    width = 10
  ) {
    return `${address.slice(0, width)}...${address.slice(-width)}`;
  }
  const resetApp = async () => {
    const { web3 } = web3Data;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    setWeb3Data({ ...INITIAL_STATE });
  };

  const subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => resetApp());
    provider.on("accountsChanged", async (accounts) => {
      console.log(accounts[0])
      setWeb3Data({ ...web3Data, address: accounts[0] });
      // await this.getAccountAssets();
    });
    provider.on("chainChanged", async (chainId) => {
      const { web3 } = web3Data;
      const networkId = await web3.eth.net.getId();
      setWeb3Data({ ...web3Data, chainId: chainId, networkId: networkId });
      // await this.getAccountAssets();
    });

    provider.on("networkChanged", async (networkId) => {
      const { web3 } = web3Data;
      const chainId = await web3.eth.chainId();
      setWeb3Data({ ...web3Data, chainId: chainId, networkId: networkId });
      // await this.getAccountAssets();
    });
  };
  function initWeb3(provider) {
    const web3 = new Web3(provider);

    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          outputFormatter: web3.utils.hexToNumber
        }
      ]
    });

    return web3;
  }


  const onConnect = async () => {
    try {
      const provider = await web3Modal.connect();
      await subscribeProvider(provider);

      await provider.enable();
      const web3 = initWeb3(provider);

      const curChainId = await provider.request({ method: 'eth_chainId' });
      const binanceTestChainId = '0x61'
      if (curChainId === binanceTestChainId) {
        console.log("Bravo!, you are on the correct network");
      } else {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x61' }],
          });
          console.log("You have succefully switched to Binance Test network")
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x61',
                    chainName: 'Binance Smart Chain Testnet',
                    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                    blockExplorerUrls: ['https://testnet.bscscan.com/'],
                    nativeCurrency: {
                      symbol: 'BNB',
                      decimals: 18,
                    }
                  }
                ]
              });
            } catch (addError) {
              console.log(addError);
              // alert(addError);
            }
          }
          // alert("Failed to switch to the network")
          return;
        }
      }

      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];

      const networkId = await web3.eth.net.getId();

      const chainId = await web3.eth.chainId();
      const contract = await contractInstance;

      const curLotteryId = await contract.getCurrentLotteryId();
      const lotteryInfo = await contract.getLotteryInfo(curLotteryId);
      setWeb3Data({
        web3,
        provider,
        connected: true,
        address,
        chainId,
        networkId,
        contract,
        lotteryInfo
      });
      const curTicketId = await contract.getCurrentTicketId();
      console.log("onConnect", curTicketId);
      localStorage.setItem("lastTicketId", parseInt(curTicketId))
      setTotalRound(curLotteryId);
      setRound(curLotteryId - 1);
      const playerCount = await contract.getPlayerCount();
      setCurrentTicketId(playerCount);
      const lotteryInfo1 = await contract.getLotteryInfo(curLotteryId - 1);
      console.log(curLotteryId - 1)
      setCurrentWinningNumber(lotteryInfo1.finalNumber);
      const userInfo = await contract.viewUserInfoForLotteryId(address, curLotteryId - 1);
      console.log(userInfo);
      let winTickets = []
      for (let i = 0; i < userInfo[2].length; i++) {
        const isReward = await contract.viewRewardsForTicketId(curLotteryId - 1, userInfo[0][i]);
        if (isReward > 0)
          winTickets.push(userInfo[0][i])
        if (userInfo[2][i] == true) {
          setIsClaimed(true);
        }
      }
      setClaimableTicketId(winTickets);
      // await this.getAccountAssets();
    } catch (e) {
      console.log(e);
    }
  };

  const clearSelection = () => {
    let i;
    for (i = 0; i < 65; i++) {
      dice[i] = 0;
    }
    setDice(dice);
  };

  const selectDice = (index) => {
    let newDice = [...dice];
    newDice[index] = !newDice[index];
    const selectedCount = newDice.filter((item) => item == true).length;
    if (selectedCount < 7) {
      setDice(newDice);
    }
  };

  const buyTicket = () => {
    if (ticketCount > 0) {
      setFirstTicketCount(ticketCount);
      setShowDropDown(false);
      setBuy(1);

      let newRandomwidth = [];
      for (let i = 0; i < ticketCount; i++) {
        newRandomwidth[i] = Math.floor(Math.random() * 20);
      }
      setRandomWidth(newRandomwidth);
    }
  };

  const buyTicketOnWeb3 = async (tickets) => {
    setFinalDices(defaultDices);
    let ticketArray = [];
    for (let i = 0; i < tickets.length; i++) {
      let wrapper = [];
      let ticket = [];
      for (let j = 0; j < tickets[i].length; j++)
        if (tickets[i][j] == 1)
          ticket.push(j + 1);
      wrapper.push(ticket);
      ticketArray.push(wrapper);
    }
    console.log(ticketArray);
    console.log(web3Data.address);
    await web3Data.contract.buyTickets(web3Data.address, ticketArray);
  }

  const buyOne = async () => {
    const selectedCount = dice.filter((item) => item == true).length;
    if (selectedCount === 6) {
      let newDices = [...finalDices];
      newDices.push([...dice]);
      // for(let i=0; i< 65; i++)
      //   console.log(dice[i]);
      setTicketCount(ticketCount - 1);
      clearSelection();
      console.log(ticketCount);
      setFinalDices(newDices);
      if (ticketCount == 1) {
        setBuy(0);
        setShowDropDown(true);
        buyTicketOnWeb3(newDices);
      }
    } else {
      alert("Select 6 numbers");
    }
  };

  const buyAll = async () => {
    let newDices = [...finalDices];
    for (let i = ticketCount - 1; i >= 0; i--) {
      const dice = getRandomNum();
      newDices.push([...dice]);
    }
    setFinalDices(newDices);
    setShowDropDown(true);
    setTicketCount(0);
    setBuy(0);
    clearSelection();
    buyTicketOnWeb3(newDices);
  };

  const claimReward = async () => {
    console.log(round);
    console.log(claimableTicketId)
    await web3Data.contract.claimReward(web3Data.address, round, claimableTicketId);
  }
  const handleInputChange = (e) => {
    if (e.target.value >= 0) setTicketCount(e.target.value);
  };
  const handleRoundChange = (e) => {
    if (e.target.value >= 1) setRound(e.target.value);
  };
  const setRandomNum = () => {
    let i, j;
    for (i = 0; i < 65; i++) {
      dice[i] = 0;
    }
    for (i = 0; i < 6; i++) {
      j = 0;
      let current = Math.floor(Math.random() * 65);
      while (j < i) {
        if (randomnum[j] == current) break;
        j++;
      }
      if (j < i) i--;
      else {
        randomnum[i] = current;
      }
    }

    let newDice = [...dice];
    for (i = 0; i < 6; i++) {
      newDice[randomnum[i]] = 1;
    }
    setDice(newDice);
  };
  const getRandomNum = () => {
    let i, j;
    for (i = 0; i < 65; i++) {
      dice[i] = 0;
    }
    for (i = 0; i < 6; i++) {
      j = 0;
      let current = Math.floor(Math.random() * 65);
      while (j < i) {
        if (randomnum[j] == current) break;
        j++;
      }
      if (j < i) i--;
      else {
        randomnum[i] = current;
      }
    }

    let newDice = [...dice];
    for (i = 0; i < 6; i++) {
      newDice[randomnum[i]] = 1;
    }
    return newDice;
  };
  const finishLottery = async () => {
    const curLotteryId = await web3Data.contract.getCurrentLotteryId();
    const lotteryInfo = await web3Data.contract.getLotteryInfo(curLotteryId);
    const playerCount = await web3Data.contract.getPlayerCount();
    setCurrentTicketId(playerCount);
    setWeb3Data({ ...web3Data, lotteryInfo: lotteryInfo });
    setLotteryFinish(true);
  };

  const realTimeUpdate = async () => {
    const lastTicketId = localStorage.getItem("lastTicketId");
    const curLotteryId = await web3Data.contract.getCurrentLotteryId();
    const lotteryInfo = await web3Data.contract.getLotteryInfo(curLotteryId);
    const playerCount = await web3Data.contract.getPlayerCount();
    setCurrentTicketId(playerCount);
    const curTicketId = await web3Data.contract.getCurrentTicketId();
    console.log(curTicketId, lastTicketId);
    // if(lastTicketId)
    const ticketCount = parseInt(curTicketId) - lastTicketId;
    let newRandomwidth = [];
    for (let i = 0; i < ticketCount; i++) {
      newRandomwidth[i] = Math.floor(Math.random() * 20);
    }
    setRandomWidth(newRandomwidth);
    localStorage.setItem("lastTicketId", parseInt(curTicketId))
    setShowDropDown(true);
    setWeb3Data({ ...web3Data, lotteryInfo: lotteryInfo });
    setLotteryFinish(false);
  }

  const handleSwitch = (e) => {
    setDarkMode(e.target.checked);
  };

  const nextRound = async () => {
    if (round < totalRound - 1) {
      setRound(round + 1);
      const lotteryInfo = await web3Data.contract.getLotteryInfo(round + 1);
      setCurrentWinningNumber(lotteryInfo.finalNumber);
      const userInfo = await web3Data.contract.viewUserInfoForLotteryId(web3Data.address, round + 1);
      console.log(userInfo);
      let winTickets = []
      for (let i = 0; i < userInfo[2].length; i++) {
        const isReward = await web3Data.contract.viewRewardsForTicketId(round + 1, userInfo[0][i]);
        if (isReward > 0)
          winTickets.push(userInfo[0][i])
        if (userInfo[2][i] == true) {
          setIsClaimed(true);
        }
      }
      setClaimableTicketId(winTickets);
    }
  };
  const prevRound = async () => {
    if (round > 1) {
      setRound(round - 1);
      const lotteryInfo = await web3Data.contract.getLotteryInfo(round - 1);
      setCurrentWinningNumber(lotteryInfo.finalNumber);
      const userInfo = await web3Data.contract.viewUserInfoForLotteryId(web3Data.address, round - 1);
      console.log(userInfo);
      let winTickets = []
      for (let i = 0; i < userInfo[2].length; i++) {
        const isReward = await web3Data.contract.viewRewardsForTicketId(round - 1, userInfo[0][i]);
        if (isReward > 0)
          winTickets.push(userInfo[0][i])
        if (userInfo[2][i] == true) {
          setIsClaimed(true);
        }
      }
      setClaimableTicketId(winTickets);
    }
  };

  return (
    <div>
      {!darkMode && (
        <div className="lg:w-full lg:block hidden fixed">
          <video className="lg:w-full h-full " muted loop autoPlay>
            <source src="video/background.mp4" type="video/mp4"></source>
          </video>
        </div>
      )}
      {!darkMode && (
        <div className="fixed lg:hidden block bg-[url('../src/assets/image/mobile_back.jpg')] w-full h-full"></div>
      )}
      <div
        className={`${darkMode ? "bg-gray-800" : "bg-none"
          } bg-cover bg-repeat-round transition duration-1000 ease-in`}
      >
        {!lotteryFinished && (
          <div className="h-[100px] w-full relative">
            <div className="flex justify-between items-center">
              <img
                src={LogoImg}
                alt="logo"
                className="w-[80px] h-[80px] float-left"
              />
              <div className="flex flex-row h-fit items-center">
                <div className="flex justify-center h-[80%] mr-8">
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    id="toggle"
                    onChange={handleSwitch}
                  />
                  <label htmlFor="toggle" className="label hover:cursor-pointer">
                    <i className="fas fa-moon"></i>
                    <i className="fas fa-sun"></i>
                    <div
                      className={`${darkMode ? "ball-move" : ""} ball`}
                    ></div>
                  </label>
                </div>
                <div
                  className="text-white border-solid mr-4 text-xs md:text-xl p-2 hover:drop-shadow-2xl hover:cursor-pointer font-bold"
                  onClick={web3Data.address === "" ? onConnect : resetApp}
                >
                  {web3Data.address === "" ? "Connect Wallet" : ellipseAddress(web3Data.address, 5)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex lg:flex-row flex-col gap-2 relative">
          <div className="w-[100%] lg:w-[50%] pb-[80px] pb-10 lg:pb-[100px]">
            <div className="flex flex-row gap-2 mb-10 ml-[10%]">
              <div className="flex justify-center text-sm md:text-xl lg:text-2xl h-auto w-[50%] items-center self-center text-center">
                <button
                  className="w-[80%] button-85 font-extrabold"
                  disabled={ticketBuyed}
                  onClick={buyTicket}
                >
                  Buy ticket
                </button>
              </div>
              <div className="w-[30%]">
                <div className="edit-63">
                  <input
                    className="ml-[20%] w-[60%] text-center text-sm md:text-xl lg:text-2xl outline-0 font-extrabold text-white"
                    type="number"
                    onChange={handleInputChange}
                    value={ticketCount}
                    disabled={ticketBuyed}
                    style={{ background: "none" }}
                  />
                </div>
              </div>
            </div>
            <div
              className={`${darkMode ? "box-neon" : " "
                } w-[80%] py-4 px-2 md:p-4 lg:p-8 ml-[10%] letter border-1 rounded-3xl`}
            >
              <p className="text-white text-5xl lg:text-7xl flex justify-center font-['toppan-bunkyu-midashi-go-std'] font-bold ">
                TICKET
              </p>
              <div className="my-[30px]">
                <p className="text-white text-xl md:text-2xl lg:text-3xl inline font-bold">
                  Select 6 numbers
                </p>
                &nbsp;
                <p className="text-[#6ad707] text-xl md:text-2xl lg:text-3xl inline font-bold">
                  To win
                </p>
              </div>
              <div className="relative md:p-4 p-1">
                <div
                  className="grid grid-cols-7 gap-x-1 gap-y-3 md:gap-2 lg:gap-3"
                  id="lotto"
                >
                  {number.map((i) => (
                    <div
                      key={i}
                      className={`${!dice[i] ? "div-unselected " : "div-selected "
                        } lg:font-bold lg:font-bold flex justify-center border-1 text-white border-gray-200 text-sm md:text-xl lg:text-2xl p-1 hover:drop-shadow-xl hover:cursor-pointer`}
                      onClick={() => selectDice(i)}
                    >
                      {i + 1}
                    </div>
                  ))}
                  <div></div>
                  <div
                    className="col-span-3 flex justify-center text-white border-solid border-2 border-white rounded-xl text-sm md:text-xl lg:text-2xl p-1 lg:font-bold lg:font-bold buy-button"
                    onClick={setRandomNum}
                  >
                    Random
                  </div>
                  <div
                    className="col-span-3 flex justify-center text-white border-solid border-2 border-white rounded-xl text-sm md:text-xl lg:text-2xl p-1 lg:font-bold lg:font-bold buy-button"
                    onClick={buyOne}
                  >
                    {ticketCount > 1 ? "Next" : "Buy"}
                  </div>
                  <div></div>
                  <div
                    className="col-span-3 flex justify-center text-white border-solid border-2 border-white rounded-xl text-xs md:text-xl lg:text-2xl p-1 lg:font-bold lg:font-bold buy-button"
                    onClick={buyAll}
                  >
                    Skip{"(all-" + ticketCount + ")"}
                  </div>
                </div>
                <div
                  className={`${!ticketBuyed ? "visible" : "invisible"
                    } w-[100%] h-[100%] bg-stone-400 absolute top-0 right-0 opacity-70`}
                ></div>
              </div>
            </div>
            {/* <div className="relative flex">
              <div
                className="w-[50%] text-white border-solid border-[#1b8ed4] rounded-xl text-xl p-2 hover:drop-shadow-2xl hover:cursor-pointer bg-lime-600 "
                onClick={finishLottery}
              >
                Finish lottery
              </div>
            </div> */}
          </div>
          <div
            className={`${lotteryFinished ? "hidden" : ""
              } lg:block lg:w-[50%] w-[100%] relative pb-[100px] lg:pb-0`}
          >
            {web3Data.lotteryInfo.endTime && (<Counter
              timestamp={web3Data.lotteryInfo.endTime}
              finish={finishLottery}
              updater={realTimeUpdate}
            />)}

            {showDropDown &&
              randomwidth.map((item, index) => (
                <span
                  key={index}
                  className={`absolute ${item % 2 ? "anim-right" : "anim-left"
                    } ml-[calc(50%_-_50px)] -mt-[50%] opacity-0 ticket left-[${item}%]`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                ></span>
              ))}
            <div className="w-[100px] md:w-[200px] lg:w-[300px] h-[100px] md:h-[200px] lg:h-[300px] scene ml-[calc(50%_-_50px)] md:ml-[calc(50%_-_100px)] lg:ml-[calc(50%_-_150px)] mt-[55%] lg:mt-[300px]">
              <div className="relative w-[100px] md:w-[200px] lg:w-[300px] h-[100px] h-[200px] lg:h-[300px] cube">
                <div
                  className={`${darkMode ? "box-neon" : " "
                    }  side back flex items-center justify-center`}
                >
                  <span>
                    {web3Data.lotteryInfo.firstTicketId ? currentTicketId : "0"}
                    <br />
                    players
                  </span>
                </div>
                <div
                  className={`${darkMode ? "box-neon" : " "
                    } side top flex items-center justify-center`}
                >
                  <img
                    src={LogoImg}
                    alt="logo"
                    className="w-full h-full float-left"
                  />
                </div>
                <div
                  className={`${darkMode ? "box-neon" : " "
                    } side bottom flex items-center justify-center`}
                >
                  <img
                    src={LogoImg}
                    alt="logo"
                    className="w-full h-full float-left"
                  />
                </div>
                <div
                  className={`${darkMode ? "box-neon" : " "
                    } side front flex items-center justify-center`}
                >
                  <span>
                    Prize
                    <br />
                    $ {web3Data.lotteryInfo.amountCollected ? (Web3Utils.fromWei(web3Data.lotteryInfo.amountCollected, 'ether') * bnbPrice * 0.6).toFixed(4) : "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {lotteryFinished && (
            <div className="absolute w-full h-full bg-gray-800 fadein p-8">
              <p className="text-[30px] md:text-[70px] lg:text-[100px] font-extrabold text-white flex justify-center font-['cursive'] text-neon-green">
                Winning Number
              </p>
              <div className="w-[100px] md:w-[200px] lg:w-[300px] h-[100px] md:h-[200px] lg:h-[300px] scene ml-[calc(50%_-_50px)] md:ml-[calc(50%_-_100px)] lg:ml-[calc(50%_-_150px)] mt-[100%] md:mt-[400px] lg:mt-[400px] flex flex-col items-center">
                <div className="relative w-[100px] md:w-[200px] lg:w-[300px] h-[100px] h-[200px] lg:h-[300px] cube z-[1]">
                  <div className="side back box-neon flex items-center justify-center">
                    <span>
                      {web3Data.lotteryInfo.firstTicketId ? currentTicketId : "0"}
                      <br />
                      players
                    </span>
                  </div>
                  <div className="side top box-neon">
                    <img
                      src={LogoImg}
                      alt="logo"
                      className="w-full h-full float-left"
                    />
                  </div>
                  <div className="side bottom box-neon">
                    <img
                      src={LogoImg}
                      alt="logo"
                      className="w-full h-full float-left"
                    />
                  </div>
                  <div className="side front box-neon flex items-center justify-center">
                    <span>
                      Prize
                      <br />
                      $ {web3Data.lotteryInfo.amountCollected ? (Web3Utils.fromWei(web3Data.lotteryInfo.amountCollected, 'ether') * bnbPrice * 0.6).toFixed(4) : "0"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2 md:gap-5 w-[300%] md:w-[260%] scale-anim z-[-1] opacity-0">
                  <div className="win-num flex justify-center text-[20px] md:text-[40px] lg:text-[60px]">
                    {web3Data.lotteryInfo.finalNumber[0][0] === "0" ? "?" : web3Data.lotteryInfo.finalNumber[0][0]}
                  </div>
                  <div
                    className="win-num flex justify-center text-[20px] md:text-[40px] lg:text-[60px] "
                    style={{ animationDelay: "500ms" }}
                  >
                    {web3Data.lotteryInfo.finalNumber[0][1] === "0" ? "?" : web3Data.lotteryInfo.finalNumber[0][1]}
                  </div>
                  <div
                    className="win-num flex justify-center text-[20px] md:text-[40px] lg:text-[60px]"
                    style={{ animationDelay: "1000ms" }}
                  >
                    {web3Data.lotteryInfo.finalNumber[0][2] === "0" ? "?" : web3Data.lotteryInfo.finalNumber[0][2]}
                  </div>
                  <div
                    className="win-num flex justify-center text-[20px] md:text-[40px] lg:text-[60px]"
                    style={{ animationDelay: "1500ms" }}
                  >
                    {web3Data.lotteryInfo.finalNumber[0][3] === "0" ? "?" : web3Data.lotteryInfo.finalNumber[0][3]}
                  </div>
                  <div
                    className="win-num flex justify-center text-[20px] md:text-[40px] lg:text-[60px]"
                    style={{ animationDelay: "2000ms" }}
                  >
                    {web3Data.lotteryInfo.finalNumber[0][4] === "0" ? "?" : web3Data.lotteryInfo.finalNumber[0][4]}
                  </div>
                  <div
                    className="win-num flex justify-center text-[20px] md:text-[40px] lg:text-[60px]"
                    style={{ animationDelay: "2500ms" }}
                  >
                    {web3Data.lotteryInfo.finalNumber[0][5] === "0" ? "?" : web3Data.lotteryInfo.finalNumber[0][5]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`${darkMode || lotteryFinished ? "bg-gray-800" : "bg-transparent"
          } h-[500px]  flex items-center relative transition duration-1000 ease-in-out`}
      >
        <div
          className={`${darkMode ? "box-neon" : " "
            } " w-[96%] md:w-[60%] lg:w-[50%] h-[80%] lg:h-[80%] ml-[2%] md:ml-[20%] lg:ml-[25%] letter rounded-2xl `}
        >
          <div className="flex p-8">
            <p className="text-white text-md md:text-2xl lg:text-3xl inline font-bold place-self-center">
              Round
            </p>
            <input
              className="text-center text-sm lg:text-xl lg:font-extrabold text-white outline outline-2 rounded-2xl w-[20%] lg:w-[10%] ml-[20px] focus:outline-offset-2 focus:outline-violet-900"
              type="number"
              onChange={handleRoundChange}
              value={round}
              max={totalRound - 1}
              style={{ background: "none" }}
            />
            <div className=" ml-[auto]">
              <button
                className="w-[30px] h-[30px] text-white font-extrabold text-[30px] text-white hover:opacity-60"
                onClick={prevRound}
              >
                &larr;
              </button>
              <button
                className="w-[30px] h-[30px] text-white font-extrabold text-[30px] ml-4 lg:ml-24 text-white hover:opacity-60"
                onClick={nextRound}
              >
                &rarr;
              </button>
            </div>
          </div>
          <div className="my-4 lg:my-8 w-full h-auto border border-gray-700"></div>
          <div className="flex flex-col lg:flex-row px-2 md:px-8">
            <div className="min-w-fit">
              <p className="text-white text-xl lg:text-2xl inline font-bold">
                Winning Number
              </p>
            </div>
            {currentWinningNumber.length && (<div className="w-full lg:ml-8 px-2 lg:px-8 py-4 lg:py-0">
              <div className="grid grid-cols-6 gap-2 lg:gap-4 inline">
                <div className="lg:font-bold flex justify-center text-white text-3xl lg:text-4xl p-1 win-ball-pink rounded-[50%]">
                  {currentWinningNumber[0][0]}
                </div>
                <div className="lg:font-bold flex justify-center text-white text-3xl lg:text-4xl p-1 win-ball-purple rounded-[50%]">
                  {currentWinningNumber[0][1]}
                </div>
                <div className="lg:font-bold flex justify-center text-white text-3xl lg:text-4xl p-1 win-ball-green rounded-[50%]">
                  {currentWinningNumber[0][2]}
                </div>
                <div className="lg:font-bold flex justify-center text-white text-3xl lg:text-4xl p-1 win-ball-gray rounded-[50%]">
                  {currentWinningNumber[0][3]}
                </div>
                <div className="lg:font-bold flex justify-center text-white text-3xl lg:text-4xl p-1 win-ball-blue rounded-[50%]">
                  {currentWinningNumber[0][4]}
                </div>
                <div className="lg:font-bold flex justify-center text-white text-3xl lg:text-4xl p-1 win-ball-cyan rounded-[50%]">
                  {currentWinningNumber[0][5]}
                </div>
              </div>
            </div>)}
          </div>
          {claimableTicketId.length ? (
            <div className="flex flex-col lg:flex-row px-2 md:px-8 mt-8">
              <div className="flex w-full lg:w-[50%]">
                <p className="text-white text-xl lg:text-2xl inline font-bold">
                  You are
                </p>
                <p className="text-[#6ad707] ml-[20%] text-xl lg:text-2xl inline font-bold winner">
                  Winner
                </p>
              </div>
              <div className="w-[80%] lg:w-[50%] self-center mt-4 lg:mt-0">
                {!isClaimed ? (<div className="col-span-3 flex justify-center text-white border-solid border-2 border-white rounded-xl text-xl lg:text-2xl p-1 lg:font-bold lg:font-bold claim-button"
                  onClick={claimReward}>
                  Claim
                </div>) :
                  (<div className="col-span-3 flex justify-center text-white border-solid border-2 border-white rounded-xl text-xl lg:text-2xl p-1 lg:font-bold lg:font-bold claimed-button"
                  >
                    Claimed
                  </div>)
                }
              </div>
            </div>
          )
            : (
              <div className="flex flex-col lg:flex-row px-2 md:px-8 mt-8">
                <div className="flex w-full justify-center rounded-full border-0 py-4">
                  <p className="text-white text-2xl lg:text-6xl inline font-bold claim linear-wipe">
                    BETTER LUCK NEXT TIME
                  </p>
                </div>
              </div>
            )}
          <div className="w-full lg:ml-8 px-2 lg:px-8 py-4 lg:py-0"></div>
        </div>
      </div>
    </div>
  );
}
