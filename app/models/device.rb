# app/models/device.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class Device < ActiveRecord::Base
  validates :name,  presence: true, length: { maximum: 50 }
  validates :filepath,  presence: true
end

# vim:ts=2 sts=2 sw=2 et:
