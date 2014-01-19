# app/models/device.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

TIME_REGEXP = /\w{3}\s\d{2}\s\d{2}\:\d{2}\:\d{2}/
class Device
  include Mongoid::Document

  validates :name,  presence: true, length: { maximum: 50 }
  validates :filepath,  presence: true

  has_many :states

  field :name,     type: String
  field :hostname, type: String
  field :filepath, type: String
  field :offset,   type: Integer, default: 0
  field :enabled,  type: Boolean

  def read_new_states
    file = File.open(self.filepath, 'r')

    begin
      while (line = file.gets)
        stamp = line.slice!( TIME_REGEXP )
        next if stamp.blank?
        line.slice!(" #{self.hostname} ") if line.index(" #{self.hostname} ") == 0
        start = self.offset
        self.offset = file.tell
        size = self.offset - start
        self.states.build(start: start, size: size, content: line.strip,
                          stamp: stamp.to_time.localtime).save!
      end
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
