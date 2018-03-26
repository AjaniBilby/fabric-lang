So thinking about external contacting within my higher level language will mean that my byte code will also need that.
  (External Contact: Executing C++ functions within my lang and getting the return, as well as the other way around)

First of all I will detail how my high level langauge will roughly work.
This is kind of my target process for first of all simplifying the code.
```javascript
function fib (int i): int{
  if (i <= 1){
    return 1;
  }else{
    return fib(i-1) + fib(i-2);
  }
}
```
Simpliy each line to be a single operation at a time.
```javascript
function fib (int i): int{
  int _t1;
  int _t2;
  int _tres;

  if (i < 0){
    tres = 1;
    return _tres
  }else{
    _t1 = i-1;
    _t1 = fib(_t1);
    _t2 = i-2;
    _t2 = fib(_t2);
    _tres = _t1 + _t2;
  }
}
```
Make a structure to allow data allocation when a function is added to the stack.
```javascript
struct fib{
  i int,
  _t1 int,
  _t2 int,
  _callpos int,
  _calloff int,
  _tres int
}

function fib (i int): int{
  int _t1;
  int _t2;
  int _tres;

  if (i < 0){
    tres = 1;
    return _tres
  }else{
    _t1 = i-1;
    _t1 = fib(_t1);
    _t2 = i-2;
    _t2 = fib(_t2);
    _tres = _t1 + _t2;
  }
}
```

Now you can see that the first byte/s are the input data and the last byte/s are the result.
We also have a direct pointer as to where processing should continue once the function is done, as well as what the caller's scope was.

This then should finally compile into something like this

```as
lbl 0
pull rB rA 4      // rB = i
set rC 0          // rC = 0

comp rB rC 0 rD   // rD = rB < rC
when rD 2         // IF rD is true
lbljmp 1          // Jump to true operation
lbljmp 2          // Jump to false operation

lbl 1
set rB 10         // Point to _tres
add rA rB rB      // Make rB actually relative to the current scope
set rC 1
push rB rC        // _tres = 1
jmplbl 3          // Finish function

lbl 2
alloc rF 30       // Allocate a new function instance
set rC 1          // rC = rB-1
sub rB rC rC
put rC rF 4       // parse the input i=rC
set rC 10         // parse this scope to the function
add rC rF rC
put rA rC 4
set rC C          // parse the continue position to the function
add rC rF rC
set rB ~          // some hardcoded value `\(0_0)/` for after the next jmp
put rB rC 4
jmplbl 0
set rB 4
add rA rB rC
add rF rB rD
set rE 4
dup rC rD rE     // Move the result of the call to _t1
unalloc rF 30

//.. repeat for _t2 = fib(i-2)


jmplbl 3          // Finish function

lbl 3             // Finish function
set rB 8          // rB = caller's position
add rA rB rB
pull rB rB 4
trans rA rF       // Duplicate register rA to rF
set rC a          // Change rA to the caller's scope offset
add rA rC rC
pull rA rC 4
go rB
```

That is my plan for internal function communication, any good ideas for external functions with C++ or NodeJS?
(I can't belive I just manually encoded all of that ;~;)