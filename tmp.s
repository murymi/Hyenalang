.intel_syntax noprefix
.data
.bss
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
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-8]
   push rax
mov rax, 0
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   push rax
   mov rax, 9
   pop rdi
   mov [rdi], al
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 1
   push rax
   mov rax, 67
   pop rdi
   mov [rdi], al
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

