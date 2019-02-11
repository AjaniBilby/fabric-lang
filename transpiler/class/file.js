const path = require('path');
const fs = require('fs');

const Directive = require('./directive.js');
const Project = require('./project.js');
const Class = require('./class.js');

class File{
	/**
	 *
	 * @param {Project} owner
	 * @param {String}  filename
	 * @param {Boolean} isRoot
	 * @param {String}  caller - path of the caller
	 */
	constructor(owner, filename, isRoot, importer = "compiler"){
		this.owner  = owner;
		this.path   = filename;
		this.isRoot = isRoot;

		this.shortPath = filename;

		this.directive = [];
		this.exports   = [];
		this.class     = [];
		this.library   = [{id: 0, as: "*"}];

		// Read in data
		let data = {};
		if (path.extname(filename) == ".json"){
			data = JSON.parse( fs.readFileSync(filename, 'utf8') );
		}else{
			console.error(`Invalid file type ${path.extname(filename)}`);
			console.error(`  importer : ${importer}`);
			console.error(`  filename : ${path.extname(filename)}`)
			process.exit(1);
		}
		if (!data.exports){
			data.exports = [];
		}
		if (!data.class){
			data.class = [];
		}
		if (!data.directive){
			data.directive = [];
		}
		if (!data.import){
			data.import = [];
		}


		for (let item of data.directive){
			this.directive.push(new Directive(this, item));
			if (item.name in data.exports){
				this.directive[this.directive.length-1].exposed = true;
			}
		}

		for (let item of data.class){
			this.class.push(new Class(this, item));
			if (item.name in data.exports){
				this.class[this.class.length-1].exposed = true;

				let name = this.class[this.class.length-1].name + "::";
				for (let item2 of this.directive){
					if (item2.name.substr(0, name.length) = name){
						item2.exposed = true;
					}
				}
			}
		}

		for (let item of data.import){
			let loc = path.join(path.dirname(this.path), item.from);
			let id = this.owner.load(loc, this.path);
			this.library.push({id: id, as: item.as, line: item.line || NaN});
		}
	}

	link(){
		this.shortPath = path.relative(this.owner.rootPath, this.path);

		for (let item of this.directive){
			item.link();
		}
		for (let item of this.class){
			item.link();
		}
		for (let item of this.class){
			item.CircularCheck();
		}
	}
	compile(){
		for (let item of this.directive){
			item.compile();
		}
		for (let item of this.class){
			item.compile();
		}
	}

	/**
	 * Get the an object reference by locally defined namespace
	 * @param {String|String[]} name
	 * @param {Object} ignore
	 */
	get(name, ignore=null, history = []){
		if (name === null){
			return null;
		}

		// Prevent infinite loops
		if (history.indexOf(this) != -1){
			return null;
		}
		history.push(this);


		if (typeof(name) == "string"){
			name = name.split('.');
		}

		if (name.length == 1){
			name = name[0];

			for (let item of this.directive){
				if (item == ignore){
					continue;
				}
				if (item.name == name){
					return item;
				}
			}

			for (let item of this.class){
				if (item == ignore){
					continue;
				}
				if (item.name == name){
					return item;
				}
			}

			for (let item of this.library){
				if (item.as == name){
					return this.owner.files[item.id];
				}
				if (item.as == "*"){
					console.log(149, item.id, this.owner);
					return this.owner.files[item.id].get(name, ignore, history);
				}
			}
		}else{
			for (let item of this.library){
				if (item.as == name[0]){
					return this.owner.files[item.id].get(name.slice(1), ignore, history);
				}
			}
		}

		return null;
	}
}

module.exports = File;
