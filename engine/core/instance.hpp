#pragma once

#include "./memory.hpp"

#include <vector>
#include <mutex>

namespace Engine{
	class Instance{
		public:
			Engine::ThreadPool::Worker* designated;

			Instance(Engine::Opperation, size_t);

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
