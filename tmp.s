.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 21
   .byte 0x72 
   .byte 0x65 
   .byte 0x65 
   .byte 0x65 
   .byte 0x61 
   .byte 0x61 
   .byte 0x61 
   .byte 0x61 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x20 
   .byte 0x62 
   .byte 0x61 
   .byte 0x64 
   .byte 0x20 
   .byte 0x6d 
   .byte 0x61 
   .byte 0x6e 
   .byte 0x21 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 21
   .quad offset .L.data.bytes.0 + 8
.align 8
.L.data.bytes.1:
   .quad 10
   .byte 0x6f 
   .byte 0x68 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x68 
   .byte 0x20 
   .byte 0x4f 
   .byte 0x68 
   .byte 0x68 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 10
   .quad offset .L.data.bytes.1 + 8
.align 8
.L.data.bytes.2:
   .quad 11
   .byte 0x73 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x64 
   .byte 0x20 
   .byte 0x6e 
   .byte 0x75 
   .byte 0x64 
   .byte 0x65 
   .byte 0x73 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.2:
   .quad 11
   .quad offset .L.data.bytes.2 + 8
.align 8
.L.data.bytes.3:
   .quad 21
   .byte 0x72 
   .byte 0x65 
   .byte 0x65 
   .byte 0x65 
   .byte 0x61 
   .byte 0x61 
   .byte 0x61 
   .byte 0x61 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x20 
   .byte 0x62 
   .byte 0x61 
   .byte 0x64 
   .byte 0x20 
   .byte 0x6d 
   .byte 0x61 
   .byte 0x6e 
   .byte 0x21 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.3:
   .quad 21
   .quad offset .L.data.bytes.3 + 8
.align 8
.L.data.bytes.4:
   .quad 10
   .byte 0x6f 
   .byte 0x68 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x68 
   .byte 0x20 
   .byte 0x4f 
   .byte 0x68 
   .byte 0x68 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.4:
   .quad 10
   .quad offset .L.data.bytes.4 + 8
.align 8
.L.data.bytes.5:
   .quad 11
   .byte 0x73 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x64 
   .byte 0x20 
   .byte 0x6e 
   .byte 0x75 
   .byte 0x64 
   .byte 0x65 
   .byte 0x73 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.5:
   .quad 11
   .quad offset .L.data.bytes.5 + 8
.align 16
string1:
   .quad 21
   .quad offset .L.data.bytes.3 + 8
.align 16
string2:
   .quad 10
   .quad offset .L.data.bytes.4 + 8
.align 16
string3:
   .quad 11
   .quad offset .L.data.bytes.5 + 8
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
   sub rsp, 0
   lea rax, [write]
   push rax
   push offset string1
   pop rax
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [write]
   push rax
   push offset string3
   pop rax
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [write]
   push rax
   push offset string2
   pop rax
   push rax
   pop rdi
   pop rax
   call rax
   mov rax, 5
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   push offset string3
   pop rax
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 116
   pop rdi
   mov [rdi], al
   mov rax, 6
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   push offset string3
   pop rax
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 105
   pop rdi
   mov [rdi], al
   mov rax, 7
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   push offset string3
   pop rax
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 116
   pop rdi
   mov [rdi], al
   mov rax, 8
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   push offset string3
   pop rax
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 116
   pop rdi
   mov [rdi], al
   lea rax, [write]
   push rax
   push offset string3
   pop rax
   push rax
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

