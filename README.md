# Point verification script

AZTEC ran Ignition, an MPC ceremony to generate a CRS for our privacy network and other zero-knowledge systems like PLONK from October 25th 2019 to the January 2nd 2020. 176 individuals and institutions took part, each generating randomness and adding it to the previous participant's contribution. If even one participant acts honestly and destroys the randomness they generated, the CRS can be trusted.

Each participant generated 100.8 million BN254 points. Each one of these contributions is broken up in 20 files themselves structured according to [this spec](/Transcript_spec.md).

# Purpose

With this repo, you can:

1. Verify that each participant signed the SHA256 digest of each transcript file they generated
2. Verify that each participant built upon the previous participant's contribution
3. Sign an attestation that you verified your contribution

(1) ensures that contributions were in fact uploaded by the owner of the private key associated with the address which participated, and were not replaced or otherwise tampered with.

(2) proves that each contribution was combined into the final output, and none were discarded.

(3) can be posted publicly, and helps demonstrate to non-participants that a number of independent individuals and institutions took part.

# Requirements

In order to run the tools in this repo, you will need:

- Python 3
- Node >10

# Installation

After cloning this repo, you will need to install npm dependencies by running `yarn install` or `npm install` in the root directory.

# Validation

To launch the validation CLI, run `npm run validate` or `yarn run validate`. Your terminal should display the following:
![start](/docs/01_start.png)

To start, enter the address associated with the contribution you would like to validate.

You will be presented with a prompt to chose which type of validation you would like to carry out: Signature validation (1), Inclusion validation (2), or both.

![validation](/docs/02_validation_type.png)

## Signature validation

### [Script](/scripts/recoverAddress.sh)

This step will:
1. Download the participant's transcript 0
2. Compute the SHA256 digest of the downloaded file
3. Fetch the signature which was submitted by the participant when they took part
4. Use the hash generated in (2) and the signature from (3) with ECRECOVER to extract the public key of the key pair which generated the signature from (3)
5. Compare the address derived for the public key in (4) to the address you submitted to the validation script

![sig validation](/docs/03_validating_signature.png)

If successful, you will see the computed hash, the fetchd signature, and the recovered address.

![sig validation](/docs/04_signature_validated.png)

The transcript downloaded and signature file can be found in the `setup_db` folder.

## Inclusion validation

### [G1 point download script](/scripts/g1.sh)
### [G2 point download script](/scripts/g2.sh)
### [Point parsing script](/scripts/parseTranscripts.sh)
### [Pairing check script](/scripts/checkPairing.py)

This step will:
1. Download the first G1 point and the first G2 point from each participant's transcript 0
2. Install the `py_ecc` python library
3. Do some light parsing of the downloaded points, transforming binary blobs into EC points
4. Run a pairing check establishing that the contribution being validated built upon the previous participant's contribution, and was built upon by the next participant

![downloading points](/docs/05_downloading_points.png)
![python deps](/docs/07_python_dependencies.png)
![validating_inclusion](/docs/08_validating_inclusion.png)

The output of the script will display a series of EC points (2 G1 points, 1 G2 point), and the pairing check which was performed using these points.

The two equalities which will be checked are:

`e(G2_generator, current_participant_first_g1) = e(current_participant_g2, previous_participant_first_g1)`

and

`e(G2_generator, next_participant_first_g1) = e(next_participant_g2, current_participant_first_g1)`

# Attestation

After you have validated a contribution and if you own the associated private key, you can optionally sign an attestation that you have validated your contribution.

![attestation](/docs/09_attestation_signed.png)

You can publicly post this attestation to link a public profile of yours with a contribution, proving to future users of the output of Ignition that multiple, independent individuals/institutions took part.