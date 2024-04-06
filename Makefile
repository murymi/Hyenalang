ifeq ($(V), 1)
V_AT =
else
V_AT = @
endif

main:
	$(V_AT)tsc main.ts
	$(V_AT)node main.js