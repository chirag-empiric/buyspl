import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@project-serum/anchor'
import tokenIdl from "../../tokens/target/idl/tokens.json"
import Wallet from '@project-serum/anchor/dist/cjs/nodewallet'

let provider
let userPublicKey

const tokenProgramId = new PublicKey(tokenIdl.metadata.address)

const commitmentLevel = 'confirmed'
const rpcUrl = 'https://api.devnet.solana.com'
export const connection = new Connection(rpcUrl, commitmentLevel)

const privateKey = new Uint8Array([129, 66, 188, 237, 45, 153, 77, 40, 148, 67, 90, 123, 31, 246, 178, 113, 131, 162, 186, 180, 212, 186, 105, 143, 10, 56, 188, 63, 211, 56, 161, 38, 74, 45, 234, 236, 131, 169, 174, 25, 123, 33, 209, 201, 63, 95, 93, 40, 231, 90, 225, 62, 157, 204, 122, 52, 93, 138, 199, 40, 34, 136, 104, 129])

export const userWallet = Keypair.fromSecretKey(privateKey)
export const masterWallet = new Wallet(userWallet)

export const initializeSolanaProvider = async () => {
    try {
        if (!window.solana) {
            alert('Phantom wallet not found! Please install Phantom.')
            // throw new Error("Phantom wallet not found!");
        } else {
            const response = await window.solana.connect()
            userPublicKey = response.publicKey

            provider = new anchor.AnchorProvider(
                connection,
                {
                    publicKey: userPublicKey,
                    signTransaction: window.solana.signTransaction,
                    signAllTransactions: window.solana.signAllTransactions,
                },
                {
                    commitment: 'confirmed',
                },
            )

            anchor.setProvider(provider)

            const program = new Program(tokenIdl, tokenProgramId, provider)

            return { userPublicKey, provider, program }
        }
    } catch (error) {
        console.error('Error initializing Solana provider:', error)
        throw error
    }
}

export { userPublicKey, provider }