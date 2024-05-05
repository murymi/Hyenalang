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
   sub rsp, 24
   lea rax, [rbp-12]
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
   mov rax, 4
   pop rdi
   mov [rdi], al
   pop rdi
push rdi
add rdi, 2
push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
push rdi
add rdi, 3
push rdi
   mov rax, 4
   pop rdi
   mov [rdi], al
add rsp, 8
   lea rax, [rbp-24]
   push rax
   lea rax, [rbp-12]
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-24]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-24]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-24]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-24]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

