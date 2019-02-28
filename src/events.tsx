import * as React from "react";

export let mouse_key_events = <P extends object, C extends React.ComponentClass<P>>(Component: C): C  =>
  (class WithMouseKeyEvents extends React.Component<P, {last_x: number, last_y: number}> {
    state = {last_x: 0, last_y: 0}
    component: any
    div: any

    constructor(props: P) {
      super(props);
      this.component = React.createRef();
      this.div = React.createRef();
    }

    coords = (e: React.MouseEvent<HTMLElement>) => {
      let rect = this.div.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      return [x, y];
    }

    call_if = (f: ((x: number, y: number) => void) | undefined, e: React.MouseEvent<HTMLElement>) => {
      if (f) {
        let [x, y] = this.coords(e);
        f(x, y);
      }
    }

    call_if_kbd = (f: ((char: string, x: number, y: number) => void) | undefined, e: any) => {
      if (f) {
        f(e.key, this.state.last_x, this.state.last_y);
      }
    }

    onClick = (e: React.MouseEvent<HTMLElement>) => {
      this.call_if(this.component.current.onClick, e);
    }

    onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
      this.call_if(this.component.current.onMouseDown, e);
    }

    onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      let [x, y] = this.coords(e);
      this.setState({last_x: x, last_y: y});
      this.call_if(this.component.current.onMouseMove, e);
    }

    onMouseUp = (e: React.MouseEvent<HTMLElement>) => {
      this.call_if(this.component.current.onMouseUp, e);
    }

    onKeyDown = (e: any) => {
      this.call_if_kbd(this.component.current.onKeyDown, e);
    }

    onKeyUp = (e: any) => {
      this.call_if_kbd(this.component.current.onKeyUp, e);
    }

    onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
      this.call_if(this.component.current.onMouseEnter, e);
    }

    onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
      this.call_if(this.component.current.onMouseLeave, e);
    }

    render() {
      let _Component = Component as any;
      return <div ref={this.div} onClick={this.onClick} onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}>
        <_Component {...this.props} ref={this.component}/>
      </div>
    }
  }) as any as C
