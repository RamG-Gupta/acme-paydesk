require "test_helper"

class SalaryLogTest < ActiveSupport::TestCase
  test "requires a meaningful change reason" do
    log = SalaryLog.new(
      employee: employees(:one),
      old_salary: 1,
      new_salary: 2,
      change_reason: "no"
    )

    assert_not log.valid?
    assert_includes log.errors[:change_reason], "is too short (minimum is 3 characters)"
  end
end
