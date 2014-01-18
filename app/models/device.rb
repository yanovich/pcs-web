# app/models/device.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class Device
  include MongoMapper::Document

  validates :name,  presence: true, length: { maximum: 50 }
  validates :filepath,  presence: true

  key :name,     String
  key :filepath, String
  key :enabled,  Boolean
end

# vim:ts=2 sts=2 sw=2 et:
