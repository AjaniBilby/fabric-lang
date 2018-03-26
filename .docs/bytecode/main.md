# Bytecode

All constand values within this langauge when compiled from a file are interpreted via hexidecimal. Thus you need to have two characters for a complete byte.

---

## Memory Manipulation

### Set
Defines the value of a register to a hard coded preset

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID
 4 | Value

### Trans(fer)
Duplicate the value of one register to another

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | From Register
 1 | To Register

### Pull
Assigns the value of a register based on a specific section of RAM

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Target Register
 1 | Pointing Register
 1 | Chunk length (hex)

### Put
Assigns the value of a register to a specific section of RAM

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Target Register
 1 | Pointing Register
 1 | Chunk length (hex)

### Push
Put a hardcoded chunk of data at a specific point in RAM

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID
 1 | Length
 ~ | Data

### Dup(licate)
Copy a section of RAM form one location to another

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, pointing to start of 'from' location
 1 | Register ID, pointing to the start of the 'to' location
 1 | Register ID, specifying the length of the section

---


## Boolean Operations

### And
Use an ADD operator over two registers

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, A
 1 | Register ID, B
 2 | Register ID, result location

### OR
Use an OR operator over the two registers

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, A
 1 | Register ID, B
 1 | Register ID, result location

### XOR
Use an XOR operator over the two registers

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, A
 1 | Register ID, B
 1 | Register ID, result location

### NOT
Invert the bits within a specified register

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, A
 1 | Register ID, result location

### Comp(are)
Compare the values of two registers, saving the boolean result in another

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, value A
 1 | Register ID, value B
 1 | Operator byte [<, <=, ==, >=, >]

### When
When a given register is not completely 1s jump forward a specified amount

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, boolean value
 4 | Jump amount


---


## Compute movement

### J(u)mp
Jump over a given number of bytes and continue processing

| Length | Purpose |
|--:|:--|
 1 | Command ID
 4 | Jump amount


### Go(to)
Jump to a **specific** point in memory to continue computation

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Pointer (hex)

### Nav(ergate)
Jump to a **specific** point in memory based on the value of a registry.
*Similar to the Go command*

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID


---


## Arithmetic Operations

### Add
Add two registers bytes together

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, A
 1 | Register ID, B
 1 | Register ID, result location

---

## Memory Management

### Alloc(ate)
Allocate a chunk of RAM

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, size request
 1 | Register ID, resultant pointer storage

### Unalloc(ate)
Unallocate a chunk of RAM

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, size
 1 | Register ID, start of the region

---

## Misc

### Pr(in)t
Pipe a section of memory into standered out

| Length | Purpose |
|--:|:--|
 1 | Command ID
 1 | Register ID, start of the region
 1 | Register ID, size

### Ex(i)t
Stop computing

| Length | Purpose |
|--:|:--|
 1 | Command ID

---
---


# Example

```as
set rB 4          // Define string length
alloc rB rA       // Allcate a location for the string

push rA 74727565  // Save the string data to RAM "true"

set rC 42         // Apply a numeric value to register C
set rD 41         // Apply a numeric value to register D

comp rC rD 3 rE   // Save the boolean result of rC < rD within rE
when rE 3         // If rE is true (all 1s)
prt rA rB         // Then print "true"

add rC rD rE      // rE = rC + rD
comp rC rE 0 rF   // rF = rC < rE
when rF 3         // If rF s true
prt rA rB         // Then print "true"


alloc rB rC       // Define string
push rC 666f6f00  // "foo "

alloc rB rD       // Define string
push rD 62617200  // "bar "

jmp 4             // Jump the next 4 bytes (two lines)
prt rC rB         // Print "foo "
ext               // End execution (Stops the program trying to execute values stored in RAM)


prt rD rB         // Print "bar "
go 55             // Goto 88 (after jmp)
```
**Output**
```
true
true
bar 
foo 
```


