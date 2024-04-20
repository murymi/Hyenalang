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
   .byte ' '
   .byte '%'
   .byte 'd'
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
   lea rax, [rbp-4]
push rax
   mov rax, 10
push rax
   mov rax, 8
   pop rdi
   imul rax, rdi
   pop rdi
   mov [rdi], eax
lea rax, .L.data.0
push rax
   lea rax, [rbp-4]
   movsxd rax, dword ptr [rax]
push rax
pop rsi
pop rdi
   lea r15, printf
   call buitin_glibc_caller
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
