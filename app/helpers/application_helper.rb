# app/helpers/application_helper.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

module ApplicationHelper
  include SessionsHelper

  def full_title(page_title)
    base_title = "Консоль АСУТП"
    if !current_user.nil?
      base_title += " - " + current_user[:name]
    end
    if page_title.empty?
      base_title
    else
      "#{page_title} - #{base_title}"
    end
  end

  def profile_title(user_title, default_title)
    if current_user?(@user)
      default_title
    else
      user_title
    end
  end
end

# vim:set ts=2 sts=2 sw=2 et:
