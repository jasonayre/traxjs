require('~/index');
import * as Mixins from '~/mixins';
import {values} from 'lodash';

export class BaseKlass {
}

const IsCar = (superclass) => class extends superclass {
  constructor(...args) {
    super(...args);
  }

  get number_of_wheels() { return super.number_of_wheels + 4 }
}

class EventBus extends Mixins.mix(BaseKlass).with(Mixins.HasSubscriptions) {
}

describe('Mixins', function() {
  let subject, subscription, message_results={};

  beforeEach(() => {
    subject = new EventBus();
    message_results = {created: []}

    subscription = subject.$$on('car.created', (message) => {
      message_results['created'].push(message);
    })
  })

  describe('topics', function(){
    it('BasicPubSubChecks', function(){
      let message = {
        price: 100
      };

      subject.$$broadcast('car.created', message);

      expect(message_results.created.length).toEqual(1);
      expect(message_results.created[0].price).toEqual(100);
      subject.$$broadcast('car.created', message);
      expect(message_results.created.length).toEqual(2);
      expect(subject.$$topic_subscriptions.car.created.subscriptions.length).toEqual(1);
      subscription.dispose();
      // debugger;
      expect(subject.$$topic_subscriptions.car.created.subscriptions.length).toEqual(0);
      subject.$$broadcast('car.created', message);
      expect(message_results.created.length).toEqual(2);
    })
  })
});
