import {mix, HasSubscriptions} from '~/mixins';
class BaseClass {}

export class Hooks extends mix(BaseClass).with(HasSubscriptions) {

}
