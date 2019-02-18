# Fabric: Class
```Fabric
class TypeName extends OtherType{
	public:
		// ...
	private:
		// ...
}
```

A class is the definition of a new type of variable to be used within your project.  
Class' can have private and public attributes and behaviours. Private members can only be accessed by class functions or other friend functions such as ones from parent classes.

## Extends
The term after the keyword ``extends`` defines what other class this class' behaviour should continue on/extend from. This will allow this class to use have all of the inherited attributes and class behaviours by default.  

``Extends`` is an optional term. Thus if not included the interpreter will presume the class extends from ``Wild``.

## Access Modifiers
Access modifies such as ``public`` and ``private`` can be mentioned multiple times. Their marking applies to any members/attributes written precediting the modifier until overwritten by another modifier.  
By default all attributes/members are public.
