.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 13
   .byte 0x68 
   .byte 0x65 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x20 
   .byte 0x6b 
   .byte 0x61 
   .byte 0x6e 
   .byte 0x79 
   .byte 0x61 
   .byte 0x75 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 13
   .quad offset .L.data.bytes.0 + 8
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
.global write
write:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
# [inline asm]
   mov rsi, [rdi+8]
   mov rdx, [rdi +0]
   mov rdi, 1
   mov rax, 1
   syscall
# [end]
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global makeArray
makeArray:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   mov rax, [rbp-8]
   push rax
   lea rax, .L.data.strings.0
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
   jmp .L.endfn.1
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   lea rax, [makeArray]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-16]
   add rax, 0
   mov rax, [rax]
   jmp .L.endfn.2
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

