#pragma once

#include "./memory.hpp"

#include <vector>
#include <mutex>

namespace Engine{
	class Instance{
		public:
			Engine::ThreadPool::Worker* designated;

			Instance(
				// Execution description
				Engine::Opperation func, // which function to execute
				size_t domain,           // the size of it's local space

				// Returning details
				Instance* caller,        // which instance call this one
				size_t rtrnPos,          // what position for the caller to execute from
				size_t errPos,           // what position for the caller to execute from
				void* rtrnAddr = nullptr // where to store the return value
			);

			// Helper
			inline void* GetLocal();
		private:
			std::mutex                      safety;

			// Info about execution
			Opperation                     funcRef;
			void*                            local;

			// Info about calling back
			bool                          returned;
			void*                       returnAddr;
			size_t                       returnPos;
			size_t                        errorPos;

			// Info about this Instance
			Instance*                       parent;
			size_t                        sessions;
			std::vector<Instance*>           child;
	};
};
