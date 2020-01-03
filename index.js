#!/usr/bin/env node

const program = require('commander');
const colour = require('colors');
const pad = require('pad');
const { exec } = require('child_process');

const parseTranscripts = require('./scripts/parseTranscripts')
const fetch = require('./prompts/fetch');
const dependencies = require('./prompts/dependencies');
const getAddress = require('./prompts/address');
const attestation = require('./prompts/attestation');

async function executeCommand(cmd, prettyName) {
    await new Promise((resolve, reject)  => {
        const transcriptData = exec(cmd);
        transcriptData.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        transcriptData.on('exit', function (data) {
            console.log(colour.bold.green(`\n${prettyName} successful.\n`))
            return resolve();
        });
        transcriptData.on('error', function (data) {
            console.log(colour.red(`${prettyName} failed.`))
            return reject();
        });
    });
}

program
    .command('validate')
    .description('Validate AZTEC Ignition contribution')
    .action(async () => {
        const { validationType, confirmDownload } = await fetch();

        if (!confirmDownload) {
            console.log(colour.red("Aborting validation, user selected 'No' on confirm download step."));
            return;
        } else {
            await executeCommand("npm run fetch:essential", "Data download");
        }

        const { address } = await getAddress();

        if (validationType === 'signature' || validationType === 'both') {
            console.log(pad(colour.bold.underline.white(`\nValidation of signature for address ${address}\n`), 30));

            await executeCommand(`./scripts/recoverAddress.sh ${address}`, "Signature validation");
        }

        if (validationType === 'inclusion' || validationType === 'both') {
            parseTranscripts();
            console.log(pad(colour.bold.underline.white(`\nValidation of inclusion for address ${address}\n`), 30));
            const { confirmDependencies } = await dependencies();
            if (confirmDependencies) {
                await executeCommand("pip install py_ecc", "Dependency install");
            }
            console.log(pad(colour.bold.underline.white(`\nLaunching validation script...\n`), 30));

            await executeCommand(`npm run validate:transcript ${address}`, "Inclusion validation")
        }

        const { privateKey } = await attestation();

        // return link to attestation page and signature they can post publicly
    });

program.parse(process.argv);