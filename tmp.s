.intel_syntax noprefix
.data
.bss
.data
.align 8
__argc__: .quad 0
__argv__: .quad 0
.text

.global _start
_start:
   mov rax, [rsp]
   lea rcx, [rsp+8]
   mov [__argc__], rax
   mov [__argv__], rcx
   call main
   mov rdi, rax
   mov rax, 60
   syscall
.text
.global string
string:
   push rbp
   mov rbp, rsp
   sub rsp, 64
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   mov [rbp-24], rdx
   mov [rbp-32], rcx
   mov rax, [rbp-8]
   push rax
   lea rax, [rbp-64]
   pop rdi
   mov cl, [rax+0]
   mov [rdi+0], cl
   mov cl, [rax+1]
   mov [rdi+1], cl
   mov cl, [rax+2]
   mov [rdi+2], cl
   mov cl, [rax+3]
   mov [rdi+3], cl
   mov cl, [rax+4]
   mov [rdi+4], cl
   mov cl, [rax+5]
   mov [rdi+5], cl
   mov cl, [rax+6]
   mov [rdi+6], cl
   mov cl, [rax+7]
   mov [rdi+7], cl
   mov cl, [rax+8]
   mov [rdi+8], cl
   mov cl, [rax+9]
   mov [rdi+9], cl
   mov cl, [rax+10]
   mov [rdi+10], cl
   mov cl, [rax+11]
   mov [rdi+11], cl
   mov cl, [rax+12]
   mov [rdi+12], cl
   mov cl, [rax+13]
   mov [rdi+13], cl
   mov cl, [rax+14]
   mov [rdi+14], cl
   mov cl, [rax+15]
   mov [rdi+15], cl
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   mov cl, [rax+24]
   mov [rdi+24], cl
   mov cl, [rax+25]
   mov [rdi+25], cl
   mov cl, [rax+26]
   mov [rdi+26], cl
   mov cl, [rax+27]
   mov [rdi+27], cl
   mov cl, [rax+28]
   mov [rdi+28], cl
   mov cl, [rax+29]
   mov [rdi+29], cl
   mov cl, [rax+30]
   mov [rdi+30], cl
   mov cl, [rax+31]
   mov [rdi+31], cl
   jmp .L.endfn.0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 32
   lea rax, [rbp-32]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   lea rax, [string]
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   push rax
   mov rax, 3
   push rax
   pop rcx
   pop rdx
   pop rsi
   pop rax
   pop rdi
   call rax
   add rsp, 8
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

