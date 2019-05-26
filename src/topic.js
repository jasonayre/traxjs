import isFunction from 'lodash/isFunction';
import assign from 'lodash/assign';
import invokeMap from 'lodash/invokeMap';
import some from 'lodash/some';

class Subscription {
  //not supported here but can override to provide own
  static matchesConditions(message, conditions) { return true }

  constructor({scope, $if, $unless, perform, is_one_time=false, observable, onBeforeDispose=[]}={}) {
    assign(this, {scope, $if, $unless, _perform: perform, is_one_time, observable, _onBeforeDisposeCallbacks: onBeforeDispose});
  }

  get has_any_conditions() { return !!(this.$if || this.$unless) }

  passesConditions(message) {
    if(!this.has_any_conditions) { return true }

    if(this.$if && this.$unless) {
      return this._passesIfConditions(message) && this._passesUnlessConditions(message);
    } else if(this.$if) {
      return this._passesIfConditions(message);
    } else if(this.$unless) {
      return this._passesUnlessConditions(message);
    }
  }

  _passesIfConditions(message) { return isFunction(this.$if) ? this.$if.bind(this.scope || this)(message) : this.constructor.matchesConditions(message, this.$if) }
  _passesUnlessConditions(message) { return !(isFunction(this.$unless) ? this.$unless.bind(this.scope || this)(message) : this.constructor.matchesConditions(message, this.$unless)) }

  perform(message) {
    if(this.scope) {
      this._perform.bind(this.scope)(message);
    } else {
      this._perform(message);
    }

    if(this.is_one_time) {
      this.dispose();
    }
  }

  onBeforeDispose(f) {
    this._onBeforeDisposeCallbacks.push(f);
  }

  notify(message) {
    if(this.passesConditions(message)) {
      this.perform(message);
    }
  }

  //for garbage collection cleanup
  dispose() {
    if(some(this._onBeforeDisposeCallbacks)) {
      invokeMap(this._onBeforeDisposeCallbacks, 'call');
    }

    if(this.observable) {
      this.observable.unsubscribe(this);
    }

    this.observable = null;
    this.scope = null;
  }
}

//aka: Observable
export class Topic {
  constructor(...args) {
    this.subscriptions = [];
  }

  subscribe(params={}) {
    let subscription = isFunction(params) ? new Subscription({perform: params, observable: this}) : new Subscription({observable: this, ...params});
    this.subscriptions.push(subscription);
    return subscription;
  }

  unsubscribe(_subscription) {
    this.subscriptions = this.subscriptions.filter(subscription => subscription !== _subscription);
  }

  notify(message) {
    this.subscriptions.forEach(observer => observer.notify(message));
  }

  //otherwise mutation of original will occur twice leading to bad bugs
  clear() {
    let subscriptions = [...this.subscriptions];
    invokeMap(subscriptions, 'dispose');
  }
}
