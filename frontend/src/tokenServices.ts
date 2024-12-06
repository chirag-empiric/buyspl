import {
    PublicKey,
    Transaction,
} from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import {
    connection,
    initializeSolanaProvider,
    masterWallet,
} from './programUtils'
import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount
} from '@solana/spl-token'
import Wallet from '@project-serum/anchor/dist/cjs/nodewallet'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'

const { solana } = window
const mintAmount = 100
const TOKEN_DECIMALS = 9
const TOKEN_NAME = "Test Token 23249999"

const ownerKp = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([129, 66, 188, 237, 45, 153, 77, 40, 148, 67, 90, 123, 31, 246, 178, 113, 131, 162, 186, 180, 212, 186, 105, 143, 10, 56, 188, 63, 211, 56, 161, 38, 74, 45, 234, 236, 131, 169, 174, 25, 123, 33, 209, 201, 63, 95, 93, 40, 231, 90, 225, 62, 157, 204, 122, 52, 93, 138, 199, 40, 34, 136, 104, 129])
);

const myKeypair = anchor.web3.Keypair.fromSecretKey(
    bs58.decode("Q2HfaHdcZuQXqkBGPBghNyW4mz4RwZQqJQqQpafpMyKZuWfaxe6sGgHBMFZ8oH8j6MehZxXgUgqVDryD2suyeWA")
);


const myWallet = new Wallet(myKeypair);
const ownerWp = new Wallet(ownerKp);

const getAssociateAccount = async (userAddress: any, tokenMintAddress: any) => {
    try {
        console.log(`address`, userAddress, tokenMintAddress)
        console.log(`address fromatted`, userAddress.toString(), tokenMintAddress.toString())
        const { provider } = await initializeSolanaProvider()

        if (window.solana && window.solana.isPhantom) {

            const response = await window.solana.connect()
            const walletPublicKey = new PublicKey(response.publicKey)

            const associatedTokenAddress = await getAssociatedTokenAddressSync(
                new PublicKey(tokenMintAddress),
                userAddress,
            )

            try {
                const getAcc = await getAccount(connection, associatedTokenAddress)
                console.log(
                    `getAcc================================`,
                    getAcc.address.toString(),
                )
                return getAcc
            } catch (err) {
                console.log('Token account not found, creating a new one...')
                const blockhash = await connection.getLatestBlockhash()
                const transaction = new Transaction({
                    recentBlockhash: blockhash.blockhash,
                    feePayer: walletPublicKey,
                }).add(
                    createAssociatedTokenAccountInstruction(
                        walletPublicKey,
                        associatedTokenAddress,
                        userAddress,
                        new PublicKey(tokenMintAddress),
                    ),
                )

                const signedTx = await window?.solana.signAndSendTransaction(
                    transaction,
                )

                await provider.connection.confirmTransaction(
                    signedTx.signature,
                    'finalized',
                )
                console.log(`signed tx`, signedTx.signature)
                const getAcc = await getAccount(connection, associatedTokenAddress)
                console.log(
                    `getAcc================================`,
                    getAcc.address.toString(),
                )
                return getAcc
            }
        } else {
            console.error('Phantom wallet is not connected')
        }
    } catch (err) {
        console.error(
            `error while fetching the token account for the token ${tokenMintAddress}`,
            err,
        )
    }
}

export class UtilServices {
    constructor(connection, provider, program, payer) {
        this.connection = connection
        this.provider = provider
        this.payer = payer
    }

    async getSplBalance(userAddress, tokenMintAddress1, isRootMaster) {
        try {
            let splAta
            const tokenMintAddress = new PublicKey(tokenMintAddress1)
            if (isRootMaster) {
                const masterAccountAddress = await getMasterAccount()
                const masterAccountDetails = await getMasterAccountDetails(masterAccountAddress)
                console.log(`details`, masterAccountDetails?.masterAccountInfo)
                const rootMasterAddress = masterAccountDetails?.masterAccountInfo?.masterAddress
                console.log(`root master address:`, rootMasterAddress)
                console.log(`root master address:`, rootMasterAddress.toString())
                console.log(`token mint:`, tokenMintAddress)
                splAta = await getAssociateAccount(rootMasterAddress, tokenMintAddress)
                console.log(`ata of root master address:`, splAta)
            } else {
                splAta = await getAssociateAccount(userAddress, tokenMintAddress)
            }
            const tokenAccountInfo = await getAccount(connection, splAta?.address)
            const tokenBalance = tokenAccountInfo.amount
            const formattedTokenBalance = Number(tokenBalance) / anchor.web3.LAMPORTS_PER_SOL
            return {
                tokenBalance: tokenBalance,
                formattedTokenBalance: formattedTokenBalance,
            }
        } catch (error) {
            console.error(`error`, error)
        }
    }
}

export class TokenServices {

    async transferSplTokens() {
        let publicKey
        const { program, provider } = await initializeSolanaProvider();
        // const mintWithSeed = new PublicKey("3h3kfQPCD2kBUs8nrVN3mMDtJcbAL2bnusT8nbXbUZLK");


        const [mintWithSeed] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(TOKEN_NAME)],
            program.programId
        );
        console.log("Token name needs to be updated here")

        try {
            if (solana && solana.isPhantom) {
                const response = await solana.connect()
                publicKey = response.publicKey.toString()
                console.log(`connected public key: ${publicKey}`)
            } else {
                console.log('Phantom wallet not found')
            }

            const source = await getOrCreateAssociatedTokenAccount(connection, masterWallet.payer, mintWithSeed, masterWallet.publicKey)
            const destination = await getOrCreateAssociatedTokenAccount(connection, masterWallet.payer, mintWithSeed, new PublicKey(publicKey))

            console.log("destination is ", destination.address)

            const context = {
                mint: mintWithSeed,
                source: source.address,
                destination: destination.address,
                authority: new PublicKey (publicKey),
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            };

            console.log("context", context);
            const txn = await program.methods
                .transferSimpleTokens(TOKEN_NAME, new anchor.BN(mintAmount * 10 ** TOKEN_DECIMALS))
                .accounts(context)
                .rpc();

            console.log("txn", txn);
            return;

            console.log(`please wait spl token is transferring...`)

            const signedTx = await window?.solana.signAndSendTransaction(txn)

            // const signedTx = await window.solana.signAndSendTransaction(serializedTx);

            await provider.connection.confirmTransaction(
                signedTx.signature,
                'finalized',
            )
            console.log(`signed tx`, signedTx.signature)
            const cnfTxn = await connection.confirmTransaction(
                signedTx.signature,
                'finalized',
            )
            console.log(`transaction confirmed`, cnfTxn)



            console.log(`  https://explorer.solana.com/tx/${txn}?cluster=devnet`)
            const response = {
                mintAddress: mintWithSeed,
                txHash: txn,
            }
            return {
                success: true,
                data: response,
            }
        } catch (err) {
            console.error(`error`, err)
            return {
                success: false,
                error: err,
            }
        }
    }

}