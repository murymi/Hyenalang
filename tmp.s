.intel_syntax noprefix
.data
.align 8
a:
   .quad 4
   .1byte 1
   .1byte 2
   .1byte 3
   .1byte 4
.bss
.data
.align 8
__argc__: .quad 0
__argv__: .quad 0
.text

.global _start
_start:
   mov rax, [rsp]
   mov rcx, [rsp+8]
   mov [__argc__], rax
   mov [__argv__], rcx
   call main
   mov rdi, rax
   mov rax, 60
   syscall
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

