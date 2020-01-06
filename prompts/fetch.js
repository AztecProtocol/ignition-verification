const inquirer = require('inquirer');

const questions = [
    { type: 'confirm', name: 'confirmDownload', message: 'This tool needs a number of points for each transcript. Do you want to download them?', default: true },
]

module.exports = function () {
    return inquirer
        .prompt(questions)
        .then(function (answers) {
            return answers;
        })
}