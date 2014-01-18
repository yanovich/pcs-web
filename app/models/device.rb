# app/models/device.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class Device
  include Mongoid::Document

  validates :name,  presence: true, length: { maximum: 50 }
  validates :filepath,  presence: true

  has_many :states

  field :name,     type: String
  field :filepath, type: String
  field :enabled,  type: Boolean
end

# vim:ts=2 sts=2 sw=2 et:
