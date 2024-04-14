.intel_syntax noprefix
.data
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 20
   lea rax, [rbp-4]
   push rax
   push 20
   pop rdi
   pop rax
   mov [rax], edi
   lea rax, [rbp-16]
   push rax
   lea rax, [rbp-4]
   push rax
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-20]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rax
   movsxd rax, dword ptr [rax]
   push rax
   pop rdi
   pop rax
   mov [rax], edi
   lea rax, [rbp-20]
   push rax
   pop rax
   movsxd rax, dword ptr [rax]
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
