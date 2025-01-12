// Подключение к Phantom Wallet и взаимодействие с Solana
const connectButton = document.getElementById('connect-wallet');
const mintButton = document.getElementById('mint');

// Импортирование необходимых компонентов из solanaWeb3
const { Connection, clusterApiUrl, PublicKey } = solanaWeb3;
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
let wallet;

// Подключение к Phantom Wallet
connectButton.addEventListener('click', async () => {
  try {
    const provider = window.solana;
    if (provider && provider.isPhantom) {
      wallet = provider;
      await provider.connect();
      console.log('Phantom Wallet connected:', provider.publicKey.toString());

      // Показать кнопку Mint, если кошелек подключен
      connectButton.style.display = 'none';
      mintButton.style.display = 'block';
    } else {
      alert('Phantom wallet not detected');
    }
  } catch (err) {
    console.error('Error connecting to Phantom Wallet:', err);
  }
});

// Функция для получения баланса
const getBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));  // Преобразуем в PublicKey
    console.log('Wallet balance:', balance);
    return balance;
  } catch (err) {
    console.error('Error getting balance:', err);
  }
};

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
