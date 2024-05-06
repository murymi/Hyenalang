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

.global makeArray
makeArray:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   sub rsp, 8
   lea rax, [rbp-8]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 10
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 20
   pop rdi
   mov [rdi], al
   add rsp, 8
   mov rax, [rbp-8]
   jmp .L.endfn.1
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-2]
   push rax
   lea rax, [makeArray]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-2]
   add rax, 0
   movsx rax, byte ptr [rax]
   jmp .L.endfn.2
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

