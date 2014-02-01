#!/usr/bin/make -f

REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER)

.PHONY: test
