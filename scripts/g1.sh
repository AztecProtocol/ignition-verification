# /bin/sh

mkdir g1points;
rm g1points/*.dat
cd g1points;

echo "Downloading first G1 point of each transcript_0"

if type "jq" > /dev/null; then
  TRANSCRIPT_NAMES=$(curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/manifest.json | jq ".participants | [ to_entries[] | (if .value.position|tostring|length == 1 then (\"00\" + (.value.position|tostring)) else if .value.position|tostring|length == 2 then (\"0\" + (.value.position|tostring)) else (.value.position|tostring) end end) + \"_\" + .value.address ] ")
  echo $TRANSCRIPT_NAMES | tr '[:upper:]' '[:lower:]' | jq " to_entries[] | \"curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/\" + (.value) + \"/transcript00.dat -H 'Range: bytes=28-91' > \" + (.value) + \"_g1.dat\" " > keys

  # Manual addition of sealed transcript
  echo "curl https://aztec-ignition.s3.eu-west-2.amazonaws.com/MAIN+IGNITION/sealed/transcript00.dat -H 'Range: bytes=28-91' > 198_sealed_g1.dat" >> keys
fi

while read p;
do
   echo $p
   eval $(sed -e 's/^"//' -e 's/"$//' <<< $p)
done < keys;
