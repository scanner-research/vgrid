import * as React from 'react';
import {Database} from './database';
import {Observer} from 'mobx-react';
import {Settings, default_settings} from './settings';

export let DatabaseContext = React.createContext<Database>(new Database([]));
export let SettingsContext = React.createContext<Settings>(default_settings);


interface ConsumerProps {
  contexts: any[],
  children: any
}

export class Consumer extends React.Component<ConsumerProps, {}> {
  render() {
    let args: any[] = [];
    return this.props.contexts.reduce(
      (acc, ctx) => () => <ctx.Consumer>{ (x: any) => { args.unshift(x); return acc() }}</ctx.Consumer>,
      () => <Observer>{() => this.props.children(...args)}</Observer>)();
  }
}


interface ProviderProps {
  values: any[],
  children: any
}

export class Provider extends React.Component<ProviderProps, {}> {
  render() {
    return this.props.values.reduce(
      (inner, [context, value]) =>
        <context.Provider value={value}>{inner}</context.Provider>,
      this.props.children);
  }
}
