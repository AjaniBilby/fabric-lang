#include "./eventloop.hpp"


// Helpers
inline bool Engine::Eventloop::Schedule::HasTasks(){
	std::lock_guard<std::mutex> lck( this->activity );

	return this->queue.empty() == false;
};




Engine::Eventloop::SearchResult Engine::Eventloop::Schedule::Retreive(){
	// Prevent other threads from altering this object while this is in progress
	std::lock_guard<std::mutex> lck(this->activity);

	Engine::Eventloop::SearchResult out;

	// The queue is empty
	if (this->queue.empty() == true){
		out.found = false;
		return out;
	}

	// Parse the result
	out.found = true;
	out.data = this->queue.front();
	this->queue.pop_front();

	return out;
};

void Engine::Eventloop::Schedule::Issue(Task task){
	std::lock_guard<std::mutex> lck( this->activity );
	this->queue.push_back(task);
};
