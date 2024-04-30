.intel_syntax noprefix
.data
.bss
.text
.global foo
foo:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global hello
hello:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global pointnew
pointnew:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   xor rax, rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global pointdo
pointdo:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   xor rax, rax
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   lea rax, [pointnew]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [pointdo]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.4:
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
