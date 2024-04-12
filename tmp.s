.intel_syntax noprefix
.data
.align 1
.L.data.0:
   .byte 'v'
   .byte 'a'
   .byte 'l'
   .byte 'u'
   .byte 'e'
   .byte ' '
   .byte 'i'
   .byte 's'
   .byte ' '
   .byte '-'
   .byte '>'
   .byte ' '
   .byte '%'
   .byte 'd'
   .byte ' '
   .byte 0
.align 8
fmt: .quad .L.data.0
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 32
   lea rax, [rbp-8]
   push rax
   push 1
   push 3
   pop rdi
   pop rax
   imul rax, rdi
   push rax
   pop rdi
   pop rax
   mov [rax], rdi
   lea rax, [rbp-24]
   push rax
   push fmt
   pop rdi
   pop rax
   mov [rax], rdi
lea rax, [printf]
push rax
   lea rax, [rbp-24]
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
   pop rax
   call rax
   mov rsp, rbp
   pop rbp
   ret

.global buitin_glibc_caller
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
