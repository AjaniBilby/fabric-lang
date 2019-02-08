#include "./instance.hpp"

Engine::Instance::Instance(Engine::Opperation ref, size_t heap){
	this->funcRef    = ref;
	this->local      = Memory::Allocate(heap);
	this->designated = nullptr;
}
