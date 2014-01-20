# app/controllers/user_controller.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class DevicesController < ApplicationController
  before_action :admin_user, only: [:new, :create, :update]

  def index
    @devices = Device.paginate(page: params[:page])
  end

  def show
    @device = Device.find(params[:id])
  end

  def new
    @device = Device.new
  end

  def create
    @device = Device.new(device_params)
    if @device.save
      flash[:success] = t '.success'
      redirect_to @device
    else
      flash.now[:danger] = I18n.t :error_msg, count:@device.errors.count
      render 'new'
    end
  end

  def update
    @device = Device.find(params[:id])
    if @device.update_attributes(device_params)
      flash[:success] = "Изменено успешно"
      redirect_to @device
    else
      flash.now[:danger] = I18n.t :error_msg, count:@device.errors.count
      render 'show'
    end
  end

  private

    def device_params
      list=['name', 'hostname', 'filepath', 'enabled']
      params.require(:device).permit(list)
    end
end

# vim:ts=2 sts=2 sw=2 et:
