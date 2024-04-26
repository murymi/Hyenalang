.intel_syntax noprefix
.data
.align 8
.L.data.strings.0:
   .quad 12
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
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 5
   .byte 0x68 
   .byte 0x65 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0
.align 8
.L.data.anon.0:
   .quad 5
   .quad offset .L.data.strings.1 + 8
.align 8
a:
   .quad 12
   .quad offset .L.data.strings.0 + 8
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   lea rax, .L.data.anon.0
   push rax
   pop rdi
   lea r15, puts
   call buitin_glibc_caller
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global buitin_glibc_caller
buitin_glibc_caller:
   push rbp
   mov rbp, rsp
   mov rax, rsp
   and rax, 15
   jnz .L.call
   mov rax, 0
   call r15
   jmp .L.end
.L.call:
   sub rsp, 8
   mov rax, 0
   call r15
   add rsp, 8
.L.end:
   mov rsp, rbp
   pop rbp
   ret
