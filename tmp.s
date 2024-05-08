.intel_syntax noprefix
.data
.align 8
.L.data.bytes.0:
   .quad 9
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.0:
   .quad 9
   .quad offset .L.data.bytes.0 + 8
.align 8
.L.data.bytes.1:
   .quad 11
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.1:
   .quad 11
   .quad offset .L.data.bytes.1 + 8
.align 8
.L.data.bytes.2:
   .quad 9
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.2:
   .quad 9
   .quad offset .L.data.bytes.2 + 8
.align 8
.L.data.bytes.3:
   .quad 11
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.3:
   .quad 11
   .quad offset .L.data.bytes.3 + 8
.align 8
.L.data.bytes.4:
   .quad 9
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.4:
   .quad 9
   .quad offset .L.data.bytes.4 + 8
.align 8
.L.data.bytes.5:
   .quad 11
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.5:
   .quad 11
   .quad offset .L.data.bytes.5 + 8
.align 8
.L.data.bytes.6:
   .quad 9
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x6f 
   .byte 0x6b 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.6:
   .quad 9
   .quad offset .L.data.bytes.6 + 8
.align 8
.L.data.bytes.7:
   .quad 11
   .byte 0x74 
   .byte 0x65 
   .byte 0x73 
   .byte 0x74 
   .byte 0x3a 
   .byte 0x20 
   .byte 0x66 
   .byte 0x61 
   .byte 0x69 
   .byte 0x6c 
   .byte 0xa 
   .byte 0
.align 8
.L.data.strings.7:
   .quad 11
   .quad offset .L.data.bytes.7 + 8
.align 4
total:
   .4byte 0
.align 4
passed:
   .4byte 0
.align 4
failed:
   .4byte 0
.bss
.data
.align 8
__argc__: .quad 0
__argv__: .quad 0
.text

.global _start
_start:
   mov rax, [rsp]
   mov rcx, [rsp+8]
   mov [__argc__], rax
   mov [__argv__], rcx
   call main
   mov rdi, rax
   mov rax, 60
   syscall
.text
.global useBar
useBar:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-2], di
   lea rax, [rbp-2]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   lea rax, [rbp-2]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   jmp .L.endfn.0
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global useBarBig
useBarBig:
   push rbp
   mov rbp, rsp
   sub rsp, 80
   mov [rbp-8], rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-80]
   add rax, 16
   mov rax, [rax]
   push rax
   lea rax, [rbp-56]
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-56]
   add rax, 8
   mov rax, [rax]
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-32]
   add rax, 0
   mov rax, [rax]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   jmp .L.endfn.1
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global makeBar
makeBar:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   sub rsp, 8
   lea rax, [rbp-8]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 20
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 8
   pop rdi
   mov [rdi], al
   add rsp, 8
   mov rax, [rbp-8]
   jmp .L.endfn.2
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global makeBigBar
makeBigBar:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   mov rax, [rbp-8]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 20
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 8
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 13
   pop rdi
   mov [rdi], rax
   add rsp, 8
   mov rax, [rbp-8]
   jmp .L.endfn.3
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

.global returnBar
returnBar:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   lea rax, [makeBar]
   push rax
   pop rax
   call rax
   jmp .L.endfn.4
.L.endfn.4:
   mov rsp, rbp
   pop rbp
   ret

