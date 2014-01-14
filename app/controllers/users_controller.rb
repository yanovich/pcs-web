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

  def update
    @user = User.find(params[:id])
    if @user.update_attributes(user_params)
      flash[:success] = "Изменено успешно"
      redirect_to @user
    else
      flash.now[:danger] = "#{I18n.t :error_msg, count:@user.errors.count}"
      render 'show'
    end
  end

  private

    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
end

# vim:ts=2 sts=2 sw=2 et:
