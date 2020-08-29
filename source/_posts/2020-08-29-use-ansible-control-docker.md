---
layout: post
title: use_ansible_control_docker
categories:
  - DevOps
tags:
  - ansible
  - Docker
asciinema: false
date: 2020-08-29 17:32:04
updated: 2020-08-29 17:32:04
---

> Requirements  
Using the docker modules requires having the Docker SDK for Python installed on the host running Ansible. You will need to have >= 1.7.0 installed. For Python 2.7 or Python 3,

注意“the host running Ansible”是指运行、运作ansible的主机，不是“the host installed Ansible”，安装ansible的主机。即是说，Docker SDK是安装在目标操作主机上。

在all modules里面可以查看docker相关的module。

```
docker_compose – Manage multi-container Docker applications with Docker Compose
docker_config – Manage docker configs
docker_container – manage docker containers
docker_container_info – Retrieves facts about docker container
docker_host_info – Retrieves facts about docker host and lists of objects of the services
docker_image – Manage docker images
docker_image_info – Inspect docker images
docker_login – Log into a Docker registry
docker_network – Manage Docker networks
docker_network_info – Retrieves facts about docker network
docker_node – Manage Docker Swarm node
docker_node_info – Retrieves facts about docker swarm node from Swarm Manager
docker_prune – Allows to prune various docker objects
docker_secret – Manage docker secrets
docker_stack – docker stack module
docker_swarm – Manage Swarm cluster
docker_swarm_info – Retrieves facts about Docker Swarm cluster
docker_swarm_service – docker swarm service
docker_swarm_service_info – Retrieves information about docker services from a Swarm Manager
docker_volume – Manage Docker volumes
docker_volume_info – Retrieve facts about Docker volumes
```

控制目标主机（inventory清单中）的docker。


# 案例

```yaml
---

- name: the book use to create a container
  hosts: all
  tasks:
   - name: gogo
     docker_container:
       image: busybox
       name: is_my_container

```


# 参考

- https://docs.ansible.com/ansible/latest/scenario_guides/guide_docker.html
- https://docs.ansible.com/ansible/latest/modules/list_of_all_modules.html