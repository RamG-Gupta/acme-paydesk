class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :name
      t.string :email
      t.string :department
      t.string :country
      t.string :currency
      t.decimal :base_salary
      t.decimal :allowances
      t.date :joining_date
      t.string :status

      t.timestamps
    end
    add_index :employees, :email, unique: true
  end
end
