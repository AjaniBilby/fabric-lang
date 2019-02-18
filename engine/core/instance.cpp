#include "./instance.hpp"

Engine::Instance::Instance(Engine::Opperation func, size_t domain, Instance* caller, size_t rtrnPos, size_t errPos, void* rtrnAddr){
	this->funcRef    = func;
	this->local      = Memory::Allocate(domain);

	this->parent     = caller;
	this->returnPos  = rtrnPos;
	this->returnAddr = rtrnAddr;
	this->errorPos   = errPos;

	this->designated = nullptr;

	this->sessions = 0;
};

void* Engine::Instance::GetLocal(){
	return this->local;
};
