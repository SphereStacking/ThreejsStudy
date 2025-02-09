FROM node:18

# 必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    xdg-utils \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxdamage1 \
    libasound2

WORKDIR /root/app
