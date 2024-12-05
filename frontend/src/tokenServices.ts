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
} from '@solana/spl-token'

const { solana } = window
const mintAmount = 100
const TOKEN_DECIMALS = 9
const TOKEN_NAME = "Test Token 1234"

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

    async mintSplTokens() {
        let publicKey
        const { program } = await initializeSolanaProvider();
        const mintWithSeed = new PublicKey("EHqkzCt9TEz8W9vGr4HzwyZS1imbUyuAWgPhTgAZTszC");

        console.log("Token name needs to be updated here")

        try {
            if (solana && solana.isPhantom) {
                const response = await solana.connect()
                publicKey = response.publicKey.toString()
                console.log(`connected public key: ${publicKey}`)
            } else {
                console.log('Phantom wallet not found')
            }

            const source = await anchor.utils.token.associatedAddress({
                mint: mintWithSeed,
                owner: masterWallet.publicKey,
            })

            const destination = await anchor.utils.token.associatedAddress({
                mint: mintWithSeed,
                owner: new PublicKey(publicKey),
            })

            console.log(`destination is ${destination}`)

            const context = {
                mint: mintWithSeed,
                source: source,
                destination: destination,
                authority: masterWallet.payer,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            };

            const txHash = await program.methods
                .transferSimpleTokens(TOKEN_NAME, new anchor.BN(mintAmount * 10 ** TOKEN_DECIMALS))
                .accounts(context)
                .signers([masterWallet.payer])
                .rpc();

            console.log(`please wait spl token is minting...`)

            // await this.confirmTransactions(txHash)

            console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`)
            const response = {
                mintAddress: mintWithSeed,
                txHash: txHash,
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