# app/models/state.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class State
  include Mongoid::Document
  include Mongoid::Timestamps::Created::Short
  include MongoidPaginator

  belongs_to :device

  field :content, type: String
  field :stamp,   type: DateTime
  field :start,   type: Integer
  field :size,    type: Integer

  index({ device_id: 1, c_at: -1 })

  def time
    if (DateTime.now - stamp) > 1
      stamp.strftime('%H:%M')
    else
      stamp.strftime('%-d %b')
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
