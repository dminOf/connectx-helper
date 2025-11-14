# How to use:

- Install bun on your machine
- Go to folder and use : bun dev
- Access the interface using : http://localhost:3000/

<img width="1247" height="852" alt="image" src="https://github.com/user-attachments/assets/8f603f7f-2dd9-4b7e-8f8b-5c190dfbc097" />

What can it do:
- See the specification fields for Port, LAG, VXC and VXC Cloud -- you can see the name, datatype and mandatory / not mandatory
- Delete fields from the specification, Modify fields (change name / datatype), Make a field mandatory
- Download an excel sheet with the 4 specifications details
- This is connected to the test zone database specification, IF YOU CHANGE HERE, IT WILL ACTUALLY CHANGE IN THE TEST ZONE SPEC -- SO DONT PLAY WITH IT OR USER REQUESTS WILL FAIL


- The config file is same as the config file we use for the golang applications (2 toml files, main and common file)
- The kafka certificates can also be defined

- It can connect to kafka and mongo, but right now this only uses mongo for the spec pages
- Other pages dont have any functionality for now, only the specs page is working


