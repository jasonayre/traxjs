require('../src/index');
import * as Mixins from '~/mixins';

export class BaseVehicle {
  get number_of_wheels() { return 0 }

  drive() {
    this.is_driving = true;
  }
}

const IsCar = (superclass) => class extends superclass {
  constructor(...args) {
    super(...args);
  }

  get number_of_wheels() { return super.number_of_wheels + 4 }
}

export class Impala extends Mixins.mix(BaseVehicle).with(IsCar) {
  drive() {
    super.drive();
    return 'CruisingDownTheStreetInMy64';
  }
}

describe('Mixins', function() {
  let subject, conditions, result;

  describe('Methods', function(){
    it('Calls super correctly', function(){
      let car = new Impala();
      let result = car.drive();
      expect(result).toEqual('CruisingDownTheStreetInMy64');
      expect(car.is_driving).toEqual(true);
    })
  })

  describe('Getters', function(){
    it('Calls super correctly', function(){
      let car = new Impala();
      expect(car.number_of_wheels).toEqual(4);
    })
  })
});
