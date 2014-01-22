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

  def state
    self.states.desc(:c_at).first
  end

  def read_new_states
    p "updating states"
    begin
      file = File.open(self.filepath, 'r')
      file.seek(self.offset, IO::SEEK_SET)

      i = 0
      begin
        while (line = file.gets)
          p line
          start = self.offset
          self.offset = file.tell
          self.save

          stamp = line.slice!(TIME_REGEXP)
          next if stamp.blank?

          line.slice!(" #{self.hostname} ") if line.index(" #{self.hostname} ") == 0
          size = self.offset - start
          state = State.new(start: start, size: size, content: line.strip,
                            stamp: stamp.to_time.localtime, device_id: self.id)
          state.save
          i += 1
          break if i > 1000
        end
      end
    rescue => e
    ensure
      file.close if file
    end
  end
end

# vim:ts=2 sts=2 sw=2 et:
