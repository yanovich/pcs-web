#!/usr/bin/make -f

REPORTER = spec

test-mocha:
	@./node_modules/.bin/mocha --reporter $(REPORTER)

test-karma:
	@./node_modules/.bin/karma start

test: test-mocha test-karma

.PHONY: test test-mocha test-karma
