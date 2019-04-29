export interface Action {
  name: string
  do_: () => void
  undo: () => void
}

export class ActionStack {
  private done_actions: Action[] = [];
  private undone_actions: Action[] = [];

  push(action: Action) {
    action.do_();
    this.done_actions.push(action);
  }

  undo() {
    let action = this.done_actions.pop();
    if (action) {
      console.log(`Undoing '${action.name}'`);
      action.undo();
      this.undone_actions.push(action);
    } else {
      console.log('No actions to undo');
    }
  }

  redo() {
    let action = this.undone_actions.pop();
    if (action) {
      console.log(`Redoing '${action.name}'`);
      action.do_();
      this.done_actions.push(action);
    } else {
      console.log('No actions to redo');
    }
  }
}
