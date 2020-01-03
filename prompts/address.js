const inquirer = require('inquirer');

const questions = [
    { type: 'input', name: 'address', message: 'Input the address of the participant you want to perform validation for:', validate: (input, answers) => !!input },
]

module.exports = function () {
    return inquirer
        .prompt(questions)
        .then(function (answers) {
            return answers;
        })
}