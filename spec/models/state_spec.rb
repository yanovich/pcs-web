# app/models/state.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe State do
  let(:device) { FactoryGirl.create(:device) }
  before { @state = device.states.build(content: "Message") }

  subject { @state }

  it { should respond_to(:device) }
  its(:device) { should eq device }
end

# vim:ts=2 sts=2 sw=2 et:
