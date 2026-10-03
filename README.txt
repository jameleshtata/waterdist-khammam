KHAMMAM WATER DISTRIBUTOR SITE
==============================

Files
-----
index.html     Home page with ordering. You do not need to edit this.
videos.html    Videos page.
planner.html   Event planner page.
privacy.html   Privacy and legal page (needs your details filled in, see below).
lang.json      All fixed text in English and Telugu. Edit a line to change a word.
app.js         Shared code. You do not need to edit this.
style.css      Colours and layout.
config.json    Business name, WhatsApp number, contact details, theme, planner rule.
products.json  Brands, sizes and optional photos.
videos.json    YouTube links.
images/        Put product photos here (see below).
make_qr.py     Makes the printable QR card.
.nojekyll      Empty file needed by GitHub Pages.

1. Set the WhatsApp number (do this first)
------------------------------------------
Open config.json and change "whatsappNumber" to country code plus number,
digits only, no plus sign or spaces. Example: 919876543210
Until it is set, the order buttons open WhatsApp without a recipient.

2. Choose the colours
---------------------
In config.json set "theme" to "teal" or "royal".

3. Add or change videos
-----------------------
Open videos.json and add a line for each video:
  { "url": "https://youtu.be/VIDEO_ID", "title": "" }
Any normal YouTube link works. Leave "title" empty to try loading it from
YouTube, or type a title yourself.

4. Add product photos later
---------------------------
Copy the photo into the images folder with any file name, for example
images/copper-1l.png. Then in products.json set that product's "image":
  "image": "images/copper-1l.png"
If the file is missing, the site shows the drawn bottle instead.
Only use photos the brand owner or the distributor has given you.

5. Change sizes, brands or the planner rule
-------------------------------------------
Edit products.json (one entry per size) and the "planner" part of config.json.
Product fields: id, brand, brandName, size, note, height, image, labelColor.
Optional fields:
  "unit": "packs"   overrides "cases" for one product
  "shape": "cup"    draws a cup instead of a bottle (used for Gluco+ cups)
  "hidden": true    keeps the product off the site until you remove this line
Fruski is hidden until the real sizes are known. Fill in "size" and delete the
"hidden" line for that entry to show it.

6. Personal links for regular shops
-----------------------------------
Add ?shop=Shop%20Name to the site address. The order form opens with the shop
name filled in. Example:
  https://USERNAME.github.io/REPONAME/?shop=Sri%20Lakshmi%20Stores
%20 means a space. Nothing is stored; the name only exists in that link.

7. QR code
----------
  pip install "qrcode[pil]" pillow
  python3 make_qr.py https://USERNAME.github.io/REPONAME --theme teal --name "Business Name"
Print the card on delivery slips, shop stickers and the vehicle.

8. Publish on GitHub Pages
--------------------------
- Create a repository, for example waterdist-khammam.
- Upload every file in this folder, including .nojekyll and the images folder.
- Settings > Pages > Source: main branch, root folder > Save.
- The site opens at https://USERNAME.github.io/REPONAME after 2 to 3 minutes.

Testing on your computer
------------------------
Opening index.html by double-click will not work, because browsers block
loading the JSON files. Run this inside the folder and open
http://localhost:8000
  python3 -m http.server

Before going live
-----------------
- Remove the draft banner: set "draftMode" to false in config.json.
- Replace every [CONFIRM] and [PLACEHOLDER] in the three JSON files.
- Get the distributor's permission from Tata for the wording "Authorised
  Tata Water distributor" and for any logos or photos.
- Fill in the FSSAI licence number.

English and Telugu
------------------
The EN | Telugu switch in the header changes the whole page. The choice is kept
only in the visitor's browser for that visit.
- Fixed text (buttons, labels) is in lang.json.
- Business text in config.json can be plain text, or { "en": "...", "te": "..." }
  for two languages. Plain text shows in both.
- Customers can type their shop name, address and notes in Telugu or English.
- The WhatsApp message that opens is always written in English so the
  distributor can read it; what the customer typed is put in exactly as typed.
- Have a Telugu speaker check lang.json and config.json before launch.

Privacy and legal page
----------------------
privacy.html is a plain-language template written for this site, based on
India's Digital Personal Data Protection Act, 2023 and the Consumer Protection
Act, 2019. It is not legal advice. Before launch:
- Fill the "privacy" section in config.json (every [CONFIRM] value).
- Have a lawyer or CA read it once, including how the DPDP Rules are phased in.
- Check it still matches what the site does if you add analytics or forms.
The page is English, with a short Telugu summary shown when Telugu is selected.
