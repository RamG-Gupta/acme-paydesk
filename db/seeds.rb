# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# db/seeds.rb
require 'securerandom'

puts "⏳ Cleaning old data..."
SalaryLog.delete_all
Employee.delete_all

puts "🌱 Generating 10,000 highly realistic employee records..."

# Realistic Data Pools for ACME Global Org
DEPARTMENTS = ["Engineering", "Product", "Design", "Human Resources", "Sales", "Marketing", "Finance", "Legal", "Operations", "Security"]
COUNTRIES_CONFIG = {
  "United States" => { currency: "USD", min_base: 70000, max_base: 180000 },
  "India"         => { currency: "INR", min_base: 600000, max_base: 2500000 },
  "United Kingdom"=> { currency: "GBP", min_base: 45000, max_base: 110000 },
  "Germany"       => { currency: "EUR", min_base: 50000, max_base: 120000 },
  "Singapore"     => { currency: "SGD", min_base: 65000, max_base: 150000 }
}
STATUSES = ["Active", "Active", "Active", "Active", "Suspended", "Terminated"] # 80%+ Active

FIRST_NAMES = ["Amit", "John", "Sarah", "Emily", "Rahul", "Priya", "Carlos", "Michael", "Elena", "Yuki", "David", "Jessica", "Raj", "Sita", "James", "Linda"]
LAST_NAMES = ["Sharma", "Smith", "Johnson", "Gupta", "Davis", "Rodriguez", "Patel", "Miller", "Tanaka", "Ivanov", "Jones", "Brown", "Verma", "Taylor"]

employees_data = []
current_time = Time.current

# 10,000 लूप चलाकर एरे में डेटा भरेंगे
10000.times do |i|
  country = COUNTRIES_CONFIG.keys.sample
  config = COUNTRIES_CONFIG[country]
  
  first_name = FIRST_NAMES.sample
  last_name = LAST_NAMES.sample
  name = "#{first_name} #{last_name}"
  
  # Unique email generation using index
  email = "#{first_name.downcase}.#{last_name.downcase}.#{i+1}@acme.com"
  
  base_salary = rand(config[:min_base]..config[:max_base]).round(2)
  allowances = (base_salary * rand(0.05..0.15)).round(2) # 5% to 15% allowance

  employees_data << {
    name: name,
    email: email,
    department: DEPARTMENTS.sample,
    country: country,
    currency: config[:currency],
    base_salary: base_salary,
    allowances: allowances,
    joining_date: rand(1..1800).days.ago.to_date, # Joined in last ~5 years
    status: STATUSES.sample,
    created_at: current_time,
    updated_at: current_time
  }
end

puts "💾 Bulk inserting 10,000 records into SQLite..."

# Engineering Best Practice: insert_all single SQL query में सब इंसर्ट कर देता है (सिर्फ 1-2 सेकंड लेगा)
Employee.insert_all!(employees_data)

puts "✅ Successfully seeded #{Employee.count} employees!"

# कुछ एम्प्लॉइज के लिए सैलरी हिस्ट्री (Logs) जेनरेट करें ताकि ग्राफ़/ट्रेंड्स दिख सकें
puts "📉 Creating initial historical salary logs for analytics..."
sample_employees = Employee.limit(500)
logs_data = []

sample_employees.each do |emp|
  old_salary = (emp.base_salary * 0.9).round(2) # 10% lower salary in past
  logs_data << {
    employee_id: emp.id,
    old_salary: old_salary,
    new_salary: emp.base_salary,
    change_reason: ["Annual Appraisal", "Promotion", "Market Correction"].sample,
    created_at: rand(30..365).days.ago,
    updated_at: current_time
  }
end

SalaryLog.insert_all!(logs_data)
puts "✅ Successfully seeded #{SalaryLog.count} salary history logs!"
