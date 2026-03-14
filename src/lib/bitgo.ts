// Lightweight BitGo REST API Integration for Next.js

const BITGO_URL = 'https://app.bitgo-test.com/api/v2';
const accessToken = process.env.BITGO_ACCESS_TOKEN;
const enterpriseId = process.env.BITGO_ENTERPRISE_ID;

const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

/**
 * Generates a testnet wallet (teth) via BitGo REST API.
 */
export async function createAgentWallet(label: string, passphrase: string) {
  if (!accessToken || !enterpriseId) {
    console.warn("BitGo credentials missing. Generating a local mock for Agent Wallet.");
    return {
      id: `mock-wallet-${Date.now()}`,
      receiveAddress: `0xmock${Date.now()}agent`,
    };
  }

  try {
    const response = await fetch(`${BITGO_URL}/teth/wallet/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        label,
        passphrase,
        enterprise: enterpriseId
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate wallet');
    }

    const data = await response.json();
    return {
      id: data.id,
      receiveAddress: data.receiveAddress.id,
    };
  } catch (error) {
    console.error("Error generating BitGo wallet:", error);
    throw new Error('Failed to create agent wallet on BitGo');
  }
}

/**
 * Initiates a transfer from a BitGo wallet.
 */
export async function transferToArtist(
  fromWalletId: string,
  toAddress: string,
  amountInWei: string,
  passphrase: string
) {
  if (!accessToken) {
    console.warn("BitGo credentials missing. Simulating transfer.");
    return {
      txid: `mock-tx-${Date.now()}`,
      status: 'simulated',
      amountInWei,
      toAddress
    };
  }

  try {
    const response = await fetch(`${BITGO_URL}/teth/wallet/${fromWalletId}/sendcoins`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        address: toAddress,
        amount: amountInWei,
        walletPassphrase: passphrase
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to send coins');
    }

    const data = await response.json();
    return {
      txid: data.txid,
      status: data.status,
      amountInWei,
      toAddress
    };
  } catch (error) {
    console.error("Error executing BitGo transfer:", error);
    throw new Error('Failed to execute transfer on BitGo');
  }
}
