from peewee import *
from config import *
from playhouse.postgres_ext import PostgresqlExtDatabase, JSONField, ArrayField

db = PostgresqlExtDatabase(bdname, user=bduser, password=bdpassword,
                           host=bdhost, port=bdport)
# db.rollback()

class Stack(Model):
    id = IdentityField()
    tel_id = IntegerField(index=True)
    name = TextField(null=True)
    description = TextField(default="")
    in_queue = IntegerField(default=0)

    class Meta:
        database = db
        db_table = 'Stack'



# Stack.drop_table()
# Stack.create_table()


