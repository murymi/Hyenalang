.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 5
   .byte 0x7a 
   .byte 0x65 
   .byte 0x72 
   .byte 0x6f 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 5
   .quad offset .L.data.bytes.0 + 8
.align 8
.L.data.bytes.1:
   .quad 13
   .byte 0x68 
   .byte 0x69 
   .byte 0x20 
   .byte 0x66 
   .byte 0x72 
   .byte 0x6f 
   .byte 0x6d 
   .byte 0x20 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x6f 
   .byte 0x70 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 13
   .quad offset .L.data.bytes.1 + 8
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
   sub rsp, 24
   lea rax, [rbp-4]
   push rax
   mov rax, 42
   pop rdi
   mov [rdi], eax
   mov qword ptr [rbp-16], -1
   mov qword ptr [rbp-24], -1
.L.continue.2:
   inc qword ptr [rbp-16]
   inc qword ptr [rbp-24]
   mov rax, 0
   push rax
   lea rax, [rbp-16]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   sete al
   movzb rax, al
   cmp rax, 0
   je .L.else.3
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.0
   push rax
   pop rdi
   pop rax
   call rax
   jmp .L.end.3
.L.else.3:
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.1
   push rax
   pop rdi
   pop rax
   call rax
.L.end.3:
   mov rax, [rbp-16]
   cmp rax, 9
   jge .L.break.2
   jmp .L.continue.2
.L.break.2:
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

