# Virtualization Project


# Components
This is the componenet diagram for this project:


## Ceph Cluster


## Virtualization Node


## Internal API 

## Internal HAProxy


## Database


## External API


## Enternal HAProxy


## Monitoring


## Manager Node




# Tools

## Libvrit


## Cloud-init


## Ceph

## Ansible


## HAProxy


## Node.js

## Redis


## PostgreSQL


## Prometheus


## Grafana

# API Scenario

## Internal APIs

### Create Virtual Machine
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


### Check Virtual Machine IP
This API is called at one minute interval and run the following command:
`arp -a | grep $(virsh domiflist test-1 | awk '{print $5 }' | tail -2 | head -1) | awk '{print $2}' | sed 's/[()]//g'`
If the virtual machine named test-1 has been assinged with an IP, the command above would return it, the database would be updated, and the cron job would be deleted. Alternatively no action is taken.


## External APIs
### Create Virtual Machine
This API calls the internal API for creating a new Virtual Machine.
Input Sample: 

    {
        "Name":  "test-1",
        "RAM":  "1024",
        "CPU":  "2",
        "Disk":  "10"
    }

Status Code 201 - Created in case the process is successful.


### List Virtual Machine
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

