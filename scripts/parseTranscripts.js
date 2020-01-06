const fs = require('fs');
const BN = require('bn.js');
const bn128 = require('@aztec/bn128');

function extract32bytelittleendian(buffer, startIndex) {
    const extractedBuffer = new Buffer.alloc(8);

    let accumulator = new Buffer.alloc(0);
    for (let i = startIndex; i < startIndex + 32; i += 8) {
        buffer.copy(extractedBuffer, 0, i, i + 8);
        const chunk = extractedBuffer;
        accumulator = Buffer.concat([chunk, accumulator])
    }
    return accumulator.toString('hex');
}

module.exports = () => {
    const g1Files = fs.readdirSync('g1points');
    const g2Files = fs.readdirSync('g2points');

    const G1points = g1Files
        .filter(filename => filename !== 'keys' && filename !== 'descriptions')
        .reduce((acc, filename) => {
            const [participantNum, address] = filename.split('_');
            const g1File = fs.readFileSync(`g1points/${filename}`);
            const G1x = extract32bytelittleendian(g1File, 0);
            const G1y = extract32bytelittleendian(g1File, 32);
        
            acc[address] = {
                participantNum: parseInt(participantNum),
                g1: {
                    x: (new BN(G1x, 16)).toString(10),
                    y: (new BN(G1y, 16)).toString(10)
                }
            };
            return acc;
        }, {});

    const G2points = g2Files
        .filter(filename => filename !== 'keys')
        .reduce((acc, filename) => {
            const g2File = fs.readFileSync(`g2points/${filename}`);
            const address = filename.split('_')[1];

            const xc0_origin = extract32bytelittleendian(g2File, 128);
            const xc1_origin = extract32bytelittleendian(g2File, 160);

            const yc0_origin = extract32bytelittleendian(g2File, 192);
            const yc1_origin = extract32bytelittleendian(g2File, 224);

            const g2Point = {
                x: {
                    c0: (new BN(xc0_origin, 16)).toString(10),
                    c1: (new BN(xc1_origin, 16)).toString(10),
                },
                y: {
                    c0: (new BN(yc0_origin, 16)).toString(10),
                    c1: (new BN(yc1_origin, 16)).toString(10),
                },
            };

            acc[address].g2 = g2Point;
            return acc;
        }, G1points);

    // participantNum skips some indices
    const addressToIndex = Object.keys(G2points)
        .sort((a, b) => G2points[a].participantNum - G2points[b].participantNum)
        .reduce((acc, address, index) => {
            acc[address] = index;
            return acc;
        }, {});

    fs.writeFileSync('points.json', JSON.stringify({
        points: G2points,
        addressToIndex,
    }));
}