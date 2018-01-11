import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalContainer from '../modal_container';
import TrackComposeModalContainer from '../track_compose_modal';
import { isMobile } from '../../util/is_mobile';
import { closeModal } from '../../../mastodon/actions/modal';

const mapDispatchToProps = dispatch => ({
  onRouteChange () {
    dispatch(closeModal());
  },
});

@connect(null, mapDispatchToProps)
@withRouter
export default class ModalContextContainer extends ImmutablePureComponent {

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onRouteChange: PropTypes.func.isRequired,
  };

  componentWillReceiveProps () {
    this.props.onRouteChange();
  }

  render () {
    return (
      <div className={this.props.className} >
        {this.props.children}
        <ModalContainer />
        {isMobile() || <TrackComposeModalContainer />}
      </div>
    );
  }

}