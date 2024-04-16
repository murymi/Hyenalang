.intel_syntax noprefix
.data
.text
.global ass
ass:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   push 100
   pop rax
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   call ass
push rax
   pop rax
   jmp .L.endfn.1
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
