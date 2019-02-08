#pragma once

#include "./../engine.hpp"
#include "./../eventloop.hpp"

#include <condition_variable>
#include <chrono>
#include <string>
#include <vector>
#include <mutex>


namespace Engine{
	namespace ThreadPool{
		class Worker{
			public:
				// Constructor
				Worker(
					size_t wID,                               // This worker's unique ID (unique to pool)
					Engine::Eventloop::Schedule* unassigned,  // Address of the unassigned task queue
					Pool* threadPool                          // Address of thread pool
				);

				// Readonly access to worker info
				inline bool   IsActive();
				inline size_t GetID();

				// Task issuing helpers
				void Issue        (Engine::Eventloop::Task task);             // Issue this task for it's self
				void IssueToPool  (Engine::Eventloop::Task task);             // Issue this task to the unassigned work pool
				void IssueToWorker(Engine::Eventloop::Task task, size_t wID); // Isuue this task to another worker

				// Wake up the worker if sleeping, else return false.
				//  return: true - the worker was asleep | false - the worker was already awake
				bool Wake();

				// Tell the thread to join with the main thread
				void Close();

				// Helper to determine if work remains
				inline bool HasTasks();

			private:
				// The managing object for this pool
				Pool* owner;

				// Worker details
				size_t workerID;    // (unique to the thread pool)
				bool   shouldClose; // Is the thread trying to close?
				bool   active;      // Is the thread in the middle of processing?

				// Task queues
				Engine::Eventloop::Schedule* unclaimed; // Unclaimed tasks
				Engine::Eventloop::Schedule      queue; // Designated tasks

				// Work through the queues
				void Process();

				// Find a task to execute
				Engine::Eventloop::SearchResult FindTask();

				// Pointer to the sytem thread created by this class
				std::thread *sysThread;

				// Used for notifying threads of events
				//  e.g. When they are suspended and a task is added to their queue
				std::condition_variable ping;
				std::mutex mtx;
		};

		class Pool{
			public:
				Pool(size_t threads);

				inline void Issue(Engine::Instance inst);
				inline void Issue(Engine::Eventloop::Task task);
				inline bool Issue(Engine::Eventloop::Task task, size_t workerID);

				bool HasActivity();
				void WaitUntilDone();
				void Close();
			private:
				std::vector<Worker*> thread;
				size_t threads;

				Engine::Eventloop::Schedule unclaimed;
		};
	};
};


