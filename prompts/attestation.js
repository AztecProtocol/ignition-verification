const inquirer = require('inquirer');

const questions = [
    { type: 'input', name: 'privateKey', message: '(optional) input the private key for the address you submitted to sign an attestation that you\'ve successfully validated the contribution:' },
]

module.exports = function () {
    return inquirer
        .prompt(questions)
        .then(function (answers) {
            return answers;
        })
}