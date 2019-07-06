require('../src/index');
import * as Helpers from '~/helpers';

describe('helpers', function(){
  describe('serialization', function(){
    it('serializes functions', function(){
      let object_to_serialize = {
        add: (v1, v2) => { return v1 + v2 },
        subtract: function(v1, v2) { return v1 - v2 }
      }

      let serialized = Helpers.serialize(object_to_serialize);
      let new_object = Helpers.deserialize(serialized);
      expect(new_object.subtract(1,2)).toEqual(-1);
      expect(new_object.add(1,2)).toEqual(3);
    });
  })

  describe('getInstancePropertyNames', function(){
    it('gets list of properties of object, including inherited', function(){
      class Something {
        someMethod() {}

        get someprop() {
          return 'hello'
        }
      }

      class SomethingElse extends Something {
        ownMethod() {}

        get someotherprop() {
          return 'helloyou'
        }
      }

      let first_subject = new Something();
      let first_subject_properties = Helpers.getInstancePropertyNames(first_subject);
      expect(first_subject_properties.length).toEqual(1);
      expect(first_subject_properties[0]).toEqual('someprop');

      let second_subject = new SomethingElse();

      let second_subject_properties = Helpers.getInstancePropertyNames(second_subject);
      expect(second_subject_properties.length).toEqual(2);
      expect(second_subject_properties[0]).toEqual('someotherprop');

      second_subject.whatever = 'blah';
      second_subject_properties = Helpers.getInstancePropertyNames(second_subject);
      expect(second_subject_properties.length).toEqual(3);

      first_subject.anything='everything';
      first_subject_properties = Helpers.getInstancePropertyNames(first_subject);
      expect(first_subject_properties.length).toEqual(2);
      second_subject_properties = Helpers.getInstancePropertyNames(second_subject_properties);
      expect(second_subject_properties.length).toEqual(4);
    });
  })

  describe('getInstanceProperties', function(){
    it('returns instance properties object', function(){
      class Something {
        someMethod() {}

        get someprop() {
          return 'hello'
        }
      }

      class SomethingElse extends Something {
        ownMethod() {}

        get someotherprop() {
          return 'helloyou'
        }
      }

      let first_subject = new Something();
      let first_subject_properties = Helpers.getInstanceProperties(first_subject);
      expect(first_subject_properties).toEqual({someprop: 'hello'});
    });
  })
})
