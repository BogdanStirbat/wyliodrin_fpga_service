# wyliodrin_fpga_service
An node.js service that receives incoming compile requests. 

# First steps, before running
- `git clone https://github.com/BogdanStirbat/wyliodrin_fpga_service `
- `cd wyliodrin_fpga_service `
- `npm install `


# Run the server
`node service.js`

#Server configuration
An configuration example can be found at https://github.com/BogdanStirbat/wyliodrin_fpga_service/blob/master/settings.js; prameters:
- `port`: the port server will accept requests;
- `buildFolder`: folder on server where `make` command will be executes;
- `sec_to_timeout`: number of seconds available for each build to run;
- `nr_parallel_builds`: number of builds that can be performed in paralel;
- `nr_characters_in_random_folder`: each build will be performed in an random-generated folder, son of `buildFolder`; this parameter configures number of characters the folder name can have.

# Accepted requests
Examples of valid requests are at https://github.com/BogdanStirbat/wyliodrin_fpga_service/blob/master/examples/cmd_client.txt. 
 - `/load`: computes loading of the system; accepted via GET; 
 - `/build`: builds a project; accepted via POST
 - `/clean`: cleans a project; accepted via POST
 
# Examples of requests are their associated responses
```
curl -X POST  -H "Content-Type: application/json" -d '{"archive_url":
"https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip","type":
"fpga"}' http://localhost:3000/build
{
  "status": "build started",
  "url": "https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip"
}

curl -X POST  -H "Content-Type: application/json" -d '{"archive_url":
"https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip","type":
"fpga"}' http://localhost:3000/build
{
  "status": "build running, not finished",
  "url": "https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip"
}

curl -X POST  -H "Content-Type: application/json" -d '{"archive_url":
"https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip","type":
"fpga"}' http://localhost:3000/build
{
  "status": "build completed",
  "url": "https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip",
  "result": {
    "build_result": "0",
    "build_time": {
      "user": "107.35",
      "system": "47.07",
      "elapsed": "3:16.80",
      "CPU": "78%"
    },
    "bitfile_url":
"/wyliodrin/projects/build/n6OZDXO5/8c92bb7d-87d8-4967-9910-ed78bc1c53b8/main.bit"
  }
}

curl -X GET http://localhost:3000/load
{
  "number_of_builds": 2,
  "max_number_of_builds": 5
}

curl -X POST  -H "Content-Type: application/json" -d '{"archive_url":
"https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip","type":
"fpga"}' http://localhost:3000/clean
{
  "status": "cleanup performed",
  "url": "https://github.com/BogdanStirbat/wyliodrin_fpga_service/raw/master/examples/fpga_zip_projects/fpga_example_project_ok.zip"
}
```

