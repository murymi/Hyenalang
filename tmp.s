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
   sub rsp, 16
   lea rax, [rbp-10]
   add rax, 8
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   add rsp, 8
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

