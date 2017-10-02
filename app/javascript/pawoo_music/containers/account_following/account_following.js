import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { fetchAccount, fetchFollowing, expandFollowing } from '../../../mastodon/actions/accounts';
import AccountHeaderContainer from '../account_header';
import { makeGetAccount } from '../../../mastodon/selectors';
import AccountTimelineContainer from '../account_timeline';
import AccountList from '../../components/account_list';

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, props) => {
    const acct = props.match.params.acct;
    const accountId = Number(state.getIn(['pawoo_music', 'acct_map', acct]));

    return {
      accountId,
      account: getAccount(state, accountId),
      accountIds: state.getIn(['user_lists', 'following', accountId, 'items'], Immutable.List()),
      hasMore: !!state.getIn(['user_lists', 'following', accountId, 'next']),
    };
  };

  return mapStateToProps;
};

@connect(makeMapStateToProps)
export default class AccountFollowing extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    accountId: PropTypes.number.isRequired,
    account: ImmutablePropTypes.map.isRequired,
    accountIds: ImmutablePropTypes.list.isRequired,
    hasMore: PropTypes.bool,
  };

  componentDidMount () {
    const { dispatch, accountId } = this.props;

    dispatch(fetchAccount(accountId));
    dispatch(fetchFollowing(accountId));
  }

  componentWillReceiveProps (nextProps) {
    const { dispatch } = this.props;

    if (nextProps.accountId !== this.props.accountId && nextProps.accountId) {
      const accountId = nextProps.accountId;

      dispatch(fetchAccount(accountId));
      dispatch(fetchFollowing(accountId));
    }
  }

  handleScrollToBottom = debounce(() => {
    const { dispatch, accountId, hasMore } = this.props;
    if (hasMore) {
      dispatch(expandFollowing(accountId));
    }
  }, 300, { leading: true });


  render () {
    const { accountId, account, accountIds, hasMore } = this.props;

    const Garally = (
      <div className='garally'>
        <AccountList
          scrollKey='account_followers'
          accountIds={accountIds}
          hasMore={hasMore}
          prepend={<AccountHeaderContainer account={account} />}
          onScrollToBottom={this.handleScrollToBottom}
        />
      </div>
    );

    return (
      <AccountTimelineContainer accountId={accountId} garally={Garally} />
    );
  }

};
