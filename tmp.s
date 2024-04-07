.intel_syntax noprefix
.global fmt
.data
.align 1
.fmtbytes:
   .byte '('
   .byte '1'
   .byte '0'
   .byte '/'
   .byte '2'
   .byte ' '
   .byte '+'
   .byte ' '
   .byte '7'
   .byte ' '
   .byte '*'
   .byte ' '
   .byte '2'
   .byte ')'
   .byte '/'
   .byte '2'
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
   push 10
   push 2
   pop rdi
   pop rax
   cqo
   idiv rdi
   push rax
   push 7
   push 2
   pop rdi
   pop rax
   imul rax, rdi
   push rax
   pop rdi
   pop rax
   add rax, rdi
   push rax
   push 2
   pop rdi
   pop rax
   cqo
   idiv rdi
   push rax
   mov rsi, rax
   mov rdi, fmt
  mov rax, rsp
  and rax, 15
  jnz .L.call
  mov rax, 0
  call printf
  jmp .L.end
.L.call:
  sub rsp, 8
  mov rax, 0
  call printf
  add rsp, 8
.L.end:
   xor rax, rax
   mov rsp, rbp
   pop rbp
   ret
