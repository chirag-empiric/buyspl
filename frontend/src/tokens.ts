export type Tokens = {
    "version": "0.1.0",
    "name": "tokens",
    "instructions": [
        {
            "name": "mintSimpleTokens",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destination",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "metadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "tokenName",
                    "type": "string"
                },
                {
                    "name": "tokenSymbol",
                    "type": "string"
                },
                {
                    "name": "tokenUri",
                    "type": "string"
                },
                {
                    "name": "tokenTax",
                    "type": "u16"
                },
                {
                    "name": "quantity",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "transferSimpleTokens",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "source",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destination",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": true
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "tokenName",
                    "type": "string"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        }
    ]
};

export const IDL: Tokens = {
    "version": "0.1.0",
    "name": "tokens",
    "instructions": [
        {
            "name": "mintSimpleTokens",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destination",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "metadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "tokenName",
                    "type": "string"
                },
                {
                    "name": "tokenSymbol",
                    "type": "string"
                },
                {
                    "name": "tokenUri",
                    "type": "string"
                },
                {
                    "name": "tokenTax",
                    "type": "u16"
                },
                {
                    "name": "quantity",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "transferSimpleTokens",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "source",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destination",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": true
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "tokenName",
                    "type": "string"
                },
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        }
    ]
};
