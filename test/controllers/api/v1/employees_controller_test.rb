require "test_helper"

class Api::V1::EmployeesControllerTest < ActionDispatch::IntegrationTest
  test "index paginates and returns meta" do
    get api_v1_employees_url, params: { page: 1, per_page: 2 }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 2, body["employees"].length
    assert_equal 3, body["meta"]["total_count"]
    assert_equal 2, body["meta"]["total_pages"]
  end

  test "index filters by department" do
    get api_v1_employees_url, params: { department: "Engineering" }

    assert_response :success
    names = JSON.parse(response.body)["employees"].map { |row| row["name"] }
    assert_equal [ "Priya Sharma" ], names
  end

  test "index searches by email fragment" do
    get api_v1_employees_url, params: { search: "john.smith" }

    assert_response :success
    emails = JSON.parse(response.body)["employees"].map { |row| row["email"] }
    assert_equal [ "john.smith@acme.com" ], emails
  end

  test "show includes salary history" do
    get api_v1_employee_url(employees(:one))

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal "Priya Sharma", body["name"]
    assert body["salary_logs"].length >= 1
    assert_equal 1_320_000.0, body["total_compensation"]
  end

  test "show returns 404 for unknown id" do
    get api_v1_employee_url(id: 9_999_999)
    assert_response :not_found
  end

  test "update writes a salary log" do
    employee = employees(:two)

    patch api_v1_employee_url(employee), params: {
      base_salary: 100_000,
      allowances: 9_000,
      change_reason: "Promotion cycle"
    }, as: :json

    assert_response :success
    employee.reload
    assert_equal 100_000, employee.base_salary
    assert_equal 9_000, employee.allowances
    assert_equal "Promotion cycle", employee.salary_logs.first.change_reason
  end

  test "update rejects a missing reason" do
    employee = employees(:two)

    patch api_v1_employee_url(employee), params: {
      base_salary: employee.base_salary + 1,
      allowances: employee.allowances,
      change_reason: ""
    }, as: :json

    assert_response :unprocessable_entity
  end

  test "analytics groups payroll by currency" do
    get analytics_api_v1_employees_url

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 3, body["headcount"]

    inr = body["global_payroll_summary"].find { |row| row["currency"] == "INR" }
    assert_in_delta 1_320_000.0, inr["total_spend"], 0.01
    assert_equal 1, inr["employee_count"]
    assert_equal 1, body["department_distribution"]["Engineering"]
    assert_equal 1, body["status_distribution"]["Suspended"]
  end
end
