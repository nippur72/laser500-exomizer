MODULE	dexomizer

;
; calculate the entry point of the deexo routine
; after the relocation below the Basic text
;

defc CITY_INVASION = 0
defc MINE_KILLERS  = 0
defc ANAGRAM       = 0
defc MOON_LANDER   = 0
defc MATCHBOX      = 0
defc AMSTERD       = 0
defc BOXING        = 0
defc MARIEL        = 0
defc GENERIC       = 1

defc deexo = 0xF500  
defc relocated_address = deexo - 0x2D  ; this changes, check that deexo is at F500, usually it's F4D3
defc relocate_lenght = end_of_relocate - start_of_relocate 

defc GENERIC_DATA_SIZE = 0x0000
defc GENERIC_DATA_END = GENERIC_DATA_START + GENERIC_DATA_SIZE
defc GENERIC_RELOCATED_DATA_END = $F100
defc GENERIC_BASIC_POINTER = 0x9000 + 1

org 0x8995

stub:  
   defw 0x89A3                 ; points to next line 
   defw 0x000A                 ; 10 (line number)
   defb 0x41, 0xf0, 0x0c       ; A=&H
   defw relocate               ; address
   defb 0x3a, 0xb6, 0x20, 0x41 ; :CALL A
   defb 0x00                   ; line terminator
   defw 0x0000                 ; end of program (0x89A3 points here)
   defb 0xFF, 0xFF, 0xFF       ; filler: when the program is run
   defb 0xFF, 0xFF, 0xFF       ; the assignment A=&H.... in line 10    
   defb 0xFF, 0xFF, 0xFF       ; will overwrite this area so we need   
   defb 0xFF                   ; to save writing over our routine   
   
;*************************************************************
; Name: relocate()
; Purpose relocate the deexo routine at bottom of memory
; and the passes control to it
; Returns: nothing
;
relocate:
   ld hl, start_of_relocate
   ld de, relocated_address
   ld bc, relocate_lenght
   
   ; relocate
   ldir

   jp relocated_address

start_of_relocate:   
   IF CITY_INVASION = 1
      ; file "c1.aebd.bin"
      ld hl, c1_start
      ld de, 0xaebd
      call deexo

      ; file "c2.bin"
      ld hl, c2_start
      ld de, 0x8995
      call deexo

      ; set basic pointers   
      ld hl, 0x9a4f+1
      ld (0x83e9), hl
   ENDIF      

   IF MINE_KILLERS = 1
      ; file "k1.9ff5.bin"
      ld hl, k1_start
      ld de, 0x9ff5
      call deexo

      ; file "k2.bin"
      ld hl, k2_start
      ld de, 0x8995
      call deexo

      ; set basic pointers   
      ld hl, 0x9814+1
      ld (0x83e9), hl
   ENDIF      

   IF ANAGRAM = 1
      ; file "a1.bdf8.bin"
      ld hl, a1_start
      ld de, 0xbdf8
      call deexo

      ; file "a2.bin"
      ld hl, a2_start
      ld de, 0x8995
      call deexo

      ; set basic pointers   
      ld hl, 0xa31e+1
      ld (0x83e9), hl
   ENDIF      

   IF MOON_LANDER = 1
      ; file "m1.adf5.bin"
      ld hl, m1_start
      ld de, 0xadf5
      call deexo

      ; file "m2.bin"
      ld hl, m2_start
      ld de, 0x8995
      call deexo

      ; set basic pointers   
      ld hl, 0x9735+1
      ld (0x83e9), hl
   ENDIF      

   IF MATCHBOX = 1     
      ; file "matchbox.exo.bin"
      ld hl, ma_start           ; relocate at bottom of memory
      ld de, 0xEFFF - 4146      ; in order to give enough safety offset space
      ld bc, 4146               ;
      ldir                      ;
      
      ld hl, 0xEFFF - 4146      ; deexomize
      ld de, 0x8995             ;
      call deexo                ;

      ; set basic pointers   
      ld hl, 0xb880+1
      ld (0x83e9), hl
   ENDIF      

   IF AMSTERD = 1     
      ; file "amsterd.exo.bin"
      ld hl, am_start           ; relocate at bottom of memory
      ld de, 0xEFFF - 7926      ; in order to give enough safety offset space
      ld bc, 7926               ;
      ldir                      ;
      
      ld hl, 0xEFFF - 7926      ; deexomize
      ld de, 0x8995             ;
      call deexo                ;

      ; set basic pointers   
      ld hl, 0xa88a+1
      ld (0x83e9), hl
   ENDIF      

   IF BOXING = 1     
      ; file "boxing.packed.exo.bin"
      ld hl, bo_end             ; relocate at bottom of memory
      ld de, 0xF100             ; in order to give enough safety offset space
      ld bc, 6327 + 1           ; exomized file length + 1 
      lddr                      ;
      
      ld hl, 0xF100 - 6327      ; deexomize
      ld de, 0x8995             ;
      call deexo                ;

      ; set basic pointers   
      ld hl, 0x9bf1+1
      ld (0x83e9), hl
   ENDIF      

   IF MARIEL = 1     
      ; file "mariel.exo.bin"
      ld hl, ma_end             ; relocate at bottom of memory
      ld de, 0xF100             ; in order to give enough safety offset space
      ld bc, 3695 + 1           ; exomized file length +1
      lddr                      ;
      
      ld hl, 0xF100 - 3695      ; deexomize
      ld de, 0x8995             ;
      call deexo                ;

      ; set basic pointers   
      ld hl, 0xce69+1
      ld (0x83e9), hl
   ENDIF      

   IF GENERIC = 1     
      ; file "generic"
