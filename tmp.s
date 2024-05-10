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
   lea rax, [rbp-8]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 4
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   add rsp, 8
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

