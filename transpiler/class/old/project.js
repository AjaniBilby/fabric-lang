const BuildNo = 1;


const File = require('./file.js');
const path = require('path');
const fs   = require('fs');

const Directive = require('./directive.js');

class Project{
	constructor(root){
		this.files = [];

		this.strucutres = [];
		this.functions = [];

		this.rootPath = root;

		this.functionCount = 0;
		this.classCount = 0;

		// Load in the critical components of the standard library
		this.load(
			path.join(__dirname, './../../std/primative.json'),
			'compiler',
			false
		);
		this.load(root, 'compiler', true);
	}
}
Project.prototype.load = function(filename, importer = "compiler", isRoot = false){
	// Check if the file is already loaded
	for (let i=0; i<this.files.length; i++){
		if (this.files[i].path == filename){
			return i;
		}
	}

	console.info(` > ${filename}`);
	let id = this.files.length;
	this.files.push(new File(this, filename, isRoot, importer));

	if (isRoot){
		this.rootPath = filename;
	}

	return id;
};
Project.prototype.link = function(){
	for (let file of this.files){
		file.link();
	}
};
Project.prototype.compile = function(){
	for (let file of this.files){
		file.compile();
	}
};
Project.prototype.save = function(outputName){
	let stream = fs.createWriteStream(outputName);

	let enginePath = path.join(__dirname, "./../../engine/engine.hpp");
	stream.write(`#include "${enginePath}"\n`);


	stream.write(`#if Engine_Build != ${BuildNo}\n`);
	stream.write(`#error "Compiler version miss match"\n`);
	stream.write(`#endif\n`);


	/*-----------------------------------
	  Forward declare everything
	-----------------------------------*/
	stream.write('namespace User{\n');
	// Structures
	for (let item of this.strucutres){
		stream.write(`struct ${item.name};`);
	}
	// Functions
	for (let item of this.functions){
		stream.write(`void ${item.name}(Engine::Eventloop::Task task);`);
	}
	stream.write('\n\n');



	for (let item of this.strucutres){
		stream.write(`struct ${item.name}{`);
		stream.write(`${item.lines.join('')}`);
		stream.write('};\n')
	}
	stream.write("\n");

	for (let item of this.functions){
		stream.write(`void ${item.name}(Engine::Eventloop::Task task){\n`);
		for (let line of item.lines){
			stream.write(`\t${line}\n`);
		}
		stream.write(`};\n`)
	}

	for (let file of this.files){
		if (file.isRoot){
			let res = file.get('main', null, [], true);
			if (res === null){
				console.error(`Error: Root file does not include any definition of a 'main' function.`);
				console.error(`  Please create, or import a 'main' function into module namespace`);
				stream.close();
				process.exit(1);
				return;
			}
			if ((res instanceof Directive) == false){
				console.error(`Error: namespace 'main' is not a function`);
				stream.close();
				process.exit(1);
				return;
			}

			stream.write(`\n#define ${res.lable} main\n`);
		}
	}

	stream.write('};');
	stream.close();
}

Project.prototype.HasError = function(){
	for (let file of this.files){
		if (file.error == true){
			return true;
		}
	}

	return false;
}

Project.prototype.GetUniqueFunctionID = function(){
	let id = this.functionCount;
	this.functionCount++;
	return id;
};
Project.prototype.GetUniqueClassID = function(){
	let id = this.classCount;
	this.classCount++;
	return id;
};

module.exports = Project;
