import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import "./App.css";
import { TokenServices } from "./tokenServices";
import { initializeSolanaProvider } from "./programUtils";

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tokensToReceive, setTokensToReceive] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const prices: Record<string, number> = {
    usdc: 1,
    usdt: 1,
    sol: 0.1,
  }; // Replace with your predefined prices

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        setWalletAddress(response.publicKey.toString());
      }
    };
    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      const { userPublicKey } = await initializeSolanaProvider();
      setWalletAddress(userPublicKey.toString());
    } catch (err) {
      setError("Failed to connect wallet");
    }
  };

  const calculateTokens = (inputAmount: string) => {
    if (currency && prices[currency]) {
      setTokensToReceive(Number(inputAmount) / prices[currency]);
    }
  };

  const handleTransaction = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    console.log(`here for swap`);

    try {
      // todo
      const tokenService = new TokenServices();

      tokenService.transferSplTokens();
    } catch (err: any) {
      setError("Transaction failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Buy SPL Tokens</h1>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected Wallet: {walletAddress}</p>
      )}

      <div className="form-group">
        <label>Select Currency</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="">Select</option>
          {Object.keys(prices).map((key) => (
            <option key={key} value={key}>
              {key.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            calculateTokens(e.target.value);
          }}
        />
      </div>

      {tokensToReceive > 0 && (
        <p>You will receive {tokensToReceive.toFixed(2)} tokens</p>
      )}

      <button
        onClick={handleTransaction}
        disabled={!amount || !currency || isLoading}
      >
        {isLoading ? "Processing..." : "Submit"}
      </button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default App;
