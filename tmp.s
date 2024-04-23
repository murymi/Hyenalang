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
   .byte 'c'
   .byte 'o'
   .byte 'w'
   .byte 0
.align 8
x:
   .quad 9
   .quad .L.data.0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 40
   lea rax, [rbp-24]
   add rax, 0
   push rax
   mov rax, 10
   pop rdi
   mov [rdi], rax
   mov rax, 0
mov rdx, rax
   push rax
   mov rax, 7
   pop rdi
   sub rax, rdi
mov rcx, rax
   lea rax, [rbp-40]
mov [rax], rcx
add rax, 8
   push rax
   lea rax, [rbp-24]
add rax, 8
imul rdx, 1
add rax, rdx
   pop rdi
mov [rdi], rax
   lea rax, [rbp-40]
   add rax, 0
   mov rax, [rax]
   jmp .L.endfn.0
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
