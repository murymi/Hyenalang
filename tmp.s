.intel_syntax noprefix
.data
.bss
.text
.global makepoint
makepoint:
   push rbp
   mov rbp, rsp
   sub rsp, 24
   mov [rbp-8], rdi
   mov rax, [rbp-8]
   push rax
# load address of var
   lea rax, [rbp-24]
   pop rdi
   movq rcx, [rax+0]
   movq [rdi+0], rcx
   movq rcx, [rax+8]
   movq [rdi+8], rcx
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global usepoint
usepoint:
   push rbp
   mov rbp, rsp
   sub rsp, 16
   mov [rbp-8], rdi
# getting struct member
# deref
# load address of var
   lea rax, [rbp-8]
# load
   mov rax, [rax]
# end load
# end deref
# add offset of member
   add rax, 8
# end add offset
# load
   mov rax, [rax]
# end load
   jmp .L.endfn.1
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
# load address of var
   lea rax, [rbp-16]
   push rax
   pop rdi
   call makepoint
# load address of var
   lea rax, [rbp-16]
   push rax
   pop rdi
   call usepoint
   xor rax, rax
.L.endfn.2:
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
