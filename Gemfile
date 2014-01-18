source 'https://rubygems.org'

ruby '2.0.0'
#ruby-gemset=pcs

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.0.2'
gem 'rails-i18n', '~> 4.0.0'
gem "mongo_mapper", git: 'git@github.com:yanovich/mongomapper.git'
gem "bson_ext", "~> 1.9.2"

# Use sqlite3 as the database for Active Record
gem 'sqlite3'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.0'

# BootStrap
gem 'bootstrap-sass', '~> 3.0.3'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby
gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# Use ActiveModel has_secure_password
gem 'bcrypt-ruby', '~> 3.1.2'

# Use unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# Use debugger
# gem 'debugger', group: [:development, :test]

gem "will_paginate", "~> 3.0.5"
gem "bootstrap-will_paginate", "~> 0.0.10"

group :development, :test do
  gem 'rspec-rails', "~> 2.14.1"
  gem 'guard-rspec', "~> 4.2.4"
  gem 'guard-spork', "~> 1.5.1"
  gem "spork-rails", "~> 4.0.0"
  gem "faker", "~> 1.2.0"

  # Workaround "Error: can't modify string; temporarily locked" in spork
  gem "rb-readline", "~> 0.5.0"
end

group :test do
  # For UI testing with RSpec
  gem 'selenium-webdriver', "~> 2.39.0"
  gem 'capybara', "~> 2.2.1"

  # For test object generation
  gem "factory_girl_rails", "~> 4.3.0"
end
