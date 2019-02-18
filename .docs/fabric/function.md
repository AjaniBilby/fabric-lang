# Fabric: Function

## Definintion
```Fabric
returns name( arguments ){
  code
}
```

**Returns** is the name of the type of data which this function will return.  
**Name** is the non-broken word (doesn't include any special tokens i.e. ``+``, ``-``) which will be used to refer to the function during calling.
**Arguments** are defined exactly the same as any other [variable](./variable-defininition.md).


## Argument upgradeability
It is important to note that argument definitions within a function definition's argument space have the special characteristic to be marked as ``upgradeable``. Marking an argument as upgradeable allows the function to be recompiled to handle function inputs where the argument type is an extention of the type specified. Upgradeability is marked via having a ``^`` directly before the argument type with no spaces inbetween (note this is before the ``@`` to specify the type as a pointer).  
### Example
Upgradeability allows the programmer to enforce certain characteristics in an input variable without explicitly locking the funciton to one set of types. For instance the function below will be able to not just take ``Float`` variables, but any variable of a type that extends from a ``Float`` such as a ``Double``.
Hence this function could take; ``(Float Float)``, ``(Double Double)``, ``(Double Float)``, or ``(Float Double)``.
```
Float Add(^Float a, ^Float b){
  return a + b;
}
```

Since we know that the argument will be at least of class ``Float`` we know it will definitly have certain attributes and class behaviour which is necessary.
