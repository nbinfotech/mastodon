import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import querystring from 'querystring';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Track from '../track';
import FollowButton from '../follow_button';
import { fetchRelationships } from '../../../mastodon/actions/accounts';
import { isMobile } from '../../util/is_mobile';

import '../app/app.scss';

const params = location.search.length > 1 ? querystring.parse(location.search.substr(1)) : {};
const hideInfo = params.hideinfo && Number(params.hideinfo) === 1;
const mobile = isMobile();

const mapStateToProps = (state, { statusId }) => {
  const status = state.getIn(['statuses', statusId]);

  return {
    acct: state.getIn(['accounts', status.get('account'), 'acct']),
    status,
    trackIsMounted: Immutable.List(['statuses', statusId, 'track']).equals(
      state.getIn(['pawoo_music', 'player', 'trackPath'])),
  };
};

@connect(mapStateToProps)
export default class EmbedMusicvideo extends React.PureComponent {

  static propTypes = {
    acct: PropTypes.string,
    status: ImmutablePropTypes.map.isRequired,
    trackIsMounted: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  state = {
    visibleInfo: false,
  };

  componentDidMount () {
    const { status } = this.props;
    const accountId = status.get('account');

    this.props.dispatch(fetchRelationships([accountId]));
  }

  handleClick = () => {
    const { visibleInfo } = this.state;

    if (!visibleInfo) {
      // クリックした瞬間に、非表示だった要素もクリックしないように少し遅らせる
      // stopPropagationはTrackまでイベントが伝搬されなくなるので使わない
      setTimeout(() => {
        this.changeVisibleInfo();
      }, 10);
    }
  }

  handleMouseEnter = () => {
    this.changeVisibleInfo();
  }

  handleMouseMove = () => {
    this.changeVisibleInfo();
  }

  handleMouseLeave = () => {
    this.setState({ visibleInfo: false });
  }

  hideLogoDebounce = debounce(() => {
    this.setState({ visibleInfo: false });
  }, 3000);

  changeVisibleInfo () {
    this.setState({ visibleInfo: true });
    this.hideLogoDebounce();
  }

  renderInfo () {
    const { acct, status, trackIsMounted } = this.props;
    const { visibleInfo } = this.state;
    const id = status.get('id');
    const track = status.get('track');
    const visible = !trackIsMounted || visibleInfo;

    if (!trackIsMounted && hideInfo) {
      return (
        <div className='embed-ui' />
      );
    }

    return (
      <div className={classNames('embed-ui', { visible })}>
        {visible && (
          <div className='info'>
            <div className='meta'>
              <a className='artist' href={`/@${acct}`} target='_blank'>{track.get('artist')}</a><br />
              <a className='title' href={`/@${acct}/${id}`} target='_blank'>{track.get('title')}</a>
            </div>
            <div className='actions'>
              <FollowButton id={status.get('account')} onlyFollow embed />
            </div>
          </div>
        )}
      </div>
    );
  }

  render () {
    const { status } = this.props;

    return (
      <div
        className='app embed-musicvideo'
        onClickCapture={mobile ? this.handleClick : noop}
        role='button'
        aria-pressed='false'
        onMouseEnter={mobile ? noop : this.handleMouseEnter}
        onMouseMove={mobile ? noop : this.handleMouseMove}
        onMouseLeave={mobile ? noop : this.handleMouseLeave}
      >
        <Track track={status.get('track')} fitContain />
        {this.renderInfo()}
      </div>
    );
  }

}