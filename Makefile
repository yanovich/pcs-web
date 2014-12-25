#!/usr/bin/make -f

REPORTER = dot

test-mocha:
	@./node_modules/.bin/mocha --reporter $(REPORTER)

test-mocha-long:
	@./node_modules/.bin/mocha --reporter spec

test-karma:
	@./node_modules/.bin/karma start test/browser/karma.conf.js

test-karma-long:
	@./node_modules/.bin/karma start

test: test-mocha test-karma

test-long: test-mocha-long test-karma-long

.PHONY: test test-long test-mocha test-mocha-long test-karma test-karma-long
