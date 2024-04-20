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
	$(V_AT)gcc -static -o tmp tmp.s