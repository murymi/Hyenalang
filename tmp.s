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
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 72
   lea rax, [rbp-16]
   add rax, 8
   push rax
   lea rax, .L.data.0
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-16]
   add rax, 0
   push rax
   mov rax, 11
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 16
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-72]
   add rax, 8
   pop rdi
   add rax, rdi
   push rax
   lea rax, [rbp-16]
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   mov rax, 2
   push rax
   mov rax, 16
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-72]
   add rax, 8
   pop rdi
   add rax, rdi
   add rax, 0
   mov rax, [rax]
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
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
