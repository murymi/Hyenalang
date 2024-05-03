.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 12
   .byte 0x68 
   .byte 0x65 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x20 
   .byte 0x77 
   .byte 0x6f 
   .byte 0x72 
   .byte 0x6c 
   .byte 0x64 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 12
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
   sub rsp, 8
   lea rax, [rbp-4]
   push rax
   mov rax, 42
   pop rdi
   mov [rdi], eax
   lea rax, [rbp-4]
   movsxd rax, dword ptr [rax]
   cmp rax, 20
   je .L.2.p.0
cmp rax, 30
jl .L.2.p.else
cmp rax, 50
jg .L.2.p.else
jmp jmp .L.2.p.1
   cmp rax, 0
   je .L.2.p.1
   cmp rax, 40
   je .L.2.p.2
   jmp .L.2.p.else
.L.2.p.0:
   jmp .L.end.2
.L.2.p.1:
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.0
   push rax
   pop rdi
   pop rax
   call rax
   jmp .L.end.2
.L.2.p.2:
   jmp .L.end.2
.L.2.p.else:
.L.end.2:
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

