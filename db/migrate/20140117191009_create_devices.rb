class CreateDevices < ActiveRecord::Migration
  def change
    create_table :devices do |t|
      t.string :name
      t.string :filepath
      t.boolean :enabled

      t.timestamps
    end
  end
end
