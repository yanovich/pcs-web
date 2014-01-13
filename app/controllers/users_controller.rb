# app/controllers/user_controller.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class UsersController < ApplicationController

  def show
    @user = User.find(params[:id])
  end

  def new
  end
end

# vim:ts=2 sts=2 sw=2 et:
