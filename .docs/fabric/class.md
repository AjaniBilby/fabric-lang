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

---

## Extends
The term after the keyword ``extends`` defines what other class this class' behaviour should continue on/extend from. This will allow this class to use have all of the inherited attributes and class behaviours by default.  

``Extends`` is an optional term. Thus if not included the interpreter will presume the class extends from ``Wild``.

---

## Access Modifiers
Access modifies such as ``public`` and ``private`` can be mentioned multiple times. Their marking applies to any members/attributes written precediting the modifier until overwritten by another modifier.  
By default all attributes/members are public.

---

## Class member functions
Member functions are functions tied to a specific class. These functions are defined within a class definition.  
All member classes with have ``this`` argument imposed on them as their first argument. The argument type will be an upgradeable pointer to the type of class this function is nested within.


### Special class functions: Data entry
| Name | Arguments | Description |
|:--|:--|:--|
| ``__init__``      | Upto user disgression | Executes when a class is initilized |
| ``__destroy__``   | None | Called when a parent class is destoryed or when a function is being destoryed. Note: This may be execute on a variable which never had it's initilize function called. The class's attributes are automatically destoryed after this function completes execution (on return) |
| ``__duplicate__`` | ``@TypeName ToAddress`` | Allows for custom behaviour on duplication. This function call is executed recursively on each Class and it's attributes. |

### Special class functions: Expression handling
| Name | Arguments | Description |
|:--|:--|:--|
| ``__add__``       | ``@Wild Other``, ``@TypeName destination`` | It is upto user disgresion what the ``Other`` type is, however this will be execute to complete expressions as necessary. The result must be placed, and can be developed/calcuated within the ``destination`` variable. Using this will prevent uncessesary data allocation to increase performance. |
| ``__subtract__``  | - | - |
| ``__modulo__``    | - | - |
| ``__greater__``   | - | - |
| ``__lesser__``    | ``@Wild Other``, ``bool destination`` | - |
| ``__approx__``    | - | - |
| ``__equal__``     | - | - |
| ``__invert__``    | ``@TypeName destination`` | - |
