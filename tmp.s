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
.align 8
message:
.quad .L.data.0
.bss
.align 4
.fuckfloatfool: .zero 4
.align 1
char:
   .zero 1
.align 4
int:
   .zero 4
.align 8
long:
   .zero 8
.text
.global main
main:
   push rbp
   mov rbp, rsp
   sub rsp, 8
   lea rax, [rbp-8]
push rax
add rsp, 8
   lea rax, [rbp-8]
add rax, 0
push rax
   mov rax, 7
   pop rdi
   mov [rdi], eax
   lea rax, [rbp-8]
add rax, 0
push rax
   mov rax, 90
   pop rdi
   mov [rdi], rax
   lea rax, [rbp-8]
add rax, 0
push rax
   mov rax, 9
   pop rdi
   mov [rdi], al
   lea rax, [rbp-8]
add rax, 0
   movsxd rax, dword ptr [rax]
   jmp .L.endfn.1
   xor rax, rax
.L.endfn.1:
   mov rsp, rbp
   pop rbp
   ret

