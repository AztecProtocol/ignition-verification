const inquirer = require('inquirer');

const validationKeys = {
    "Transcript signature": "signature",
    "Transcript inclusion (requires Python)": "inclusion",
    "Both (requires Python)": "both",
}

const thingsToValidate = Object.keys(validationKeys);

const questions = [
    { type: 'list', name: "validationType", message: "Do you want to validate the signature of a contribution, the inclusion of a contribution, or both?", choices: thingsToValidate },
]

module.exports = function () {
    return inquirer
        .prompt(questions)
        .then(function (answers) {
            return {
                ...answers,
                validationType: validationKeys[answers.validationType],
            };
        })
}