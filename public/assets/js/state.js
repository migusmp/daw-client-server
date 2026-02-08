class StateManager {
  constructor(initialState = {}) {
    this.state = initialState;
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    return () => { // Return an unsubscribe function
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }; // Merge new state
    this.notifyObservers();
  }

  getState() {
    return { ...this.state }; // Return a copy to prevent direct manipulation
  }

  notifyObservers() {
    this.observers.forEach(observer => observer(this.getState()));
  }
}

export const appState = new StateManager({
    user: null,
    meLoading: false,
    meError: null,
});