.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 11
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
   .byte 0
.align 8
.L.data.strings.0:
   .quad 11
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
   sub rsp, 40
   lea rax, [rbp-16]
   push rax
   lea rax, .L.data.strings.0
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   mov rax, -1
mov [rbp-32], rax
   mov rax, 96
mov [rbp-40], rax
.L.continue.2:
inc qword ptr [rbp-32]
lea rax, [rbp-24]
   push rax
   lea rax, [rbp-16]
add rax, 8
mov rax, [rax]
mov rdi, qword ptr [rbp-32]
imul rdi, 1
add rax, rdi
   pop rdi
mov [rdi], rax
inc qword ptr [rbp-40]
   lea rax, [rbp-24]
   mov rax, [rax]
   push rax
   lea rax, [rbp-40]
   mov rax, [rax]
   pop rdi
   mov [rdi], al
   lea rax, [rbp-16]
mov rax, [rax]
   cmp [rbp-32], rax
   jge .L.break.2
   jmp .L.continue.2
.L.break.2:
   lea rax, [write]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

