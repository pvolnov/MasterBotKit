import os

import requests
from sanic import Sanic, response
from sanic.views import HTTPMethodView
from sanic.response import text

from Api import Api
from ButtonHeandler import ButtonHeandler
from ConfigHeandler import ConfigHeandler
from MenuHeandler import MenuHeandler
from TableHeandler import TableHeandler

TEXT_HELLO = 'I am post method'

app = Sanic('mbk server 1.2')


@app.middleware('response')
async def print_on_response(request, response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers["Access-Control-Allow-Methods"] = "POST, PUT, GET, OPTIONS, DELETE, PATCH"


app.add_route(MenuHeandler.as_view(), '/menus')
# app.add_route(ButtonHeandler.as_view(), '/buttons/<btn_id:int>')
app.add_route(ButtonHeandler.as_view(), '/buttons')
app.add_route(TableHeandler.as_view(), '/tables')
app.add_route(ConfigHeandler.as_view(), '/config')
app.add_route(Api.as_view(), '/api')


config = {}
config["upload"] = "./tests/uploads"



@app.post("/upload")
def post_json(request):
    test_file = request.files.get('file')

    file_parameters = {
        'body': test_file.body,
        'name': test_file.name,
        'type': test_file.type,
    }
    # print("file_parameters",file_parameters)

    r = requests.post("https://catbox.moe/user/api.php", data={
        "reqtype": "fileupload"
    },
                      files={
                          "fileToUpload": test_file.body
                      })
    print(r.text)

    return response.text("OK")

@app.options("/upload")
def post_json(request):
    return response.text("OK")



if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=8000, debug=True)
    app.run(host="localhost", port=8000, debug=False)
    print("Start")
