from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, db, Config


class Api(HTTPMethodView):

    def get(self, request):
        args = request.args
        return response.json({})

    def post(self, request):
        r=request.json
        print(r)
        return response.text("ok")

    def patch(self, request):
        pass
        return response.text("ok")

    def delete(self, request):
        pass
        return response.text("Complete")

    def options(self,reques):
        return response.text("")
