# -*- coding: utf-8 -*-
import sys

from MbkResponse import MbkResponse

UNUSUAL_RESPONSE = "Неожиданный ответ"

sys.path.append('../')
sys.path.append('./')

from datetime import datetime

from models import *
import telebot

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

CONFIG = {}
for c in Config.select():
    if c.value == "json":
        CONFIG[c.name] = c.json
    else:
        CONFIG[c.name] = c.value

# BOT CODE


bot = telebot.TeleBot(CONFIG["ttoken"])


def review(text, u, menu_name=None, callback=None, message_id=None, file=None, mes_type="text"):
    bcount = Buttons.select().where(Buttons.name == text).count()
    info = {}
    zbutton = False
    if bcount == 1:
        btn = Buttons.get(Buttons.name == text)
        info = btn.info
        print("Btn by name")
    else:
        menu = Menu.get_or_none(Menu.id == u.cms)
        if bcount == 0:
            info = menu.zbutton
            zbutton = True
        else:
            btn = Buttons.get((Buttons.name == text) & (Buttons.menu_id == menu.id))
            info = btn.info

    mbk = MbkResponse(CONFIG, bot, u)
    logger.info("info" + str(info))
    logger.debug("info" + str(info))
    info = {
        "notificationText": None,
        "newLevel": None,
        "changeGroup": None,
        "response": "",
        "file_url": ",",
        "textParsing": "None",
        "editLastMessage": 0,
        **info
    }
    # zero button
    if "responseType" in info and zbutton:
        if info["responseType"] != mes_type:
            bot.send_message(u.tel_id, UNUSUAL_RESPONSE)
            Messages(user=u, text=UNUSUAL_RESPONSE, type=-1,
                     date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
            return u
        else:
            if mes_type == "text":
                mbk.new_message_text(menu.id, text)
            elif mes_type == "audio":
                mbk.new_message_audio(menu.id, file)
            elif mes_type == "photo":
                mbk.new_message_photo(menu.id, file)
            elif mes_type == "video":
                mbk.new_message_video(menu.id, file)
            elif mes_type == "voice":
                mbk.new_message_voice(menu.id, file)
            elif mes_type == "document":
                mbk.new_message_document(menu.id, file)

    if callback is not None:
        mbk.oncallback(callback)

    if "newLevel" in info and info["newLevel"]:
        mbk.set_level(info["newLevel"])

    if "saveInTable" in info and info["saveInTable"] == 1:
        mbk.save_in_table(info["tableName"], info["columnName"], info["tableRowValue"])

    if "changeGroup" in info and info["changeGroup"] == 1:
        mbk.change_group(info["changeGroup"])

    elif "add_callback_menu" in info and info["add_callback_menu"] == 1:
        mbk.add_callback_menu(info["callback_menu"])

    if "notification" in info and info["notification"] == 1:
        mbk.alarm(info["notificationText"])

    if "addition" in info:
        mbk.add_addition(info["addition"], info["file_url"])

    mbk.add_response(info["response"], info["textParsing"])

    if not ("autoResponse" in info and info["autoResponse"] > 0):
        mbk.send(message_id if info["editLastMessage"] > 0 else 0)

    mbk.save()
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


@bot.message_handler(content_types=['document'])
def handle_docs_document(message):
    try:
        u = Users.get_or_none(Users.tel_id == message.chat.id)
        logger.info(u.name + ": file")

        file_info = bot.get_file(message.document.file_id)
        downloaded_file = bot.download_file(file_info.file_path)

        u = review(message.text, u, message_id=message.message_id, file=downloaded_file, mes_type="file")
        u.save()
        Messages(user=u, text="FILE", type=3, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
    except Exception as e:
        bot.reply_to(message, e)


@bot.message_handler(content_types=['photo'])
def handle_docs_photo(message):
    # try:
    u = Users.get_or_none(Users.tel_id == message.chat.id)
    logger.info(u.name + ": photo")

    file_info = bot.get_file(message.photo[len(message.photo) - 1].file_id)
    downloaded_file = bot.download_file(file_info.file_path)

    u = review(message.text, u, message_id=message.message_id, file=downloaded_file, mes_type="photo")
    u.save()
    Messages(user=u, text="FILE", type=3, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()


# except Exception as e:
#     bot.reply_to(message, e)


@bot.message_handler(content_types=['video'])
def handle_docs_video(message):
    try:
        u = Users.get_or_none(Users.tel_id == message.chat.id)
        logger.info(u.name + ": video")

        file_info = bot.get_file(message.video.file_id)
        downloaded_file = bot.download_file(file_info.file_path)

        u = review(message.text, u, message_id=message.message_id, file=downloaded_file, mes_type="video")
        u.save()
        Messages(user=u, text="FILE", type=3, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
    except Exception as e:
        bot.reply_to(message, e)


@bot.message_handler(content_types=['audio'])
def handle_docs_video(message):
    try:
        u = Users.get_or_none(Users.tel_id == message.chat.id)
        logger.info(u.name + ": audio")

        file_info = bot.get_file(message.audio.file_id)
        downloaded_file = bot.download_file(file_info.file_path)

        u = review(message.text, u, message_id=message.message_id, file=downloaded_file, mes_type="audio")
        u.save()
        Messages(user=u, text="FILE", type=3, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
    except Exception as e:
        bot.reply_to(message, e)


@bot.message_handler(content_types=['audio'])
def handle_docs_video(message):
    try:
        u = Users.get_or_none(Users.tel_id == message.chat.id)
        logger.info(u.name + ": audio")

        file_info = bot.get_file(message.audio.file_id)
        downloaded_file = bot.download_file(file_info.file_path)

        u = review(message.text, u, message_id=message.message_id, file=downloaded_file, mes_type="audio")
        u.save()
        Messages(user=u, text="FILE", type=3, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()
    except Exception as e:
        bot.reply_to(message, e)


@bot.message_handler(content_types=["text"])
def repeat_all_messages(message):
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

    logger.info(u.name + " " + message.text)

    u = review(message.text, u, message_id=message.message_id, mes_type="text")
    # logger.info(u.name + " " + message.text)
    u.save()
    Messages(user=u, text=message.text, type=1, date=str(datetime.now().strftime("%d %b. %Y %H:%M"))).save()


# Main Fanction

if __name__ == '__main__':
    if "SERVER" in os.environ:
        logger.info("Starting on server 2.2")
    else:
        logger.info("DEBAG Starting")

    print(CONFIG)

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
