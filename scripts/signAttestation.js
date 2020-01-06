const { Account } = require('web3x/account');
const { hexToBuffer } = require('web3x/utils');
const colour = require('colors');

function signAttestation(submittedAddress, rawPvtKeyInput) {
    if (!rawPvtKeyInput) {
        console.log(colour.blue.bold('Thank you for taking part in Ignition.'));
        return;
    }

    try {
        const pvtKeyInput = (rawPvtKeyInput.startsWith('0x')) ? rawPvtKeyInput : `0x${rawPvtKeyInput}`;
        const account = Account.fromPrivate(
            hexToBuffer(pvtKeyInput)
        );
        const address = account.address.toString();
        
        if (address.toLowerCase() !== submittedAddress.toLowerCase()) {
            console.log(colour.yellow("\nSubmitted private key does not match address being verified, aborting attestation."));
            return;
        }

        const message = `https://www.aztecprotocol.com/ignition/?address=${submittedAddress}&timestamp=${Date.now()}`;
        const signature = account.sign(message);

        console.log(colour.green.bold(`Successfully signed attestation for address ${address}\n`));
        console.log(colour.white.bold.underline(`Attestation:`));
        console.log(JSON.stringify({
            message: signature.message,
            hash: signature.messageHash,
            signature:signature.signature,
        }));

        console.log(colour.blue.bold('\nThank you for taking part in Ignition. You can publicly post the attestation above on any public facing website.'));
    } catch (e) {
        console.log(colour.blue.bold('\nThank you for taking part in Ignition.'));
        return ;
    }
}

module.exports = signAttestation;