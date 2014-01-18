# app/models/state.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class State
  include Mongoid::Document

  belongs_to :device

  field :content, type: String
  field :time,    type: DateTime
  field :start,   type: Integer
  field :size,    type: Integer
end

# vim:ts=2 sts=2 sw=2 et:
