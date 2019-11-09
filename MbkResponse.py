# -*- coding: utf-8 -*-
import sys
import urllib

UNUSUAL_RESPONSE = "Неожиданный ответ"

sys.path.append('../')
sys.path.append('./')

from datetime import datetime

import requests

from models import *
from telebot import types
import logging

# add filemode="w" to overwrite
filename = None
if "SERVER" in os.environ:
    filename = "bot.log"

logging.basicConfig(format=u'[LINE:%(lineno)d] # %(levelname)s [%(asctime)s]: %(message)s', level=logging.INFO,
                    filename=filename
                    )

logging.basicConfig(format=u'[LINE:%(lineno)d] # %(levelname)s [%(asctime)s]: %(message)s', level=logging.DEBUG,
                    )

logger = logging.getLogger("cs")
    
class MbkResponse:

    bot = None
    user = None
    _reply_markup = None
    _parse_mode = None
    _addition_type = None
    _addition = None
    _response = "Выбирите действие"
    _addition_url = ""
    _file_url = ""
    CONFIG = {}

    def __init__(self, configs, bot, user):
        self.bot = bot
        self.user = user
        self.CONFIG = configs

    def format(self, string):
        time = datetime.now().strftime("%Y-%m-%d %H:%M")

        return string.replace("%TIME%", time).replace("%NAME%", self.user.name).replace(
            "%FILE%", self._file_url).replace("%USERNAME%", self.user.username).replace(
            "%USER_ID%", str(self.user.tel_id))

    def alarm(self, text):
        logger.info(text)
        requests.get("https://alarmerbot.ru/?key={}&message= ".format(self.CONFIG["alarmer_key"]) + str(text))

    @staticmethod
    def upload_file(self, downloaded_file):
        r = requests.post("https://catbox.moe/user/api.php", data={
            "reqtype": "fileupload"
        },
                          files={
                              "fileToUpload": downloaded_file
                          })
        logger.info(r.text)
        return r.text

    def set_level(self, level):
        self.user.level = level

    def save_in_table(self, table, column="", value="-", new=True):
        t = Tables.get_by_id(table)
        col = t.columns
        row = {}
        if not new:
            last_row = Rows.select().where(Rows.user == self.user).order_by(Rows.id.desc()).limit(1)[0]
            row = last_row.columns

        for c in col:
            if c["name"] == column:
                row[c["name"]] = value
            else:
                value = "-"
                if c["default"] > 0:
                    value = self.format(c["defaultValue"])
                row[c["name"]] = value

        if not new:
            r = Rows.update({Rows.columns: row}).where(Rows.id == last_row.id).execute()
        else:
            Rows.create(table=t, user=self.user, columns=row)

    def change_group(self, group):
        keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
        menu = Menu.get_by_id(group)
        butns = list(set([x for sublist in menu.buttons for x in sublist]))
        butns = Buttons.select(Buttons.name, Buttons.id).where(
            Buttons.id.in_(butns)).execute()
        res = {}
        for b in butns:
            res[b.id] = b.name

        for r in menu.buttons:
            buttons = []
            for c in r:
                if c >= 0: buttons.append(types.KeyboardButton(text=res[c]))
            if len(buttons) > 0:
                keyboard.row(*buttons)

        self._reply_markup = keyboard
        self.user.cms = menu.id

    def add_response(self, text, parse_mode=None):
        if text != "":
            self._response = self.format(text)
            self._parse_mode = parse_mode

    def add_addition(self, type, url):
        f = open('out.jpg', 'wb')
        f.write(urllib.request.urlopen(url).read())
        f.close()
        self._addition = open('out.jpg', 'rb')
        self._addition_type = type
        self._addition_url = url

    def send(self, edit_message_id=0):
        if edit_message_id > 0:
            self.bot.edit_message_text(
                chat_id=self.user.tel_id,
                text=self._response,
                parse_mode=self._parse_mode,
                reply_markup=self._reply_markup,
                message_id=edit_message_id
            )
        elif self._addition is None:
            self.bot.send_message(self.user.tel_id, self._response, reply_markup=self._reply_markup,
                                   parse_mode=self._parse_mode)
            Messages(user=self.user, text=self._response, type=-1,
                     date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
        else:
            if self._addition_type == "photo":
                self.bot.send_photo(
                    photo=self._addition,
                    caption=self._response,
                    parse_mode=self._parse_mode,
                    chat_id=self.user.tel_id,
                    reply_markup=self._reply_markup)

            if self._addition_type == "file":
                self._bot.send_document(
                    data=self._addition,
                    caption=self._response,
                    parse_mode=self._parse_mode,
                    chat_id=self.user.tel_id,
                    reply_markup=self._reply_markup)

            Messages(user=self.user, text=self._response + " [File]", type=-3, info={"url": self._addition_url},
                     date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()

    def add_callback_menu(self, menu):
        # assert self.reply_markup is not None, "reply_markup already set"

        keyboard = types.InlineKeyboardMarkup()
        menu = Menu.get_by_id(menu)
        butns = list(set([x for sublist in menu.buttons for x in sublist]))
        butns = Buttons.select(Buttons.name, Buttons.id, Buttons.info).where(
            Buttons.id.in_(butns)).execute()
        res = {}
        for b in butns:
            if "callbackType" in b.info and b.info["callbackType"] == 1:
                res[b.id] = {
                    "name": b.name,
                    "callback": b.info["callback"],
                    "url": True
                }
            else:
                res[b.id] = {
                    "name": b.name,
                    "callback": (b.info["callback"] if "callback" in b.info else ""),
                    "url": False
                }

        for r in menu.buttons:
            buttons = []
            for c in r:
                if c >= 0:
                    if res[c]["url"]:
                        buttons.append(types.InlineKeyboardButton(text=res[c]["name"],
                                                                  url=res[c]["callback"]))
                    else:
                        buttons.append(types.InlineKeyboardButton(text=res[c]["name"],
                                                                  callback_data=res[c]["name"] + "_" +
                                                                                str(menu.id) + "_" + res[c][
                                                                                    "callback"]))
            if len(buttons) > 0:
                keyboard.row(*buttons)

            self._reply_markup = keyboard

    def save(self):
        self.user.save()

    def oncallback(self, callback):
        self._callback = callback

    def new_message_text(self, text):
        self._text = text

    def new_message_audio(self, audio):
        self._audio = audio
        self._file_url = self.upload_file(audio)

    def new_message_photo(self, photo):
        self._photo = photo
        self._file_url = self.upload_file(photo)
        print(self._file_url)

    def new_message_video(self, video):
        self._video = video
        self._file_url = self.upload_file(video)

    def new_message_voice(self, voice):
        self._voice = voice
        self._file_url = self.upload_file(voice)

    def new_message_document(self, document):
        self._document = document
        self._file_url = self.upload_file(document)
