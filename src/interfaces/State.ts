import {DataFunc} from './DataFunc';

export interface State {
    name: string;
    render: DataFunc;
    toNext: DataFunc;
    fromNext: DataFunc;
    toPrev: DataFunc;
    fromPrev: DataFunc;
    jumpOut: DataFunc;
    jumpIn: DataFunc;
}