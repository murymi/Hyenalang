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
.global fmtwrite
fmtwrite:
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

.global fmtwrite_char
fmtwrite_char:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
# [inline asm]
   lea rsi, [rbp-1]
   mov rdx, 1
   mov rdi, 1
   mov rax, 1
   syscall
# [end]
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global fmtwrite_integer
fmtwrite_integer:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   mov [rbp-8], rdi
   mov rax, 0
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   setl al
   movzb rax, al
   cmp rax, 0
   je .L.else.3
   lea rax, [rbp-8]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   neg rax
   pop rdi
   mov [rdi], rax
   lea rax, [fmtwrite_char]
   push rax
   mov rax, 45
   push rax
   pop rdi
   pop rax
   call rax
   jmp .L.end.3
.L.else.3:
.L.end.3:
   mov rax, 0
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   setle al
   movzb rax, al
   cmp rax, 0
   je .L.else.4
   mov rax, 0
   jmp .L.endfn.2
   jmp .L.end.4
.L.else.4:
.L.end.4:
   lea rax, [rbp-16]
   push rax
   mov rax, 48
   push rax
   mov rax, 10
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cqo
   idiv rdi
   mov rax, rdx
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], rax
   lea rax, [fmtwrite_integer]
   push rax
   lea rax, [rbp-8]
   push rax
   mov rax, 10
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cqo
   idiv rdi
   pop rdi
   mov [rdi], rax
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [fmtwrite_char]
   push rax
   lea rax, [rbp-16]
   mov rax, [rax]
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   lea rax, [fmtwrite_integer]
   push rax
   mov rax, 20000
   neg rax
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.5:
   mov rsp, rbp
   pop rbp
   ret

