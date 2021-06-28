#!/bin/bash

# This is the format for running the script!!
# /root/configuration/create-vm.sh <name=test-vm> <ram=1024> <cpu=2> <disk=10G>


name=$1
memory=$2
cpu=$3
disk=$4

pool=storagepool

base=/root/configuration
directory=$base/$name

mkdir -p $directory

iso=$base/ubuntu.img


ssh-keygen -t rsa -b 4096 -f ${directory}/id_rsa -C $name -N "" -q

key=$(cat ${directory}/id_rsa.pub)
sed -i -e "s/SSH_KEY_TEMPLATE/${key}/g" $directory/cloud_init.cfg

sed -i -e "s/HOSTNAME/${name}/g" $directory/cloud_init.cfg


qemu-img create -b $iso -f qcow2 $directory/$name-ubuntu.qcow2 5G
#qemu-img convert -f qcow2 -O raw $directory/$name-ubuntu.qcow2 rbd:libvirt-pool/$name-ubuntu
$base/cloud-localds -i $base/network_config_static.cfg $directory/$name-seed.img $base/cloud_init.cfg


qemu-img create -f raw rbd:libvirt-pool/$name-extra $disk

virsh pool-refresh $pool
virsh net-start default

virt-install --name $name \
  --memory $memory --vcpus $cpu \
  --boot hd,menu=on \
  --disk path=$directory/$name-seed.img,device=cdrom \
  --disk path=$directory/$name-ubuntu.qcow2,device=disk \
  --disk vol=$pool/$name-extra  \
  --os-type Linux --os-variant ubuntu18.04 \
  --network network:default \
  --console pty,target_type=serial \
  --autostart --noautoconsole

# --disk vol=$pool/$name-ubuntu