const Project = require('./class/project.js');
const path = require('path');

if (!process.argv[2]){
	console.error("Missing filename");
	process.exit(1);
}

if (process.argv[2] == "-v"){
	console.info('version: 0.0.0');
	process.exit(0);
}

let proj = new Project(path.normalize(__dirname + "/../" + process.argv[2]));
proj.link();
if (proj.HasError()){
	console.error("Linker Error");
	process.exit();
}
proj.compile();
if (proj.HasError()){
	console.error("Compilation Error");
	process.exit();
}

console.info('');
let outputPath = path.join(__dirname, './../', process.argv[3] || "a.cpp");
proj.save(outputPath);
console.info('Saved:', outputPath);
