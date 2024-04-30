.intel_syntax noprefix
.data
.align 8
.L.data.strings.0:
   .quad 12
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x20 
   .byte 0x70 
   .byte 0x61 
   .byte 0x73 
   .byte 0x73 
   .byte 0x65 
   .byte 0x64 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 12
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x64 
   .byte 0xa 
   .byte 0
.align 8
.L.data.anon.0:
   .quad 12
   .quad offset .L.data.strings.0 + 8
.align 8
.L.data.anon.1:
   .quad 12
   .quad offset .L.data.strings.1 + 8
.bss
.text
.global write
write:
   push rbp
   mov rbp, rsp
   sub rsp, 16
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

.global hello
hello:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global pointnew
pointnew:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
   mov [rbp-2], sil
   lea rax, [rbp-4]
   add rax, 0
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   mov [rdi], al
   lea rax, [rbp-4]
   add rax, 1
   push rax
   lea rax, [rbp-2]
   movsx rax, byte ptr [rax]
   pop rdi
   mov [rdi], al
   lea rax, [rbp-4]
   movsx rax, word ptr [rax]
   jmp .L.endfn.2
   xor rax, rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global pointsum
pointsum:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   jmp .L.endfn.3
   xor rax, rax
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

.global assert_eql
assert_eql:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
   mov [rbp-2], sil
   lea rax, [rbp-2]
   movsx rax, byte ptr [rax]
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   sete al
   movzb rax, al
   cmp rax, 0
   je .L.else.5
   lea rax, [write]
   push rax
   lea rax, .L.data.anon.0
   push rax
   pop rdi
   pop rax
   call rax
   jmp .L.end.5
.L.else.5:
   lea rax, [write]
   push rax
   lea rax, .L.data.anon.1
   push rax
   pop rdi
   pop rax
   call rax
.L.end.5:
   xor rax, rax
.L.endfn.4:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-2]
   push rax
   lea rax, [pointnew]
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-3]
   push rax
   lea rax, [pointsum]
   push rax
   lea rax, [rbp-2]
   push rax
   pop rdi
   pop rax
   call rax
   pop rdi
   mov [rdi], al
   lea rax, [assert_eql]
   push rax
   lea rax, [rbp-3]
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   xor rax, rax
.L.endfn.6:
   mov rsp, rbp
   pop rbp
   ret

.global buitin_glibc_caller
buitin_glibc_caller:
   push rbp
   mov rbp, rsp
   mov rax, rsp
   and rax, 15
   jnz .L.call
   mov rax, 0
   call r15
   jmp .L.end
.L.call:
   sub rsp, 8
   mov rax, 0
   call r15
   add rsp, 8
.L.end:
   mov rsp, rbp
   pop rbp
   ret
