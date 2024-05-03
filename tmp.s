.intel_syntax noprefix
.data
.align 8
.L.data.strings.0:
   .quad 3
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 5
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.anon.0:
   .quad 3
   .quad offset .L.data.strings.0 + 8
.align 8
.L.data.anon.1:
   .quad 5
   .quad offset .L.data.strings.1 + 8
.bss
.text
.global write
write:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
# [inline asm]
   mov rsi, [rdi+8]
   mov rdx, [rdi +0]
   mov rdi, 1
   mov rax, 1
   syscall
# [end]
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global test_eq
test_eq:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   lea rax, [rbp-16]
   mov rax, [rax]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   sete al
   movzb rax, al
   cmp rax, 0
   je .L.else.2
   lea rax, [write]
   push rax
   lea rax, .L.data.anon.0
   push rax
   pop rdi
   pop rax
   call rax
   mov rax, 0
   jmp .L.endfn.1
   jmp .L.end.2
.L.else.2:
.L.end.2:
   lea rax, [write]
   push rax
   lea rax, .L.data.anon.1
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 64
   lea rax, [rbp-13]
   push rax
   mov rax, 5
   pop rdi
   mov [rdi], rax
   mov rax, 0
mov rdx, rax
   push rax
   mov rax, 5
   pop rdi
   sub rax, rdi
mov rcx, rax
   lea rax, [rbp-32]
mov [rax], rcx
add rax, 8
   push rax
   lea rax, [rbp-13]
add rax, 8
imul rdx, 1
add rax, rdx
   pop rdi
mov [rdi], rax
   mov rax, 0
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-32]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 106
   pop rdi
   mov [rdi], al
   lea rax, [rbp-36]
   push rax
   mov rax, 1
   pop rdi
   mov [rdi], eax
   mov rax, 0
mov rdx, rax
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   sub rax, rdi
mov rcx, rax
   lea rax, [rbp-64]
mov [rax], rcx
add rax, 8
   push rax
   lea rax, [rbp-32]
add rax, 8
mov rax, [rax]
imul rdx, 1
add rax, rdx
   pop rdi
mov [rdi], rax
   lea rax, [write]
   push rax
   lea rax, [rbp-64]
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

