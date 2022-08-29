import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Button, Pagination, Breadcrumb, ActionRow, Icon, Card, Container,
  AlertModal, IconButton,
} from '@edx/paragon';
import { Add, Delete } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingPage } from '../../generic';
import {
  LOADING_STATUS, libraryShape, paginated, ROUTES,
} from '../common';
import { EmptyPage } from '../empty-page';
import {
  fetchLibraryList,
  libraryListInitialState,
  selectLibraryList,
} from './data';
import {
  deleteLibrary,
} from './data/thunks';
import messages from './messages';
import commonMessages from '../common/messages';
import emptyPageMessages from '../empty-page/messages';

const LibraryCardBase = ({
  intl, library, goToLibraryItem, handleDeleteLibrary,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const setShowDeleteModalHandler = (event, active) => {
    event.stopPropagation();
    setShowDeleteModal(active);
  };

  return (
    <>
      <Card
        isClickable
        className="library-item"
        onClick={() => goToLibraryItem(library)}
      >
        <Card.Header
          className="library-title"
          title={library.title}
          actions={
            library.can_delete && (
              <ActionRow>
                <IconButton
                  isActive
                  aria-label={intl.formatMessage(messages['library.list.delete'])}
                  src={Delete}
                  iconAs={Icon}
                  alt={intl.formatMessage(messages['library.list.delete'])}
                  onClick={(e) => setShowDeleteModalHandler(e, true)}
                  className="bg-light-200"
                  invertColors
                />
              </ActionRow>
            )
          }
        />
        <div className="library-metadata">
          <span className="library-org metadata-item">
            <span className="value">{library.org}</span>
          </span>
          <span className="library-slug metadata-item">
            <span className="value">{library.slug}</span>
          </span>
        </div>
      </Card>
      <AlertModal
        isOpen={showDeleteModal}
        title={intl.formatMessage(messages['library.list.delete.modal.title'])}
        footerNode={(
          <ActionRow>
            <Button
              size="md"
              variant="tertiary"
              onClick={(e) => setShowDeleteModalHandler(e, false)}
            >
              {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={(e) => handleDeleteLibrary(e, library.id)}
            >
              {intl.formatMessage(commonMessages['library.common.forms.button.yes'])}
            </Button>
          </ActionRow>
        )}
      >
        {intl.formatMessage(messages['library.list.delete.modal.body'])}
      </AlertModal>
    </>
  );
};

LibraryCardBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  goToLibraryItem: PropTypes.func.isRequired,
  handleDeleteLibrary: PropTypes.func.isRequired,
};

const LibraryCard = injectIntl(LibraryCardBase);

export class LibraryListPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paginationParams: {
        page: 1,
        page_size: +process.env.LIBRARY_LISTING_PAGINATION_PAGE_SIZE,
      },
      filterParams: {
        type: 'complex',
        text_search: '',
        org: '',
      },
    };
  }

  componentDidMount() {
    this.props.fetchLibraryList({
      params: {
        ...this.state.filterParams,
        ...this.state.paginationParams,
      },
    });
  }

  goToCreateLibraryPage = () => {
    this.props.history.push(ROUTES.List.CREATE);
  }

  handlePageChange = (selectedPage) => {
    this.setState(state => ({
      paginationParams: {
        ...state.paginationParams,
        page: selectedPage,
      },
    }));

    this.props.fetchLibraryList({
      params: {
        ...this.state.filterParams,
        ...this.state.paginationParams,
        page: selectedPage,
      },
    });
  }

  handleDeleteLibrary = (event, libraryId) => {
    event.stopPropagation();
    this.props.deleteLibrary(libraryId).then(() => {
      this.props.fetchLibraryList({
        params: {
          ...this.state.filterParams,
          ...this.state.paginationParams,
        },
      });
    });
  }

  goToLibraryItem = (library) => {
    this.props.history.push(library.url);
  }

  renderError() {
    const { intl, errorMessage } = this.props;

    return (
      <div>
        {intl.formatMessage(messages['library.list.loading.error'], { errorMessage })}
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

    const paginationOptions = {
      currentPage: this.state.paginationParams.page,
      pageCount: Math.ceil(libraries.count / this.state.paginationParams.page_size),
      buttonLabels: {
        previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
        next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
        page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
        currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
        pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
      },
    };

    return (
      <div className="library-list-wrapper">
        <Breadcrumb
          links={[
            { label: intl.formatMessage(commonMessages['library.common.breadcrumbs.studio']), url: getConfig().STUDIO_BASE_URL },
          ]}
          activeLabel={intl.formatMessage(messages['library.list.breadcrumbs.libraries'])}
        />
        <div className="wrapper-mast wrapper">
          <header className="mast has-actions">
            <h2 className="page-header">{intl.formatMessage(messages['library.list.page.heading'])}</h2>
            <nav className="nav-actions">
              <ul className="nav-list">
                <li className="nav-item">
                  {libraries.count !== 0 && (
                  <Button
                    variant="outline-primary"
                    onClick={this.goToCreateLibraryPage}
                    size="sm"
                  >
                    {intl.formatMessage(messages['library.list.new.library'])}
                  </Button>
                  )}
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div className="wrapper-content wrapper">
          <section className="content">
            <article className="content-fullwidth" role="main">
              {libraries.count > 0
                ? (
                  <ul className="library-list">
                    {libraries.data.map(library => (
                      <LibraryCard
                        key={library.id}
                        library={library}
                        goToLibraryItem={this.goToLibraryItem}
                        handleDeleteLibrary={this.handleDeleteLibrary}
                      />
                    ))}
                  </ul>
                ) : (
                  <EmptyPage
                    heading={intl.formatMessage(emptyPageMessages['library.list.empty.heading'])}
                    body={intl.formatMessage(emptyPageMessages['library.list.empty.body'])}
                  >
                    <ActionRow>
                      <Button
                        variant="outline-primary"
                        size="lg"
                        onClick={this.goToCreateLibraryPage}
                      >
                        <Icon src={Add} />
                        {intl.formatMessage(emptyPageMessages['library.list.empty.new.library'])}
                      </Button>
                    </ActionRow>
                  </EmptyPage>
                )}
              {paginationOptions.pageCount > 1
                && (
                  <Pagination
                    className="library-list-pagination"
                    paginationLabel="pagination navigation"
                    currentPage={paginationOptions.currentPage}
                    pageCount={paginationOptions.pageCount}
                    buttonLabels={paginationOptions.buttonLabels}
                    onPageSelect={this.handlePageChange}
                  />
                )}
            </article>
          </section>
        </div>
      </div>
    );
  }

  render() {
    const { status } = this.props;

    let content;
    if (status === LOADING_STATUS.FAILED) {
      content = this.renderError();
    } else if (status === LOADING_STATUS.LOADING) {
      content = this.renderLoading();
    } else if (status === LOADING_STATUS.LOADED) {
      content = this.renderContent();
    }

    return (
      <Container fluid>
        {content}
      </Container>
    );
  }
}

LibraryListPage.contextType = AppContext;

LibraryListPage.propTypes = {
  errorMessage: PropTypes.string,
  fetchLibraryList: PropTypes.func.isRequired,
  deleteLibrary: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  libraries: paginated(libraryShape).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
};

LibraryListPage.defaultProps = libraryListInitialState;

export default connect(
  selectLibraryList,
  {
    fetchLibraryList,
    deleteLibrary,
  },
)(injectIntl(withRouter(LibraryListPage)));
