#include "./thread.hpp"


// Helpers
inline bool Engine::ThreadPool::Worker::IsActive(){
	return this->active;
};
inline size_t Engine::ThreadPool::Worker::GetID(){
	return this->workerID;
};
inline bool Engine::ThreadPool::Worker::HasTasks(){
	return this->queue.HasTasks();
};




Engine::ThreadPool::Worker::Worker(size_t wID, Engine::Eventloop::Schedule* wPool, Pool* tPool){
	this->workerID    = wID;
	this->unclaimed   = wPool; // Receive unassigned work pool
	this->owner       = tPool;

	this->shouldClose = false;
	this->active      = false;
	this->sysThread   = new std::thread(&Engine::ThreadPool::Worker::Process, this);
};


void Engine::ThreadPool::Worker::Issue(Engine::Eventloop::Task task){
	this->queue.Issue(task); // Queue the task
	this->Wake();            // Ensure the thread is awake
	return;
};
void Engine::ThreadPool::Worker::IssueToPool(Engine::Eventloop::Task task){
	this->owner->Issue(task); // Allow the manager to queue the task and wake any sleeping threads
	return;
};
void Engine::ThreadPool::Worker::IssueToWorker(Engine::Eventloop::Task task, size_t wID){
	this->owner->Issue(task, wID);
	return;
};


bool Engine::ThreadPool::Worker::Wake(){
	// If the thread isn't currently active
	if (this->active == false){
		this->active = true;
		std::unique_lock<std::mutex> lck(this->mtx);
		this->ping.notify_all();

		// A chnge ocured
		return true;
	}

	return false;
};
void Engine::ThreadPool::Worker::Close(){
	this->shouldClose = true;

	// If the thread is suspended wake it so it can decay
	this->Wake();

	// Wait until the decay is complete
	this->sysThread->join();
};


Engine::Eventloop::SearchResult Engine::ThreadPool::Worker::FindTask(){
	Engine::Eventloop::SearchResult res;
	res.found = false;

	// Search for a task in queue priority order
	#if (THREAD_UNCLAIMED_TASK_PRIORITY)
		res = this->unclaimed->Find();

		if (res.found == true){ // Claim the task
			res.data.labour->designated = this;
		}else{                  // Find another task
			res = this->queue.Find();
		}
	#else
		res = this->queue.Find();

		// Unable to find a task in priority #1 queue
		// Search another one
		if (res.found == false){
			res = this->unclaimed->Find();

			// Claim the task
			if (res.found == true){
				res.data.labour->designated = this;
			}
		}
	#endif

	return res;
};
void Engine::ThreadPool::Worker::Process(){
	this->active = true;
	std::unique_lock<std::mutex> lock(this->mtx);
	std::string str;

	#if DEBUG_SHOW_THREAD_ACTIVITY
		str = "Log: Thread[" + std::to_string(this->workerID) + "]: Spawned\n";
		std::clog << str;
	#endif

	Engine::Eventloop::SearchResult result;
	while (true){
		result = this->FindTask();

		if (result.found = true){  // Execute the task
			#if DEBUG_SHOW_THREAD_ACTIVITY
				str = "Log: Thread[" + std::to_string(this->workerID) + "]: Processing task\n";
				std::clog << str;
			#endif

			result.data.labour->Process(result.data);
		}else{                     // Suspend until further notice
			this->active = false;

			#if DEBUG_SHOW_THREAD_ACTIVITY
				str = "Log: Thread[" + std::to_string(this->workerID) + "]: Entering stasis\n";
				std::clog << str;
			#endif

			// Suspend until ping is triggered
			this->ping.wait(lck);

			// Reanimate
			#if DEBUG_SHOW_THREAD_ACTIVITY
				str = "Log: Thread[" + std::to_string(this->workerID) + "]: Reanimated\n";
				std::clog << str;
			#endif
			this->active = true;

			// Was this reanimated to close?
			if (this->shouldClose){
				break;
			}else{
				continue;
			}
		}


		#if DEBUG_SHOW_THREAD_ACTIVITY
		str = "Log: Thread[" + std::to_string(this->workerID) + "]: Destorying\n";
		std::clog << str;
		#endif

		return;
	}
};











Engine::ThreadPool::Pool::Pool(size_t num){
	this->threads = threads;

	// Generate workers
	this->thread.reserve(threads);
	for (size_t i=0; i<threads; i++){
		this->thread[i] = new Engine::ThreadPool::Worker(i, &this->unclaimed, this);
	}
};


void Engine::ThreadPool::Pool::Issue(Engine::Instance* inst){
	Engine::Eventloop::Task task;
	task.labour   = inst;
	task.position = 0;
	this->Issue(task);
};
void Engine::ThreadPool::Pool::Issue(Engine::Eventloop::Task task){
	this->unclaimed.queue(task);
};
void Engine::ThreadPool::Pool::Issue(Engine::Eventloop::Task task, size_t workerID){
	this->thread[workerID].queue(task);
};


bool Engine::ThreadPool::HasActivity(){
	// Check if any threads are active
	for (size_t i=0; i<this->threads; i++){
		if (this->tread[i].HasActivity()){
			if (this->thread[i].active == false){
				#if DEBUG_SHOW_THREAD_ACTIVITY
					std::string str = "Log: thread " + std::to_string(i) + " is suspended while it has dedicated tasks.\n  Waking Worker.";
					std::clog << str;
				#endif

				this->thread[i].Wake();
			}

			return true;
		}
	}

	// No threads are active, check if any unclaimed work remains
	if (this->unclaimed.HasTasks()){
		#if DEBUG_SHOW_THREAD_ACTIVITY
			std::string str = "Log: No threads are active while work remains.\n  Waking all workers..\n";
			std::clog << str;
		#endif

		// Since no workers are active and task remain wake all of them
		for (size_t i=0; i<this->threads; i++){
			this->thread[i].Wake();
		}
		return true;
	}

	return false;
};
