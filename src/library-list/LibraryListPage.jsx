import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { libraryShape, LoadingPage } from '../library-common';
import { createLibrary, fetchLibraryList } from './data/actions';
import { libraryListPageSelector } from './data/selectors';
import { LibraryForm } from './library-form';
import { default as LibraryItem } from './LibraryItem';
import messages from './messages';

class LibraryListPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
    };
  }

  showForm = () => {
    this.setState({
      showForm: true,
    });
  }

  hideForm = () => {
    this.setState({
      showForm: false,
    });
  }

  componentDidMount() {
    this.props.fetchLibraryList();
  }

  renderError() {
    const { intl, error } = this.props;

    return (
      <div>
        {intl.formatMessage(messages['library.list.loading.error'], {error})}
      </div>
    );
  }

  renderLoading() {
    const { intl } = this.props;

    return (
      <LoadingPage loadingMessage={intl.formatMessage(messages['library.list.loading.message'])} />
    );
  }

  renderContent() {
    const { intl, libraries } = this.props;
    const { showForm } = this.state;

    return (
      <div className="library-list-wrapper">
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions">
            <h1 className="page-header">{intl.formatMessage(messages['library.list.page.heading'])}</h1>
            <nav className="nav-actions">
              <ul>
                <li className="nav-item">
                  <Button
                    className="btn-success"
                    onClick={this.showForm}>
                    <Icon className="fa fa-plus pr-3" alt="" />
                    {intl.formatMessage(messages['library.list.new.library'])}
                  </Button>
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-primary" role="main">
              {showForm &&
              <LibraryForm cancel={this.hideForm} />
              }
              <ul className="library-list">
                {libraries.map((library, i) => (
                <li key={i} className="library-item">
                  <LibraryItem library={library} />
                </li>
                ))}
              </ul>
            </article>
            <aside className="content-supplementary">
              <div className="bit">
                <h3 className="title title-3">{intl.formatMessage(messages['library.list.aside.title'])}</h3>
                <p>{intl.formatMessage(messages['library.list.aside.text'])}</p>
                <ul className="list-actions">
                  <li className="action-item">
                    <a
                      href="http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/course_components/libraries.html"
                      rel="noopener"
                      target="_blank">
                      {intl.formatMessage(messages['library.list.aside.help.link'])}
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

LibraryListPage.contextType = AppContext;

LibraryListPage.propTypes = {
  error: PropTypes.string,
  fetchLibraryList: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  libraries: PropTypes.arrayOf(libraryShape),
  loaded: PropTypes.bool,
  loading: PropTypes.bool,
};

LibraryListPage.defaultProps = {
  error: null,
  libraries: [],
  loaded: false,
  loading: false,
};

export default connect(
  libraryListPageSelector,
  {
    fetchLibraryList,
  }
)(injectIntl(LibraryListPage));
