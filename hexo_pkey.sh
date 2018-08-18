#!/bin/bash
hexo clean && hexo d && hexo clean
git add .
git commit -m "update: $(date)"
git push origin hexo_uni
