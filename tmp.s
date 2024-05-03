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
.L.data.strings.2:
   .quad 12
   .quad offset .L.data.bytes.2 + 8
.align 8
.L.data.bytes.3:
   .quad 12
   .byte 0x6b 
   .byte 0x77 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x64 
   .byte 0x61 
   .byte 0x20 
   .byte 0x68 
   .byte 0x75 
   .byte 0x6b 
   .byte 0x6f 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.3:
   .quad 12
   .quad offset .L.data.bytes.3 + 8
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

.global test_eq
test_eq:
   push rbp
   mov rbp, rsp
   sub rsp, 16
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
   je .L.else.2
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.0
   push rax
   pop rdi
   pop rax
   call rax
   mov rax, 0
   jmp .L.endfn.1
   jmp .L.end.2
.L.else.2:
.L.end.2:
   lea rax, [write]
   push rax
   lea rax, .L.data.strings.1
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   lea rax, [rbp-16]
   push rax
   mov rax, 1
cmp rax, 0
jz .L.else.4
.L.if.4:
   lea rax, .L.data.strings.2
jmp .L.endif.4
.L.else.4:
   lea rax, .L.data.strings.3
.L.endif.4:
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   lea rax, [write]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

