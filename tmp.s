.intel_syntax noprefix
.data
.align 1
.L.data.0:
   .byte '%'
   .byte 'd'
   .byte '
'
   .byte 0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 48
   lea rax, [rbp-24]
   add rax, 0
   push rax
   mov rax, 10
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-28]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], eax
.L.continue.1:
   lea rax, [rbp-24]
   add rax, 0
   mov rax, [rax]
   push rax
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   pop rdi
   cmp rax, rdi
   setl al
   movzb rax, al
   cmp rax, 0
   je .L.break.1
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-24]
   add rax, 8
   pop rdi
   add rax, rdi
   push rax
   mov rax, 2
   push rax
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   pop rdi
   imul rax, rdi
   pop rdi
   mov [rdi], al
   lea rax, [rbp-28]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.continue.1
.L.break.1:
   mov rax, 3
mov rdx, rax
   push rax
   mov rax, 8
   pop rdi
   sub rax, rdi
mov rcx, rax
   lea rax, [rbp-48]
mov [rax], rcx
add rax, 8
   push rax
   lea rax, [rbp-24]
add rax, 8
imul rdx, 1
add rax, rdx
   pop rdi
mov [rdi], rax
   lea rax, [rbp-28]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], eax
.L.continue.2:
   lea rax, [rbp-48]
   add rax, 0
   mov rax, [rax]
   push rax
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   pop rdi
   cmp rax, rdi
   setl al
   movzb rax, al
   cmp rax, 0
   je .L.break.2
   lea rax, .L.data.0
   push rax
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-48]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, byte ptr [rax]
   push rax
   pop rsi
   pop rdi
   lea r15, printf
   call buitin_glibc_caller
   lea rax, [rbp-28]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-28]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.continue.2
.L.break.2:
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
