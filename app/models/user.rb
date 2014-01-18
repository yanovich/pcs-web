# app/models/user.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class User
  include ActiveModel::SecurePassword
  include MongoMapper::Document

  before_save { self.email = email.downcase }
  before_create :create_remember_token

  validates :name,  presence: true, length: { maximum: 50 }

  key :name,            String
  key :email,           String
  key :password_digest, String
  key :remember_token,  String
  key :admin,           Boolean

  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX },
    uniqueness: { case_sensitive: false }
  has_secure_password
  validates :password, length: { minimum: 6 }, if: lambda { |m| m.password.present? } 

  def User.new_remember_token
    SecureRandom.urlsafe_base64
  end

  def User.encrypt(token)
    Digest::SHA1.hexdigest(token.to_s)
  end

  private

    def create_remember_token
      self.remember_token = User.encrypt(User.new_remember_token)
    end
end

User.ensure_index [[:email, 1]], :unique => true
User.ensure_index [[:remember_token, 1]], :unique => true

# vim:ts=2 sts=2 sw=2 et:
