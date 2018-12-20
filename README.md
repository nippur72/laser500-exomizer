# laser500-exomizer

Exomizer self extracting build tool for Laser 500.

Takes an exomized Laser 500 program and turns it into a self extracting executable.

The self-extractor uses the Z80 `deexo.asm` routine relocated at the address $F500. 
After decompression, the system `VARTAB` pointer is set according to the uncompressed
file length. That can be overidden for special cases (e.g. multiple chunks programs) 
with the `-v` option which sets explicitly the `VARTAB` pointer.

## Installation

```
npm i -g laser500-exomizer
```

## Usage

After installation, you can call the command `exolaser` from the prompt.

Example:

First create the exomized data bytes from AMSTERD.bin. It's assumed 
that `exomizer.exe` is already installed and in the path.
```
exomizer.exe raw -P0 amsterd.bin -o amsterd.exo.dat
```

Now create the Laser 500 self extracting program `amsterd.exo.bin`
```
exolaser -i amsterd.exo.dat -u amsterd.bin -o amsterd.exo.bin 
```

## Testing

You can also test decompression with the `test_deexo` command. 
It runs the deexo routine in a simulated Z80 environment using the given parameters.

Example
```
test_deexo.js -o amsterd.bin 8995 -c amsterd.exo.dat e400
```

- `amsterd.bin` is the original uncompressed file
- `8995` is the memory address where the file will be decompressed to
- `amsterd.exo.dat` is the exomized bytes file
- `e400` is the memory address where to put the exomized data bytes

There is also a `-b` option that switches to backward compression using 
the Z80 assembler routine `deexo_b.asm`. It requires that the exomized data bytes 
are created with the `exomizer -b` option. 

Backward compression is used when the compressed data have to be placed in memory
before the decompressed section. Normal forward compression is used when the compressed
data are placed after the decompressed section. 
