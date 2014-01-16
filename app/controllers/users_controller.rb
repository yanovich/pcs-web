# app/controllers/user_controller.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class UsersController < ApplicationController
  before_action :correct_user,   only: [:update]

  def index
    unless current_user.admin?
      redirect_to user_path(current_user)
    end
    @users = User.paginate(page: params[:page])
  end

  def show
    unless admin_or_self
      redirect_to user_path(current_user)
    end
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
      if ( params[:user][:password].empty? &&
        params[:user][:password_confirmation].empty? )
        params[:user].delete('password')
        params[:user].delete('password_confirmation')
      end
      list=['name', 'email', 'password', 'password_confirmation']
      list.push('admin') if current_user.admin? && current_user.id.to_s != params[:id]
      params.require(:user).permit(list)
    end

    def admin_or_self
      current_user.admin? || current_user.id.to_s == params[:id]
    end

    def correct_user
      unless admin_or_self
        sign_out
        redirect_to(signin_path)
      end
    end
end

# vim:ts=2 sts=2 sw=2 et:
