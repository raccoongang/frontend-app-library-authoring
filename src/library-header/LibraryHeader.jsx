import React from 'react';
import PropTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dropdown, Icon } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { ensureConfig } from '@edx/frontend-platform/config';

import { libraryShape } from '../library-common';
import { libraryDetailSelector } from '../library-detail';
import StudioLogo from './assets/studio-logo.png';
import messages from './messages';

ensureConfig([
  'CMS_BASE_URL',
  'LOGOUT_URL',
], 'Library header');

class LibraryHeader extends React.Component {
  render() {
    const { authenticatedUser, config } = this.context;
    const { intl, library } = this.props;

    return (
      <div className="wrapper-header wrapper">
        <header className="primary" role="banner">
          <div className="wrapper-l">
            <h1 className="branding">
              <Link to="/">
                <img
                  src={StudioLogo}
                  alt={intl.formatMessage(messages['library.header.logo.alt'])}
                />
              </Link>
            </h1>
            <Route path="/library">
              {library &&
              <h2 className="info-library">
                <Link to={library.url} className="library-link">
                  <span className="library-org">{library.org}</span>
                  <span className="library-id">{library.id}</span>
                  <span className="library-title" title={library.title}>{library.title}</span>
                </Link>
              </h2>
              }
            </Route>
          </div>
          <div className="wrapper-r">
            {authenticatedUser !== null &&
            <nav className="nav-account" aria-label={intl.formatMessage(messages['library.header.account.label'])}>
              <ol>
                <li className="nav-item nav-account-help">
                  <h3 className="title">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      title={intl.formatMessage(messages['library.header.nav.help.title'])}
                      rel="noopener"
                      target="_blank">
                      {intl.formatMessage(messages['library.header.nav.help'])}
                    </a>
                  </h3>
                </li>
                <li className="nav-item nav-account-user">
                  <Dropdown>
                    <Dropdown.Button>
                      {authenticatedUser.username}
                      <Icon className="fa fa-caret-down pl-3" alt="" />
                    </Dropdown.Button>
                    <Dropdown.Menu>
                      <Dropdown.Item href={config.CMS_BASE_URL}>{intl.formatMessage(messages['library.header.account.studiohome'])}</Dropdown.Item>
                      <Dropdown.Item href={config.LOGOUT_URL}>{intl.formatMessage(messages['library.header.account.signout'])}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </li>
              </ol>
            </nav>
            }
          </div>
        </header>
      </div>
    );
  }
}

LibraryHeader.contextType = AppContext;

LibraryHeader.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
};

LibraryHeader.defaultProps = {
  library: null,
};

export default connect(
  libraryDetailSelector,
)(injectIntl(LibraryHeader));
