.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 6
   .byte 0x68 
   .byte 0x65 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 6
   .quad offset .L.data.bytes.0 + 8
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
   mov rax, 20
cmp rax, 0
sete al
movzb rax, al
   cmp rax, 0
   je .L.else.2
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.0
   push rax
   pop rdi
   pop rax
   call rax
   jmp .L.end.2
.L.else.2:
.L.end.2:
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

