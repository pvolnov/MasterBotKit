from playhouse.shortcuts import model_to_dict
from sanic import response
from sanic.views import HTTPMethodView

from models import Menu, Buttons, Tables, Rows


class TableHeandler(HTTPMethodView):

    def get(self, request):
        r=request.args
        result = []
        if "table_id" in r:
            t=Tables.get_by_id(r["table_id"])

            columns_names=[c["name"] for c in t.columns]
            print(columns_names)
            all=Rows.select(Rows.id,Rows.columns).where(Rows.table==t).execute()
            for a in all:
                print(a.columns)
                res=[]
                for c_name in columns_names:
                    if c_name in a.columns:
                        res.append(a.columns[c_name])
                    else:
                        res.append("-")

                result.append(res)
        else:
            all = Tables.select().execute()
            for a in all:
                result.append(model_to_dict(a))
        return response.json(result)


    def post(self, request):
        print(request.json)
        try:
            Tables.insert(request.json).execute()
            return response.text("ok")
        except Exception as e:
            return response.json(
                {'message': str(e)},
                status=500
            )

    def patch(self, request):
        r=request.json
        Tables.update(r).execute()
        return response.text("ok")

    def delete(self, request):
        r = request.json
        Buttons.delete_by_id(r["table_id"])
        return response.text("Complete")
