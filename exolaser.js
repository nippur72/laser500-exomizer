#!/usr/bin/env node

const fs = require("fs");

const commandLineArgs = require('command-line-args')

const options = parseOptions([
   { name: 'input',  alias: 'i', type: String, defaultOption: true },
   { name: 'output', alias: 'o', type: String },
   { name: 'vartab', alias: 'v', type: hexAddress },   
   { name: 'uncompressed', alias: 'u', type: String },
]);

if(options.input === undefined || options.output === undefined || (options.uncompressed === undefined && options.vartab === undefined)) 
{
   console.log("usage: exolaser -i exomizedfile -o output [-v VARTAB | -u uncompressedfile]");
   console.log("       -i or --input file          the data file produced by exomizer");   
   console.log("       -o or --output file         the Laser 500 executable file to create");   
   console.log("       -u or --uncompressed file   the uncompressed file in order to calulate VARTAB");   
   console.log("       -v or --vartab hexaddress   overrides the Laser 500 VARTAB pointer value");      
   process.exit(-1);
}

const stub = require("./stub");

const fileName = options.input;
const outName = options.output;
const uncompressedName = options.uncompressed;

let vartab = options.vartab;

if(vartab === undefined) {
   const orig = fs.readFileSync(uncompressedName); 
   vartab = 0x8995 + orig.length;
}

const data = fs.readFileSync(fileName); 

const GENERIC_DATA_SIZE          = data.length;
const GENERIC_DATA_START         = 0x8995 + 0x00FE; // from stub.sym
const GENERIC_DATA_END           = GENERIC_DATA_START + GENERIC_DATA_SIZE - 1;
const GENERIC_RELOCATED_DATA_END = 0xF4D3 - 1; // relocated_address - 1, get it from stub.sym
const GENERIC_BASIC_POINTER      = vartab;

const fix_address_1 = 0x0028 +1;
const fix_address_2 = 0x002B +1;
const fix_address_3 = 0x002E +1;
const fix_address_4 = 0x0033 +1;
const fix_address_5 = 0x003C +1;

// patches stub.bin
write_word(stub, fix_address_1, GENERIC_DATA_END);
write_word(stub, fix_address_2, GENERIC_RELOCATED_DATA_END);
write_word(stub, fix_address_3, GENERIC_DATA_SIZE);
write_word(stub, fix_address_4, GENERIC_RELOCATED_DATA_END - GENERIC_DATA_SIZE + 1);
write_word(stub, fix_address_5, GENERIC_BASIC_POINTER);

const joined = mergeArray(stub, data);

fs.writeFileSync(outName, joined); 
console.log(`file ${outName} generated`);

// *********************************************

function mergeArray(a1, a2) {
   return new Uint8Array([...a1].concat([...a2]));
}

function write_word(v, address, value) {
   v[address] = lo(value);
   v[address+1] = hi(value);
}

function lo(word) {
   return word & 0xff;   
}

function hi(word) {
   return (word >> 8) & 0xff;
}

function parseOptions(optionDefinitions) {
   try {       
      return commandLineArgs(optionDefinitions);
   } catch(ex) {
      console.log(ex.message);
      process.exit(-1);
   }
}

function hexAddress(address) {
   return parseInt(address, 16);
}
