import axios from 'axios';

const nagiosAPIEndpoint = 'http://localhost/nagios/cgi-bin/statusjson.cgi?query=servicelist&details=true&hostname=localhost';

let current_status = {
  query_time: '',
  server_id: 'localhost',
  services: {},
};

// Function to fetch Nagios service status and update current_status
async function fetchNagiosStatus() {
  try {
    const response = await axios.get(nagiosAPIEndpoint, {
      auth: {
        username: 'nagiosadmin', // Replace with your Nagios API username
        password: 'nagiosadmin', // Replace with your Nagios API password
      },
    });

    if (response.status === 200) {
      const serviceData = response.data;
      const servicelist = serviceData.data.servicelist.localhost;

      current_status.query_time = serviceData.result.query_time;
      for (const serviceName in servicelist) {
        const service = servicelist[serviceName];
        const serviceStatus = service.status;
        const pluginOutput = service.plugin_output;

        if (serviceName === 'Swap Usage') {
            current_status.services['swapUsage'] = {
                status: serviceStatus,
                plugin_output: pluginOutput,
              };
            const regex = /(\d+) MB out of (\d+) MB/g;
            const match = regex.exec(pluginOutput);
            if (match) {
              const freeMemory = parseInt(match[1]);
              const freeGB = freeMemory/1024;
              const totalMemory = parseInt(match[2]);
              const totalGB = totalMemory/1024;
              const usedMemory = totalGB - freeGB;
              const perCent = ((usedMemory*100)/totalMemory)
      
              // Store the free memory in MiBs in the 'value' property
              current_status.services['swapUsage'].free = freeGB;
              current_status.services['swapUsage'].total = totalGB;
              current_status.services['swapUsage'].used = usedMemory;
              current_status.services['swapUsage'].percent = perCent;
            }
            else {
                console.log('no match'); 
            }
          }

          if (serviceName === 'Current Load') {
            current_status.services['currentLoad'] = {
                status: serviceStatus,
                plugin_output: pluginOutput,
              };
              
            const match = pluginOutput.match(/load average: ([\d.]+)/);
            if (match) {
                current_status.services['currentLoad'].load = parseFloat(match[1]);
            }
            else {
                console.log('no match'); 
            }

            // console.log(current_status)
          }
          if (serviceName === 'HTTP') {
            current_status.services['HTTP'] = {
                status: serviceStatus,
                plugin_output: pluginOutput,
              };

              const statusMatch = pluginOutput.match(/HTTP\/\d+\.\d+ (\d+) OK/);
              const responseStatus = statusMatch ? parseInt(statusMatch[1]) : null;
                     
              const bytesMatch = pluginOutput.match(/(\d+) bytes/);
              const numberOfBytes = bytesMatch ? parseInt(bytesMatch[1]) : null;
                      
              const timeMatch = pluginOutput.match(/([\d.]+) second response time/);
              const responseTimeInSeconds = timeMatch ? parseFloat(timeMatch[1]) : null;

              current_status.services['HTTP'].responseStatus = responseStatus;
              current_status.services['HTTP'].speed = responseTimeInSeconds?  numberOfBytes/(responseTimeInSeconds*1e6): 100 ; 
               
          }

          if (serviceName === 'PING') {
            current_status.services['PING'] = {
                status: serviceStatus,
                plugin_output: pluginOutput,
              };

              const packetLossMatch = pluginOutput.match(/Packet loss = (\d+)%/);
              const packetLossPercentage = packetLossMatch ? parseInt(packetLossMatch[1]) : null;
              
              // Extract RTA (Round-Trip Time) in milliseconds
              const rtaMatch = pluginOutput.match(/RTA = ([\d.]+) ms/);
              const rtaMilliseconds = rtaMatch ? parseFloat(rtaMatch[1]) : null;

              current_status.services['PING'].packetLoss = packetLossPercentage; 
              current_status.services['PING'].rta = rtaMilliseconds;
              
          }

          if (serviceName === 'Root Partition') {
            current_status.services['rootPartition'] = {
                status: serviceStatus,
                plugin_output: pluginOutput,
              };
              // Extract inode valueconst inodeMatch = pluginOutput.match(/inode=(\d+)%/);

                const inodeMatch = pluginOutput.match(/inode=(\d+)%/);
                const inodeValue = inodeMatch ? parseInt(inodeMatch[1]) : null;

                // Extract free space in MiB
                const freeSpaceMatch = pluginOutput.match(/free space: \/ (\d+) MiB/);
                const freeSpaceMiB = freeSpaceMatch ? parseInt(freeSpaceMatch[1]) : null;

                // Extract percentage
                const percentageMatch = pluginOutput.match(/(\d+\.\d+)%/);
                const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : null;

                // Calculate total storage in MiB
                const totalStorageMiB = freeSpaceMiB / (percentage / 100);

                // Convert free space and total storage to GB
                const freeSpaceGB = freeSpaceMiB / 1024;
                const totalStorageGB = totalStorageMiB / 1024;

                current_status.services['rootPartition'].used = (totalStorageGB-freeSpaceGB); 
                current_status.services['rootPartition'].total = totalStorageGB; 
                current_status.services['rootPartition'].inode = inodeValue; 
                current_status.services['rootPartition'].perCent = percentage; 
            }
            if (serviceName === 'Total Processes') {
                current_status.services['processes'] = {
                    status: serviceStatus,
                    plugin_output: pluginOutput,
                  };

                  
            const processCountMatch = pluginOutput.match(/(\d+) processes/);
            const numberOfProcesses = processCountMatch ? parseInt(processCountMatch[1]) : null;
            // console.log("Number of Processes:", numberOfProcesses);

            current_status.services['processes'].number = numberOfProcesses; 
            



                }  
    }
    // console.log("utils status",current_status); 
    } else {
      console.error('Failed to fetch Nagios service status:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching Nagios service status:', error);
  }

  return current_status; 

}

export { fetchNagiosStatus };