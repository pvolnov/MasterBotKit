import logging
import os

import requests
from sanic import Sanic, response
from sanic.views import HTTPMethodView
from sanic.response import text, redirect
import hashlib

from Api import Api
from ButtonHeandler import ButtonHeandler
from ConfigHeandler import ConfigHeandler
from MenuHeandler import MenuHeandler
from TableHeandler import TableHeandler
from UserHeandler import UserHeandler
from models import Config
from config import ADMIN_HOST, SERVER_PORT

TEXT_HELLO = 'I am post method'

filename = None
log_level = logging.DEBUG
if "SERVER" in os.environ:
    filename = "bot.log"
    log_level = logging.INFO

logging.basicConfig(format=u'[LINE:%(lineno)d] #%(name)s %(levelname)s [%(asctime)s]: %(message)s',
                    level = log_level,
                    filename=filename
                    )

logger = logging.getLogger("server")

PASS = Config.get_or_none(Config.name == "password")
if PASS is not None:
    PASS=PASS.value
else:
    PASS="ok"

app = Sanic('mbk server 1.2')


@app.middleware('request')
async def add_key(request):
    # logger.info(request.cookies)
    if (request.url.find("api") or "type" not in request.args and request.args["type"][0]!="auth") < 0 and str(
            request.cookies.get('session')) != hashlib.md5(PASS.encode('utf-8')).hexdigest():
        pass
        # resp = text("Error")
        # resp.cookies['auth'] = "false"
        # return resp


@app.middleware('response')
async def print_on_response(request, response):
    response.headers['Access-Control-Allow-Origin'] = ADMIN_HOST
    # response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = '*, content-type'
    response.headers['Access-Control-Allow-Credentials'] = "true"
    response.headers["Access-Control-Allow-Methods"] = "POST, PUT, GET, OPTIONS, DELETE, PATCH"



app.add_route(MenuHeandler.as_view(), '/menus')
app.add_route(ButtonHeandler.as_view(), '/buttons')
app.add_route(TableHeandler.as_view(), '/tables')
app.add_route(ConfigHeandler.as_view(), '/config')
app.add_route(UserHeandler.as_view(), '/users')
app.add_route(Api.as_view(), '/api')

config = {}
config["upload"] = "./tests/uploads"


@app.post("/upload")
def post_json(request):
    test_file = request.files.get('file')
    r = requests.post("https://catbox.moe/user/api.php", data={
        "reqtype": "fileupload"
    },
                      files={
                          "fileToUpload": test_file.body
                      })
    logger.info(r.text)
    return response.text(r.text)


@app.options("/upload")
def post_json(request):
    return response.text("OK")


if __name__ == '__main__':
    if "SERVER" in os.environ:
        app.run(host="0.0.0.0", port=SERVER_PORT, debug=False)
        logger.info("Run on server")
    else:
        app.run(host="localhost", port=SERVER_PORT, debug=False)
        logger.info("Run debag mode")

