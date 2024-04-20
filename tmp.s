.intel_syntax noprefix
.data
.align 1
.L.data.0:
   .byte 'c'
   .byte '	'
   .byte 'o'
   .byte 'w'
   .byte '
'
   .byte 0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-8]
push rax
lea rax, .L.data.0
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-8]
   mov rax, [rax]
push rax
pop rdi
   call puts
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

