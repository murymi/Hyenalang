.intel_syntax noprefix
.data
.bss
.text
.global makenum
makenum:
   push rbp
   mov rbp, rsp
   sub rsp, 0
   mov rax, 10
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
   mov rsp, rbp
   pop rbp
   ret

.global add
add:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-4], edi
   mov [rbp-8], esi
# load address of var
   lea rax, [rbp-8]
# load
   movsxd rax, dword ptr [rax]
# end load
   push rax
# load address of var
   lea rax, [rbp-4]
# load
   movsxd rax, dword ptr [rax]
# end load
   pop rdi
   add rax, rdi
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
   sub rsp, 8
# assign variable
# generate address of variable
# load address of var
   lea rax, [rbp-4]
# address of variable generated
   push rax
# generate value to assign
   call makenum
   push rax
   call makenum
   push rax
   pop rsi
   pop rdi
   call add
# store value to variable address
# store
   pop rdi
   mov [rdi], eax
# end store
# load address of var
   lea rax, [rbp-4]
# load
   movsxd rax, dword ptr [rax]
# end load
   jmp .L.endfn.2
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
