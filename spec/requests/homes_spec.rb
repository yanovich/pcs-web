# spec/requests/homes_spec.rb - test home page
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe "Home page" do
  it "should have correct title" do
    visit '/'
    expect(page).to have_title('Консоль АСУТП')
  end
end

# vim:ts=2 sts=2 sw=2 et:
