from MbkResponse import MbkResponse
from jv_models import Stack


class BotResponse(MbkResponse):

    def new_message_photo(self, photo):
        super().new_message_photo(photo)

    def call_func(self, cmd):

        def alert_first():
            row=Stack.get_or_none(Stack.in_queue==1)
            if row is not None:
                self.bot.send_message(row.tel_id, "Вы первый в очереди, Вас ожидают.")

        if cmd == "list":
            resp = "<b>Текущая очередь</b>\n"
            queue = Stack.select().order_by(Stack.in_queue).execute()
            for i ,row in enumerate(queue):
                resp += str(i+1) + ". " + row.name + " - " + row.description + "\n"

            self.bot.send_message(self.user.tel_id, resp,
                                  parse_mode="HTML")

        elif cmd == "put":
            row = Stack.get_or_none(Stack.tel_id == self.user.tel_id)
            if row is None:
                count = Stack.select().count()
                Stack(tel_id=self.user.tel_id, name=self.user.name,in_queue=count+1).save()
            else:
                self.bot.send_message(self.user.tel_id, "Вы уже стоите в очереди")
                self.change_group(3)

        elif cmd == "pull":
            row = Stack.get_or_none(Stack.tel_id == self.user.tel_id)
            if row is None:
                self.bot.send_message(self.user.tel_id, "Вы не стоите в очереди")
            else:
                Stack.update({Stack.in_queue: Stack.in_queue - 1}).where(Stack.in_queue>row.in_queue).execute()
                Stack.delete_by_id(row.id)
                if row.in_queue==1:
                    alert_first()

                self.bot.send_message(self.user.tel_id, "Готово")


        elif cmd == "intention":
            row = Stack.get_or_none(Stack.tel_id == self.user.tel_id)
            if row is not None:
                row.description = self.text
                row.save()

        elif cmd == "skip":
            row=Stack.get_or_none(Stack.tel_id == self.user.tel_id)
            row2=Stack.get_or_none(Stack.in_queue == row.in_queue+1)
            row.in_queue+=1
            if row2 is not None:
                row2.in_queue -= 1
                row2.save()
            row.save()
            self.bot.send_message(self.user.tel_id, "Вы пропустили человека")
            alert_first()

        elif cmd == "drop_first":
            row=Stack.get_or_none(Stack.in_queue == 1)
            self.bot.send_message(self.user.tel_id, str(row.name) + " удален из очереди")
            Stack.delete_by_id(row.id)
            Stack.update({Stack.in_queue:Stack.in_queue-1}).execute()
            alert_first()

        elif cmd == "present":
            print(self.text)
            self.user.name = self.text
