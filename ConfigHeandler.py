from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, db, Config


class ConfigHeandler(HTTPMethodView):

    def get(self, request):
        args = request.args
        conf=Config.select().execute()
        res={}
        for c in conf:
            res[c.name]=c.value
        return response.json(res)

    def post(self, request):
        r=request.json
        for conf in r:
            c=Config.update({Config.value:r[conf]}).where(Config.name==conf).execute()
            if c==0:
                Config.create(name=conf,value=r[conf])
        print(r)
        return response.text("Update "+str(len(conf)))

    def patch(self, request):
        pass
        return response.text("ok")

    def delete(self, request):
        pass
        return response.text("Complete")

    def options(self,reques):
        return response.text("")
