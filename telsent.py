# -*- coding: utf-8 -*-
import json
import os
import re
import sys
import urllib
from cmath import sqrt

from playhouse.shortcuts import model_to_dict
from telebot.apihelper import ApiException

UNUSUAL_RESPONSE = "Неожиданный ответ"

sys.path.append('../')
sys.path.append('./')

from datetime import datetime

import requests
from telebot.types import InputMediaPhoto, InputMediaVideo

from config import *

from models import *
import telebot
from telebot import types

import logging

# add filemode="w" to overwrite
filename = None
if "SERVER" in os.environ:
    filename = "bot.log"

logging.basicConfig(format=u'[LINE:%(lineno)d] # %(levelname)s [%(asctime)s]: %(message)s', level=logging.INFO,
                    filename=filename
                    )

logger = logging.getLogger("cs")

CONFIG = {}
for c in Config.select():
    if c.value == "json":
        CONFIG[c.name] = c.json
    else:
        CONFIG[c.name] = c.value


# BOT CODE
class MbkResponse:
    bot = None
    user = None
    reply_markup = None
    parse_mode = None
    addition_type = None
    addition = None
    response="Выбирите действие"
    addition_url=""
    CONFIG = {}

    def __init__(self, configs, bot, user):
        self.bot = bot
        self.user = user
        self.CONFIG = configs

    def format(self, string):
        time = datetime.now().strftime("%Y-%m-%d %H:%M")

        return string.replace("%TIME%", time).replace("%NAME%", self.user.name).replace("%USERNAME%",
                                                                                        self.user.username).replace(
            "%USER_ID%", str(self.user.tel_id))

    def alarm(self, text):
        requests.get("https://alarmerbot.ru/?key={}&message= ".format(CONFIG["alarmer_key"]) + str(text))

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

        self.reply_markup = keyboard
        self.user.cms = menu.id

    def set_response(self, text, parse_mode=None):
        self.response = self.format(text)
        self.parse_mode=parse_mode

    def add_addition(self,type,url):
        import requests
        f = open('out.jpg', 'wb')
        f.write(urllib.request.urlopen(url).read())
        f.close()
        self.addition = open('out.jpg', 'rb')
        self.addition_type=type
        self.addition_url = url

    def send(self,edit_message_id=0):
        if edit_message_id>0:
            bot.edit_message_text(
                chat_id=self.user.tel_id,
                text=self.response,
                parse_mode=self.parse_mode,
                reply_markup=self.reply_markup,
                message_id=edit_message_id
            )
        elif self.addition is None:
            bot.send_message(self.user.tel_id, self.response, reply_markup=self.reply_markup, parse_mode=self.parse_mode)
            Messages(user=self.user, text=self.response, type=-1, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
        else:
            if self.addition_type == "photo":
                bot.send_photo(
                    photo=self.addition,
                    caption=self.response,
                    parse_mode=self.parse_mode,
                    chat_id=self.user.tel_id,
                    reply_markup=self.reply_markup)


            if self.addition_type == "file":
                bot.send_document(
                    data=self.addition,
                    caption=self.response,
                    parse_mode=self.parse_mode,
                    chat_id=self.user.tel_id,
                    reply_markup=self.reply_markup)

            Messages(user=self.user, text=self.response+" [File]", type=-3, info={"url": self.addition_url},
                     date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()

    def add_callback_menu(self, menu, callback="-"):
        assert self.reply_markup is not None, "reply_markup already set"

        keyboard = types.InlineKeyboardMarkup()
        menu = Menu.get_by_id(menu)
        butns = list(set([x for sublist in menu.buttons for x in sublist]))
        butns = Buttons.select(Buttons.name, Buttons.id, Buttons.info).where(
            Buttons.id.in_(butns)).execute()
        res = {}
        for b in butns:
            res[b.id] = {
                "name": b.name,
                "callback": callback,
                "url": ("callbackType" in b.info and b.info["callbackType"] == 1)
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

            self.reply_markup = keyboard


bot = telebot.TeleBot(CONFIG["ttoken"])


def alarm(text):
    logger.info(text)
    requests.get("https://alarmerbot.ru/?key={}&message= ".format(CONFIG["alarmer_key"]) + str(text))


def review(text, u, menu_name=None, callback=None, message_id=None):
    bcount = Buttons.select().where(Buttons.name == text).count()
    info = {}
    if bcount == 1:
        btn = Buttons.get(Buttons.name == text)
        info = btn.info
        print("Btn by name")
    else:
        menu = Menu.get_or_none(Menu.id == u.cms)
        if bcount == 0:
            info = menu.zbutton
        else:
            btn = Buttons.get((Buttons.name == text) & (Buttons.menu_id == menu.id))
            info = btn.info

    print("info", info)
    if "responseType" in info and info["responseType"] != "text":
        bot.send_message(u.tel_id, UNUSUAL_RESPONSE)
        Messages(user=u, text=UNUSUAL_RESPONSE, type=-1, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()

        return u

    if "newLevel" in info and info["newLevel"]:
        u.level = int(info["newLevel"])

    if "saveInTable" in info and info["saveInTable"] == 1:
        if "columnName" not in info:
            info["columnName"] = ""
        t = Tables.get_by_id(info["tableName"])
        col = t.columns
        row = {}
        if "editRow" in info and info["editRow"] == 1:
            last_row = Rows.select().where(Rows.user == u).order_by(Rows.id.desc()).limit(1)[0]
            row = last_row.columns

        for c in col:
            if c["name"] == info["columnName"]:
                row[c["name"]] = info["tableRowValue"]
            else:
                value = "-"
                if c["default"] > 0:
                    value = format(c["defaultValue"], u)
                row[c["name"]] = value

        if "editRow" in info and info["editRow"] == 1:
            r = Rows.update({Rows.columns: row}).where(Rows.id == last_row.id).execute()
        else:
            Rows.create(table=t, user_id=u, columns=row)

    reply_markup = None
    if "changeGroup" in info and info["changeGroup"] == 1:
        keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
        menu = Menu.get_by_id(info["newGroupId"])
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

        reply_markup = keyboard
        u.cms = menu.id

    elif "add_callback_menu" in info and info["add_callback_menu"] == 1:
        keyboard = types.InlineKeyboardMarkup()
        menu = Menu.get_by_id(info["callback_menu"])
        butns = list(set([x for sublist in menu.buttons for x in sublist]))
        butns = Buttons.select(Buttons.name, Buttons.id, Buttons.info).where(
            Buttons.id.in_(butns)).execute()
        res = {}
        for b in butns:
            res[b.id] = {
                "name": b.name,
                "callback": b.info["callback"] if "callback" in info else "-",
                "url": ("callbackType" in b.info and b.info["callbackType"] == 1)
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

            reply_markup = keyboard

    if "notification" in info and info["notification"] == 1:
        text = format(info["notificationText"], u)
        alarm(text)

    response = "Выбирите действие"
    if "response" in info and info["response"]:
        response = format(info["response"], u)

    if "textParsing" in info and info["textParsing"] != "None":
        parse_mode = info["textParsing"]
    else:
        parse_mode = None

    if "editLastMessage" in info and info["editLastMessage"] > 0:
        bot.edit_message_text(
            chat_id=u.tel_id,
            text=response,
            parse_mode=parse_mode,
            reply_markup=reply_markup,
            message_id=message_id
        )
    else:
        if "addition" in info:
            import requests
            f = open('out.jpg', 'wb')
            f.write(urllib.request.urlopen(info["file_url"]).read())
            f.close()
            img = open('out.jpg', 'rb')
            if info["addition"] == "photo":
                bot.send_photo(
                    photo=img,
                    caption=response,
                    parse_mode=parse_mode,
                    chat_id=u.tel_id,
                    reply_markup=reply_markup)
                Messages(user=u, text="Photo", type=-3, info={"url": info["file_url"]},
                         date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()

            if info["addition"] == "file":
                bot.send_document(
                    data=info["file_url"],
                    caption=response,
                    parse_mode=parse_mode,
                    chat_id=u.tel_id,
                    reply_markup=reply_markup)
                Messages(user=u, text="Document", info={"url": info["file_url"]},
                         type=-3, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
            img.close()
        else:
            bot.send_message(u.tel_id, response, reply_markup=reply_markup, parse_mode=parse_mode)
            Messages(user=u, text=response, type=-1, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()

    return u


@bot.callback_query_handler(
    func=lambda call: True)
def callback(call):
    if call.from_user:
        cal = str(call.data)
        print("Callback", cal)
        button_name = cal.split("_")[0]
        menu_name = cal.split("_")[1]
        callback = "".join(cal.split("_")[2:])

        u = Users.get_or_none(Users.tel_id == call.message.chat.id)
        u = review(button_name, u, menu_name=menu_name, callback=callback, message_id=call.message.message_id)
        u.save()

    bot.answer_callback_query(call.id, text="")
    Messages(user=u, text=cal, type=2, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()


def format(string, u):
    time = datetime.now().strftime("%Y-%m-%d %H:%M")

    return string.replace("%TIME%", time).replace("%NAME%", u.name).replace("%USERNAME%", u.username).replace(
        "%USER_ID%", str(u.tel_id))


@bot.message_handler(content_types=["text"])
def repeat_all_messages(message):
    print(message.text)

    u = Users.get_or_none(Users.tel_id == message.chat.id)
    if u == None:
        """the user is not in the database """
        mstart = Menu.get(Menu.name == "Start")
        u = Users(tel_id=message.chat.id, name=str(message.from_user.first_name) + " " + str(
            message.from_user.last_name), cms=mstart.id,  # 1 - enter age
                  username=str(message.from_user.username))
        ava = bot.get_user_profile_photos(message.chat.id)
        f = bot.get_file(ava.photos[0][-1].file_id)
        avatar = "https://api.telegram.org/file/bot{}/{}".format(CONFIG["ttoken"], f.file_path)
        u.avatar = avatar
        u.save()

    u = review(message.text, u, message_id=message.message_id)
    # logger.info(u.name + " " + message.text)
    u.save()
    Messages(user=u, text=message.text, type=1, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()


# Main Fanction

if __name__ == '__main__':
    if "SERVER" in os.environ:
        logger.info("Starting on server 2.2")
    else:
        logger.info("DEBAG Starting")

    er = 5
    while er > 0:
        try:
            bot.polling(none_stop=True)

        except Exception as e:
            logger.info(str(e))

            import traceback

            traceback.print_tb(e.__traceback__)

            if "SERVER" in os.environ:
                er -= 1
                alarm(e)
            else:
                break
    if er < 1:
        exit(-1)
