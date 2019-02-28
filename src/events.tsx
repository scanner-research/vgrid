import * as React from "react";

export let click_listener = <P extends object, C extends React.ComponentClass<P>>(Component: C): C  =>
  (class WithClickListener extends React.Component<P, {}> {
    component: any
    div: any

    constructor(props: P) {
      super(props);
      this.component = React.createRef();
      this.div = React.createRef();
    }

    onClick = (e: React.MouseEvent<HTMLElement>) => {
      let rect = this.div.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      this.component.current.onClick(x, y);
    }

    render() {
      let _Component = Component as any;
      return <div onClick={this.onClick} ref={this.div}>
        <_Component {...this.props} ref={this.component}/>
      </div>
    }
  }) as any as C


// TODO: can this type assert that C must have onKeyDown?
export let mouseover_key_listener = <P extends object, C extends React.ComponentClass<P>>(Component: C): C  =>
  (class WithKeyListener extends React.Component<any, {}> {
    component: any

    constructor(props: P) {
      super(props);
      this.component = React.createRef();
    }

    onKeyDown = (e: any) => {
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
