import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
mkdirSync('engine/pkg',{recursive:true});
const r=spawnSync(process.execPath,['node_modules/assemblyscript/bin/asc.js','engine/index.ts','--outFile','engine/pkg/janela.wasm','--optimize','--runtime','stub','--noAssert'],{stdio:'inherit'});
if(r.status!==0)process.exit(r.status??1);
