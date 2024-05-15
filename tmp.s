.intel_syntax noprefix
.data
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
   sub rsp, 0
   lea rax, [stringsis_alnum]
   push rax
   mov rax, 57
   push rax
   pop rdi
   pop rax
   call rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global stringsis_number
stringsis_number:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
   mov rax, 48
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   setge al
   movzb rax, al
   push rax
   mov rax, 57
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   setle al
   movzb rax, al
   pop rdi
   cmp rax, 0
   je .L.fail.2
   cmp rdi, 0
   je .L.fail.2
   mov rax, 1
   jmp .L.finish.2
.L.fail.2:
   xor rax, rax
.L.finish.2:
   jmp .L.endfn.1
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global stringsis_alpha
stringsis_alpha:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
   mov rax, 95
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   sete al
   movzb rax, al
   push rax
   mov rax, 90
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   setle al
   movzb rax, al
   push rax
   mov rax, 65
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   setge al
   movzb rax, al
   pop rdi
   cmp rax, 0
   je .L.fail.4
   cmp rdi, 0
   je .L.fail.4
   mov rax, 1
   jmp .L.finish.4
.L.fail.4:
   xor rax, rax
.L.finish.4:
   push rax
   mov rax, 122
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   setle al
   movzb rax, al
   push rax
   mov rax, 97
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   pop rdi
   cmp rax, rdi
   setge al
   movzb rax, al
   pop rdi
   cmp rax, 0
   je .L.fail.5
   cmp rdi, 0
   je .L.fail.5
   mov rax, 1
   jmp .L.finish.5
.L.fail.5:
   xor rax, rax
.L.finish.5:
   pop rdi
   cmp rax, 0
   je .L.step2.6
   mov rax, 1
   jmp .L.finish.6
.L.step2.6:
   cmp rdi, 0
   je .L.finish.6
   mov rax, 1
.L.finish.6:
   pop rdi
   cmp rax, 0
   je .L.step2.7
   mov rax, 1
   jmp .L.finish.7
.L.step2.7:
   cmp rdi, 0
   je .L.finish.7
   mov rax, 1
.L.finish.7:
   jmp .L.endfn.3
.L.endfn.3:
   mov rsp, rbp
   pop rbp
   ret

.global stringsis_alnum
stringsis_alnum:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-1], dil
   lea rax, [stringsis_alpha]
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   push rax
   lea rax, [stringsis_number]
   push rax
   lea rax, [rbp-1]
   movsx rax, byte ptr [rax]
   push rax
   pop rdi
   pop rax
   call rax
   pop rdi
   cmp rax, 0
   je .L.step2.9
   mov rax, 1
   jmp .L.finish.9
.L.step2.9:
   cmp rdi, 0
   je .L.finish.9
   mov rax, 1
.L.finish.9:
   jmp .L.endfn.8
.L.endfn.8:
   mov rsp, rbp
   pop rbp
   ret

