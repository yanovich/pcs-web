# spec/requests/homes_spec.rb - test home page
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

require 'spec_helper'

describe "User pages" do
  subject { page }

  describe "profile page" do
    let(:user) { FactoryGirl.create(:user) }
    before do
      sign_in user
      visit user_path(user)
    end

    it { should have_selector("input[value=\'#{user.name}\']") }
    it { should have_selector("input[value=\'#{user.email}\']") }
  end
end

# vim:ts=2 sts=2 sw=2 et:
