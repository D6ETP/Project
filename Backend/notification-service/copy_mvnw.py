import os
import shutil

src = r"c:\Users\cheta\Desktop\CDAC Project\Self-Project\Backend\booking-service"
dst = r"c:\Users\cheta\Desktop\CDAC Project\Self-Project\Backend\notification-service"

shutil.copy(os.path.join(src, "mvnw"), os.path.join(dst, "mvnw"))
shutil.copy(os.path.join(src, "mvnw.cmd"), os.path.join(dst, "mvnw.cmd"))
shutil.copytree(os.path.join(src, ".mvn"), os.path.join(dst, ".mvn"))
print("Done")
