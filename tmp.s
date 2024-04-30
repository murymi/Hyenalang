.intel_syntax noprefix
.data
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

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-4]
   push rax
   mov rax, 1
   push rax
   mov rax, 4
   pop rdi
   mov rcx, rdi
.L.shr.2:
   shr rax
   loop .L.shr.2
   pop rdi
   mov [rdi], eax
   lea rax, [rbp-4]
   push rax
   mov rax, 1
   push rax
   lea rax, [rbp-4]
   movsxd rax, dword ptr [rax]
   pop rdi
   mov rcx, rdi
.L.shl.3:
   shl rax
   loop .L.shl.3
   pop rdi
   mov [rdi], eax
   lea rax, [rbp-4]
   movsxd rax, dword ptr [rax]
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
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
