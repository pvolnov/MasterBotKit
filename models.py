from peewee import *
from config import *
from playhouse.postgres_ext import PostgresqlExtDatabase, JSONField, ArrayField

db = PostgresqlExtDatabase(bdname, user=bduser, password=bdpassword,
                           host=bdhost, port=bdport)


class Options(Model):
    name = TextField()
    price = IntegerField(default=0)
    count=IntegerField(default=0)
    item_id = IntegerField(default=0)

    class Meta:
        database = db
        db_table = 'Options'


class Order(Model):
    name=TextField()
    price = IntegerField(default=0)
    option = ForeignKeyField(Options)
    status = IntegerField(default=0)
    user = IntegerField(default=0)
    date=DateField(null=True)
    goods = TextField(default="")

    class Meta:
        database = db
        db_table = 'Order'


class Items(Model):
    name = TextField()
    discr = TextField(null=True)
    category = IntegerField()
    options = ManyToManyField(Options, backref='item')

    class Meta:
        database = db
        db_table = 'Items'


class Users(Model):
    vk_id = IntegerField(index=True)
    name = TextField(null=True)
    cms=IntegerField(default=0)
    last_mes=IntegerField(default=0)
    orders = ManyToManyField(Order, backref='item')

    class Meta:
        database = db
        db_table = 'Users'


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

# Options.create_table()
# Users.create_table()
# Config.create_table()
# Items.create_table()
# Order.create_table()
