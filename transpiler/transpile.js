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

console.info('Loading;');
let proj = new Project(path.normalize(__dirname + "/../" + process.argv[2]));
if (proj.HasError()){
	console.error("\nCritical load error");
	process.exit(1);
}

console.info('\nLinking;');
proj.link();
if (proj.HasError()){
	console.error("\nCritical linker error");
	process.exit(1);
}
console.info('\nCompiling;');
proj.compile();
if (proj.HasError()){
	console.error("\nCritical compilation error");
	process.exit(1);
}

console.info('');
let outputPath = path.join(__dirname, './../', process.argv[3] || "dump-fabric.cpp");
proj.save(outputPath);
console.info('Saved:', outputPath);
