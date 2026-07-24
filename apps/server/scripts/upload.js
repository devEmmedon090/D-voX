// MODULAR: Pinata Web3 SDK — Node.js upload with HARD-CODED GATEWAY URL
const { PinataSDK } = require('pinata-web3');
const fs = require('fs');
const path = require('path');
const { Blob, File } = require('node:buffer');

// === MODULAR CONFIG: YOUR KEYS + GATEWAY ===
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ZTdkOGU2OC05MjA2LTQyODctYmY1Zi1iNjVhNmEwYjc4ZGQiLCJlbWFpbCI6ImVtbWVkb24wOTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijg0ZTU2YmE4NTZhNzc5ZmJjODkwIiwic2NvcGVkS2V5U2VjcmV0IjoiNTg5YmI5NjE2ZWU5NDQ1NTEwNDZmZDNjYmFlNDg5Nzc2M2EyMmRlYjA0NDE0ZTcyYzhmYjcwMGU5NTI1OTM5ZiIsImV4cCI6MTc5MzcxOTU0M30.yTyjLU7je3DhPnksPhrZ4nlw7Lunh3KkC40jyvgA-TA';
const GATEWAY = 'lime-electoral-parrotfish-434.mypinata.cloud';  // ← YOUR GATEWAY

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: GATEWAY
});

async function uploadCandidate() {
  const filePath = path.join(__dirname, '../../candidate-data/emmanuel.json');
  console.log('Uploading:', filePath);

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'application/json' });
    const file = new File([blob], 'Emmanuel.json');

    const upload = await pinata.upload.file(file, {
      pinataMetadata: { name: 'Emmanuel.json' }
    });

    const cid = upload.IpfsHash;
    const url = `https://${GATEWAY}/ipfs/${cid}`;

    console.log('SUCCESS!');
    console.log('CID:', cid);
    console.log('URL:', url);
    console.log('Copy this into Solidity: "ipfs://' + cid + '"');
    console.log('OPEN IN BROWSER → SEE YOUR JSON!');
    console.log(url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

uploadCandidate();
