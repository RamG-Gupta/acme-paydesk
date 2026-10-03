require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  test "rejects invalid email and negative pay" do
    employee = Employee.new(
      name: "Test User",
      email: "not-an-email",
      department: "Engineering",
      country: "India",
      currency: "INR",
      base_salary: -1,
      allowances: 0,
      joining_date: Date.current,
      status: "Active"
    )

    assert_not employee.valid?
    assert_includes employee.errors[:email], "is invalid"
    assert_includes employee.errors[:base_salary], "must be greater than or equal to 0"
  end

  test "filtered search matches name case-insensitively" do
    results = Employee.filtered(search: "priya")
    assert_equal [employees(:one).id], results.pluck(:id)
  end

  test "filtered by country and status" do
    results = Employee.filtered(country: "United States", status: "Active")
    assert_equal [employees(:two).id], results.pluck(:id)
  end

  test "adjust_compensation! updates pay and writes an audit row" do
    employee = employees(:one)

    assert_difference "SalaryLog.count", 1 do
      result = employee.adjust_compensation!(
        base_salary: 1_400_000,
        allowances: 150_000,
        change_reason: "Promotion"
      )
      assert_equal :updated, result
    end

    employee.reload
    assert_equal 1_400_000, employee.base_salary
    log = employee.salary_logs.first
    assert_equal 1_200_000, log.old_salary
    assert_equal 1_400_000, log.new_salary
    assert_equal 120_000, log.old_allowances
    assert_equal 150_000, log.new_allowances
    assert_equal "Promotion", log.change_reason
  end

  test "adjust_compensation! is a no-op when figures are unchanged" do
    employee = employees(:two)

    assert_no_difference "SalaryLog.count" do
      result = employee.adjust_compensation!(
        base_salary: employee.base_salary,
        allowances: employee.allowances,
        change_reason: "Typo"
      )
      assert_equal :unchanged, result
    end
  end

  test "adjust_compensation! requires a change reason" do
    employee = employees(:two)

    assert_raises ActiveRecord::RecordInvalid do
      employee.adjust_compensation!(
        base_salary: employee.base_salary + 1000,
        allowances: employee.allowances,
        change_reason: ""
      )
    end
  end
end
