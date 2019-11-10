from peewee import *
from config import *
from playhouse.postgres_ext import PostgresqlExtDatabase, JSONField, ArrayField

db = PostgresqlExtDatabase(bdname, user=bduser, password=bdpassword,
                           host=bdhost, port=bdport)
# db.rollback()

class Users(Model):
    id = IdentityField()
    tel_id = IntegerField(index=True)
    name = TextField(null=True)
    username = TextField(null=True)
    avatar=TextField(null=True)
    cms = IntegerField(default=1)
    level = IntegerField(default=0)

    class Meta:
        database = db
        db_table = 'Users'


class Buttons(Model):
    id = IdentityField()
    name = TextField(null=True)
    callback = TextField(null=True)
    type = IntegerField(default=0)
    menu_id = IntegerField(default=0)
    info = JSONField(default={
        "callback": "",
        "changePermit": False,
        "newLevel": 0,
        "saveInTable": False,
        "levelPermit": False,
        "constLevel": False,
        "tableName": 0,
        "newGroupId": 1,
        "columnName": 0,
        "tableRowValue": "",
        "editRow": False,
        "notification": False,
        "notificationText": "",
        "changeGroup": False,
        "response": "",
        "funkParams": "",
        "template": "new",
        "textParsing": "no",
    })

    class Meta:
        database = db
        db_table = 'Buttons'


class Menu(Model):
    id = IdentityField()
    name = TextField(null=True,unique=True)
    type = IntegerField(default=0)
    zbutton = JSONField(default={})
    buttons = JSONField(default=[])

    class Meta:
        database = db
        db_table = 'Menu'


class Tables(Model):
    id = IdentityField()
    name = TextField(null=True)
    columns = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Tables'


class Rows(Model):
    id = IdentityField()
    user = ForeignKeyField(Users,'id',lazy_load=False)
    table = ForeignKeyField(Tables)
    columns = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Rows'


class Config(Model):
    id = IdentityField()
    name = TextField()
    value = TextField()
    json = JSONField(default={})

    class Meta:
        database = db
        db_table = 'Config'

class Messages(Model):
    id = IdentityField()
    text = TextField()
    type = IntegerField()
    info=JSONField(null=True)
    date=TextField(null=True)
    user = ForeignKeyField(Users,'id',lazy_load=False)
    message_id=IntegerField(default=0)

    class Meta:
        database = db
        db_table = 'Messages'



# Messages.drop_table()
# Config.drop_table()
# Rows.drop_table()
# Tables.drop_table()
# Buttons.drop_table()
# Menu.drop_table()
# Users.drop_table()



# Users.create_table()
# Messages.create_table()
# Buttons.create_table()
# Config.create_table()
# Tables.create_table()
# Rows.create_table()
# Menu.create_table()

