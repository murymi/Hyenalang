#!/bin/bash
# Simple assemble/link script.

if [ -z $1 ]; then
    echo "Usage: ./asm64 <asmMainFile> (no extension)"
    exit
fi
# Verify no extensions were entered
if [ ! -e "$1.asm" ]; then
    echo "Error, $1.asm not found."
    echo "Note, do not enter file extensions."
    exit
fi
# Compile, assemble, and link.
# -Worphan-labels
# -g dwarf2
nasm -f elf64 $1.asm -o $1.o

ld -g -o $1 $1.o -no-pie