"use client";

import { useEffect, useState } from "react";
import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { FaEye, FaEyeSlash, FaCopy, FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function Home() {
  const [mnemonics, setMnemonics] = useState("");
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [keypair, setKeypair] = useState([]);
  const [isVisible, setIsvisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isClipboardAvailable, setIsClipboardAvailable] = useState(false);
  const [visibility, setVisibility] = useState([]);

  const toggleVisibility = (index) => {
    const updatedVisibility = [...visibility];
    updatedVisibility[index] = !updatedVisibility[index];
    setVisibility(updatedVisibility);
  };

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const notifySuccess = (msg) => {
    toast.success(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  useEffect(() => {
    // Check if running in a browser environment
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("data");
      if (savedData) {
        setKeypair(JSON.parse(savedData));
        setMnemonics(localStorage.getItem("mnemonic") || '');
      }
      // else{
      //   setKeypair([]);
      //   setMnemonics(JSON.stringify(''));
      // }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      setIsClipboardAvailable(true);
      localStorage.setItem("data", JSON.stringify(keypair));
      localStorage.setItem("mnemonic", mnemonics);
      setVisibility(new Array(keypair.length).fill(false));
      // setMnemonics(localStorage.getItem('mnemonics') || '');
    }
    // if (typeof window !== "undefined") {
      // const mne = localStorage.getItem('mnemonic');
      // setMnemonics(mne);
    // }
    // localStorage.setItem('data', JSON.stringify(keypair));
  }, [keypair]);

  const handleGenerate = () => {
    if (mnemonics) {
      const seed = mnemonicToSeedSync(mnemonics);
      for(let i = 0; i< count; i++){

      const path = `m/44'/501'/${i}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;

      let secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

      let publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

      setKeypair((prevKeypair) => [
        ...prevKeypair,
        { publickey: publicKey, privatekey: bs58.encode(secret) },
      ]);
      }
      localStorage.setItem("data", JSON.stringify(keypair));

    } else {
      const mnemonic = generateMnemonic();
      // localStorage.setItem("mnemonics", JSON.stringify(mnemonic));
      const seed = mnemonicToSeedSync(mnemonic);
      // let a = [];
      for (let i = 0; i < count; i++) {
        const path = `m/44'/501'/${i}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;

        let secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

        let publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

        setKeypair((prevKeypair) => [
          ...prevKeypair,
          { publickey: publicKey, privatekey: bs58.encode(secret) },
        ]);
      }
      // localStorage.setItem("data", JSON.parse(keypair));
      // localStorage.setItem("mnemonic", mnemonic);
      if (typeof window !== "undefined") {
        localStorage.setItem("mnemonic", mnemonic);
        setMnemonics(mnemonic);
      }
    }
  };

  const handleCopy = async (textToCopy) => {
    if (isClipboardAvailable) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
        notifySuccess("Copied");
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }
  };

  const removeItem = (index) => {
    const updatedItems = keypair.filter((_, i) => i !== index);

    localStorage.setItem("data", JSON.stringify(updatedItems));

    setKeypair(updatedItems);
    notifySuccess('Deleted!');
  };

  const handleAddWallet = () => {
    if(mnemonics){
      const seed = mnemonicToSeedSync(mnemonics);
      // let a = [];
        const path = `m/44'/501'/${count+1}'/0'`;
        const derivedSeed = derivePath(path, seed.toString("hex")).key;

        let secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

        let publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

        setKeypair((prevKeypair) => [
          ...prevKeypair,
          { publickey: publicKey, privatekey: bs58.encode(secret) },
        ]);
        notifySuccess('Added!')
        if (typeof window !== "undefined") {
          localStorage.setItem("mnemonic", mnemonics);
          setMnemonics(mnemonics);
        }
  }
  else{
    notifyError('Please Generate Seed First!')
  }
  }

  const handleDeleteAll = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('data');
      if(!keypair){
        notifyError('Nothing to Delete !')
      }
      // if(keypair){
        // notifyError('Nothing to Delete !')
      // }
      setKeypair([]);
      setCount(0);

    }
    
  };
  return (
    <div className="lg:container lg:mx-auto p-10 box-border">
      <div className="border-b-2 border-gray-700 p-3 m-3">
        <h1 className="block text-6xl pb-10">HD Wallet</h1>
        <div className="relative">
          <ToastContainer />
          <label
            for="search"
            class="mb-2 text-sm font-medium text-white sr-only dark:text-white"
          >
            Search
          </label>
          <input
            type="search"
            id="search"
            className="block outline-none w-3/4 p-4 text-sm text-gray-900  rounded-lg dark:bg-gray-700  dark:placeholder-gray-400 dark:text-white mr-3"
            placeholder="Enter Your Seed if you have one, if NOT then click on Generate to get one"
            required
          />

          <div className="max-w-sm mx-auto absolute end-7 bottom-2.5 border-y p-1.5">
            <label for="underline_select" className="sr-only">
              Underline select
            </label>
            <select
              id="underline_select"
              className="block cursor-pointer px-0 text-sm text-gray-500 bg-transparent border-b-2 border-gray-700 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
            >
              <option selected>Choose No. of Keypairs</option>
              <option value="1" onClick={(e) => setCount(e.target.value)}>
                1
              </option>
              <option value="2" onClick={(e) => setCount(e.target.value)}>
                2
              </option>
              <option value="3" onClick={(e) => setCount(e.target.value)}>
                3
              </option>
              <option value="4" onClick={(e) => setCount(e.target.value)}>
                4
              </option>
              <option value="5" onClick={(e) => setCount(e.target.value)}>
                5
              </option>
              <option value="6" onClick={(e) => setCount(e.target.value)}>
                6
              </option>
              <option value="7" onClick={(e) => setCount(e.target.value)}>
                7
              </option>
              <option value="8" onClick={(e) => setCount(e.target.value)}>
                8
              </option>
              <option value="9" onClick={(e) => setCount(e.target.value)}>
                9
              </option>
              <option value="10" onClick={(e) => setCount(e.target.value)}>
                10
              </option>
            </select>
          </div>
        </div>
        <div className="flex justify-center p-10 ">
          {count ? (
            <button
              type="button"
              className="w-1/5 text-white hover:w-2/5 hover:text-white border border-gray-800 hover:bg-transparent focus:ring-4 focus:outline-none focus:ring-gray-300 font-extrabold rounded-lg text-xl px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-transparent dark:focus:ring-gray-800"
              onClick={handleGenerate}
            >
              Generate
            </button>
          ) : (
            <button
              type="button"
              className="w-1/5 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
              onClick={() => notifyError("Please Specify Number of KeyPair")}
            >
              Generate
            </button>
          )}
        </div>
      </div>
      <div className="border-b-2 border-gray-700 p-3 m-3">
        <div>
          <div className="flex justify-between">
            <h1>Secret Key</h1>
            <div className="flex">
              {(isOpen && mnemonics) && (
                <button
                  className="text-gray-600 hover:text-white"
                  onClick={() => handleCopy(mnemonics)}
                >
                {isCopied ?  'Copied!' : <FaCopy size={20} /> }  
                </button>
              )}
              <button
                className="flex items-center bg-transparent text-white px-4 py-2 rounded"
                onClick={(mnemonics) ? () => setIsOpen(!isOpen): (()=>notifyError('Please Generate the SEED First'))}
              >
                <svg
                  className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${
                    (isOpen && mnemonics) ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke={isOpen ? "white" : "gray"}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {(isOpen && mnemonics) && (
              <div className="grid grid-cols-4 gap-4 justify-items-center align-middle py-10 ">
                {mnemonics?.split(" ").map((item) => {
                  return (
                    <div className="border-x border-y p-3 border-gray-700  w-full flex justify-center ">
                      <p>{item}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-b-2 border-gray-700 p-3 m-3">
        <div className="flex justify-between h-9">
          <h1>KeyPair</h1>
          <div className="flex mr-8">
            <div className="max-w-full mr-3">
              <button
                type="button"
                className="max-w-full bg-gray-700  text-white-900 hover:bottom-2 font-normal rounded-sm text-sm px-5 me-2 py-1 dark:hover:bg-transparent dark:hover:border-y-2"
                onClick={handleAddWallet}
              >
                Add Wallet
              </button>
            </div>
            <div>
              <button
                type="button"
                className="max-w-full bg-red-900  text-white-900 hover:bottom-2 font-normal rounded-sm text-sm px-5 me-2 py-1  dark:hover:bg-transparent dark:hover:border-y-2"
                onClick={handleDeleteAll}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
        <div>
          {keypair?.map((item, key) => {
            return (
              <div class="w-9/12 /p-6 bg-transparent border-2  rounded-lg shadowbg-blue-800 dark:border-gray-700 mt-5 p-4">
                <div className="flex justify-between">
                  <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Wallet {key + 1}
                  </h5>
                  <button
                    onClick={() => removeItem(key)}
                    className="flex items-center px-1 py-2"
                  >
                    <FaTrash className=" text-white text-md hover:text-red-800 hover:text-xl" />
                  </button>
                </div>
                <p class="mb-3 font-normal text-gray-400">
                  <h3>Public Key:</h3>
                  <span className="text-sm text-gray-700">
                    {item.publickey}
                  </span>
                </p>
                <div class="mb-3 font-normal text-gray-400">
                  <h3>Private Key:</h3>
                  <span className="text-xs text-gray-700 flex justify-between">
                  <div>
                  {visibility[key]
                    ? item.privatekey
                    : "*".repeat(item.privatekey.length)}{" "}
                </div>
                    <div>
                      <button
                        className="text-gray-600 hover:text-gray-700 px-2"
                        onClick={() => toggleVisibility(key)}
                      >
                        {visibility[key] ? (
                          <FaEyeSlash className="text-gray-400" size={20} />
                        ) : (
                          <FaEye size={20} />
                        )}
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleCopy(item.privatekey)}
                      >
                        <FaCopy size={20} />
                      </button>
                    </div>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
