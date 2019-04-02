class Project{
	constructor(mainFile){
		this.files = [];
		this.root = -1;

		this.load(`${__dirname}/../../std/header.fab`);
		this.load(mainFile, true);
	}

	load(filename, isMain=false){
		for (let file of this.files){
			if (file.filename == filename){
				return file.id;
			}
		}

		let id = this.files.length;
		this.files.push(new File(filename, id, this, isMain))

		return id;
	}
}


module.exports = Project;
