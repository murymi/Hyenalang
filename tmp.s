.intel_syntax noprefix
.global fmt
.data
.align 1
.fmtbytes:
   .byte 'r'
   .byte 'e'
   .byte 's'
   .byte ' '
   .byte '='
   .byte ' '
   .byte '%'
   .byte 'd'
   .byte 10
   .byte 0
.align 8
fmt: .quad .fmtbytes
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 40
   lea rax, [rbp-0]
   push rax
   push 10
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-8]
   push rax
   push 11
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-16]
   push rax
   push 10
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-24]
   push rax
   push 90
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-32]
   push rax
   push 89
   pop rdi
   pop rax
   mov [rax], rdi
.L.continue.9:
   lea rax, [rbp-32]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   push 100
   pop rdi
   pop rax
   cmp rax, rdi
   setl al
   movzb rax, al
   push rax
   pop rax
   cmp rax, 0
   je .L.end.9
   lea rax, [rbp-32]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rax
   mov rsi, rax
   mov rdi, fmt
   mov rax, rsp
   and rax, 15
   jnz .L.call.11
   mov rax, 0
   call printf
   jmp .L.end.11
.L.call.11:
   sub rsp, 8
   mov rax, 0
   call printf
   add rsp, 8
.L.end.11:
   lea rax, [rbp-32]
   push rax
   lea rax, [rbp-32]
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
   jmp .L.continue.9
.L.end.9:
   xor rax, rax
   mov rsp, rbp
   pop rbp
   ret
