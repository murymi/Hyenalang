.intel_syntax noprefix
.data
.align 8
a:
   .quad 4
   .byte 1
   .byte 2
   .byte 3
   .byte 4
.align 8
b:
   .quad a
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
   sub rsp, 80
   lea rax, [rbp-50]
   mov qword ptr [rax], 3
   add rax, 8
   push rax
   add rsp, 8
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-80]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-50]
   add rax, 8
   imul rdx, 14
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-80]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   push rax
   mov rax, 1
   pop rdi
   mov [rdi], al
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

