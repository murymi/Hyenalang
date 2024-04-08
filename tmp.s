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
   sub rsp, 8

   lea rax, [rbp-0]
   push rax

   push 0

   pop rdi
   pop rax
   mov [rax], rdi


   lea rax, [rbp-0]
   push rax
   push 90
   push 90
   pop rdi
   pop rax
   imul rax, rdi
   push rax
   pop rdi
   pop rax
   mov [rax], rdi
   sub rsp, 8

   lea rax, [rbp-0]
   push rax
   pop rax
   mov rax, [rax]
   push rax
   pop rax
   mov rsi, rax
   mov rdi, fmt
   mov rax, rsp
   and rax, 15
   jnz .L.call.2
   mov rax, 0
   call printf
   jmp .L.end.2
.L.call.2:
   sub rsp, 8
   mov rax, 0
   call printf
   add rsp, 8
.L.end.2:
   xor rax, rax
   mov rsp, rbp
   pop rbp
   ret
