require "test_helper"

class Api::V1::EmployeesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_v1_employees_index_url
    assert_response :success
  end

  test "should get show" do
    get api_v1_employees_show_url
    assert_response :success
  end

  test "should get update" do
    get api_v1_employees_update_url
    assert_response :success
  end

  test "should get analytics" do
    get api_v1_employees_analytics_url
    assert_response :success
  end
end