fix_address_1:      
      ld hl, GENERIC_DATA_END              ; pointer to end of source data block in memory
fix_address_2:      
      ld de, GENERIC_RELOCATED_DATA_END    ; pointer to end of moved source data block in memory (bottom of mem)
fix_address_3:      
      ld bc, GENERIC_DATA_SIZE + 1         ; exomized file length +1
      lddr                                 ; relocate at bottom of memory in order to give enough safety offset space

fix_address_4:      
      ld hl, GENERIC_RELOCATED_DATA_END - GENERIC_DATA_SIZE   
      ld de, 0x8995             
      call deexo                

      ; set basic pointers   
fix_address_5:      
      ld hl, GENERIC_BASIC_POINTER
      ld (0x83e9), hl
   ENDIF      

   ; new autorun
autorun:   
   ld   hl, 0x5552     ; stuffs "RU" in keyboard buffer
   ld   (0x8289),hl 
   ld   hl, 0x0d4e     ; stuffs "N\n"  in keyboard buffer
   ld   (0x8289+2),hl 
   ld   hl, 0x8289     ; keyboard buffer pointer
   ld   (0x85f7), hl
   rst  0             ; call reset which triggers keyboard buffer

   ; old without autorun
   ; jp 0000h  ; do a ret

IF GENERIC = 0
   INCLUDE "deexo.raw.asm"
ENDIF

IF GENERIC = 1
   INCLUDE "deexo_F500.raw.asm"
ENDIF

end_of_relocate:

IF CITY_INVASION = 1
   INCLUDE "c1.aebd.exo.asm"
   INCLUDE "c2.exo.asm"
ENDIF

IF MINE_KILLERS = 1
   INCLUDE "k1.9ff5.exo.asm"
   INCLUDE "k2.exo.asm"
ENDIF

IF ANAGRAM = 1
   INCLUDE "a1.bdf8.exo.asm"
   INCLUDE "a2.exo.asm"
ENDIF

IF MOON_LANDER = 1
   INCLUDE "m1.adf5.exo.asm"
   INCLUDE "m2.exo.asm"
ENDIF

IF MATCHBOX = 1
   INCLUDE "matchbox.exo.asm"
ENDIF

IF AMSTERD = 1
   INCLUDE "amsterd.exo.asm"
ENDIF

IF BOXING = 1
   INCLUDE "boxing.packed.exo.asm"   
ENDIF

IF MARIEL = 1
   INCLUDE "mariel.exo.asm"   
ENDIF

IF GENERIC = 1
   ; file is added by JavaScript code
GENERIC_DATA_START:   
ENDIF