.global returnBigBar
returnBigBar:
   push rbp
   mov rbp, rsp
   sub rsp, 32
   mov [rbp-8], rdi
   mov rax, [rbp-8]
   push rax
   lea rax, [makeBigBar]
   push rax
   lea rax, [rbp-32]
   push rax
   pop rdi
   pop rax
   call rax
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   jmp .L.endfn.5
.L.endfn.5:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 1200
   lea rax, [test_eql]
   push rax
   mov rax, 8
   push rax
   mov rax, 8
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   mov rax, 24
   push rax
   mov rax, 24
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   mov rax, 1
   push rax
   mov rax, 1
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-120]
   push rax
   lea rax, [rbp-48]
   mov qword ptr [rax], 5
   add rax, 8
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
   mov rax, 2
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 24
   push rdi
   mov rax, 4
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 32
   push rdi
   mov rax, 5
   pop rdi
   mov [rdi], rax
   add rsp, 8
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-64]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-48]
   add rax, 8
   imul rdx, 8
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-80]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-64]
   add rax, 8
   mov rax, [rax]
   imul rdx, 8
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-96]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-80]
   add rax, 8
   mov rax, [rax]
   imul rdx, 8
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 1
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-112]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-96]
   add rax, 8
   mov rax, [rax]
   imul rdx, 8
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   push rax
   mov rax, 8
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-112]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-120]
   mov rax, [rax]
   push rax
   mov rax, 1
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [useBar]
   push rax
   lea rax, [rbp-122]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], al
   add rsp, 8
   lea rax, [rbp-122]
   movsx rax, word ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   push rax
   mov rax, 10
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [useBar]
   push rax
   lea rax, [rbp-124]
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   add rsp, 8
   lea rax, [rbp-124]
   movsx rax, word ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   push rax
   mov rax, 14
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [useBarBig]
   push rax
   lea rax, [rbp-152]
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
   mov rax, 2
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], rax
   add rsp, 8
   lea rax, [rbp-152]
   push rax
   pop rdi
   pop rax
   call rax
   push rax
   mov rax, 6
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-154]
   push rax
   lea rax, [makeBar]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-154]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 20
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-158]
   push rax
   lea rax, [makeBar]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-158]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   lea rax, [rbp-156]
   push rax
   lea rax, [makeBar]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-156]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 28
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [makeBigBar]
   push rax
   lea rax, [rbp-184]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-184]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 20
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [makeBigBar]
   push rax
   lea rax, [rbp-208]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-208]
   add rax, 8
   mov rax, [rax]
   push rax
   mov rax, 8
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [makeBigBar]
   push rax
   lea rax, [rbp-232]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-232]
   add rax, 16
   mov rax, [rax]
   push rax
   mov rax, 13
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-234]
   push rax
   lea rax, [returnBar]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-234]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 20
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-238]
   push rax
   lea rax, [makeBar]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-238]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   lea rax, [rbp-236]
   push rax
   lea rax, [returnBar]
   push rax
   pop rax
   call rax
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-236]
   add rax, 0
   movsx rax, byte ptr [rax]
   pop rdi
   add rax, rdi
   push rax
   mov rax, 28
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [returnBigBar]
   push rax
   lea rax, [rbp-264]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-264]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 20
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [returnBigBar]
   push rax
   lea rax, [rbp-288]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-288]
   add rax, 8
   mov rax, [rax]
   push rax
   mov rax, 8
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [returnBigBar]
   push rax
   lea rax, [rbp-312]
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-312]
   add rax, 16
   mov rax, [rax]
   push rax
   mov rax, 13
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-328]
   mov qword ptr [rax], 4
   add rax, 8
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 2
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 3
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 4
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 5
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 6
   push rdi
   mov rax, 7
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 7
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], al
   add rsp, 8
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-328]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 4
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-330]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-328]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-330]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 7
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-332]
   push rax
   mov rax, 8
   push rax
   mov rax, 3
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-328]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-332]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 3
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
   lea rax, [rbp-328]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 9
   pop rdi
   mov [rdi], al
   pop rdi
   push rdi
   add rdi, 1
   push rdi
   mov rax, 23
   pop rdi
   mov [rdi], al
   add rsp, 8
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-334]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-328]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-334]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 9
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-336]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-328]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-336]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 23
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [rbp-416]
   mov qword ptr [rax], 3
   add rax, 8
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
   mov rax, 2
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 24
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 32
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 40
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 48
   push rdi
   mov rax, 1
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 56
   push rdi
   mov rax, 2
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 64
   push rdi
   mov rax, 3
   pop rdi
   mov [rdi], rax
   add rsp, 8
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-416]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   push rdi
   add rdi, 0
   push rdi
   mov rax, 50
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 8
   push rdi
   mov rax, 51
   pop rdi
   mov [rdi], rax
   pop rdi
   push rdi
   add rdi, 16
   push rdi
   mov rax, 52
   pop rdi
   mov [rdi], rax
   add rsp, 8
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-440]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-440]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 50
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-464]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-464]
   add rax, 8
   mov rax, [rax]
   push rax
   mov rax, 51
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-488]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-488]
   add rax, 16
   mov rax, [rax]
   push rax
   mov rax, 52
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-512]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-512]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 4
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-530]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-528]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-528]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-530]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 9
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-562]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-560]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 3
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-560]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-562]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-610]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-592]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-608]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-592]
   add rax, 8
   mov rax, [rax]
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-608]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-610]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 9
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-658]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-640]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-656]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-640]
   add rax, 8
   mov rax, [rax]
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-656]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-658]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 23
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-722]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-688]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-704]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-688]
   add rax, 8
   mov rax, [rax]
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-720]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-704]
   add rax, 8
   mov rax, [rax]
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-720]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-722]
   add rax, 0
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 7
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-786]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 4
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-752]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-328]
   add rax, 8
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-768]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-752]
   add rax, 8
   mov rax, [rax]
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-784]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-768]
   add rax, 8
   mov rax, [rax]
   imul rdx, 2
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   mov rax, 2
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-784]
   add rax, 8
   mov rax, [rax]
   pop rdi
   add rax, rdi
   movsx rax, word ptr [rax]
   pop rdi
   mov [rdi], ax
   lea rax, [rbp-786]
   add rax, 1
   movsx rax, byte ptr [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-840]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-816]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-416]
   add rax, 8
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-816]
   add rax, 8
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-840]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 50
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-888]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-864]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-416]
   add rax, 8
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-864]
   add rax, 8
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-888]
   add rax, 8
   mov rax, [rax]
   push rax
   mov rax, 51
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-936]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-912]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-416]
   add rax, 8
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-912]
   add rax, 8
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-936]
   add rax, 16
   mov rax, [rax]
   push rax
   mov rax, 52
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-1000]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-960]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-416]
   add rax, 8
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-976]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-960]
   add rax, 8
   mov rax, [rax]
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-976]
   add rax, 8
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-1000]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 1
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-1064]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-1024]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-416]
   add rax, 8
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-1040]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-1024]
   add rax, 8
   mov rax, [rax]
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-1040]
   add rax, 8
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-1064]
   add rax, 8
   mov rax, [rax]
   push rax
   mov rax, 2
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-1128]
   push rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 3
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-1088]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-416]
   add rax, 8
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 0
   mov rdx, rax
   push rax
   mov rax, 2
   pop rdi
   sub rax, rdi
   mov rcx, rax
   lea rax, [rbp-1104]
   mov [rax], rcx
   add rax, 8
   push rax
   lea rax, [rbp-1088]
   add rax, 8
   mov rax, [rax]
   imul rdx, 24
   add rax, rdx
   pop rdi
   mov [rdi], rax
   mov rax, 1
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-1104]
   add rax, 8
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-1128]
   add rax, 16
   mov rax, [rax]
   push rax
   mov rax, 3
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [makeBigBar]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
   pop rdi
   add rax, rdi
   push rax
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-1152]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-1152]
   add rax, 0
   mov rax, [rax]
   push rax
   mov rax, 20
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-1176]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-1176]
   add rax, 8
   mov rax, [rax]
   push rax
   mov rax, 8
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
   lea rax, [test_eql]
   push rax
   lea rax, [rbp-1200]
   push rax
   mov rax, 8
   push rax
   mov rax, 2
   push rax
   mov rax, 24
   pop rdi
   imul rax, rdi
   push rax
   lea rax, [rbp-416]
   pop rdi
   add rax, rdi
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
   mov cl, [rax+16]
   mov [rdi+16], cl
   mov cl, [rax+17]
   mov [rdi+17], cl
   mov cl, [rax+18]
   mov [rdi+18], cl
   mov cl, [rax+19]
   mov [rdi+19], cl
   mov cl, [rax+20]
   mov [rdi+20], cl
   mov cl, [rax+21]
   mov [rdi+21], cl
   mov cl, [rax+22]
   mov [rdi+22], cl
   mov cl, [rax+23]
   mov [rdi+23], cl
   lea rax, [rbp-1200]
   add rax, 16
   mov rax, [rax]
   push rax
   mov rax, 13
   push rax
   pop rsi
   pop rdi
   pop rax
   call rax
