# Key
If a class is indented under another then it is an extension of the higher less indented class.

## Abbreviations.
**BBC** : Blank behaviour class. These classes are not intended to be used in their own right, but are instead implemented to help create functions with upgradeability easily. They normally have a default behaviour to ensure mistakes are not made.

# Primative Type Tree
* Wild
	* **Void**: Class of size 0 bytes
	* **Bool**: True/false value
	* **Number**: ``BBC``. Default Behaviour: Double.
		* **Float**: A variably fixed point number for approximate representation of the majority of real numbers
			* **Double**: Same behaviour as float but with double the precession.
		* **Integer**: ``BBC``. Default Behaviour: 64bit unsigned integer.
			* **uint**: ``BBC``. Default Behaviour: 64bit unsigned integer
				* **u8**: 8bit unsigned integer
					* **u16**: 16bit unsigned integer
						* **u32**: 32bit unsigned integer
							* **u64**: 64bit unsigned interger
			* **int**: ``BBC``. Default Behaviour: 64bit signed integer
				* **i8**: 8bit signed integer
					* **i16**: 16bit signed integer
						* **i32**: 32bit signed integer
							* **i64**: 64bit signed integer
	* **Char**: A single ASCII character
