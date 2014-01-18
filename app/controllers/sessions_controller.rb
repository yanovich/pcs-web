# app/controllers/sessions_controller.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class SessionsController < ApplicationController
  skip_before_filter :signed_in_user, only: [:new, :create]

  def new
  end

  def create
    user = User.find_by_email(params[:session][:email].downcase)
    if user && user.authenticate(params[:session][:password])
      sign_in user
      redirect_back_or root_path
    else
      flash.now[:error] = "Невернoе имя пользователя или пароль"
      render 'new'
    end
  end

  def destroy
    sign_out
    redirect_to signin_url
  end
end

# vim:ts=2 sts=2 sw=2 et:
