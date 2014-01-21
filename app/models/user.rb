# app/models/user.rb
# Copyright 2014 Sergei Ianovich
#
# Licensed under AGPLv3 or later
# Process Control Service Web Interface

class User
  include ActiveModel::SecurePassword
  include Mongoid::Document

  before_save { self.email = email.downcase }
  before_create :create_remember_token


  field :name,            type: String
  field :email,           type: String
  field :password_digest, type: String
  field :remember_token,  type: String
  field :admin,           type: Boolean

  validates :name,  presence: true, length: { maximum: 50 }
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX },
    uniqueness: { case_sensitive: false }
  has_secure_password
  validates :password, length: { minimum: 6 }, if: lambda { |m| m.password.present? } 

  index( { email: 1 }, { unique: true })
  index( { remember_token: 1 })

  def User.new_remember_token
    SecureRandom.urlsafe_base64
  end

  def User.encrypt(token)
    Digest::SHA1.hexdigest(token.to_s)
  end


  # Assigns to +attribute+ the boolean opposite of <tt>attribute?</tt>. So
  # if the predicate returns +true+ the attribute will become +false+. This
  # method toggles directly the underlying value without calling any setter.
  # Returns +self+.
  def toggle(attribute)
    self[attribute] = !send("#{attribute}?")
    self
  end 
    
  # Wrapper around +toggle+ that saves the record. This method differs from
  # its non-bang version in that it passes through the attribute setter.
  # Saving is not subjected to validation checks. Returns +true+ if the
  # record could be saved.
  def toggle!(attribute)
    toggle(attribute).update_attribute(attribute, self[attribute])
  end

  private

    def create_remember_token
      self.remember_token = User.encrypt(User.new_remember_token)
    end
end

# vim:ts=2 sts=2 sw=2 et:
