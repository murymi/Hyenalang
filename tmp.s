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
   sub rsp, 16

   lea rax, [rbp-0]
   push rax

   push 90

   pop rdi
   pop rax
   mov [rax], rdi


   push 10
   push 10
   pop rdi
   pop rax
   add rax, rdi
   push rax
   sub rsp, 8


   lea rax, [rbp-8]
   push rax

   push 78

   pop rdi
   pop rax
   mov [rax], rdi

   xor rax, rax
   mov rsp, rbp
   pop rbp
   ret
