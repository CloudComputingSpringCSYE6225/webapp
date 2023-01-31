export const userModel = (sequelize, Sequelize) => {
    const User = sequelize.define(
        'user',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            first_name: {
                type: Sequelize.STRING,
                required: true,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING,
                required: true,
                allowNull: false,
            },
            username: {
                type: Sequelize.STRING,
                required: true,
                unique: {
                    msg: 'Username should be unique',
                    fields: ['username'],
                },
                allowNull: false,
                validate: {
                    isEmail: {
                        args: true,
                        msg: 'User name should be a valid email address!',
                    },
                },
            },
            password: {
                type: Sequelize.STRING,
                required: true,
                validate: {
                    len: {
                        args: [5, 500],
                        msg: 'Password should be between 5 and 15 characters',
                    },
                },
            },
            account_created: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
            account_updated: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            }
        },{
            initialAutoIncrement: 1,
        }
    )

    sequelize.query(`CREATE OR REPLACE FUNCTION update_modified_column()   
                        RETURNS TRIGGER AS $$
                        BEGIN
                             IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
                                NEW.account_updated = now();
                                NEW.account_created := OLD.account_created;
                                RETURN NEW;
                            ELSE
                                RETURN OLD;
                            END IF;
                        END;
                        $$ language 'plpgsql';`
    )

    sequelize.query(`CREATE TRIGGER update_user_modtime BEFORE UPDATE ON user FOR EACH ROW EXECUTE PROCEDURE  update_modified_column();`)
    return User
}