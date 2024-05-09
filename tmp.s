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
   lea rcx, [rsp+8]
   mov [__argc__], rax
   mov [__argv__], rcx
   call main
   mov rdi, rax
   mov rax, 60
   syscall
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-4]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], eax
   lea rax, [rbp-8]
   push rax
   mov rax, 90
   pop rdi
   mov [rdi], eax
   mov rax, 2
   push rax
   mov rax, 1
   pop rdi
   add rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 1
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   jmp .L.endfn.0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

