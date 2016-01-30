import {State} from '../interfaces/State';
import {OptionsObj} from '../interfaces/OptionsObj';
import {Promise} from 'es6-promise';

// Pollyfill Object.assign
interface ObjectCtor extends ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}
declare var Object: ObjectCtor;
export let assign = Object.assign ? Object.assign : function(target: any, ...sources: any[]): any {
    return;
};


export class StateHandler {
    public currentState: State;
    public currentProm: Promise<Object>;

    constructor(public data: Object, public jumpContract: Object, public states?: Array<State>, public options?: OptionsObj) {
        if (!states) {
            this.states = [];
            this.currentState = null;
        }


        this.options = {
            loop: false,
            history: false
        };

        if (options) {
            this.options = Object.assign(this.options,options);
        }


        // Initialize currentProm to pass this.data when thenned.
        this.currentProm = new Promise((resolve, _) => {
            resolve(this.data);
        });
    };

    addState(state:State): StateHandler{
        this.states.push(state);
        return this;
    }

    runFromBeginning(): void {
        this.currentState = this.states[0];
        this.currentProm = this.currentState.render(this.data)
    }

    next(): any {
        return new Promise<StateHandler>((resolve, reject) => {
            this.currentProm.then(data => {
                this.data = data;
                this.currentProm = this.currentState.toNext(this.data);

                this.currentProm.then(data => {

                    this.data = data;
                    let currentIndex = this.states.indexOf(this.currentState);

                    if (++currentIndex < this.states.length) {
                        this.currentState = this.states[currentIndex];
                    } else if (this.options.loop) {
                        this.currentState = this.states[0];
                    } else {
                        reject(new Error('No state after this one'));
                    }

                    this.currentProm = this.currentState.fromPrev(this.data);

                    this.currentProm.then(data => {
                        this.data = data;
                        this.currentProm = this.currentState.render(this.data);
                        resolve(this);
                    })
                })
            })
        })
    }

    prev(): any {
        return new Promise<StateHandler>((resolve, reject) => {
            this.currentProm.then(data => {
                this.data = data;
                this.currentProm = this.currentState.toPrev(this.data);

                this.currentProm.then(data => {

                    this.data = data;
                    let currentIndex = this.states.indexOf(this.currentState);

                    if(--currentIndex > -1) {
                        this.currentState = this.states[currentIndex]
                    } else if (this.options.loop) {
                        this.currentState = this.states[this.states.length - 1];
                    } else {
                        reject(new Error('No state before this one'));
                    }

                    this.currentProm = this.currentState.fromNext(this.data);

                    this.currentProm.then(data => {
                        this.data = data;
                        this.currentProm = this.currentState.render(this.data);
                        resolve(this);
                    })
                })
            })
        })
    }
}