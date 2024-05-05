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
   sub rsp, 16
   lea rax, [rbp-16]
   push rax
   pop rdi
push rdi
add rdi, 8
push rdi
   mov rax, 70
   pop rdi
   mov [rdi], rax
   pop rdi
push rdi
add rdi, 0
push rdi
   mov rax, 8
   pop rdi
   mov [rdi], al
add rsp, 8
   lea rax, [rbp-16]
   add rax, 8
   add rax, 0
   add rax, 0
   mov rax, [rax]
   push rax
   lea rax, [rbp-16]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

