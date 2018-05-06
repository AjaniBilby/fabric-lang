Function calls are designed with asynchronous and multithreading in mind.
A typical call should be executed like;
```
execute(attr1, attr2) -> result when {

} then {

}
```

This means that the function with name ``execute`` will be running, and any return values will be piped into the local variable ``result``. The code within the ``when`` clause is executed whenever the function yields a value. When the function has finished execution code within the ``then`` clause will be executed, and all data within the execution will be wiped.  
When a function is called asynchronously it is pushed to the event loop. If this execution is to be executed within another thread then when the function yields/returns a result the ``when``/``then`` clause will be executed within the thread that the function was originally called from.  
This helps prevent data races within a function.


This method of function calls is designed to eliminate the current methods being used for callbacks when reading a stream of data. Previously if you wanted to listen for TCP requests on a certain port you would need to define a new function specifically for this task, thus it will now have a different local scope from when it was called. However, within fabric, this can be done in a simpler way.
```
TcpListen(8080) -> res when{
  // Code to handle a TCP request
}
```
Or streaming a file
```
ReadFile('file.txt') -> chunk when{
  // When a chunk of data is received
} then {
  // When the final chunk of data is received
}
```

## Different types of calls
If all you want is the final value, and you want execution to happen synchronously then you can instead use an ``=>``.  
To execute the function within a different thread from its self ``->``.  
To execute the function within the main thread you can use ``~>``.  

### Why execute something in the main thread?
If you have a global variable such as a counter and multiple threads try to increment the value at the same time they will overwrite one another causing the number to not increase correct and have unexpected behaviour. To allow global values with a variety of behaviour you need to create the function to specifically edit them safely.
```
int counter = 0;

void Increment(){
  counter++;
}

TcpListen(8080) -> res when {
  Increment() ~> ?
}
```
