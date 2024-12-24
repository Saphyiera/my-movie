const fs = require('fs');
const { generateKeyPairSync } = require('crypto');

const PUBLIC_KEY_FILE = 'public.pem';
const PRIVATE_KEY_FILE = 'private.pem';

function checkAndGenerateKeyPair() {
    if (fs.existsSync(PUBLIC_KEY_FILE) && fs.existsSync(PRIVATE_KEY_FILE)) {
        console.log('Key pair already exists.');
        return;
    }

    console.log('Key pair not found. Generating new key pair...');

    try {
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });

        fs.writeFileSync(PUBLIC_KEY_FILE, publicKey);
        fs.writeFileSync(PRIVATE_KEY_FILE, privateKey);

        console.log('New key pair generated and saved to files.');
    } catch (error) {
        console.error('Error generating key pair:', error);
    }
}

module.exports = { checkAndGenerateKeyPair, PUBLIC_KEY_FILE, PRIVATE_KEY_FILE };