.intel_syntax noprefix
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
   .byte 0
.align 8
message:
.quad .L.data.0
.bss
.align 4
.fuckfloatfool: .zero 4
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
push offset message
pop rax
   mov rax, [rax]
push rax
pop rdi
   call puts
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

