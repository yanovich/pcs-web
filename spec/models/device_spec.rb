# spec/models/device_spec.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe Device do
  before do
    @device = Device.new(name: "a device", filepath: "/dev/null")
  end

  subject { @device }

  it { should respond_to(:name) }
  it { should respond_to(:filepath) }
  it { should respond_to(:enabled) }

  it { should be_valid }

  describe "when name is not present" do
    before { @device.name = " " }
    it { should_not be_valid }
  end

  describe "when filepath is not present" do
    before { @device.filepath = " " }
    it { should_not be_valid }
  end
end

# vim:ts=2 sts=2 sw=2 et:
