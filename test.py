import datetime
import urllib

import requests
from peewee import fn

from jv_models import Stack

print(fn.MIN(Stack.in_queue))