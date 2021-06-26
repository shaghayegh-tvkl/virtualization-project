virsh net-start default

qemu-img create -b ~/configuration/bionic-server-cloudimg-amd64.img -f qcow2 -F qcow2 name.qcow2 10G

qemu-img convert -f qcow2 -O raw name.qcow2 rbd:libvirt-pool/test-image-2