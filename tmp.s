.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 3
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 3
   .quad offset .L.data.bytes.0 + 8
.align 8
.L.data.bytes.1:
   .quad 5
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 5
   .quad offset .L.data.bytes.1 + 8
.align 8
.L.data.bytes.2:
   .quad 3
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.2:
   .quad 3
   .quad offset .L.data.bytes.2 + 8
.align 8
.L.data.bytes.3:
   .quad 5
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.3:
   .quad 5
   .quad offset .L.data.bytes.3 + 8
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
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 48
   lea rax, [rbp-41]
   mov qword ptr [rax], 3
   add rax, 8
   push rax
   pop rdi
   push rdi
   mov qword ptr [rdi + 0],2
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 9
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   mov qword ptr [rdi + 11],2
   pop rdi
   push rdi
   add rdi, 19
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 20
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   mov qword ptr [rdi + 22],2
   pop rdi
   push rdi
   add rdi, 30
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 31
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], al
   add rsp, 8
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 11
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-41]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 11
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-41]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 11
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-41]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

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
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global test_eq
test_eq:
   push rbp
   mov rbp, rsp
   sub rsp, 48
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   lea rax, [rbp-16]
   mov rax, [rax]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   sete al
   movzb rax, al
   cmp rax, 0
   je .L.else.3
   lea rax, [write]
   push rax
   lea rax, [rbp-32]
   push rax
   lea rax, .L.data.strings.2
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
   lea rax, [rbp-32]
   push rax
   pop rdi
   pop rax
   call rax
   mov rax, 0
   jmp .L.endfn.2
   jmp .L.end.3
.L.else.3:
.L.end.3:
   lea rax, [write]
   push rax
   lea rax, [rbp-48]
   push rax
   lea rax, .L.data.strings.3
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
   lea rax, [rbp-48]
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

