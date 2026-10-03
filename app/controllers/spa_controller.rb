# frozen_string_literal: true

class SpaController < ActionController::API
  def index
    file = Rails.public_path.join("index.html")
    if file.exist?
      send_file file, type: "text/html; charset=utf-8", disposition: "inline"
    else
      render plain: "PayDesk UI is not built. In frontend/, run npm run build.", status: :not_found
    end
  end
end
