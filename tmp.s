.intel_syntax noprefix
.data
.bss
.data
.align 8
__argc__: .quad 0
__argv__: .quad 0
.text

.global _start
_start:
   mov rax, [rsp]
   mov rcx, [rsp+8]
   mov [__argc__], rax
   mov [__argv__], rcx
   call main
   mov rdi, rax
   mov rax, 60
   syscall
.text
.global useBar
useBar:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   lea rax, [rbp-8]
   mov rax, [rax]
   jmp .L.endfn.0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 64
   lea rax, [rbp-48]
   mov qword ptr [rax], 5
   add rax, 8
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 24
   push rdi
   mov rax, 4
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 32
   push rdi
   mov rax, 5
   pop rdi
   mov [rdi], rax
   add rsp, 8
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-64]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-48]
   add rax, 8
   imul rdx, 8
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   mov rax, 8
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-64]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   mov rax, [rax]
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

