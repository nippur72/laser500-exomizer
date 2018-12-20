
@rem compile deexo.asm
z80asm --cpu=z80 -s -b deexo.asm 
z80asm --cpu=z80 -s -b deexo_b_F500.asm 
z80asm --cpu=z80 -s -b deexo_F500.asm 

@rem convert deexo_F500.bin into deexo_F500.raw.asm
node bin2asm

@rem compile stub.asm, (uses deexo_F500.raw.asm at previous step)
z80asm --cpu=z80 -s -b stub.asm 

@rem convert stub.bin to JavaScript
node bin2js -i stub.bin -o stub.js -n stub
node bin2js -i deexo_F500.bin -o deexo_F500.js -n deexo
node bin2js -i deexo_b_F500.bin -o deexo_b_F500.js -n deexo_b

@del deexo.raw.asm
@del deexo_F500.raw.asm
@del deexo.bin
@del deexo_b_F500.bin
@del deexo_F500.bin
@del stub.bin
