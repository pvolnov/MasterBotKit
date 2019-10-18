from peewee import *
from config import *
from playhouse.postgres_ext import PostgresqlExtDatabase, JSONField, ArrayField

db = PostgresqlExtDatabase(bdname, user=bduser, password=bdpassword,
                           host=bdhost, port=bdport)


class Users(Model):
    tel_id = IntegerField(index=True)
    name = TextField(null=True)
    username = TextField(null=True)
    cms = IntegerField(default=0)
    level = IntegerField(default=0)

    class Meta:
        database = db
        db_table = 'Users'


class Buttons(Model):
    name = TextField(null=True,unique=True)
    callback = TextField(null=True)
    type = IntegerField(default=0)
    info = JSONField(default=[])

    class Meta:
        database = db
        db_table = 'Buttons'


class Menu(Model):
    name = TextField(null=True,unique=True)
    type = IntegerField(default=0)
    zbutton = JSONField(default={})
    buttons = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Menu'


class Tables(Model):
    name = TextField(null=True)
    columns = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Tables'


class Rows(Model):
    user = ForeignKeyField(Users,'id')
    table = ForeignKeyField(Tables)
    columns = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Rows'


class Config(Model):
    name = TextField()
    value = TextField()
    json = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Config'

# Order.drop_table()
# Options.drop_table()
# Items.drop_table()
# Users.drop_table()
# Config.drop_table()

Users.create_table()
Buttons.create_table()
Config.create_table()
Tables.create_table()
Rows.create_table()
Menu.create_table()

