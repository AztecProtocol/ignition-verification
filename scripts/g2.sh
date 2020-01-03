# /bin/sh

mkdir g2points;
rm g2points/*
cd g2points;
rm keys

echo "Downloading G2 points of each transcript_0"

TRANSCRIPT_NAMES=$(curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/manifest.json | jq ".participants | [ to_entries[] | (if .value.position|tostring|length == 1 then (\"00\" + (.value.position|tostring)) else if .value.position|tostring|length == 2 then (\"0\" + (.value.position|tostring)) else (.value.position|tostring) end end) + \"_\" + .value.address ] ")
echo $TRANSCRIPT_NAMES | tr '[:upper:]' '[:lower:]' | jq " to_entries[] | \"curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/\" + (.value) + \"/transcript00.dat -H 'Range: bytes=322560028-322560283' > \" + (.value) + \"_g2.dat\" " > keys

# Manual addition of sealed transcript
echo "curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/sealed/transcript00.dat -H 'Range: bytes=322560028-322560283' > 198_sealed_g2.dat" >> keys

while read p;
do
   echo $p
   eval $(sed -e 's/^"//' -e 's/"$//' <<< $p)
done < keys;