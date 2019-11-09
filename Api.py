import hashlib

import telebot
from sanic import response
from sanic.views import HTTPMethodView

from models import Config, Rows, Users, Messages


class Api(HTTPMethodView):

    def get(self, request):
        args = request.args
        if "password" in args:
            pas=Config.get(Config.name=="password").value
            if pas==args["password"][0]:
                return response.text(hashlib.md5(pas.encode('utf-8')).hexdigest())
            else:
                return response.text("error")

        return response.json({})

    def post(self, request):
        r = request.json
        print(r)
        if r["type"] == "send_message_to_user":
            message = r["message"]
            print(r)
            user=Users.get_by_id(r["user_id"])
            bot = telebot.TeleBot(Config.get(Config.name == "ttoken").value)

            parse_mode=None
            type = -1
            if "textParsing" in r and r["textParsing"]!="None":
                parse_mode=r["textParsing"]

            if "addition" in r and r["addition"]=="photo":
                type = -3
                bot.send_photo(user.tel_id,caption=message,photo=r["file"],parse_mode=parse_mode)
            else:
                bot.send_message(user.tel_id,message,parse_mode=parse_mode)

            Messages(user=user, text=message, type=type).save()


        if r["type"] == "send_message":
            message = r["message"]
            rows = Rows.select(Rows.user).where(Rows.id.in_(r["chats"]))
            users_ids = [r.user for r in rows]
            users = Users.select().where(Users.id.in_(users_ids))
            bot = telebot.TeleBot(Config.get(Config.name == "ttoken").value)

            import gevent.monkey
            # gevent.monkey.patch_all()
            def send(bot, u):
                bot.send_message(u.tel_id, message)
                Messages(user=u, text=message, type=-1).save()

            jobs = [gevent.spawn(send, bot, u) for u in users]
            gevent.wait(jobs)

        return response.text("ok")

    def patch(self, request):
        pass
        return response.text("ok")

    def delete(self, request):
        pass
        return response.text("Complete")

    def options(self, reques):
        return response.text("")
