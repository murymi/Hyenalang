.intel_syntax noprefix
.data
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 2
   lea rax, [rbp-2]
push rax
add rsp, 8
   lea rax, [rbp-2]
add rax, 0
add rax, 0
add rax, 1
push rax
   mov rax, 2
   pop rdi
   mov [rdi], al
   lea rax, [rbp-2]
add rax, 0
add rax, 0
add rax, 1
   movsx rax, byte ptr [rax]
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

