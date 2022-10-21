# on Mac
Update /etc/hosts to 
xx.xx.xx.xx  memos.loc
where xx is the ip address of the whisper server


# on Ubuntu or Debian

## Make sure is all update

```
sudo apt update -y
sudo apt upgrade -y
```

## Install pip3

```
sudo apt install tmux -y
```

## Install pip3

```
sudo apt install python3-pip -y
```

## Install ffmpeg

```
sudo apt install ffmpeg -y
```

## Install git

```
sudo apt install git -y
```

## Install pytorch

```
sudo pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu
```

## Install whisper

```
sudo pip3 install git+https://github.com/openai/whisper.git 
```

## Sync folder

```
rsync -av -e ssh --exclude='node_modules' /Users/fabgio/Projects/memos/src/backend root@memos.loc:/root
rsync -av -e ssh root@memos.loc:/root/audios /Users/fabgio/Downloads/audio 
```

## Install node

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
nvm install 18.11.0
```

## Allow ports

```
sudo ufw status verbose
sudo ufw allow https
```

## Generate keys https


// On the server

```
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```


## Whisper cpp

```
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make
bash ./download-ggml-model.sh base.en
bash ./download-ggml-model.sh small.en
bash ./download-ggml-model.sh medium.en
````


curl -F token=memossecretupload -F logo=@dd0dad16-7790-4e8b-b64e-9c3e2d6bd9d0.mp3 http://memos.loc:3000/upload