# -*- coding: utf-8 -*-
import sys
import urllib

UNUSUALresponse = "Неожиданный ответ"

sys.path.append('../')
sys.path.append('./')

from datetime import datetime

import requests

from models import *
from telebot import types
import logging

# add filemode="w" to overwrite





class MbkResponse(object):
    bot = None
    user = None
    reply_markup = None
    parse_mode = None
    addition_type = None
    addition = None
    response = "Выбирите действие"
    addition_url = ""
    file_url = ""
    CONFIG = {}
    text = ""
    document = None
    voice = None
    video = None
    photo = None
    audio = None



    def __init__(self, configs, bot, user):
        self.bot = bot
        self.user = user
        self.CONFIG = configs

        logger_handler = logging.StreamHandler(sys.stdout)
        logger_handler.setLevel(logging.DEBUG)

        if "SERVER" in os.environ:
            logger_handler = logging.FileHandler('mbk.log')
            logger_handler.setLevel(logging.INFO)
        logger_formatter = logging.Formatter('[LINE:%(lineno)d] # %(levelname)s [%(asctime)s]: %(message)s')
        logger_handler.setFormatter(logger_formatter)

        self.logger = logging.getLogger("MBK")
        self.logger.addHandler(logger_handler)

    def format(self, string):
        time = datetime.now().strftime("%Y-%m-%d %H:%M")

        return string.replace("%TIME%", time).replace("%NAME%", self.user.name).replace(
            "%FILE%", self.file_url).replace("%USERNAME%", self.user.username).replace(
            "%USER_ID%", str(self.user.tel_id)).replace(
            "%RESPONSE%", str(self.text))

    def alarm(self, text):
        text=self.format(text)
        self.logger.info(text)
        requests.get("https://alarmerbot.ru/?key={}&message= ".format(self.CONFIG["alarmer_key"]) + str(text))

    @staticmethod
    def upload_file(self, downloaded_file):
        r = requests.post("https://catbox.moe/user/api.php", data={
            "reqtype": "fileupload"
        },
                          files={
                              "fileToUpload": downloaded_file
                          })
        self.logger.info(r.text)
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

        notNull = False
        for r in menu.buttons:
            buttons = []
            for c in r:
                if c > 0:
                    buttons.append(types.KeyboardButton(text=res[c]))
            if len(buttons) > 0:
                keyboard.row(*buttons)
                notNull=True

        if notNull:
            self.reply_markup = keyboard
        else:
            self.reply_markup=types.ReplyKeyboardRemove()

        self.user.cms = menu.id

    def addresponse(self, text, parse_mode=None):
        if text != "":
            self.response = self.format(text)
            self.parse_mode = parse_mode

    def addaddition(self, type, url):
        f = open('out.jpg', 'wb')
        f.write(urllib.request.urlopen(url).read())
        f.close()
        self.addition = open('out.jpg', 'rb')
        self.addition_type = type
        self.addition_url = url

    def send(self,edit=False, input_message_id=0):
        if edit:
            mes=Messages.select().where( (Messages.user==self.user) & (Messages.type<0)).order_by(
                Messages.id.desc()).limit(1).execute()[0]
            mes.text=self.response
            print(mes.message_id)
            try:
                self.bot.edit_message_text(
                    chat_id=self.user.tel_id,
                    text=self.response,
                    parse_mode=self.parse_mode,
                    reply_markup=self.reply_markup,
                    message_id=mes.message_id
                )
                mes.save()
                return
            except Exception as e:
                self.logger.info("Can't edit message "+str(e))

        if self.addition is None:
            m=self.bot.send_message(self.user.tel_id, self.response, reply_markup=self.reply_markup,
                                  parse_mode=self.parse_mode)
            Messages(user=self.user, text=self.response, type=-1,message_id=m.message_id,
                     date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
        else:
            if self.addition_type == "photo":
                m=self.bot.send_photo(
                    photo=self.addition,
                    caption=self.response,
                    parse_mode=self.parse_mode,
                    chat_id=self.user.tel_id,
                    reply_markup=self.reply_markup)

            elif self.addition_type == "file":
                m=self.bot.send_document(
                    data=self.addition,
                    caption=self.response,
                    parse_mode=self.parse_mode,
                    chat_id=self.user.tel_id,
                    reply_markup=self.reply_markup)
            else:
                return

            Messages(user=self.user, text=self.response + " [File]", type=-3, info={"url": self.addition_url},
                     message_id=m.message_id,
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

        notNull = False
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
                notNull=True

        if notNull:
            self.reply_markup = keyboard

    def save(self):
        self.user.save()

    def oncallback(self, callback):
        self._callback = callback

    def new_message_text(self, menu_id, text):
        self.text = text

    def new_message_audio(self, menu_id, audio):
        self.audio = audio
        self.file_url = self.upload_file(audio)

    def new_message_photo(self, menu_id, photo):
        self.photo = photo
        self.file_url = self.upload_file(photo)

    def new_message_video(self, menu_id, video):
        self.video = video
        self.file_url = self.upload_file(video)

    def new_message_voice(self, menu_id, voice):
        self.voice = voice
        self.file_url = self.upload_file(voice)

    def new_message_document(self, menu_id, document):
        self.document = document
        self.file_url = self.upload_file(document)

    def call_func(self,cmd):
        pass
