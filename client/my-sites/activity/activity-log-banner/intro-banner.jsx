/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import CardHeading from 'components/card-heading';
import DismissibleCard from 'blocks/dismissible-card';
import ExternalLink from 'components/external-link';
import QuerySitePurchases from 'components/data/query-site-purchases';
import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
} from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { isFreePlan } from 'lib/plans';
import { recordTracksEvent } from 'state/analytics/actions';
import { siteHasBackupProductPurchase } from 'state/purchases/selectors';

/**
 * Style dependencies
 */
import './intro-banner.scss';

/**
 * Image dependencies
 */
import activityImage from 'assets/images/illustrations/site-activity.svg';

class IntroBanner extends Component {
	recordLearnMore = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_learn_more' );

	recordUpgrade = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_upgrade' );

	recordDismiss = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_dismiss' );

	renderCardContent() {
		const { siteIsJetpack, siteHasBackup, siteSlug, translate } = this.props;
		const upgradePlan = siteIsJetpack ? PLAN_JETPACK_PERSONAL_MONTHLY : PLAN_PERSONAL;
		const upgradeFeature = siteIsJetpack
			? FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY
			: FEATURE_JETPACK_ESSENTIAL;

		return (
			<Fragment>
				<p>
					{ translate(
						'We’ll keep track of all the events that take place on your site to help manage things easier. '
					) }
					{ ! siteHasBackup
						? translate(
								'With your free plan, you can monitor the 20 most recent events on your site.'
						  )
						: translate(
								'Looking for something specific? You can filter the events by type and date.'
						  ) }
				</p>
				{ ! siteHasBackup && (
					<Fragment>
						<p>{ translate( 'Upgrade to a paid plan to unlock powerful features:' ) }</p>
						<ul className="activity-log-banner__intro-list">
							<li>
								<Gridicon icon="checkmark" size={ 18 } />
								{ translate( 'Access full activity for the past 30 days.' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 18 } />
								{ translate( 'Filter events by type and date.' ) }
							</li>
						</ul>

						<div className="activity-log-banner__intro-actions">
							{ ! siteHasBackup && (
								<Button
									primary
									className="activity-log-banner__intro-button"
									href={ `/plans/${ siteSlug }?feature=${ upgradeFeature }&plan=${ upgradePlan }` }
									onClick={ this.recordUpgrade }
								>
									{ translate( 'Upgrade now' ) }
								</Button>
							) }
							<ExternalLink
								href="https://en.blog.wordpress.com/2018/10/30/introducing-activity/"
								icon
								onClick={ this.recordLearnMore }
								target="_blank"
							>
								{ translate( 'Learn more' ) }
							</ExternalLink>
						</div>
					</Fragment>
				) }
			</Fragment>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		const wpBrandFont = 'wp-brand-font';

		return (
			<Fragment>
				<QuerySitePurchases siteId={ siteId } />

				<DismissibleCard
					preferenceName="activity-introduction-banner"
					className="activity-log-banner__intro"
					onClick={ this.recordDismiss }
				>
					<div className="activity-log-banner__intro-description">
						<span className={ wpBrandFont }>
							<CardHeading tagName="h1" size={ 24 }>
								{ translate( 'Welcome to your site’s activity' ) }
							</CardHeading>
						</span>
						{ this.renderCardContent() }
					</div>
					<img
						className="activity-log-banner__intro-image"
						src={ activityImage }
						alt={ translate( 'A site’s activity listed on a vertical timeline.' ) }
					/>
				</DismissibleCard>
			</Fragment>
		);
	}
}

export default connect(
	( state, { siteId } ) => {
		const siteIsOnFreePlan = isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) );
		const hasBackupPurchase = siteHasBackupProductPurchase( state, siteId );

		return {
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteHasBackup: ! siteIsOnFreePlan || hasBackupPurchase,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( IntroBanner ) );
