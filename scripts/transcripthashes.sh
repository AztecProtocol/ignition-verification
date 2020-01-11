# /bin/bash

mkdir transcripts;
cd transcripts;


curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/manifest.json | jq ".participants | [ to_entries[] | (if .value.position|tostring|length == 1 then (\"00\" + (.value.position|tostring)) else if .value.position|tostring|length == 2 then (\"0\" + (.value.position|tostring)) else (.value.position|tostring) end end) + \"_\" + .value.address ] " | tr '[:upper:]' '[:lower:]' | jq " to_entries[] | \"curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/\" + (.value) + \"/transcript00.dat >\" + (.value) + \"_0.dat\" " > keys

while read p;
do
    FILENAME=$(echo $p | cut -f2 -d '>' | sed 's/.$//');
    eval $(sed -e 's/^"//' -e 's/"$//' <<< $p);

    echo "0x$(shasum -a 256 $FILENAME | cut -f1 -d ' ')" > $FILENAME"_hash";
    rm $FILENAME;
done < keys;
