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
   movsxd rax, dword ptr [rax]
   jmp .L.endfn.0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   lea rax, [useBar]
   push rax
   lea rax, [rbp-12]
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
   mov rax, 2
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], eax
   add rsp, 8
   lea rax, [rbp-12]
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

