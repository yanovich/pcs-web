# app/controllers/application_controller.rb - main application controller
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  include SessionsHelper
  before_filter :signed_in_user

  # Before filters

  def signed_in_user
    store_location
    redirect_to signin_url, notice: "Please sign in." unless signed_in?
  end
end

# vim:ts=2 sts=2 sw=2 et:
