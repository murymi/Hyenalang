.intel_syntax noprefix
.global fmt
.data
.align 1
.L.data.0:
   .byte 'h'
   .byte 'e'
   .byte 'l'
   .byte 'l'
   .byte 'o'
   .byte ' '
   .byte 'w'
   .byte 'o'
   .byte 'r'
   .byte 'l'
   .byte 'd'
   .byte ' '
   .byte '%'
   .byte 'd'
   .byte ' '
   .byte 0
.align 8
fmt: .quad .L.data.0

.text
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

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   lea rax, [rbp-0]
   push rax
   push fmt
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-8]
   push rax
   push 0
   pop rdi
   pop rax
   mov [rax], rdi
.L.continue.3:
   lea rax, [rbp-8]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   push 50
   pop rdi
   pop rax
   cmp rax, rdi
   setl al
   movzb rax, al
   push rax
   pop rax
   cmp rax, 0
   je .L.break.3
   lea rax, [rbp-0]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rdi
   lea rax, [rbp-8]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rsi
   lea r15, [printf]
   call buitin_glibc_caller
   sub rsp, 8
   lea rax, [rbp-8]
   push rax
   lea rax, [rbp-8]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   push 1
   pop rdi
   pop rax
   add rax, rdi
   push rax
   pop rdi
   pop rax
   mov [rax], rdi
   sub rsp, 8
   jmp .L.continue.3
.L.break.3:
   xor rax, rax
   mov rsp, rbp
   pop rbp
   ret
