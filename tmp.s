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
.global Baradd
Baradd:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], al
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 1
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 1
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], al
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global Barzero
Barzero:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 1
   push rax
   mov rax, 0
   pop rdi
   mov [rdi], al
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global Barset
Barset:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   mov [rbp-8], rdi
   mov [rbp-9], sil
   mov [rbp-10], dl
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   push rax
   lea rax, [rbp-9]
   movsx rax, byte ptr [rax]
   pop rdi
   mov [rdi], al
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 1
   push rax
   lea rax, [rbp-10]
   movsx rax, byte ptr [rax]
   pop rdi
   mov [rdi], al
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global BargetSum
BargetSum:
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
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 144
   lea rax, [rbp-68]
   mov qword ptr [rax], 3
   add rax, 8
   push rax
   pop rdi
   push rdi
   mov qword ptr [rdi+0], 3
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 12
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   mov qword ptr [rdi+20], 3
   pop rdi
   push rdi
   add rdi, 28
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 32
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 36
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   mov qword ptr [rdi+40], 3
   pop rdi
   push rdi
   add rdi, 48
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 52
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   pop rdi
   push rdi
   add rdi, 56
   push rdi
   mov rax, 99
   pop rdi
   mov [rdi], eax
   add rsp, 8
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
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
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
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
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
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
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
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
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
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
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
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
   mov rax, 4
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsxd rax, dword ptr [rax]
   push rax
   mov rax, 99
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
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
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
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
   mov rax, 20
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-68]
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
   lea rax, [rbp-122]
   mov qword ptr [rax], 3
   add rax, 8
   push rax
   pop rdi
   push rdi
   mov qword ptr [rdi+0], 3
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 9
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 10
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 11
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 12
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 13
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   mov qword ptr [rdi+14], 3
   pop rdi
   push rdi
   add rdi, 22
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 23
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 24
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 25
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 26
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 27
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   mov qword ptr [rdi+28], 3
   pop rdi
   push rdi
   add rdi, 36
   push rdi
   mov rax, 0
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 37
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 38
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 39
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 40
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 41
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], al
   add rsp, 8
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-144]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-122]
   add rax, 8
   imul rdx, 14
   add rax, rdx
   pop rdi
   mov [rdi], rax
   lea rax, [test_eq]
   push rax
   lea rax, [rbp-144]
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
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
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
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
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
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
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
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 0
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 1
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 0
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 1
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 0
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 1
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 0
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 0
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 0
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 0
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 1
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 1
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 1
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 0
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 2
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 2
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   push rax
   mov rax, 5
   pop rdi
   mov [rdi], al
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   push rax
   mov rax, 5
   pop rdi
   mov [rdi], al
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 10
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   push rax
   mov rax, 6
   pop rdi
   mov [rdi], al
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   push rax
   mov rax, 9
   pop rdi
   mov [rdi], al
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 1
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 15
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [Barzero]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 0
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [Baradd]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [Barset]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   mov rax, 6
   push rax
   mov rax, 9
   push rax
   pop rdx
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
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 15
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eq]
   push rax
   lea rax, [BargetSum]
   push rax
   mov rax, 8
   push rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   mov rax, 2
   push rax
   mov rax, 14
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-144]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   pop rax
   call rax
   push rax
   mov rax, 15
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
.L.endfn.4:
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
.L.endfn.5:
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
   je .L.else.7
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
   jmp .L.endfn.6
   jmp .L.end.7
.L.else.7:
.L.end.7:
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
.L.endfn.6:
   mov rsp, rbp
   pop rbp
   ret

