const File = require('./file.js');
const path = require('path');
const fs   = require('fs');

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
			path.join(__dirname, './../../local/std/primative.json'),
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

	stream.write(`#include "./engine/engine.hpp"\n\n`);


	/*-----------------------------------
	  Forward declare everything
	-----------------------------------*/
	stream.write('namespace User{\n');
	// Structures
	for (let item of this.strucutres){
		stream.write(`\tstruct ${item.name};\n`);
	}
	// Functions
	for (let item of this.functions){
		stream.write(`\tvoid ${item.name}(Engine::Eventloop::Task task);\n`)
	}
	stream.write('\n\n');



	for (let item of this.strucutres){
		stream.write(`\tstruct ${item.name}{\n`);
		stream.write(`\t\t${item.lines.join(',\n\t\t')}`);
		stream.write('\n\t};\n')
	}
	stream.write("\n");

	for (let item of this.functions){
		stream.write(`\tvoid ${item.name}(Engine::Eventloop::Task task){\n`);
		for (let line of item.lines){
			stream.write(`\t\t${line}\n`);
		}
		stream.write(`\t};\n`)
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
