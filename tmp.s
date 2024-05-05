.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 12
   .byte 0x64 
   .byte 0x65 
   .byte 0x66 
   .byte 0x65 
   .byte 0x72 
   .byte 0x20 
   .byte 0x62 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x63 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 12
   .quad offset .L.data.bytes.0 + 8
.align 8
.L.data.bytes.1:
   .quad 18
   .byte 0x64 
   .byte 0x65 
   .byte 0x66 
   .byte 0x65 
   .byte 0x72 
   .byte 0x20 
   .byte 0x69 
   .byte 0x6e 
   .byte 0x6e 
   .byte 0x65 
   .byte 0x72 
   .byte 0x20 
   .byte 0x62 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x63 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 18
   .quad offset .L.data.bytes.1 + 8
.align 8
.L.data.bytes.2:
   .quad 12
   .byte 0x77 
   .byte 0x72 
   .byte 0x69 
   .byte 0x74 
   .byte 0x65 
   .byte 0x20 
   .byte 0x66 
   .byte 0x69 
   .byte 0x72 
   .byte 0x73 
   .byte 0x74 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.2:
   .quad 12
   .quad offset .L.data.bytes.2 + 8
.bss
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
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.2
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.1
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.0
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

