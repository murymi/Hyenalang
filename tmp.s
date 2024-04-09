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
   .byte 'd'
   .byte ' '
   .byte '%'
   .byte 'd'
   .byte 0
.align 8
fmt: .quad .L.data.0
.text
.global foo
foo:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   lea rax, [rbp-8]
   mov [rax], rdi
   lea rax, [rbp-16]
   push rax
   push fmt
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-16]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rdi
   lea rax, [rbp-8]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rsi
   lea r15, [printf]
   call buitin_glibc_caller
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   push 70
   pop rdi
   call foo
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
