.intel_syntax noprefix
.data
.align 1
a:
   .byte 0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
push offset a
   pop rax
   movsx rax, byte ptr [rax]
   push rax
   push 0
   pop rdi
   pop rax
   cmp rax, rdi
   sete al
   movzb rax, al
   push rax
   pop rax
   cmp rax, 0
   je .L.else.1
   push 0
   pop rax
   cmp rax, 0
   je .L.else.3
   push 10
   pop rax
   jmp .L.endfn.1
   jmp .L.end.3
.L.else.3:
.L.end.3:
   jmp .L.end.1
.L.else.1:
.L.end.1:
   push 5
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
