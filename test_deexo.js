const fs = require('fs');
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
   { name: 'original'   , alias: 'o', type: String, multiple: true },
   { name: 'compressed' , alias: 'c', type: String, multiple: true },
   { name: 'backward'   , alias: 'b', type: Boolean }
];

const options = parseOptions();

if(options.original === undefined || options.compressed === undefined) 
{
   console.log("usage: test_deexo -o originalfile address -c compressedfile address [-b]");
   console.log("       addresses must be given in hexadecimal");
   console.log("       -b use backward compression");
   process.exit(-1);
}

const original = options.original;
const compressed = options.compressed;
const backward = options.backward === true;

/*

REMINDER about backward compression. Ideally original and compressed files 
should be separated in memory, but due to limited 64K RAM of Z80 they usually
have to overlap.

A compressed file totally within the original file space is NOT possible, e.g.:

   OOOOOOOOOOOOOOO
        CCCCCC

The only possible configurations are:

1) tail of compressed file after tail of original file + 2 safety bytes:
 
   OOOOOOOO
        CCCCC

2) head of compressed file before head of original file - 2 safety bytes

   OOOOOOOO
 CCCCC
   
When using the 1) memory model, forward compression must be used (no -b flag and 'deexo.asm' routine)
When using the 2) memory model, backward compression must be used (-b flag in exomizer and 'deexo_b.asm' routine)

*/

// do computations about the safety address

compressed.size = fs.statSync(compressed.name).size;
original.size   = fs.statSync(original.name).size;
original.end    = original.start + original.size - 1;
compressed.end  = compressed.start + compressed.size - 1;

const optimal_address = backward ? original.start - 2 : original.end - compressed.size + 3;
const safety_offset = backward ? original.start - compressed.start : compressed.end - original.end;
const end_at_f100 = 0xF100 - compressed.size + 1;

compressed.head = backward ? compressed.end : compressed.start;
original.head   = backward ? original.end   : original.start;

// setup a virtual Z80 cpu
const Z80 = require("./Z80");
const memory = new Uint8Array(65536);
//const mem_read = (address) => memory[address]; 
//const mem_write = (address, value) => memory[address] = value; 

let debugRead = false;
let mem_read = function(address) {   
   if(debugRead) 
   {
      if(address >= compressed.start && address <= compressed.end)
      {
         console.log(`R ${hex(address,4)}: ${hex(memory[address])}`);
      }
   }
   return memory[address];
}

let debugWrite = false;
let mem_write = function(address, value) {
   memory[address] = value;
   if(debugWrite) 
   {
      if(address >= original.start && address <= original.end)
      {
         console.log(`W ${hex(address,4)}: ${hex(value)}`);
      }
   }
}

const io_read = (port) => 0x00;
const io_write = (port, value) => { };
const cpu = new Z80({ mem_read, mem_write, io_read, io_write });

console.log("virtual Z80 cpu prepared with 64K empty RAM");

// loads the deexo routine in RAM at top
let deexo = { start: 0xF500 };

if(backward) {
   deexo.bytes = load("deexo_b_F500.bin", deexo.start);
   console.log("using backward compression");
} else {   
   deexo.bytes = load("deexo_F500.bin", deexo.start);
   console.log("using normal forward compression");
}

deexo = { 
   ...deexo, 
   size: deexo.bytes.length, 
   end: deexo.start + deexo.bytes.length - 1
};

console.log(`-----------------------------------------------`);
console.log(`MEMORY         start   end     size    from    `);
console.log(`-----------------------------------------------`);
console.log(`deexo          ${hex(deexo.start,4)}    ${hex(deexo.end,4)}    ${hex(deexo.size,4)}`);
console.log(`compressed     ${hex(compressed.start,4)}    ${hex(compressed.end,4)}    ${hex(compressed.size,4)}    HL=${hex(compressed.head,4)}    `);
console.log(`original       ${hex(original.start,4)}    ${hex(original.end,4)}    ${hex(original.size,4)}    DE=${hex(original.head,4)}    `);
console.log(`-----------------------------------------------`);
console.log(`safety offset is ${safety_offset} bytes`);
console.log(`optimal compressed start address is ${hex(optimal_address,4)}`);
console.log(`calculated start to make it end at F100 is ${hex(end_at_f100,4)}`);
console.log(`-----------------------------------------------`);

