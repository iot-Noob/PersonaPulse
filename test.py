import os


for root,_,file in os.walk("./Roles/"):
    for f in file:
        print(f)