.L.endfn.6:
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
.L.endfn.7:
   mov rsp, rbp
   pop rbp
   ret

.global test
test:
   push rbp
   mov rbp, rsp
   sub rsp, 48
   mov [rbp-1], dil
   push offset total
   pop rax
   push rax
   mov rax, 1
   push rax
   push offset total
   pop rax
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   cmp rax, 0
   je .L.else.9
   lea rax, [write]
   push rax
   lea rax, [rbp-32]
   push rax
   lea rax, .L.data.strings.4
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
   push offset passed
   pop rax
   push rax
   mov rax, 1
   push rax
   push offset passed
   pop rax
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.9
.L.else.9:
   lea rax, [write]
   push rax
   lea rax, [rbp-48]
   push rax
   lea rax, .L.data.strings.5
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
   push offset failed
   pop rax
   push rax
   mov rax, 1
   push rax
   push offset failed
   pop rax
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
.L.end.9:
.L.endfn.8:
   mov rsp, rbp
   pop rbp
   ret

.global test_eql
test_eql:
   push rbp
   mov rbp, rsp
   sub rsp, 48
   mov [rbp-1], dil
   mov [rbp-2], sil
   push offset total
   pop rax
   push rax
   mov rax, 1
   push rax
   push offset total
   pop rax
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
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
   je .L.else.11
   lea rax, [write]
   push rax
   lea rax, [rbp-32]
   push rax
   lea rax, .L.data.strings.6
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
   push offset passed
   pop rax
   push rax
   mov rax, 1
   push rax
   push offset passed
   pop rax
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   jmp .L.end.11
.L.else.11:
   push offset failed
   pop rax
   push rax
   mov rax, 1
   push rax
   push offset failed
   pop rax
   movsxd rax, dword ptr [rax]
   pop rdi
   add rax, rdi
   pop rdi
   mov [rdi], eax
   lea rax, [write]
   push rax
   lea rax, [rbp-48]
   push rax
   lea rax, .L.data.strings.7
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
.L.end.11:
.L.endfn.10:
   mov rsp, rbp
   pop rbp
   ret

