.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 9
   .byte 0x2e 
   .byte 0x2f 
   .byte 0x63 
   .byte 0x2e 
   .byte 0x68 
   .byte 0x79 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x61 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 9
   .quad offset .L.data.bytes.0 + 8
.align 8
.L.data.bytes.1:
   .quad 2
   .byte 0x25 
   .byte 0x73 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 2
   .quad offset .L.data.bytes.1 + 8
.align 8
.L.data.bytes.2:
   .quad 1
   .byte 0x72 
   .byte 0
.align 8
.L.data.strings.2:
   .quad 1
   .quad offset .L.data.bytes.2 + 8
.align 8
.L.data.bytes.3:
   .quad 13
   .byte 0x6d 
   .byte 0x61 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x63 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x64 
   .byte 0
.align 8
.L.data.strings.3:
   .quad 13
   .quad offset .L.data.bytes.3 + 8
.align 8
.L.data.bytes.4:
   .quad 22
   .byte 0x46 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x64 
   .byte 0x20 
   .byte 0x74 
   .byte 0x6f 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x70 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x20 
   .byte 0x66 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x20 
   .byte 0x25 
   .byte 0x73 
   .byte 0
.align 8
.L.data.strings.4:
   .quad 22
   .quad offset .L.data.bytes.4 + 8
.align 8
.L.data.bytes.5:
   .quad 9
   .byte 0x2e 
   .byte 0x2f 
   .byte 0x63 
   .byte 0x2e 
   .byte 0x68 
   .byte 0x79 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x61 
   .byte 0
.align 8
.L.data.strings.5:
   .quad 9
   .quad offset .L.data.bytes.5 + 8
.align 8
.L.data.bytes.6:
   .quad 2
   .byte 0x25 
   .byte 0x73 
   .byte 0
.align 8
.L.data.strings.6:
   .quad 2
   .quad offset .L.data.bytes.6 + 8
.align 8
.L.data.bytes.7:
   .quad 1
   .byte 0x72 
   .byte 0
.align 8
.L.data.strings.7:
   .quad 1
   .quad offset .L.data.bytes.7 + 8
.align 8
.L.data.bytes.8:
   .quad 13
   .byte 0x6d 
   .byte 0x61 
   .byte 0x6c 
   .byte 0x6c 
   .byte 0x6f 
   .byte 0x63 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x64 
   .byte 0
.align 8
.L.data.strings.8:
   .quad 13
   .quad offset .L.data.bytes.8 + 8
.align 8
.L.data.bytes.9:
   .quad 22
   .byte 0x46 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x64 
   .byte 0x20 
   .byte 0x74 
   .byte 0x6f 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x70 
   .byte 0x65 
   .byte 0x6e 
   .byte 0x20 
   .byte 0x66 
   .byte 0x69 
   .byte 0x6c 
   .byte 0x65 
   .byte 0x20 
   .byte 0x25 
   .byte 0x73 
   .byte 0
.align 8
.L.data.strings.9:
   .quad 22
   .quad offset .L.data.bytes.9 + 8
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
   lea rax, [fileread_to_string]
   push rax
   lea rax, [rbp-16]
   push rax
   lea rax, .L.data.strings.5
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [fmtprint]
   push rax
   lea rax, .L.data.strings.6
   push rax
   lea rax, [rbp-48]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   lea rax, [rbp-16]
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
   add rsp, 8
   lea rax, [rbp-48]
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global fmtwrite_char
fmtwrite_char:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
   lea rax, [write]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-1]
   push rax
   mov rax, 1
   push rax
   pop rdx
   pop rsi
   pop rdi
   pop rax
   call rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global fmtwrite_int
fmtwrite_int:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   mov [rbp-8], rdi
   mov rax, 0
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   setl al
   movzb rax, al
   cmp rax, 0
   je .L.else.3
   lea rax, [rbp-8]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   neg rax
   pop rdi
   mov [rdi], rax
   lea rax, [fmtwrite_char]
   push rax
   mov rax, 45
   push rax
   pop rdi
   pop rax
   call rax
   jmp .L.end.3
.L.else.3:
.L.end.3:
   mov rax, 0
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   setle al
   movzb rax, al
   cmp rax, 0
   je .L.else.4
   mov rax, 0
   jmp .L.endfn.2
   jmp .L.end.4
