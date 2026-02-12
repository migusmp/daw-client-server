class StateManager {
  constructor(initialState = {}) {
    this.state = initialState;
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
    
    // Return an unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyObservers();
  }

  getState() {
    return { ...this.state };
  }

  notifyObservers() {
    this.observers.forEach(observer => observer(this.getState()));
  }
}

export const appState = new StateManager({
    user: null,
});
