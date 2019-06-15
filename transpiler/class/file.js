const path = require('path');
const fs = require('fs');

const Lexer = require('./../interpreter/lexer.js');

const Directive = require('./directive.js');
const Project = require('./project.js');
const Class = require('./class.js');
const Subject = require('./subject.js');

class File{
	/**
	 *
	 * @param {Project} owner
	 * @param {String} filename
	 * @param {Boolean} isRoot
	 * @param {String} caller
	 */
	constructor(owner, filename, isRoot, caller){
		this.owner = owner;
		this.path = filename;
		this.isRoot = isRoot;
		this.error = false;

		this.shortPath = filename;

		this.directive = [];
		this.subject = [];
		this.class = [];
		this.library [{id: 0, as: "*"}];
		this.expose = [];

		let data = {};
		let extension = path.extname(filename);
		if (extension == ".fab"){
			data = Lexer.Interpret( fs.readFileSync(filename, 'utf8'), filename );
		}else{
			console.error(`Invalid file type ${path.extname(filename)}`);
			console.error(`  importer : ${importer}`);
			console.error(`  filename : ${path.extname(filename)}`);
			process.exit(1);
		}

		if (!data.expose)
			data.expose = [];
		if (!data.class)
			data.class = [];
		if (!data.subject)
			data.subject = [];
		if (!data.directive)
			data.directive = [];
		if (!data.import)
			data.import = [];

		for (let item of data.subject){
			this.subject.push(new Directive(this, item));
		}
		for (let item of data.class){
			this.class.push(new Class(this, item));
		}
		for (let item of data.directive){
			this.directive.push(new Directive(this, item));
		}
		for (let item of data.import){
			let loc = path.join(path.dirname(this.path), item.from);
			let id = this.owner.load(loc, this.path);
			this.library.push({
				id: id,
				as: item.as,
				line: item.line || NaN
			});
		}
		for (let item of data.expose){
			if (item.name.indexOf('.') !== -1){
				console.error(`Invalid exposure of '${item.name}'. You may only expose a class or function from this file`);
				console.error(`  Note: You cannot expose a class' function, instead only the class its self`);
				console.error(`  line: ${item.line}`);
				this.error = true;
				continue;
			}
			if (item.name.indexOf('::') !== -1){
				console.error(`Invalid exposure of '${item.name}'. You cannot expose just a class' function, you must expose the whole class`);
				console.error(`  Note: You cannot expose a class' function, instead only the class its self`);
				console.error(`  line: ${item.line}`);
				this.error = true;
				continue;
			}

			this.expose.push(item.name);
		}
	}

	link(){

	}
	compiler(){}
}
