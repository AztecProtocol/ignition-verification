# /bin/bash

mkdir signatures;
cd signatures;


curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/manifest.json | jq ".participants | [ to_entries[] | (if .value.position|tostring|length == 1 then (\"00\" + (.value.position|tostring)) else if .value.position|tostring|length == 2 then (\"0\" + (.value.position|tostring)) else (.value.position|tostring) end end) + \"_\" + .value.address ] " | tr '[:upper:]' '[:lower:]' | jq " to_entries[] | \"curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/\" + (.value) + \"/transcript00.sig > \" + (.value) + \"_signature.sig\" " > keys

while read p;
do
   echo $p
   eval $(sed -e 's/^"//' -e 's/"$//' <<< $p)
done < keys;
