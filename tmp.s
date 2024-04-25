.intel_syntax noprefix
.data
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   mov rax, 0
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-16]
   add rax, 8
   pop rdi
   add rax, rdi
   push rax
   mov rax, 121
   pop rdi
   mov [rdi], al
   lea rax, [rbp-16]
   add rax, 8
   push rax
   pop rdi
   lea r15, puts
   call buitin_glibc_caller
   xor rax, rax
.L.endfn.1:
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
