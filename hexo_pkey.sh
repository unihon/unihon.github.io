#!/bin/bash
git add .
git commit -m "update: $(date -R)"
git push origin hexo_uni
