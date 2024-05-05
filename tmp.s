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
.global write
write:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
# [inline asm]
   mov rsi, [rdi+8]
   mov rdx, [rdi +0]
   mov rdi, 1
   mov rax, 1
   syscall
# [end]
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 24
   lea rax, [rbp-16]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 4
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 10
   pop rdi
   mov [rdi], rax
   add rsp, 8
   lea rax, [rbp-24]
   push rax
   mov rax, 8
   push rax
   lea rax, [rbp-16]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-24]
   mov rax, [rax]
   mov rax, [rax]
   jmp .L.endfn.1
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

