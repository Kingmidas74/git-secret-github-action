#!/usr/bin/env bash

export PREFIX="$1"
cd ~
git clone https://github.com/sobolevn/git-secret.git
cd git-secret
sudo make build
sudo make install
