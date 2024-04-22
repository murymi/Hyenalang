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
   sub rsp, 184
   lea rax, [rbp-88]
   add rax, 0
   push rax
   mov rax, 10
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-92]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], eax
.L.continue.1:
   lea rax, [rbp-88]
   add rax, 0
   mov rax, [rax]
   push rax
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   pop rdi
   cmp rax, rdi
   setl al
   movzb rax, al
   cmp rax, 0
   je .L.break.1
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 8
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-88]
   add rax, 8
   pop rdi
   add rax, rdi
   push rax
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-92]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.continue.1
.L.break.1:
   lea rax, [rbp-184]
   push rax
   lea rax, [rbp-88]
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   movq rcx, [rax+16]
   movq [rdi+16], rcx
   movq rcx, [rax+24]
   movq [rdi+24], rcx
   movq rcx, [rax+32]
   movq [rdi+32], rcx
   movq rcx, [rax+40]
   movq [rdi+40], rcx
   movq rcx, [rax+48]
   movq [rdi+48], rcx
   movq rcx, [rax+56]
   movq [rdi+56], rcx
   movq rcx, [rax+64]
   movq [rdi+64], rcx
   movq rcx, [rax+72]
   movq [rdi+72], rcx
   movq rcx, [rax+80]
   movq [rdi+80], rcx
   lea rax, [rbp-92]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], eax
.L.continue.2:
   lea rax, [rbp-184]
   add rax, 0
   mov rax, [rax]
   push rax
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   pop rdi
   cmp rax, rdi
   setl al
   movzb rax, al
   cmp rax, 0
   je .L.break.2
   lea rax, .L.data.0
   push rax
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 8
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-184]
   add rax, 8
   pop rdi
   add rax, rdi
   mov rax, [rax]
   push rax
   pop rsi
   pop rdi
   lea r15, printf
   call buitin_glibc_caller
   lea rax, [rbp-92]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-92]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.continue.2
.L.break.2:
   mov rax, 88
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
