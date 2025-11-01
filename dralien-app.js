 /* ---------- Navigation ---------- */
        function navigate(page) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add('active'));
        }
        /* ---------- Sub Nav Switching ---------- */
        function switchSubNav(btn) {
            const subNav = btn.closest('.sub-nav');
            subNav.querySelectorAll('.sub-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const sectionContent = subNav.nextElementSibling;
            sectionContent.querySelectorAll('.nav-content').forEach(c => c.classList.remove('active'));
            const targetId = btn.dataset.sub;
            const targetContent = sectionContent.querySelector(`#${targetId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
        document.querySelectorAll('.sub-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => switchSubNav(btn));
        });
        /* ---------- Tabs Switching ---------- */
        document.querySelectorAll('.tab').forEach(t => {
            t.addEventListener('click', () => {
                const target = t.dataset.target;
                t.closest('.tabs').nextElementSibling.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                t.closest('.tabs').nextElementSibling.querySelector('#' + target).classList.add('active');
                t.closest('.tabs').querySelectorAll('.tab').forEach(tb => tb.classList.remove('active'));
                t.classList.add('active');
            });
        });
        /* ---------- Stake Toggle ---------- */
        document.querySelectorAll('.stake-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const parent = btn.closest('.stake-toggle');
                parent.querySelectorAll('.stake-toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const type = btn.dataset.type;
                document.getElementById('token-stake-panel').classList.toggle('hidden', type !== 'token');
                document.getElementById('token-stake-panel').classList.toggle('active', type === 'token');
                document.getElementById('nft-stake-panel').classList.toggle('hidden', type !== 'nft');
                document.getElementById('nft-stake-panel').classList.toggle('active', type === 'nft');
            });
        });

        document.querySelectorAll('.history-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.history-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Implement filter logic here (e.g., show/hide history cards based on data-filter)
            });
        });


        /* ---------- History Filters ---------- */

        let connectedWallet = null;
        let connectedAddress = null;

    // Check wallet availability on page load
    window.addEventListener('load', () => {
      checkWalletAvailability();
    });

    function checkWalletAvailability() {
      // Check MetaMask
      if (typeof window.ethereum !== 'undefined') {
        updateWalletStatus('metamask', 'installed');
      }

      // Check Phantom
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        updateWalletStatus('phantom', 'installed');
      }

      // Check Trust Wallet
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        updateWalletStatus('trust', 'installed');
      }

      // Check Coinbase
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
        updateWalletStatus('coinbase', 'installed');
      }

      // Check Rainbow
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isRainbow) {
        updateWalletStatus('rainbow', 'installed');
      }
    }

    function updateWalletStatus(wallet, status) {
      const statusElement = document.getElementById(`${wallet}-status`);
      if (statusElement) {
        statusElement.textContent = status === 'installed' ? 'Installed' : 'Not Detected';
        if (status === 'installed') {
          statusElement.classList.add('installed');
        }
      }
    }

    function openWalletModal() {
      document.getElementById('walletModal').classList.add('active');
      document.getElementById('errorMessage').classList.remove('active');
      document.getElementById('successMessage').classList.remove('active');
    }

    function closeWalletModal() {
      document.getElementById('walletModal').classList.remove('active');
    }

    async function connectWallet(walletType) {
      const walletOption = document.querySelector(`[data-wallet="${walletType}"]`);
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');
      const connectingOverlay = document.getElementById('connectingOverlay');
      const connectingWalletName = document.getElementById('connectingWalletName');
      
      // Clear previous messages
      errorMessage.classList.remove('active');
      successMessage.classList.remove('active');
      
      // Add connecting state
      walletOption.classList.add('connecting');
      
      // Get wallet display name
      const walletNames = {
        'metamask': 'MetaMask',
        'phantom': 'Phantom',
        'trust': 'Trust Wallet',
        'coinbase': 'Coinbase Wallet',
        'walletconnect': 'WalletConnect',
        'rainbow': 'Rainbow'
      };
      
      connectingWalletName.textContent = walletNames[walletType];
      connectingOverlay.classList.add('active');

      try {
        let address;

        switch(walletType) {
          case 'metamask':
            address = await connectMetaMask();
            break;
          case 'phantom':
            address = await connectPhantom();
            break;
          case 'trust':
            address = await connectTrustWallet();
            break;
          case 'coinbase':
            address = await connectCoinbase();
            break;
          case 'walletconnect':
            address = await connectWalletConnect();
            break;
          case 'rainbow':
            address = await connectRainbow();
            break;
          default:
            throw new Error('Unsupported wallet');
        }

        if (address) {
          connectedWallet = walletType;
          connectedAddress = address;
          
          // Hide connecting overlay
          connectingOverlay.classList.remove('active');
          
          // Show success message
          document.getElementById('walletAddress').textContent = address;
          successMessage.classList.add('active');

          // Update button status
          setTimeout(() => {
            document.getElementById('connectedAddress').textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            document.getElementById('connectedStatus').classList.add('active');
            closeWalletModal();
          }, 2000);
        }
      } catch (error) {
        console.error('Wallet connection error:', error);
        
        // Hide connecting overlay
        connectingOverlay.classList.remove('active');
        
        // Show error message with better formatting
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.innerHTML = `
          <div class="error-icon">⚠️</div>
          <div class="error-title">${error.message.includes('not installed') ? 'Wallet Not Found' : 'Connection Failed'}</div>
          <div class="error-text">${error.message}</div>
        `;
        errorMsg.classList.add('active');
        
        // Scroll error into view
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        walletOption.classList.remove('connecting');
      }
    }

    async function connectMetaMask() {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        return accounts[0];
      } catch (error) {
        if (error.code === 4001) {
          throw new Error('Connection request rejected by user.');
        }
        throw error;
      }
    }

    async function connectPhantom() {
      if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
        throw new Error('Phantom is not installed. Please install Phantom wallet.');
      }

      try {
        const response = await window.solana.connect();
        return response.publicKey.toString();
      } catch (error) {
        throw new Error('Failed to connect to Phantom wallet.');
      }
    }

    async function connectTrustWallet() {
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isTrust) {
        throw new Error('Trust Wallet is not installed. Please install Trust Wallet extension.');
      }

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        return accounts[0];
      } catch (error) {
        throw new Error('Failed to connect to Trust Wallet.');
      }
    }

    async function connectCoinbase() {
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
        throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet extension.');
      }

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        return accounts[0];
      } catch (error) {
        throw new Error('Failed to connect to Coinbase Wallet.');
      }
    }

    async function connectWalletConnect() {
      throw new Error('WalletConnect integration requires additional setup. Please use another wallet or contact support.');
    }

    async function connectRainbow() {
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isRainbow) {
        throw new Error('Rainbow is not installed. Please install Rainbow wallet extension.');
      }

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        return accounts[0];
      } catch (error) {
        throw new Error('Failed to connect to Rainbow wallet.');
      }
    }

    // Close modal on overlay click
    document.getElementById('walletModal').addEventListener('click', (e) => {
      if (e.target.id === 'walletModal') {
        closeWalletModal();
      }
    });
        /* ---------- Modal Helpers ---------- */
        function openModal(id) { document.getElementById(id).classList.add('active'); }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); }
        /* ---------- Notification Functions ---------- */
        function openNotification() {
            document.getElementById('notificationSection').classList.add('active');
        }
        function closeNotification() {
            document.getElementById('notificationSection').classList.remove('active');
        }
        /* ---------- Init Listeners ---------- */
        document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
            item.addEventListener('click', () => navigate(item.dataset.page));
        });
        /* ---------- Live Progress Demo ---------- */
        setInterval(() => {
            document.querySelectorAll('.progress-fill').forEach(fill => {
                let w = parseFloat(fill.style.width || '0') + 0.8;
                if (w > 100) w = 30;
                fill.style.width = w + '%';
            });
        }, 2500);
        /* ---------- Staking Functions ---------- */
        function setAmount(type) {
            // Placeholder logic - replace with actual balance calculation
            let amount = 0;
            if (type === 'min') amount = 100;
            if (type === 'half') amount = 5000; // half of max
            if (type === 'max') amount = 10000; // assume max balance
            document.querySelector('[data-label="token-amount-input"]').value = amount;
        }
        function adjustNft(delta) {
            const input = document.querySelector('[data-label="nft-amount-input"]');
            let value = parseInt(input.value) || 0;
            value = Math.max(0, value + delta);
            input.value = value;
        }
