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
   mov [rbp-2], di
   lea rax, [rbp-2]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   lea rax, [rbp-2]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   jmp .L.endfn.0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [useBar]
   push rax
   lea rax, [rbp-2]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], al
   add rsp, 8
   lea rax, [rbp-2]
   movsx rax, word ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

