from MbkResponse import MbkResponse


class BotResponse(MbkResponse):

    def new_message_photo(self, photo):
        super().new_message_photo(photo)
        self.bot.s