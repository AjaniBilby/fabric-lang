#include "./memory.hpp"

void* Memory::Allocate(size_t bytes){
	#if FLAG_MEMORY_PERGE
		char* addr = (char*)malloc(bytes);
		void* out = reinterpret_cast<void*>(addr);

		// Wipe the memory
		while (bytes > 0){
			addr* = 0;
			addr++;
		}

		return out;
	#else
		return (void*)malloc(bytes);
	#endif
};

void Memory::Unallocate(void* addr){
	free(addr);
};
