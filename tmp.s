.intel_syntax noprefix
.data
.bss
.text
.global foo
foo:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global foonew
foonew:
   push rbp
   mov rbp, rsp
   sub rsp, 40
   mov [rbp-8], rdi
   mov [rbp-16], rsi
   mov [rbp-24], rdx
   lea rax, [rbp-40]
   add rax, 0
   push rax
   lea rax, [rbp-16]
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-40]
   add rax, 8
   push rax
   lea rax, [rbp-24]
   mov rax, [rax]
   pop rdi
   mov [rdi], rax
   mov rax, [rbp-8]
   push rax
   lea rax, [rbp-40]
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global foozero
foozero:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 0
   push rax
   mov rax, 5
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-8]
   mov rax, [rax]
   add rax, 8
   push rax
   mov rax, 5
   pop rdi
   mov [rdi], rax
   xor rax, rax
.L.endfn.2:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 24
   lea rax, [rbp-16]
   push rax
   mov rax, 2
   push rax
   mov rax, 3
   push rax
   pop rdx
   pop rsi
   pop rdi
   call foonew
   lea rax, [rbp-24]
   push rax
   lea rax, [rbp-16]
   push rax
   pop rdi
   call foozero
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-16]
   add rax, 8
   mov rax, [rax]
   push rax
   lea rax, [rbp-16]
   add rax, 0
   mov rax, [rax]
   pop rdi
   add rax, rdi
   jmp .L.endfn.3
   xor rax, rax
.L.endfn.3:
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
