const Directive = require('./directive.js');
const Project = require('./project.js');
const File = require('./file.js');

class Class{
	/**
	 *
	 * @param {Directive} owner
	 * @param {Object}    data
	 */
	constructor(owner, data){
		this.owner = owner;
		this.exposed = false;

		this.id = this.owner.owner.GetUniqueClassID();
		this.name        = data.name;
		this.line        = data.line || NaN;
		this.extends     = data.extends ? data.extends : "wild";
		this.decendant   = [];
		this.attribute   = data.attribute ? data.attribute : [];
		this.isPrimivite = typeof(data.primitive) === "string";
		this.primitive   = this.isPrimivite ? data.primitive : null;
		this.lable       = this.isPrimivite ? this.primitive : `C${this.id}`;
	}

	link(){
		if (this.name == "wild"){
			return;
		}

		// Check for name collision
		let res = this.owner.get(this.name, this);
		if (res !== null){
			console.error(`Error: Invalid class definition. Class's name collides with another namespace definition.`);
			console.error(`  file  : ${this.owner.shortPath}`);
			console.error(`  class : ${this.name}`);
			console.error(`  type  : ${typeof(res)}`);
			this.owner.error = true;
			return;
		}

		// Check inheretance class exists
		res = this.owner.get(this.extends);
		if (res == null){
			console.error(`Error: Invalid class definition. Unable to find extension class '${this.extends}'.`);
			console.error(`  file  : ${this.owner.shortPath}`);
			console.error(`  class : ${this.name}`);
			console.error(`  line  : ${this.line}`);
			this.owner.error = true;
			return;
		}
		if ((res instanceof Class) == false){
			console.error(`Error: Invalid class definition. A class can only extend of another class, not '${this.extends}'.`);
			console.error(`  file  : ${this.owner.shortPath}`);
			console.error(`  class : ${this.name}`);
			console.error(`  line  : ${this.line}`);
			this.owner.error = true;
		}
		this.extends = res;
		this.extends.decendant.push(this);

		// Check all attribute types exist and names do not collide
		let reserve = [];
		for (let attr of this.attribute){
			if (attr.name in reserve){
				console.error(`Error: Invalid class definition. Invalid attribute '${attr.name}' due to that name already being used within the class.`);
				console.error(`  file  : ${this.owner.shortPath}`);
				console.error(`  line ${attr.line || this.line}`);
				this.owner.error = ture;
			}

			res = this.owner.get(attr.type);
			if (res == null){
				console.error(`Error: Invalid class definition. Invalid attribute '${attr.name}' due to invalid type '${attr.type}'.`);
				console.error(`  file  : ${this.owner.shortPath}`);
				console.error(`  class : ${this.name}`);
				console.error(`  line  : ${attr.line || this.line}`);
				this.owner.error = true;
			}else{
				attr.type = res;
			}
		}
	}

	CircularCheck(){
		if (this.name == "wild"){
			return;
		}

		for (let attr of this.attribute){
			if (attr.type.IsDecendant(this)){
				console.error(`Error: Invalid class definition. A class cannot include it's self or one of it's decendants within its self.`);
				console.error(`  file: ${this.owner.shortPath}`);
				console.error(`  name: ${attr.name}`);
				console.error(`  line: ${attr.line || this.line}`);
				this.owner.error = true;
			}
		}
	}

	IsDecendant(target, history=[]){
		if (target == this){
			return true;
		}
		if (history.indexOf(this) != -1){
			return false;
		}
		history.push(this);

		for (let child of this.decendant){
			if (child.IsDecendant(target, history)){
				return true;
			}
		}

		return false;
	}

	compile(){
		if (this.isPrimivite){
			return;
		}

		let lines = [];
		for (let attr of this.attribute){
			lines.push(`${attr.type.lable} ${attr.name}`);
		}

		this.owner.owner.strucutres.push({
			name: this.lable,
			lines: lines
		});
	}
}

module.exports = Class;
