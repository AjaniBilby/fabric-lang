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
		this.lable = "Func_"+this.id;

		this.raw = data;
	}

	link(){}
	compile(){
		this.owner.owner.functions.push({
			name: this.lable,
			lines: this.lines || ["//foo", "//bar", "return;"]
		});
	}
}

module.exports = Directive;
