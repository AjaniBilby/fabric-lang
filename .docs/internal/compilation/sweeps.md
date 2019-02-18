# Transpile Sweeps
1. Loading
	1. Read in the root and critical standard library files. Read in any other files as needed
2. Linking
	0. This step can occur during either ``#2`` or ``#4``. Degrees generate new versions of themselves as needed and then their linking is triggered.
	1. Degrees generate a base version of themselves with all attributes being ``wild``.
	2. Functions generate a namespace class based on their arguments and local variables. It also checks that all other required/called functions exist.
	3. New functions are generated based on existing ones as needed.
	4. Classes check their extensions and attributes are valid.
3. Compiling
	1. Classes forward declare their existance.
	2. Functions forward declare their existance.
	3. Classes declare their exact structure.
	4. Functions declare their contents.
	5. Contents is stored in a temporary C++ file.
	6. A C++ compiler is triggered to compile the file.
