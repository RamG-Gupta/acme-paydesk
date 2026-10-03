# frozen_string_literal: true

require "securerandom"

puts "Cleaning existing roster..."
SalaryLog.delete_all
Employee.delete_all

puts "Generating 10,000 employees..."

rng = Random.new(2026)

DEPARTMENTS = Employee::DEPARTMENTS
COUNTRIES_CONFIG = {
  "United States" => { currency: "USD", min_base: 70_000, max_base: 180_000 },
  "India" => { currency: "INR", min_base: 600_000, max_base: 2_500_000 },
  "United Kingdom" => { currency: "GBP", min_base: 45_000, max_base: 110_000 },
  "Germany" => { currency: "EUR", min_base: 50_000, max_base: 120_000 },
  "Singapore" => { currency: "SGD", min_base: 65_000, max_base: 150_000 }
}.freeze
STATUSES = ([ "Active" ] * 8 + %w[Suspended Terminated]).freeze

FIRST_NAMES = %w[Amit John Sarah Emily Rahul Priya Carlos Michael Elena Yuki David Jessica Raj Sita James Linda].freeze
LAST_NAMES = %w[Sharma Smith Johnson Gupta Davis Rodriguez Patel Miller Tanaka Ivanov Jones Brown Verma Taylor].freeze

now = Time.current
employees_data = []

10_000.times do |i|
  country = COUNTRIES_CONFIG.keys.sample(random: rng)
  config = COUNTRIES_CONFIG[country]
  first_name = FIRST_NAMES.sample(random: rng)
  last_name = LAST_NAMES.sample(random: rng)
  base_salary = rng.rand(config[:min_base]..config[:max_base]).round(2)
  allowances = (base_salary * rng.rand(0.05..0.15)).round(2)

  employees_data << {
    name: "#{first_name} #{last_name}",
    email: "#{first_name.downcase}.#{last_name.downcase}.#{i + 1}@acme.com",
    department: DEPARTMENTS.sample(random: rng),
    country: country,
    currency: config[:currency],
    base_salary: base_salary,
    allowances: allowances,
    joining_date: rng.rand(1..1_800).days.ago.to_date,
    status: STATUSES.sample(random: rng),
    created_at: now,
    updated_at: now
  }
end

Employee.insert_all!(employees_data)
puts "Inserted #{Employee.count} employees"

sample = Employee.order(:id).limit(500)
logs_data = sample.map do |emp|
  old_salary = (emp.base_salary * 0.9).round(2)
  {
    employee_id: emp.id,
    old_salary: old_salary,
    new_salary: emp.base_salary,
    old_allowances: emp.allowances,
    new_allowances: emp.allowances,
    change_reason: %w[Annual\ appraisal Promotion Market\ correction].sample(random: rng),
    created_at: rng.rand(30..365).days.ago,
    updated_at: now
  }
end

SalaryLog.insert_all!(logs_data)
puts "Inserted #{SalaryLog.count} salary history rows"
