from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, db


class MenuHeandler(HTTPMethodView):

    def get(self, request):
        args = request.args
        if "menu_id" in args:
            menu=Menu.get_by_id(args["menu_id"][0])
            res=model_to_dict(menu)
            return response.json(res)

        menu = Menu.select(Menu.name,Menu.id,Menu.type).execute()
        menues = []
        for m in menu:
            menues.append(model_to_dict(m))
        return response.json(menues)

    def post(self, request):
        r=request.json
        print("add menu",r)
        try:
            m=Menu.insert(r).execute()
            return response.text({"id":m})
        except Exception as e:
            db.rollback()
            return response.json(
                {'message': str(e)},
                status=500
            )

    def patch(self, request):
        r=request.json
        if "btn_coord" in r:
            menu=Menu.get_by_id(r["menu_id"])
            print('r["btn_coord"]',r["btn_coord"])
            menu.buttons[r["btn_coord"]["y"]][r["btn_coord"]["x"]]=r["button_id"]
            menu.save()
            return response.json("ok")

        if "zbutton" in r:
            Menu.update({Menu.zbutton: r["zbutton"],Menu.name:r["name"]}).where(Menu.id == r["id"]).execute()
            return response.json("ok")

        print(r["buttons"])
        new_buttons=[]
        for row in r["buttons"]:
            btn_row=[]
            for b in row:
                if b>0:
                    btn_row.append(b)
            new_buttons.append(btn_row)

        Menu.update({Menu.buttons:new_buttons}).where(Menu.id==r["id"]).execute()
        return response.text("ok")

    def delete(self, request):
        r = request.args
        if int(r["menu_id"][0]) < 2:
            return response.text("You can`t delete START menu")
        Menu.delete_by_id(r["menu_id"][0])
        return response.text("Complete")

    def options(self,reques):
        return response.text("")