.L.else.4:
.L.end.4:
   lea rax, [rbp-16]
   push rax
   mov rax, 48
   push rax
   mov rax, 10
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cqo
   idiv rdi
   mov rax, rdx
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], rax
   lea rax, [fmtwrite_int]
   push rax
   mov rax, 10
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cqo
   idiv rdi
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [fmtwrite_char]
   push rax
   lea rax, [rbp-16]
   mov rax, [rax]
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global fmtwrite_integer
fmtwrite_integer:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   mov rax, 0
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   pop rdi
   cmp rax, rdi
   sete al
   movzb rax, al
   cmp rax, 0
   je .L.else.6
   lea rax, [fmtwrite_char]
   push rax
   mov rax, 48
   push rax
   pop rdi
   pop rax
   call rax
   mov rax, 0
   jmp .L.endfn.5
   jmp .L.end.6
.L.else.6:
.L.end.6:
   lea rax, [fmtwrite_int]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.5:
   mov rsp, rbp
   pop rbp
   ret

.global fmtprintln
fmtprintln:
   push rbp
   mov rbp, rsp
   sub rsp, 32
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   lea rax, [fmtprint]
   push rax
   lea rax, [rbp-32]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
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
   lea rax, [rbp-16]
   mov rax, [rax]
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [fmtwrite_char]
   push rax
   mov rax, 10
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.7:
   mov rsp, rbp
   pop rbp
   ret

.global fmtprint
fmtprint:
   push rbp
   mov rbp, rsp
   sub rsp, 96
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   lea rax, [rbp-17]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
   lea rax, [rbp-32]
   push rax
   lea rax, [rbp-16]
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-36]
   push rax
   mov rax, 1
   pop rdi
   mov [rdi], eax
   mov rax, -1
   mov [rbp-48], rax
   mov rax, 0
   mov [rbp-56], rax
.L.continue.9:
   lea rax, [rbp-8]
   mov rax, [rax]
   mov rax, [rax]
   dec rax
   cmp [rbp-48], rax
   jge .L.break.9
   inc qword ptr [rbp-48]
   lea rax, [rbp-37]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 8
   mov rax, [rax]
   mov rdi, qword ptr [rbp-48]
   imul rdi, 1
   add rax, rdi
   mov rax, [rax]
   pop rdi
   mov [rdi], al
   inc qword ptr [rbp-56]
   lea rax, [rbp-17]
   movsx rax, byte ptr [rax]
   cmp rax, 0
   je .L.else.10
   lea rax, [rbp-17]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
   jmp .L.continue.9
   jmp .L.end.10
.L.else.10:
.L.end.10:
   lea rax, [rbp-37]
   movsx rax, byte ptr [rax]
   cmp rax, 37
   je .L.11.p.0
   jmp .L.11.p.else
.L.11.p.0:
   lea rax, [rbp-17]
   push rax
   mov rax, 1
   pop rdi
   mov [rdi], al
   lea rax, [rbp-80]
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
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
   lea rax, [rbp-56]
   mov rax, [rax]
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-80]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, byte ptr [rax]
   cmp rax, 113
   je .L.12.p.0
   cmp rax, 100
   je .L.12.p.1
   cmp rax, 119
   je .L.12.p.2
   cmp rax, 98
   je .L.12.p.3
   cmp rax, 115
   je .L.12.p.4
   jmp .L.12.p.else
.L.12.p.0:
   lea rax, [fmtwrite_integer]
   push rax
   mov rax, 8
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   add rax, rdi
   mov rax, [rax]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-36]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.12
.L.12.p.1:
   lea rax, [fmtwrite_integer]
   push rax
   mov rax, 8
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-36]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.12
.L.12.p.2:
   lea rax, [fmtwrite_integer]
   push rax
   mov rax, 8
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-36]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.12
.L.12.p.3:
   lea rax, [fmtwrite_char]
   push rax
   mov rax, 8
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   add rax, rdi
   mov rax, [rax]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-36]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.12
.L.12.p.4:
   lea rax, [rbp-96]
   push rax
   mov rax, 8
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   add rax, rdi
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
   lea rax, [write]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-96]
   add rax, 8
   mov rax, [rax]
   push rax
   lea rax, [rbp-96]
   add rax, 0
   mov rax, [rax]
   push rax
   pop rdx
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-36]
   push rax
   mov rax, 2
   push rax
   lea rax, [rbp-36]
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.12
.L.12.p.else:
   lea rax, [fmtwrite_char]
   push rax
   lea rax, [rbp-37]
   movsx rax, byte ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-17]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
