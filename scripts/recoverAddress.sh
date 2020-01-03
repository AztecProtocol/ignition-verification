#!/bin/bash
set -e

: ${API_URL=https://ignition.aztecprotocol.com}
: ${TRANSCRIPTS=1}
: ${SETUP_DIR=$(pwd)/setup_db}

PREV_ADDRESS=$(echo $1 | tr '[:upper:]' '[:lower:]')
bold=$(tput bold)
normal=$(tput sgr0)

mkdir -p $SETUP_DIR
rm -f $SETUP_DIR/*
for TRANSCRIPT in $(seq 0 $[TRANSCRIPTS - 1]); do
    echo Downloading full transcript $TRANSCRIPT for address $1...
    FILENAME=$SETUP_DIR/transcript$TRANSCRIPT
    curl -s -S $API_URL/api/data/$1/$TRANSCRIPT > $FILENAME.dat
    curl -s -S $API_URL/api/signature/$1/$TRANSCRIPT > $FILENAME.sig
    HASH=0x$(shasum -a 256 $FILENAME.dat | cut -f1 -d ' ')

    echo "The SHA256 hash of transcript $TRANSCRIPT for address $1 is:"
    echo $bold$HASH$normal
    echo "The available signature over that hash is:"
    echo $bold$(cat $FILENAME.sig)$normal

    RECOVERED=$(node recover-address $HASH $(cat $FILENAME.sig))

    echo "The recovered address given the above signature is:"
    echo $bold$RECOVERED$normal
    if [ "${RECOVERED}" != "${PREV_ADDRESS}" ]; then
        exit 1
    fi

done