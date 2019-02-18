echo off
node transpiler/transpile.js %1 "temp.cpp"
clang++ "temp.cpp" %2