.L.end.12:
   jmp .L.end.11
.L.11.p.else:
   lea rax, [fmtwrite_char]
   push rax
   lea rax, [rbp-37]
   movsx rax, byte ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-17]
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
.L.end.11:
   jmp .L.continue.9
.L.break.9:
.L.endfn.8:
   mov rsp, rbp
   pop rbp
   ret

.global write
write:
   push rbp
   mov rbp, rsp
   sub rsp, 24
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   mov [rbp-24], rdx
# [inline asm]
   mov rax, 1
   syscall
# [end]
.L.endfn.13:
   mov rsp, rbp
   pop rbp
   ret

.global fileread_to_string
fileread_to_string:
   push rbp
   mov rbp, rsp
   sub rsp, 112
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   lea rax, [rbp-24]
   push rax
   lea rax, [fopen]
   push rax
   lea rax, [rbp-16]
   mov rax, [rax]
   add rax, 8
   mov rax, [rax]
   push rax
   lea rax, .L.data.strings.7
   add rax, 8
   mov rax, [rax]
   push rax
   pop rsi
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.16
   xor rax, rax
   call r15
   jmp .L.end.16
.L.call.16:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.16:
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-24]
   mov rax, [rax]
   cmp rax, 0
   je .L.else.15
   lea rax, [fseek]
   push rax
   lea rax, [rbp-24]
   mov rax, [rax]
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   push rax
   pop rdx
   pop rsi
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.17
   xor rax, rax
   call r15
   jmp .L.end.17
.L.call.17:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.17:
   lea rax, [rbp-32]
   push rax
   lea rax, [ftell]
   push rax
   lea rax, [rbp-24]
   mov rax, [rax]
   push rax
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.18
   xor rax, rax
   call r15
   jmp .L.end.18
.L.call.18:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.18:
   pop rdi
   mov [rdi], rax
   lea rax, [rewind]
   push rax
   lea rax, [rbp-24]
   mov rax, [rax]
   push rax
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.19
   xor rax, rax
   call r15
   jmp .L.end.19
.L.call.19:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.19:
   lea rax, [rbp-40]
   push rax
   lea rax, [malloc]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.21
   xor rax, rax
   call r15
   jmp .L.end.21
.L.call.21:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.21:
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-40]
   mov rax, [rax]
   cmp rax, 0
   je .L.else.20
   lea rax, [rbp-48]
   push rax
   mov rax, 1
   push rax
   lea rax, [fread]
   push rax
   lea rax, [rbp-40]
   mov rax, [rax]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   push rax
   lea rax, [rbp-24]
   mov rax, [rax]
   push rax
   pop rcx
   pop rdx
   pop rsi
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.22
   xor rax, rax
   call r15
   jmp .L.end.22
.L.call.22:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.22:
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   lea rax, [rbp-48]
   mov rax, [rax]
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-40]
   mov rax, [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
   lea rax, [rbp-64]
   add rax, 0
   push rax
   lea rax, [rbp-32]
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-64]
   add rax, 8
   push rax
   lea rax, [rbp-40]
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   mov rax, [rbp-8]
   push rax
   lea rax, [rbp-64]
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
   jmp .L.endfn.14
   jmp .L.end.20
.L.else.20:
   lea rax, [fmtprintln]
   push rax
   lea rax, .L.data.strings.8
   push rax
   lea rax, [rbp-72]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], rax
   add rsp, 8
   lea rax, [rbp-72]
   mov rax, [rax]
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [exit]
   push rax
   mov rax, 1
   push rax
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.23
   xor rax, rax
   call r15
   jmp .L.end.23
.L.call.23:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.23:
.L.end.20:
   jmp .L.end.15
.L.else.15:
   lea rax, [fmtprintln]
   push rax
   lea rax, .L.data.strings.9
   push rax
   lea rax, [rbp-112]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   lea rax, [rbp-16]
   mov rax, [rax]
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
   add rsp, 8
   lea rax, [rbp-112]
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [exit]
   push rax
   mov rax, 1
   push rax
   pop rdi
   pop r15
   mov rax, rsp
   and rax, 15
   jnz .L.call.24
   xor rax, rax
   call r15
   jmp .L.end.24
.L.call.24:
   sub rsp, 8
   xor rax, rax
   call r15
   add rsp, 8
.L.end.24:
.L.end.15:
.L.endfn.14:
   mov rsp, rbp
   pop rbp
   ret

