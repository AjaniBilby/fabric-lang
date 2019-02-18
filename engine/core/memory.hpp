#pragma once

#include <stdlib.h>

namespace Memory{
	void* Allocate(size_t);
	void Unallocate(void*);
}

#include "./memory.cpp"
