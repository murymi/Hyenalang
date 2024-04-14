.intel_syntax noprefix
.data
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 10
   lea rax, [rbp-10]
   push rax
sub rsp, 8
   lea rax, [rbp-10]
   push rax
   push 1
   push 1
   pop rdi
   pop rax
   add rax, rdi
   push rax
   pop rdi
   imul rdi, 1
   pop rax
   add rax, rdi
   lea rax, [rax]
   push rax
   push 90
   pop rdi
   pop rax
   mov [rax], dil
   lea rax, [rbp-10]
   push rax
   push 2

   pop rdi
   pop rax
   imul rdi, 1
   add rax, rdi
push rax
   pop rax
   movsx rax, byte ptr [rax]
   push rax

   pop rax
   jmp .L.endfn.2
   xor rax, rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global buitin_glibc_caller
buitin_glibc_caller:
   push rbp
   mov rbp, rsp
   mov rax, rsp
   and rax, 15
   jnz .L.call
   mov rax, 0
   call r15
   jmp .L.end
.L.call:
   sub rsp, 8
   mov rax, 0
   call r15
   add rsp, 8
.L.end:
   mov rsp, rbp
   pop rbp
   ret
