const Interpret = require('./../linker/interpret.js');

const path = require('path');
const fs = require('fs');

class File{
	constructor(filename, id, owner, isMain = false){
		// Initilize key values
		this.filename = filename;
		this.short = filename;
		this.id = id;
		this.isMain = isMain;
		this.project = owner;

		this.link = [];

		// Check the file type is correct
		let ext = path.extension(filename);
		let summary;
		if (ext == "json"){
			summary = JSON.parse( fs.readFileSync(filename, 'utf8'), this.filename );
		}else if (ext == "fab"){
			summary = Interpret.summary( fs.readFileSync(filename, 'utf8'), this.filename );
		}else{
			console.error('Import Error: Cannot import file due to invalid file type.');
			console.error('              File type must be .fab');
			console.error(`  filename: ${filename}`);
			process.exit(1);
		}

		for (let lib of summary.imports){
			this.link({
				id: this.project.load( path.join(this.filename, lib.file) ),
				as: lib.as
			});
		}
	}
}


module.exports = File;
