import os

bdname = 'master_bot_kit_db'
bduser = 'postgres'
bdpassword = 'nef441'
bdhost = '51.79.69.179'
admin_pass="nef441"
admin_host="http://localhost:3000"
if 'SERVER' in os.environ:
    bdhost = '127.0.0.1'
    admin_host = "http://mbk.neafiol.site"

bdport = 5432