#pragma once

namespace Engine{
	namespace ThreadPool{
		class Worker;
		class Pool;
	};

	namespace Eventloop{
		struct Task;
		struct SearchResult;

		class Schedule;
	};

	class Instance;

	typedef void(*Opperation)(Eventloop::Task);
};

int main(){
	// User::main();
};



#include "core.hpp"
