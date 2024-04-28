.intel_syntax noprefix
.data
.align 8
.L.data.strings.0:
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
.bss
.text
.global foo
foo:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   mov [rbp-8], rdi
mov rax, [rbp-8]
   push rax
   lea rax, .L.data.strings.0
   pop rdi
mov rcx, [rax]
mov [rdi], rcx
lea rcx, [rax + 8]
mov [rdi+8], rcx
mov rax, [rbp-8]
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 24
# assign variable
# generate address of variable
# load address of var
   lea rax, [rbp-24]
# address of variable generated
   push rax
# generate value to assign
# load address of var
   lea rax, [rbp-16]
   push rax
   pop rdi
   call foo
# getting struct member
# load address of var
   lea rax, [rbp-16]
# add offset of member
   add rax, 8
# end add offset
# load
   mov rax, [rax]
# end load
# store value to variable address
# store
   pop rdi
   mov [rdi], rax
# end store
# load address of var
   lea rax, [rbp-24]
# load
   mov rax, [rax]
# end load
   push rax
   pop rdi
   lea r15, puts
   call buitin_glibc_caller
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
