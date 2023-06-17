import 'regenerator-runtime/runtime';
import { Wallet } from './near-wallet';
import { Contract } from './near-interface';

const CONTRACT_ADDRESS = process.env.CONTRACT_NAME;

// When creating the wallet you can optionally ask to create an access key
// Having the key enables to call non-payable methods without interrupting the user to sign
const wallet = new Wallet({ createAccessKeyFor: CONTRACT_ADDRESS });
const contract = new Contract({ contractId: process.env.CONTRACT_NAME, walletToUse: wallet });
// Setup on page load
window.onload = async () => {
  let isSignedIn = await wallet.startUp();

  if (isSignedIn) {
    signedInFlow();
  } else {
    signedOutFlow();
  }

  fetchGreeting();
};

// Button clicks
document.querySelector('form').onsubmit = doUserAction;
document.querySelector('#sign-in-button').onclick = () => { wallet.signIn(); };
document.querySelector('#sign-out-button').onclick = () => { wallet.signOut(); };

// Take the new greeting and send it to the contract
async function doUserAction(event) {
  event.preventDefault();
  const { greeting } = event.target.elements;

  document.querySelector('#signed-in-flow main')
    .classList.add('please-wait');

  await wallet.callMethod({ method: 'set_greeting', args: { greeting: greeting.value }, contractId: CONTRACT_ADDRESS });

  // ===== Fetch the data from the blockchain =====
  await fetchGreeting();
  await contract.sendMoney();
  document.querySelector('#signed-in-flow main')
    .classList.remove('please-wait');
}

// Get greeting from the contract on chain
async function fetchGreeting() {
  const currentGreeting = await wallet.viewMethod({ method: 'get_greeting', contractId: CONTRACT_ADDRESS });

  document.querySelectorAll('[data-behavior=greeting]').forEach(el => {
    el.innerText = currentGreeting;
    el.value = currentGreeting;
  });
  document.querySelectorAll('.ctaddress').forEach(el => {
    el.innerHTML = CONTRACT_ADDRESS;
  });
}

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-in-flow').style.display = 'none';
  document.querySelector('#signed-out-flow').style.display = 'block';
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector('#signed-out-flow').style.display = 'none';
  document.querySelector('#signed-in-flow').style.display = 'block';
  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = wallet.accountId;
  });
  //document.querySelectorAll('[data-behavior=account-balance]').forEach(async el => {
  //  el.innerText = await contract.getAmountFromTransaction('Cxex9ERKRRujmN5YBev5DJtH1xHBgwqCtZ6at4FH9m76');
  //});
  document.querySelectorAll('[data-behavior=account-balance]').forEach(async el => {
    el.innerText = await contract.getAcount();
  });
}