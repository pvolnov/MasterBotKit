from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, Buttons, db


class ButtonHeandler(HTTPMethodView):

    def get(self, request, btn_id=None):
        args = request.args
        if "btn_id" in args:
            btn = Buttons.get_by_id(args["btn_id"][0])
            return response.json(model_to_dict(btn))

        if "all" in args:
            btns = Buttons.select(Buttons.name, Buttons.id,Buttons.type).execute()
            res = []
            for b in btns:
                res.append(model_to_dict(b))
            return response.json(res)

        if "menu_id" in args:
            menu = Menu.get_by_id(args["menu_id"][0])
            butns = list(set([x for sublist in menu.buttons for x in sublist]))
            butns = Buttons.select(Buttons.menu_id,Buttons.name, Buttons.id, Buttons.type, Buttons.callback).where(
                Buttons.id.in_(butns)).execute()
            res = {}
            for b in butns:
                model = model_to_dict(b)
                res[model["id"]] = model

            buttons_menu = []
            for button in menu.buttons:
                row = []
                for b in button:
                    if b in res:
                        row.append(res[b])
                    else:
                        row.append({
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

                buttons_menu.append(row)
            return response.json(buttons_menu)

        btn = Buttons.get_by_id(btn_id)
        return response.json(model_to_dict(btn))

    def post(self, request):
        r = request.json
        print(r)
        if "id" in r:
            del r["id"]
        try:
            b = Buttons.insert(r).execute()
            return response.json({"id": b})
        except Exception as e:
            db.rollback()
            return response.json(
                {'message': str(e)},
                status=500
            )

    def patch(self, request):
        r = request.json
        Buttons.update({Buttons.name: r["name"], Buttons.info: r["info"]}).where(Buttons.id == r["id"]).execute()
        return response.text("ok")

    def delete(self, request):
        r = request.args
        if "button_id" in r:
            Buttons.delete_by_id(r["button_id"][0])
        return response.text("Complete")

    def options(self, request):
        return response.text("")
