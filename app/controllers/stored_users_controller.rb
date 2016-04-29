class StoredUsersController < ApplicationController
  include ViewAsAuthorization

  before_filter :authenticate
  before_filter :numeric_uid?, except: [:get, :delete_all_recent, :delete_all_saved]
  respond_to :json

  def get
    authorize_query_stored_users current_user
    users_found = User::StoredUsers.get current_user.real_user_id
    render json: { users: users_found }.to_json
  end

  def store_saved_uid
    response = User::StoredUsers.store_saved_uid current_user.real_user_id, uid_param
    render json: response.to_json
  end

  def store_recent_uid
    response = User::StoredUsers.store_recent_uid current_user.real_user_id, uid_param
    render json: response.to_json
  end

  def delete_saved_uid
    response = User::StoredUsers.delete_saved_uid current_user.real_user_id, uid_param
    render json: response.to_json
  end

  def delete_all_recent
    response = User::StoredUsers.delete_all_recent current_user.real_user_id
    render json: response.to_json
  end

  def delete_all_saved
    response = User::StoredUsers.delete_all_saved current_user.real_user_id
    render json: response.to_json
  end

  private

  def uid_param
    params.require 'uid'
  end

  def error_response
   result = { success: false, message: 'Please provide a numeric UID.' }
    respond_with(result) do |format|
      format.json { render json: result.to_json, status: :bad_request }
    end
  end

  def numeric_uid?
    begin
      Integer(uid_param, 10)
    rescue ArgumentError
      error_response
    end
  end

end
