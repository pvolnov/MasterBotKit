from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, db, Config, Messages, Users


class UserHeandler(HTTPMethodView):

    def get(self, request):
        args = request.args
        result={}
        print(args)
        if "message_from_user" in args:
            u=Users.get_by_id(args["message_from_user"][0])
            messages=Messages.select().where(Messages.user==u).order_by(Messages.id.desc()).execute()
            result=[]
            for m in messages:
                result.append({
                    "text":m.text,
                    "type":m.type,
                    "date":m.date,
                    "info":m.info,
                    **model_to_dict(u)
                })
        if "all_user" in args:
            users=Users.select().execute()
            result=[model_to_dict(u) for u in users]

        return response.json(result)


    def options(self,reques):
        return response.text("")
