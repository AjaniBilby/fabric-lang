# Fabric: Variable definintion
Variables can be defined and assigned in one single composit pattern.
```
type name = 1;
```
All variable definitions must include a semi-colon at the end to mark the endpoint of the definition.
``Type`` will refer to what class type the variable is and it's ``name`` will be used to refer to it later.  

Variable definitions are context aware, thus if you assign and define in one action within a function definition's argument space - the assigning value will become a default value for that parameter. Ditto with classes.

## Pointer/Addresses
If a type is prepended with the character ``@`` then it will specify to the compiler that this variable is storing a reference to a variable rather than the variable its self. **Note** this sort of primative pointer will allow for data leaks and if an object moves address the pointer will not automatically update accordingly.
It is important to note that accessing attributes of the target class will require the use of ``->`` instead of the normal use of ``.``. This allows a clear distinction to anyone reading Fabric code that the variable in question is a pointer rather than storing the variable to help with debugging.
