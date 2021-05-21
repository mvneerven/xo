import ExoFormNavigationBase from './ExoFormNavigationBase';

class ExoFormNoNavigation extends ExoFormNavigationBase {
    async render(){
        return Promise.resolve()
    }
}

export default ExoFormNoNavigation;