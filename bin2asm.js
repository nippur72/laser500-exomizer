const fs = require("fs");

bin2asm("deexo.bin", "deexo.raw.asm", "deexo_raw");
bin2asm("deexo_F500.bin", "deexo_F500.raw.asm", "deexo_raw");

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
