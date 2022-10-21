# Readme
Memos using Whisper Open AI


## How does it work

### Frontend
Memos is available at https://memos.web.app

The frontend code is in `./src/frontend`. Nothing special here, just an index.html and some JS that manages the UI and some CSS (it is a mess right now) for the styling.

The deploy is managed by 2 git workflows in `./github/workflows` . One action publishes to github page (I will deprecate it). The other action uses Firebase. The frontend is hosted on Firebase hosting.

### Backend
There are 2 pieces involved for the backend.
When a audio is recorded the file is posted to a firebase function (`functions/index.js`). Currently firebase function does not do much. It simply forward the audio to an external server I created on Vultr.

On second server where I installed Whisper AI (and Whisper AI C++). Here is where the magic happen. The audio file is fed to a Whisper process. Once Whisper does the transcoding then the text is sent back to Firebase which then return to the client. If all goes well then a confetti message is shown.

I could have used just the second server but I didnt want to mess with domain registration, ssl certificates... firebase functions act as reverse proxy :)

----

Feel free to connect with me for more info.




