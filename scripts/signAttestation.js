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
        
        if (address.toLowerCase() !== submittedAddress) {
            console.log(colour.yellow("\nSubmitted private key does not match address being verified, aborting attestation."));
            return;
        }

        const message = `Attestation for ${submittedAddress}, verified on ${Date.now()}`;
        const signature = account.sign(message);

        console.log(colour.green.bold(`Successfully signed attestation for address ${address}\n`));
        console.log(colour.white.bold.underline(`Attestation text:`));
        console.log(colour.white(`${message}\n`));

        console.log(colour.white.bold.underline(`Attestation hash:`));
        console.log(colour.white(`${signature.messageHash}\n`));

        console.log(colour.white.bold.underline(`Attestation signature:`));
        console.log(colour.white(`${signature.signature}\n`));

        console.log(colour.blue.bold('\nThank you for taking part in Ignition. You can publicly post the attestation signature and the attestation hash on any public facing website.'));
    } catch (e) {
        console.log(colour.blue.bold('Thank you for taking part in Ignition.'));
        return ;
    }
}

module.exports = signAttestation;