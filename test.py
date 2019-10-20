from models import Buttons, Rows, Users, Tables

u=Users.get_by_id(1)
t=Tables.get_by_id(1)
Rows.create(user=u,table=t,columns={"Name2":"petya","Name":"pat"})