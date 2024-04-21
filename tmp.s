.intel_syntax noprefix
.data
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 32
   lea rax, [rbp-32]
   add rax, 24
   push rax
   mov rax, 20
   pop rdi
   mov [rdi], rax
   mov rax, 0
   push rax
   lea rax, [rbp-32]
   add rax, 0
   pop rdi
   add rax, rdi
   push rax
   mov rax, 70
   pop rdi
   mov [rdi], al
   mov rax, 0
   push rax
   lea rax, [rbp-32]
   add rax, 0
   pop rdi
   add rax, rdi
   movsx rax, byte ptr [rax]
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
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
