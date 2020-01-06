#!/usr/bin/env node

const program = require('commander');
const colour = require('colors');
const pad = require('pad');
const { exec } = require('child_process');

const parseTranscripts = require('./scripts/parseTranscripts')
const signAttestation = require('./scripts/signAttestation');
const fetch = require('./prompts/fetch');
const dependencies = require('./prompts/dependencies');
const getAddress = require('./prompts/address');
const attestation = require('./prompts/attestation');

async function executeCommand(cmd, prettyName, silent = false) {
    return new Promise((resolve, reject)  => {
        const transcriptData = exec(cmd);
        const output = [];
        transcriptData.stdout.on('data', function (data) {
            output.push(data.toString());
            if (!silent) console.log(data);
        });

        transcriptData.on('exit', function (data) {
            if (!silent) console.log(colour.bold.green(`\n${prettyName} successful.\n`))
            return resolve(output);
        });
        transcriptData.on('error', function (data) {
            if (!silent) console.log(colour.red(`${prettyName} failed.`))
            return reject();
        });
    });
}

async function getPythonVersion(bin) {
    const [pythonVersion] = await executeCommand(`${bin} --version`, 'Feth python version', true);
    if (!pythonVersion) {
        return false;
    }
    const [,version] = pythonVersion.split(' ');
    const [mainRelease] = version.split('.');
    return parseInt(mainRelease);
}

program
    .command('validate')
    .description('Validate AZTEC Ignition contribution')
    .action(async () => {
        const { validationType, confirmDownload } = await fetch();

        if (!confirmDownload) {
            console.log(colour.yellow("Skipping download, assuming data is in relevant folders."));
        } else {
            await executeCommand("npm run fetch:essential", "Data download");
        }

        const { address } = await getAddress();

        if (validationType === 'signature' || validationType === 'both') {
            console.log(pad(colour.bold.underline.white(`\nValidation of signature for address ${address}\n`), 30));

            await executeCommand(`./scripts/recoverAddress.sh ${address}`, "Signature validation");
        }

        if (validationType === 'inclusion' || validationType === 'both') {
            const pythonVersion = await getPythonVersion('python');
            if ((!pythonVersion || pythonVersion < 3) && !getPythonVersion('python3')) {
                console.log(colour.red('Please install python3 on your machine.'));
                return;
            }

            parseTranscripts();
            console.log(pad(colour.bold.underline.white(`\nValidation of inclusion for address ${address}\n`), 30));
            const { confirmDependencies } = await dependencies();
            if (confirmDependencies) {
                const pipBin = (pythonVersion < 3) ? 'pip3' : 'pip';
                await executeCommand(`${pipBin} install py_ecc`, "Dependency install");
            }
            console.log(pad(colour.bold.underline.white(`\nLaunching validation script...\n`), 30));
            const pythonBin = (pythonVersion < 3) ? 'python3' : 'python';
            await executeCommand(`${pythonBin} ./scripts/checkPairing.py ${address}`, "Inclusion validation")
        }

        const { privateKey } = await attestation();
        signAttestation(address, privateKey);
    });

program.parse(process.argv);