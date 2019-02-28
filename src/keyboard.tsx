import * as React from "react";

export enum KeyMode {
  Standalone = 1,
  Jupyter = 2
}

export let key_dispatch = (settings, methods, key) => {
  let mode_methods = methods[settings.key_mode];
  let key_lower = key.toLowerCase();
  if (!(key_lower in mode_methods)) {
    return null;
  }

  return mode_methods[key_lower]();
};


// TODO: can this type assert that C must have onKeyDown?
export let mouseover_key_listener = <C extends React.ComponentClass>(Component: C): C  =>
  (class WithKeyListener extends React.Component<any, {}> {
    component: any

    constructor(props) {
      super(props);
      this.component = React.createRef();
    }

    onKeyDown = (e) => {
      this.component.current.onKeyDown(e.key);
    }

    onMouseEnter = () => {
      document.addEventListener('keydown', this.onKeyDown);
    }

    onMouseLeave = () => {
      document.removeEventListener('keydown', this.onKeyDown);
    }

    render() {
      let _Component = Component as any;
      return <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <_Component {...this.props} ref={this.component}/>
      </div>
    }
  }) as any as C
