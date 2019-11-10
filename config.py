import os

bdname = 'master_bot_kit_db'
bduser = 'postgres'
bdpassword = 'nef441'
bdhost = '51.79.69.179'
ADMIN_PASS = "nef441"
ADMIN_HOST = "http://localhost:3000"
if 'SERVER' in os.environ:
    bdhost = '127.0.0.1'
    ADMIN_HOST = "http://mbk.neafiol.site"

bdport = 5432
SERVER_PORT = 8000
