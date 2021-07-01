# Virtualization Project


# Components
This is the componenet diagram for this project:



## Virtualization Node
Virtual machines are created on two virtualization nodes. I'm using QEMU to emulate machines and Libvirt to provide a daemon and client to manipulate VMs.



## Ceph Cluster
The storage of my virtual machines are managed by Ceph. Ceph is an open-source software storage platform, implements object storage on a single distributed computer cluster, and provides 3-in-1 interfaces for object-, block- and file-level storage.
A block is a sequence of bytes (often 512). Block-based storage interfaces are a mature and common way to store data on media including HDDs, SSDs, CDs, floppy disks, and even tape. The ubiquity of block device interfaces is a perfect fit for interacting with mass data storage including Ceph.

Ceph block devices are thin-provisioned, resizable, and store data striped over multiple OSDs. Ceph block devices leverage RADOS capabilities including snapshotting, replication and strong consistency. Ceph block storage clients communicate with Ceph clusters through kernel modules or the librbd library. Ceph block devices can integrate with the QEMU virtual machines. 

My Ceph Storage Cluster is made up of 3 Ceph Monitors, 1 Ceph Manager, and 3 Ceph OSDs.

Libvirt-pool is created for RADOS Block Devices (RBD) in order to provide block device images to virtual machines. A pool is defined by Libvirt and connected to libvirt-pool to manage images.


## Internal API 

Creating virtual machines are done through internal APIs. A Node.js application using Express framework is running on virtualization nodes to provide APIs to create virtual machines and run the necessary scripts in order to create virutal machines. Internal APIs are run via PM2 process manager so if there is error, the application would be restarted automatically.

Code is copied to each machine and started by ansible plays. If there would be an updated to the code, another ansible play would copy the files again, install npm dependencies, and restart the code with PM2.

## Internal HAProxy
For balancing the request between our two virtualization nodes, an HAProxy is used for load balancing the requests on our two machines using Round-robin algorithm.

## Database
In this project, PostgreSQL database is used to store the data of all our virtual machines. Also, Redis is used to cache the name of each virtual machine and the IP address of the virtualization node on which it is running. This data can be used in order to change the status of each machine. For example, if you need to suspend a machine, you have to know exactly where is your machine.

Both databases are installed using docker-compose.


## External API
Users intract with this system through external APIs. A Node.js application using Express framework is running on api nodes to provide APIs to intract with internal APIs. External APIs are run via PM2 process manager so if there is error, the application would be restarted automatically.

Code is copied to each machine and started by ansible plays. If there would be an updated to the code, another ansible play would copy the files again, install npm dependencies, and restart the code with PM2.

## Enternal HAProxy
For balancing the request between our two API nodes, an HAProxy is used for load balancing the requests on our two machines using Round-robin algorithm.


## Monitoring
For monitoring my application I have used Prometheus. Prometheus can collect metrics about your application and infrastructure. Metrics are small concise descriptions of an event: date, time, and a descriptive value. Grafana is also used for visualizing collected data.

Both tools are installed using docker-compose.

## Manager Node
All the tasks explained above are done using ansible:

`ansible-playbook -i ./installation/hosts ./installation/site.yml`



# API Scenario

## Internal APIs

- ### Create Virtual Machine
This API runs the [create-vm.sh](https://github.com/shaghayegh-tvkl/virtualization-project/blob/main/installation/libvirt/files/create-vm.sh) script. This script creates the Ubuntu 18.04 image and the extra disks for the requested virtual machine, creates the keys and seed them into the  and then run `virsh` command for creating a new virtual machine with given parameters. 
Since the API is behind a reverse proxy, we won't know which vitual machine is created on which node so this data would be cached in Redis. If we need to delete a virtual machine we would exactly know the node on which the virtual machine has been created.
After running the script, the virtual machine data will be added to the database (PostgreSQL). However, since the machine has not been assigned an IP yet the value for this column would be set as "unassigned" and another function would add this column. The following line is added to the crontab file:

`*/1 * * * * curl -X POST -d '{"name" :"test-1"}' -H "Content-Type: application/json" http://localhost:8000/api/v1/ip/`

This would create a cron job so that every minute would be checking if the virtual machine has been assigned an IP and if so, the database record would be updated. 



Input Sample: 

    {
        "Name":  "test-1",
        "RAM":  "1024",
        "CPU":  "2",
        "Disk":  "10"
    }

Status Code 201 - Created in case the process is successful.


- ### Check Virtual Machine IP
This API is called at one minute interval and run the following command:

`arp -a | grep $(virsh domiflist test-1 | awk '{print $5 }' | tail -2 | head -1) | awk '{print $2}' | sed 's/[()]//g'`

If the virtual machine named test-1 has been assinged with an IP, the command above would return it, the database would be updated, and the cron job would be deleted. Alternatively no action is taken.


## External APIs
- ### Create Virtual Machine
This API calls the internal API for creating a new Virtual Machine.
Input Sample: 

    {
        "Name":  "test-1",
        "RAM":  "1024",
        "CPU":  "2",
        "Disk":  "10"
    }

Status Code 201 - Created in case the process is successful.


- ### List Virtual Machine
This API retrieves VM data from the database. The output is an array of JSON containing each Virtual Machine data. This is the output sample:

    [    
        {
            "Name":  "test-1",
            "RAM":  "1024",
            "CPU":  "2",
            "Disk":  "10",
            "IP":  "192.168.122.122",
            "CreatedAt":  "2021-06-29T19:33:30.839Z"
        }
    ]


## Tools
These following tools are used in this project.
- Libvrit
- Cloud-init
- Ceph
- Ansible
- HAProxy
- Node.js
- Redis
- PostgreSQL
- Prometheus
- Grafana