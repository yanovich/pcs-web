# app/models/state.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe State do
  let(:device) { FactoryGirl.create(:device) }
  before do
    Mongoid.default_session.collections.select {|c| c.name !~ /system/}.each {|c| c.find.remove_all}
    @state = device.states.build(content: "Message")
  end

  subject { @state }

  it { should respond_to(:device) }
  it { should respond_to(:c_at) }
  it { should respond_to(:stamp) }
  its(:device) { should eq device }

  describe "written to device file" do
    before do
      @stamp = DateTime.now.change(usec: 0)
      @file = File.open(device.filepath, 'w')
      @file.write("#{@stamp.strftime("%b %d %H:%M:%S")} ")
      @file.write("#{device.hostname} pcs: Test message\n")
      @pos = @file.tell
      @file.close
    end

    it "should appear" do
      expect { device.read_new_states }.to change(device.states, :count).by(1)
    end

    describe "and read" do
      before do
        device.read_new_states
        @state = device.states.desc(:c_at).first
      end

      its(:stamp) { should eq @stamp.utc.to_s }
      its(:start) { should eq 0 }
      its(:size) { should eq @pos }
      its(:content) { should eq "pcs: Test message" }

      describe "appended one" do
        before do
          @stamp = DateTime.now.change(usec: 0)
          @file = File.open(device.filepath, 'a+')
          @file.write("#{@stamp.strftime("%b %d %H:%M:%S")} ")
          @file.write("#{device.hostname} pcs: Test message 2\n")
          @file.close
          device.read_new_states
          @state = device.states.desc(:c_at).first
        end

        it "should appear once" do
          device.states.count.should eq 2
        end

        its(:stamp) { should eq @stamp.utc.to_s }
        its(:start) { should eq @pos }
        its(:content) { should eq "pcs: Test message 2" }
      end
    end

    after { File.unlink(device.filepath) }
  end
end

# vim:ts=2 sts=2 sw=2 et:
