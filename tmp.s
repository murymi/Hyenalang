.intel_syntax noprefix
.data
.bss
.align 4
.fuckfloatfool: .zero 4
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 160
   lea rax, [rbp-160]
push rax
add rsp, 8
   mov rax, 10
push rax
   lea rax, [rbp-160]
add rax, 0
   pop rdi
   add rax, rdi
push rax
   mov rax, 30
   pop rdi
   mov [rdi], eax
   mov rax, 10
push rax
   lea rax, [rbp-160]
add rax, 0
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

