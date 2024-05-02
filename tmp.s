.intel_syntax noprefix
.data
.align 8
.L.data.strings.0:
   .quad 11
   .byte 0x68 
   .byte 0x65 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x20 
   .byte 0x77 
   .byte 0x6f 
   .byte 0x72 
   .byte 0x6c 
   .byte 0x64 
   .byte 0
.align 8
a:
   .quad 11
   .quad offset .L.data.strings.0 + 8
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   push offset a
   pop rax
   add rax, 0
   mov rax, [rax]
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