// loads the exomized file bytes
load(compressed.name, compressed.start);

// prepare a CALL to deexo
const state = cpu.getState();
state.pc = deexo.start - 4;
state.sp = 0xFFFF;
mem_write(deexo.start - 4, 0xCD);            // CALL
mem_write(deexo.start - 3, lo(deexo.start)); // 
mem_write(deexo.start - 2, hi(deexo.start)); // 
mem_write(deexo.start - 1, 0xC9);            // RET

// prepare deexo parameters HL=compressed source, DE=uncompressed dest
state.h = hi(compressed.head); 
state.l = lo(compressed.head); 
state.d = hi(original.head); 
state.e = lo(original.head);

console.log(`deexo ${backward?'BACKWARD ':''}routine launched with parameters HL=${hex(compressed.head,4)} DE=${hex(original.head,4)}`);

// do actual deexo
//debugRead = true;
//debugWrite = true;

cpu.setState(state);
let failed = false;
let tstates = 0;
for(let t=0;;t++) {
   tstates += cpu.run_instruction();
   const pc = cpu.getState().pc;
   if(pc === deexo.start - 1) break; // RET reached
   if(pc < (deexo.start-4) || pc > (deexo.start+512)) {
      console.log(`aborted: PC went out of bounds reaching ${hex(pc,4)} after ${t} Z80 instructions`);
      failed = true;
      break;
   }
   if(t>50000000) {
      console.log("aborted: deexo routine was looping forever");
      failed = true;
      break;
   }
}

if(!failed) {
   console.log(`deexo routine ended normally after ${tstates} t-states`);
}

original.bytes = fs.readFileSync(original.name);
// console.log(`file "${original.name}" (${original.bytes.length} bytes) loaded for compare with memory`);

console.log("comparing...");
let equal = true;
let ndiffs = 0;
for(let t=0; t < original.bytes.length; t++) {
   const o = original.bytes[t];
   const m = memory[t + original.start];
   if(o !== m) {
      console.log(`diff at ${hex(t,4)}: (orig) ${hex(o)} != ${hex(m)} (deexo)`);
      equal = false;
      ndiffs++;
      if(ndiffs > 5) {
         console.log("[...]");
         break;
      }
   }
}

if(!equal) console.log("deexo FAILED to decompress the file correctly");
else console.log("deexo OK, original uncompressed file is identical with decompressed copy in memory");


// ********************** UTILITY FUNCTIONS **********************

function load(filename, start) {   
   const bytes = fs.readFileSync(filename);
   
   const end = start + bytes.length - 1;

   for(let i=0,t=start;t<=end;i++,t++) {
      mem_write(t, bytes[i]);
   }

   // console.log(`file "${filename}" (${bytes.length} bytes) loaded at ${hex(start,4)}-${hex(end,4)}`);

   return bytes;
}

function lo(word) {
   return word & 0xff;   
}

function hi(word) {
   return (word >> 8) & 0xff;
}

function hex(value, size) {
   if(size === undefined) size = 2;
   let s = "0000" + value.toString(16);
   return s.substr(s.length - size);
}

function parseOptions() {
   try { 
      const options = commandLineArgs(optionDefinitions); 
      return { 
         ...options, 
         original: fileNameAndAddress(options.original),
         compressed: fileNameAndAddress(options.compressed)
      }      
   } catch(ex) {
      console.log(ex.message);
      process.exit(-1);
   }
}

function fileNameAndAddress(argv)
{   
   if(argv === undefined || argv.length != 2) return undefined;

   const [fileName, address] = argv;

   if(!fs.existsSync(fileName)) {
      console.log(`${fileName} not found`);
      process.exit(-1);
   }

   const decimalAddress = parseInt(address, 16);

   return { name: fileName, start: decimalAddress };
}
