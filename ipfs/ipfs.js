import {ipfs} from 'ipfs'

export const node = await main()

async function main(){
    const node = await ipfs.create();
    const version = await node.version();
    console.log('Version: ', version.version);
    return node;
}

