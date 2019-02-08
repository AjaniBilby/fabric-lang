#pragma once

#include <stdlib.h>

namespace Memory{
	inline void* Allocate(size_t);
	inline void Unallocate(void*);
}
