# Memory
All memory data is stored within a structure, and when a structure it stored the data type is stored at the beginning of the chunk.
> This only occurces for the root, so if a structure inlcudes other structures it does not store their data-type since it is redundant since it can be derived from the stored information about the root datatype
This data identifier spans two bytes of which is a unique uint ID.

## Structures
The structure it's self is store so that dynamic calls can be forfilled ``object[attr]``.
Structures are store by alternating immutable strings with a datatype id.
```
'a', 0, 'b', 0, 'float', 1
```

## Strings
The only case where immutable strings are used is within structures, otherwise all strings are stored within a resizeable array, with the number of unicode characters described in the first 4 bytes of the string. This restricts the length of a single string to 4GB. However in a realistic use case there is minimal point to holding a whole document larger than that size in RAM. Instead it should be piped though RAM executing any task on each chunk.
> The storing of strings is very similar to a block chain buffer/byte array. Except with special behaviours