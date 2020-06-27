import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { libraryShape, LoadingPage } from '../library-common';
import { fetchLibraryDetail } from './data/actions';
import { libraryDetailSelector } from './data/selectors';
import messages from './messages';

class LibraryDetailPage extends React.Component {
  componentDidMount() {
    const { libraryId } = this.props.match.params;
    this.props.fetchLibraryDetail({libraryId});
  }

  renderError() {
    const { intl, error } = this.props;

    return (
      <div>
        {intl.formatMessage(messages['library.detail.loading.error'], {error})}
      </div>
    );
  }

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />
    );
  }

  renderContent() {
    const { intl, library } = this.props;

    return (
      <div className="library-detail-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions has-navigation has-subtitle">
            <div className="page-header">
              <small className="subtitle">{intl.formatMessage(messages['library.detail.page.heading'])}</small>
              <h1 className="page-header-title">{library.title}</h1>
            </div>
            <nav className="nav-actions">
                <ul>
                    <li className="nav-item">
                      <Button className="btn-success">
                        <Icon className="fa fa-plus pr-3 icon-inline" alt="" />
                        {intl.formatMessage(messages['library.detail.new.component'])}
                      </Button>
                    </li>
                </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
            </article>
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.detail.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.detail.aside.text.1'])}</p>
                <p>{intl.formatMessage(messages['library.detail.aside.text.2'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener"
                      target="_blank">
                      {intl.formatMessage(messages['library.detail.aside.help.link'])}
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </div>
    );
  }

  render() {
    const { error, loaded, loading } = this.props;

    let content;
    if (error) {
      content = this.renderError();
    } else if (loading) {
      content = this.renderLoading();
    } else if (loaded) {
      content = this.renderContent();
    }

    return (
      <div className="container-fluid">
        {content}
      </div>
    );
  }
}

LibraryDetailPage.contextType = AppContext;

LibraryDetailPage.propTypes = {
  error: PropTypes.string,
  fetchLibraryDetail: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  library: libraryShape,
  loaded: PropTypes.bool,
  loading: PropTypes.bool,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

LibraryDetailPage.defaultProps = {
  error: null,
  library: null,
  loaded: false,
  loading: false,
};

export default connect(
  libraryDetailSelector,
  {
    fetchLibraryDetail,
  }
)(injectIntl(LibraryDetailPage));
