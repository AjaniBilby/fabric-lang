#pragma once

#include "./../engine.hpp"

#include <deque>
#include <mutex>

namespace Engine{
	namespace Eventloop{
		struct Task{
			Instance*       labour;
			unsigned long position; // What position is the function at?
		};

		struct SearchResult{
			Task  data;
			bool found;
		};

		class Schedule{
			public:
				Schedule();

				void Issue(Task task);
				SearchResult Retreive();

				// Helper to determine if tasks remain
				inline bool HasTasks();
			private:
				std::deque<Task> queue; // Holds the queue items
				std::mutex activity;    // Is the queue currently active?
		};
	}
}

#include "eventloop.cpp"
