# app/models/concerns/mongoid_paginator.rb
#
# intergration into Process Control Service Web Interface
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
#
# of https://github.com/lucasas/will_paginate_mongoid/raw/master/lib/will_paginate_mongoid/mongoid_paginator.rb
# Copyright (c) 2013 Lucas Souza <lucasas@gmail.com>
#
# The MIT License
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.


module MongoidPaginator
  extend ActiveSupport::Concern

  included do
    def self.paginate(options = {})
      options = base_options options

      WillPaginate::Collection.create(options[:page], options[:per_page]) do |pager|
        fill_pager_with self.skip(options[:offset]).limit(options[:per_page]), self.count, pager
      end
    end


    def self.page(page)
      paginate({page: page})
    end

    private

    def self.base_options(options)
      options[:page] ||= 1
      options[:per_page] ||= (WillPaginate.per_page || 10)
      options[:offset] = (options[:page].to_i - 1) * options[:per_page].to_i
      options
    end

    def self.fill_pager_with(medias, size, pager)
      pager.replace medias.to_a
      pager.total_entries = size
    end
  end
end
