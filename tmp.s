.intel_syntax noprefix
.data
.align 1
.L.data.0:
   .byte 'h'
   .byte 'e'
   .byte 'l'
   .byte 'l'
   .byte 'o'
   .byte ' '
   .byte 'w'
   .byte 'o'
   .byte 'r'
   .byte 'l'
   .byte 'd'
   .byte 0
.bss
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 16
# assign variable
# generate address of variable
# getting struct member
# load address of var
   lea rax, [rbp-16]
# add offset of member
   add rax, 8
# end add offset
# address of variable generated
   push rax
# generate value to assign
   lea rax, .L.data.0
# store value to variable address
# store
   pop rdi
   mov [rdi], rax
# end store
# assign variable
# generate address of variable
# getting struct member
# load address of var
   lea rax, [rbp-16]
# add offset of member
   add rax, 0
# end add offset
# address of variable generated
   push rax
# generate value to assign
   mov rax, 11
# store value to variable address
# store
   pop rdi
   mov [rdi], rax
# end store
# assign [small]
# generate address of variable
# deref
   mov rax, 3
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
# getting struct member
# load address of var
   lea rax, [rbp-16]
# add offset of member
   add rax, 8
# end add offset
# load
   mov rax, [rax]
# end load
   pop rdi
   add rax, rdi
# end deref
# address of variable generated
   push rax
# generate value to assign
   mov rax, 97
# store value to variable address
# store
   pop rdi
   mov [rdi], al
# end store
# deref 
   mov rax, 3
   push rax
   mov rax, 1
   pop rdi
   imul rax, rdi
   push rax
# getting struct member
# load address of var
   lea rax, [rbp-16]
# add offset of member
   add rax, 8
# end add offset
# load
   mov rax, [rax]
# end load
   pop rdi
   add rax, rdi
# load
   movsx rax, byte ptr [rax]
# end load
   jmp .L.endfn.0
   xor rax, rax
.L.endfn.0:
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
