import * as React from "react";

/**
 * React component decorator that adds event handlers for tracking mouse movement and key presses.
 * For key presses, the onKeyDown/onKeyUp are only listened to/fired when the mouse is inside the
 * component. For mouse movement, the callbacks are x/y mouse coordinates relative to the component.
 */
export let mouse_key_events = <C extends object>(Component: C): C  =>
  (class WithMouseKeyEvents extends React.Component<any, {}> {
    last_x: number = 0
    last_y: number = 0
    component: any
    div: any

    constructor(props: any) {
      super(props);
      this.component = React.createRef();
      this.div = React.createRef();
    }

    coords = (ex: number, ey: number) => {
      // Note: calling getBoundingClientRect
      let rect = this.div.current.getBoundingClientRect();
      let x = ex - rect.left;
      let y = ey - rect.top;
      return [x, y];
    }

    call_if = (f: ((x: number, y: number) => void) | undefined, e: React.MouseEvent<HTMLElement>) => {
      if (f) {
        let [x, y] = this.coords(e.clientX, e.clientY);
        f(x, y);
      }
    }

    call_if_kbd = (f: ((char: string, x: number, y: number) => void) | undefined, e: any) => {
      if (f) {
        let [x, y] = this.coords(this.last_x, this.last_y);
        f(e.key, x, y);
      }
    }

    onClick = (e: React.MouseEvent<HTMLElement>) => {
      if (this.component.current) {
        this.call_if(this.component.current.onClick, e);
      }
    }

    onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
      if (this.component.current) {
        this.call_if(this.component.current.onMouseDown, e);
      }
    }

    onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      this.last_x = e.clientX;
      this.last_y = e.clientY;
      if (this.component.current) {
        this.call_if(this.component.current.onMouseMove, e);
      }
    }

    onMouseUp = (e: React.MouseEvent<HTMLElement>) => {
      if (this.component.current) {
        this.call_if(this.component.current.onMouseUp, e);
      }
    }

    onKeyDown = (e: any) => {
      if (this.component.current) {
        this.call_if_kbd(this.component.current.onKeyDown, e);
      }
    }

    onKeyUp = (e: any) => {
      if (this.component.current) {
        this.call_if_kbd(this.component.current.onKeyUp, e);
      }
    }

    onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
      if (this.component.current) {
        this.call_if(this.component.current.onMouseEnter, e);
      }
    }

    onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
      if (this.component.current) {
        this.call_if(this.component.current.onMouseLeave, e);
      }
    }

    render() {
      let _Component = Component as any;
      return <div ref={this.div} onClick={this.onClick} onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}>
        <_Component {...this.props} ref={this.component} />
      </div>
    }
  }) as any as C
