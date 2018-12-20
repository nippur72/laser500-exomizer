@rem exomizer.exe raw -P0 c1.aebd.bin -o c1.aebd.exo.bin
@rem exomizer.exe raw -P0 c2.bin -o c2.exo.bin

@rem exomizer.exe raw -P0 k1.9ff5.bin -o k1.9ff5.exo.bin
@rem exomizer.exe raw -P0 k2.bin -o k2.exo.bin

@rem exomizer.exe raw -P0 m1.adf5.bin -o m1.adf5.exo.bin
@rem exomizer.exe raw -P0 m2.bin      -o m2.exo.bin

@rem exomizer.exe raw -P0 matchbox.bin        -o matchbox.exo.bin
@rem exomizer.exe raw -P0 -d matchbox.exo.bin -o matchbox.decrunched.bin
@rem FC /B matchbox.decrunched.bin matchbox.bin

@rem === AMSTERD ===
SET ORIGINAL=AMSTERD.bin
SET EXODAT=AMSTERD.exo.dat
SET FINALBIN=AMSTERD.exo.bin
exomizer.exe raw -P0 %ORIGINAL% -o %EXODAT%
node test_deexo.js -o %ORIGINAL% 8995 -c %EXODAT% e400
node exolaser -i %EXODAT% -o %FINALBIN% -u %ORIGINAL%

@rem === BOXING ===
@rem SET ORIGINAL=boxing.packed.bin
@rem SET EXODAT=boxing.packed.dat
@rem SET FINALBIN=boxing.exo.bin
@rem SET VARTAB=9bf2
@rem exomizer.exe raw -P0 %ORIGINAL% -o %EXODAT%
@rem node test_deexo.js -o %ORIGINAL% 8995 -c %EXODAT% d84a
@rem node exolaser -i %EXODAT% -o %FINALBIN% -v %VARTAB%

@rem === MARIEL HEMINGWAY ===
@rem SET ORIGINAL=mariel.bin
@rem SET EXODAT=mariel.exo.dat 
@rem SET FINALBIN=mariel.exo.bin
@rem exomizer.exe raw -P0 %ORIGINAL% -o %EXODAT%
@rem node test_deexo.js -o %ORIGINAL% 8995 -c %EXODAT% e292
@rem node exolaser -i %EXODAT% -o %FINALBIN% -u %ORIGINAL%

@rem === ANAGRAM ===
@rem SET ORIGINAL=anagram.packed.bin
@rem SET EXODAT=anagram.exo.dat 
@rem SET FINALBIN=anagram.exo.bin
@rem SET VARTAB=a2d5
@rem exomizer.exe raw -P0 %ORIGINAL% -o %EXODAT%
@rem node test_deexo.js -o %ORIGINAL% 8995 -c %EXODAT% db6a
@rem node exolaser -i %EXODAT% -o %FINALBIN% -v %VARTAB%

