import requests

with open("upload.bat", 'rb') as f:
    r = requests.post("http://localhost:8000/upload", data={
        "reqtype": "fileupload"
    },
                      files={
                          "file": f
                      })
    print(r.text)

# with open("upload.bat", 'rb') as f:
#     r = requests.post("https://catbox.moe/user/api.php", data={
#         "reqtype": "fileupload"
#     },
#                       files={
#                           "fileToUpload": f
#                       })
#     print(r.text)
    # print(r.json())
