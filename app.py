from sanic import Sanic
from sanic.views import HTTPMethodView
from sanic.response import text

from Api import Api
from ButtonHeandler import ButtonHeandler
from ConfigHeandler import ConfigHeandler
from MenuHeandler import MenuHeandler
from TableHeandler import TableHeandler

TEXT_HELLO = 'I am post method'

app = Sanic('some_name')


@app.middleware('response')
async def print_on_response(request, response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers["Access-Control-Allow-Methods"] = "POST, PUT, GET, OPTIONS, DELETE, PATCH"



class SimpleAsyncView(HTTPMethodView):

    async def get(self, request):
        return text('I am async get method')

    async def post(self, request):
        return text('I am async post method')

    async def put(self, request):
        return text('I am async put method')


app.add_route(MenuHeandler.as_view(), '/menus')
# app.add_route(ButtonHeandler.as_view(), '/buttons/<btn_id:int>')
app.add_route(ButtonHeandler.as_view(), '/buttons')
app.add_route(TableHeandler.as_view(), '/tables')
app.add_route(ConfigHeandler.as_view(), '/config')
app.add_route(Api.as_view(), '/api')

if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=8000, debug=True)
    app.run(host="localhost", port=8000, debug=False)
