# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_03_164641) do
  create_table "employees", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "department"
    t.string "country"
    t.string "currency"
    t.decimal "base_salary"
    t.decimal "allowances"
    t.date "joining_date"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_employees_on_email", unique: true
  end

  create_table "salary_logs", force: :cascade do |t|
    t.integer "employee_id", null: false
    t.decimal "old_salary"
    t.decimal "new_salary"
    t.string "change_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id"], name: "index_salary_logs_on_employee_id"
  end

  add_foreign_key "salary_logs", "employees"
end
