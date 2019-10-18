from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, Buttons


class ButtonHeandler(HTTPMethodView):

    def get(self, request, btn_id):
        print(btn_id)
        args = request.args

        btn=Buttons.get_by_id(btn_id)
        return response.json(model_to_dict(btn))


    def post(self, request):
        print(request.json)
        try:
            Buttons.insert(request.json).execute()
            return response.text("ok")
        except Exception as e:
            return response.json(
                {'message': str(e)},
                status=500
            )

    def patch(self, request,btn_id):
        r=request.json
        r["id"]=btn_id
        Buttons.update(r).execute()
        return response.text("ok")

    def delete(self, request,btn_id):
        r = request.json
        Buttons.delete_by_id(btn_id)
        return response.text("Complete")
