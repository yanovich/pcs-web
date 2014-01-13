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
end
