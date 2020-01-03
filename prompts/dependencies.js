const inquirer = require('inquirer');

const questions = [
    { type: 'confirm', name: 'confirmDependencies', message: 'Validating your transcript inclusion requires the python library py_ecc. Do you want to install it?', default: true },
]

module.exports = function () {
    return inquirer
        .prompt(questions)
        .then(function (answers) {
            return answers;
        })
}