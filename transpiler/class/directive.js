const Project = require('./project.js');
const Class = require('./class.js');
const File = require('./file.js');

const Interpreter = require('./../interpreter/interpreter.js');


class Signature{
	/**
	 * Generate the signature of a function
	 * @param {File} owner
	 * @param {Object|String}    rtrn
	 * @param {Object[]|String}  args
	 */
	constructor(file, rtrn, args){
		this.file = file;
		this.sign = [];

		let elms = [rtrn].concat(args);
		for (let item of elms){
			if (typeof(item) == "string"){
				this.sign.push(this.file.GetClassByName(item));
				continue;
			}

			if (isNaN(item.type.id) == false){
				this.sign.push(item.type.id);
				continue;
			}
			this.sign.push(this.file.GetClassByName(item.type));
			continue;
		}
	}

	/**
	 * Check if two signatures are equal
	 * @param {Signature} other
	 */
	equal(other){
		// Signatures are no the same length
		if (this.sign.length != other.sign.length){
			return false;
		}

		// Check if each element of the signature is the same
		for (let i=0; i<this.sign.length; i++){
			if (this.sign[i] != other.sign[i]){
				return false;
			}
		}

		return true;
	}
}


class Directive{
	/**
	 *
	 * @param {Project} owner
	 * @param {Object} data
	 */
	constructor(owner, data){
		this.owner = owner;
		this.exposed = false;

		this.id = owner.owner.GetUniqueFunctionID();
		this.lable = "F_"+this.id.toString(16);
		this.name = data.name;
		this.return = data.return;

		if (!data.argument){
			data.argument = [];
		}
		if (!data.variable){
			data.variable = [];
		}

		if (this.owner.expose.indexOf(this.name) != -1){
			this.exposed = true;
		}

		this.args = data.argument.length;
		this.local = new Class(this.owner, {
			name: this.name+"_LocalNameSpace",
			attribute: data.argument.concat(data.local)
		});
		this.owner.class.push(this.local);
	}

	link(){
		// Generate a signature
	}
	compile(){
		let lines = [];
		lines.push(`${this.local.lable}* local = reinterpret_cast<${this.local.lable}*>(task.labour->GetLocal());`);

		this.owner.owner.functions.push({
			name: this.lable,
			lines: lines
		});
	}
}

module.exports = Directive;
