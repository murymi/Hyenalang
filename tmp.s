.intel_syntax noprefix
.data
.align 1
.L.data.0:
   .byte 'h'
   .byte 'e'
   .byte 'l'
   .byte 'l'
   .byte 'o'
   .byte ' '
   .byte 'w'
   .byte 'o'
   .byte 'r'
   .byte 'l'
   .byte 'd'
   .byte 0
.align 1
.L.data.1:
   .byte '%'
   .byte 's'
   .byte '
'
   .byte 0
.align 8
cow:
   .quad 11
   .quad .L.data.0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 32
   lea rax, [rbp-16]
   add rax, 0
   push rax
   push offset cow
   pop rax
   add rax, 0
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-16]
   add rax, 8
   push rax
   push offset cow
   pop rax
   add rax, 8
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-32]
   add rax, 0
   push rax
   lea rax, [rbp-16]
   add rax, 0
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-32]
   add rax, 8
   push rax
   lea rax, [rbp-16]
   add rax, 8
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, .L.data.1
   push rax
   lea rax, [rbp-32]
   add rax, 8
   mov rax, [rax]
   push rax
   pop rsi
   pop rdi
   lea r15, printf
   call buitin_glibc_caller
   xor rax, rax
.L.endfn.0:
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
