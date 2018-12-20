const fs = require("fs");

bin2asm("deexo.bin", "deexo.raw.asm", "deexo_raw");
bin2asm("deexo_F500.bin", "deexo_F500.raw.asm", "deexo_raw");

// bin2asm("c1.aebd.exo.bin", "c1.aebd.exo.asm", "c1");
// bin2asm("c2.exo.bin",      "c2.exo.asm",      "c2");

// bin2asm("k1.9ff5.exo.bin", "k1.9ff5.exo.asm", "k1");
// bin2asm("k2.exo.bin",      "k2.exo.asm",      "k2");

// bin2asm("a1.bdf8.exo.bin", "a1.bdf8.exo.asm", "a1");
// bin2asm("a2.exo.bin",      "a2.exo.asm",      "a2");

//bin2asm("m1.adf5.exo.bin", "m1.adf5.exo.asm", "m1");
//bin2asm("m2.exo.bin",      "m2.exo.asm",      "m2");

// bin2asm("matchbox.exo.bin",   "matchbox.exo.asm", "ma");

// bin2asm("amsterd.exo.bin",   "amsterd.exo.asm", "am");

//bin2asm("b1.9fe4.exo.bin", "b1.9fe4.exo.asm", "b1");
//bin2asm("b2.exo.bin",      "b2.exo.asm",      "b2");

// bin2asm("boxing.packed.exo.bin",   "boxing.packed.exo.asm", "bo");

bin2asm("mariel.exo.bin",   "mariel.exo.asm", "ma");

function bin2asm(fileName, outName, label) 
{
   const buffer = fs.readFileSync(fileName);

   const bytes = new Uint8Array(buffer);

   let out = "; file generated automatically, do not edit\r\n\r\n";

   out = out + `${label}_start:\r\n`;

   bytes.forEach(b=>out+=` defb 0x${b.toString(16)}\r\n`);

   out = out + `${label}_end:\r\n`;

   fs.writeFileSync(outName,out);

   console.log(`file '${outName}' generated`);
}
