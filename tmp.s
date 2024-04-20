.intel_syntax noprefix
.data
.align 1
.L.data.0:
   .byte 'H'
   .byte 'e'
   .byte 'l'
   .byte 'l'
   .byte 'o'
   .byte ' '
   .byte 'H'
   .byte 'y'
   .byte 'e'
   .byte 'n'
   .byte 'a'
   .byte ' '
   .byte 'u'
   .byte 's'
   .byte 'e'
   .byte 'r'
   .byte 0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
lea rax, .L.data.0
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
