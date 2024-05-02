.intel_syntax noprefix
.data
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   lea rax, [test_template]
   push rax
   mov rax, 1
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global test_template
test_template:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-2], dil
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

