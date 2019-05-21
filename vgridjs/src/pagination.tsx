import * as React from "react";
import * as Rb from 'react-bootstrap';
import {inject} from 'mobx-react';

import {Settings} from './settings';
import {BlockSelectType, LabelState} from './label_state';

interface BlockPaginationProps {
  blocks: React.ReactNode[]
  settings?: Settings
}

interface BlockPaginationState {
  page: number
}

@inject("settings")
export class BlockPagination extends React.Component<BlockPaginationProps, BlockPaginationState> {
  state = {page: 0}

  render() {
    let blocks_per_page = this.props.settings!.blocks_per_page
    let num_pages = Math.floor((this.props.blocks.length - 1) / blocks_per_page);

    let PageButtons = () => <div className='page-buttons'>
      <Rb.ButtonGroup>
        <Rb.Button onClick={() => {
          this.setState({page: Math.max(this.state.page - 1, 0)});
        }}>&larr;</Rb.Button>
        <Rb.Button onClick={() => {
          this.setState({page: Math.min(this.state.page + 1, num_pages)});
        }}>&rarr;</Rb.Button>
        <span key={this.state.page}>
          <Rb.FormControl type="text" defaultValue={`${this.state.page + 1}`} onKeyPress={(e: any) => {
            if (e.key === 'Enter') { this.setState({
              page: Math.min(Math.max(parseInt(e.target.value)-1, 0), num_pages)
            }); }
          }} />
        </span>
        <span className='page-count'>/ {num_pages + 1}</span>
      </Rb.ButtonGroup>
    </div>;

    let paginate = this.props.settings!.paginate || num_pages > 1;
    return <div className='vgrid-pagination'>
        {paginate ? <PageButtons /> : null}
        <div className='page'>
            <ul style={{listStyleType: "none"}}>
                {this.props.blocks.filter((_, i) =>
                  i >= this.state.page * blocks_per_page && i < (this.state.page + 1) * blocks_per_page)}
            </ul>
            <div className='clearfix' />
        </div>
        {paginate ? <PageButtons /> : null}
    </div>;
  }
}
