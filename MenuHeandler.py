from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, db


class MenuHeandler(HTTPMethodView):

    def get(self, request):
        print(request.args)
        args = request.args
        if "menu_id" in args:
            menu=Menu.get_by_id(args["menu_id"])
            return response.json(menu)

        menu = Menu.select().execute()
        menues = []
        for m in menu:
            menues.append(model_to_dict(m))
        return response.json(menues)

    def post(self, request):
        print(request.json)
        try:
            Menu.insert(request.json).execute()
            return response.text("ok")
        except Exception as e:
            db.rollback()
            return response.json(
                {'message': str(e)},
                status=500
            )

    def patch(self, request):
        r=request.json
        args = request.args
        if "menu_id" in args:
            r["id"]=args["menu_id"]
        Menu.update(r).execute()
        return response.text("ok")

    def delete(self, request):
        r = request.json
        if r["menu_id"] < 2:
            return response.text("You can`t delete START menu")
        Menu.delete_by_id(r["menu_id"])
        return response.text("Complete")
