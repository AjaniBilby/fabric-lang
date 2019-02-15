const Project = require('./project.js');
const Class = require('./class.js');
const File = require('./file.js');

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


		// Generate class for local space
		let local = [];
		for (let attr of data.argument){
			local.push({
				name    : attr.name,
				type    : attr.type,
				line    : attr.line,
				public  : true,
				default : attr.default
			});
		}
		for (let attr of data.variable){
			local.push({
				name    : attr.name,
				type    : attr.type,
				line    : attr.line,
				public  : false,
				default : attr.default
			});
		}
		this.local = new Class(this.owner, {
			name: this.name+"_LocalNameSpace",
			attribute: local
		});
		this.owner.class.push(this.local);
	}

	expose(){
		this.exposed = true;
	}

	link(){}
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
