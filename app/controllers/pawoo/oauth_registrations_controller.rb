class Pawoo::OauthRegistrationsController < DeviseController
  include Devise::Controllers::Rememberable
  include Pawoo::WithRedisSessionStore

  before_action :require_omniauth_auth
  before_action :require_no_authentication
  before_action :set_oauth_registration

  def new; end

  def create
    @oauth_registration.assign_attributes(oauth_registration_params)

    if @oauth_registration.save
      user = @oauth_registration.user
      sign_in(user)
      remember_me(user)

      BootstrapTimelineWorker.perform_async(user.account_id)
      FetchPixivFollowsWorker.perform_async(
        @oauth_registration.oauth_authentication.id,
        *omniauth_auth['credentials'].values_at('token', 'refresh_token', 'expires_at')
      )

      redirect_to after_sign_in_path_for(user)
    elsif @oauth_registration.user.errors.added?(:email, :taken) && @oauth_registration.email_confirmed?
      redirect_to new_user_session_path, alert: t('.already_registered')
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_oauth_registration
    @oauth_registration = Pawoo::Form::OauthRegistration.from_omniauth_auth(omniauth_auth)
  end

  def require_omniauth_auth
    redirect_to root_path, alert: t('devise.failure.timeout') unless omniauth_auth
  end

  def omniauth_auth
    @omniauth_auth ||= JSON.parse(pawoo_redis_session_store('devise.omniauth').get('auth'))
  rescue TypeError, JSON::ParserError
    nil
  end

  def oauth_registration_params
    params.require(:pawoo_form_oauth_registration).permit(
      :email, :username, :display_name, :note
    ).merge(locale: I18n.locale)
  end
end
