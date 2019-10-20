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
            all_rows=Rows.select(Rows.id,Rows.columns).where(Rows.table==t).execute()
            for row in all_rows:
                res=[]
                print("columns_names",columns_names)
                print("row.columns",row.columns)
                for c_name in columns_names:
                    if c_name in row.columns:
                        res.append(row.columns[c_name])
                    else:
                        res.append("-")

                result.append({"row":res,"id":row.id})
        else:
            all = Tables.select().execute()
            for a in all:
                result.append(model_to_dict(a))
        return response.json(result)


    def post(self, request):
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
        if "patch_table_data" in r:
            for rid in r["patch_table_data"]:
                row=Rows.get_by_id(rid)
                row.columns={
                    **row.columns,
                    **r["patch_table_data"][rid]
                }
                row.save()
            return response.text("ok")

        Tables.update({Tables.columns:r["columns"]}).where(Tables.id==r["id"]).execute()
        return response.text("ok")

    def post(self, request):
        r=request.json
        t=Tables.insert(r).execute()
        r["id"]=t
        return response.json(r)

    def delete(self, request):
        r = request.args
        if "table_id" in r:
            Tables.delete_by_id(r["table_id"][0])
        if "rows[]" in r:
            for r in r["rows[]"]:
                try:
                    Rows.delete_by_id(r)
                except:
                    response.text("Error")
        return response.text("ok")

    def options(self,reques):
        return response.text("")
