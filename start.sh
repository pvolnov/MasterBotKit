export SERVER='VDS1'

cp -f config.py mbk_server/config.py
cp -f config.py mbk_bot/config.py
pip3.7 install -r mbk_bot/requrement.txt
pip3.7 install -r mbk_server/requrement.txt

systemd start mbk
systemd start mbk_server