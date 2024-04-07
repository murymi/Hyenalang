.intel_syntax noprefix
.global fmt
.data
.align 1
.fmtbytes:
   .byte '4'
   .byte '0'
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
   push 40
   pop rax
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
