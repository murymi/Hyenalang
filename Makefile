ifeq ($(V), 1)
V_AT =
else
V_AT = @
endif

FILE ?= ""

main:
	$(V_AT)tsc main.ts
	$(V_AT)node main.js $(FILE)

bin:
	$(V_AT)as -g -o tmp.o tmp.s
	$(V_AT)ld -g -o tmp tmp.o --no-pie