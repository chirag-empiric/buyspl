import React, { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createTransferInstruction } from "@solana/spl-token";
import "./App.css";

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tokensToReceive, setTokensToReceive] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ownerWallet = new PublicKey(
    "5zZnD6ASxazuNKCc2BNZg77dukw3VYnE5LDL1haTnGvU"
  ); // Replace with the actual owner wallet address
  const tokenMint = new PublicKey(
    "5zZnD6ASxazuNKCc2BNZg77dukw3VYnE5LDL1haTnGvU"
  ); // Replace with the token mint address
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
      const response = await window.solana.connect();
      setWalletAddress(response.publicKey.toString());
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

    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const transaction = new Transaction();

      // Transfer selected currency to owner wallet
      const sourceWallet = new PublicKey(walletAddress!);
      const destinationWallet = ownerWallet;
      const lamports =
        currency === "sol" ? Number(amount) * 1e9 : Number(amount); // Adjust for SOL or token decimals

      if (currency === "sol") {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: sourceWallet,
            toPubkey: destinationWallet,
            lamports,
          })
        );
      } else {
        const tokenAccount = await connection.getParsedTokenAccountsByOwner(
          sourceWallet,
          {
            mint: new PublicKey(currency),
          }
        );

        const sourceTokenAccount = tokenAccount.value[0].pubkey;

        transaction.add(
          createTransferInstruction(
            sourceTokenAccount,
            destinationWallet,
            sourceWallet,
            lamports,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sourceWallet;

      const signedTransaction = await window.solana.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await connection.confirmTransaction(signature);

      // Call smart contract to transfer tokens
      // Replace with your Anchor or Solana program interaction logic
      // const program = new Program(idl, programId, provider);
      // await program.rpc.transferTokens(...);

      setSuccess("Transaction completed successfully");
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
