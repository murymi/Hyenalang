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
   sub rsp, 0
.L.continue.0:
   push 1
   push 0
   pop rdi
   pop rax
   cmp rax, rdi
   setg al
   movzb rax, al
   push rax
   pop rax
   cmp rax, 0
   je .L.end.0
   push 1
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
   jmp .L.continue.0
.L.end.0:
   xor rax, rax
   mov rsp, rbp
   pop rbp
   ret
