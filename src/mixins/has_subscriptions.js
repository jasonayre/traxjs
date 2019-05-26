import {Topic} from '~/topic';
import get from 'lodash/get';
import set from 'lodash/set';
import some from 'lodash/some';
import invokeMap from 'lodash/invokeMap';
import values from 'lodash/values';
import {setProperty} from '~/helpers';

export const HasSubscriptions = (superclass) => class extends superclass {
  constructor(...args) {
    super(...args);
    this.$$topic_subscriptions = {};
  }

  $$on(_event, callback) {
    let key = `$$topic_subscriptions.${_event}`;
    let subscription = get(this, key);

    if(subscription) {
      return subscription.subscribe(callback);
    } else {
      setProperty(this, key, new Topic());
      return get(this, key).subscribe(callback);
    }
  }

  $$broadcast(_event, message) { this.$$notify(_event, message) }
  async $$broadcastAsync(_event, message) { this.$$notify(_event, message) }

  $$notify(_event, message) {
    let subscription = get(this, `$$topic_subscriptions.${_event}`);

    if(subscription) {
      subscription.notify(message);
    }
  }

  $$disposeSubscriptionsForSubscribers() {
    invokeMap(values(this.$$topic_subscriptions), 'dispose');
  }
}
