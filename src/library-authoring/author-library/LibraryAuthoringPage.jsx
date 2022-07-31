import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Breadcrumb,
  Col,
  Container,
  Icon,
  IconButton,
  Input,
  Row,
  Button,
  Pagination,
} from '@edx/paragon';
import {
  Edit,
  TextFields,
  OndemandVideo,
  HelpOutline,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@edx/paragon/icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  selectLibraryEdit,
  updateLibrary,
} from '../configure-library/data';
import {
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  ROUTES,
  fetchable,
  paginated,
} from '../common';
import messages from './messages';
import BlockPreviewContainer from './BlockPreview';
import commonMessages from '../common/messages';
import emptyPageMessages from '../empty-page/messages';
import libraryListMessages from '../list-libraries/messages';
import { ErrorAlert } from '../common/ErrorAlert';
import { SuccessAlert } from '../common/SuccessAlert';
import { LoadGuard } from '../../generic/LoadingPage';
import { EmptyPage } from '../empty-page';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

const ButtonTogglesBase = ({
  setShowPreviews, showPreviews, sending, quickAddBehavior, intl,
}) => (
  <ActionRow>
    <Button
      variant="outline-primary"
      onClick={() => setShowPreviews(!showPreviews)}
      size="sm"
    >
      { intl.formatMessage(showPreviews ? messages['library.detail.hide_previews'] : messages['library.detail.show_previews']) }
    </Button>
    <Button
      variant="outline-primary"
      size="sm"
      disabled={sending}
      onClick={quickAddBehavior}
    >
      <FontAwesomeIcon icon={faPlus} className="pr-1 mr-1" />
      {intl.formatMessage(messages['library.detail.add.item'])}
    </Button>
  </ActionRow>
);

ButtonTogglesBase.propTypes = {
  intl: intlShape.isRequired,
  sending: PropTypes.bool.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  quickAddBehavior: PropTypes.func.isRequired,
};

const ButtonToggles = injectIntl(ButtonTogglesBase);

const PagingHeaderBase = ({
  intl,
  paginationOptions,
  onPageSelect,
  collectionCount,
}) => {
  const { currentPage, pageCount } = paginationOptions;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === pageCount;
  const nextPage = isLastPage ? null : currentPage + 1;
  const previousPage = isFirstPage ? null : currentPage - 1;

  const pageSize = +process.env.LIBRARY_AUTHORING_PAGINATION_PAGE_SIZE;
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(currentPage * pageSize, collectionCount);

  const pagingMessage = intl.formatMessage(messages['library.detail.header.paging'],
    { start: Math.min(start + 1, end), end, collectionCount });

  const handlePreviousButtonClick = () => {
    onPageSelect(previousPage);
  };

  const handleNextButtonClick = () => {
    onPageSelect(nextPage);
  };

  return (
    <div className="paging-header">
      <p>{pagingMessage}</p>
      <ActionRow>
        <IconButton
          invertColors
          src={KeyboardArrowLeft}
          iconAs={Icon}
          disabled={isFirstPage}
          alt="Arrow left"
          onClick={handlePreviousButtonClick}
          variant="primary"
          size="sm"
        />
        <IconButton
          invertColors
          src={KeyboardArrowRight}
          iconAs={Icon}
          disabled={isLastPage}
          alt="Arrow right"
          onClick={handleNextButtonClick}
          variant="primary"
          size="sm"
        />
      </ActionRow>
    </div>
  );
};

PagingHeaderBase.propTypes = {
  intl: intlShape.isRequired,
  paginationOptions: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    buttonLabels: PropTypes.shape({
      previous: PropTypes.string.isRequired,
      next: PropTypes.string.isRequired,
      page: PropTypes.string.isRequired,
      currentPage: PropTypes.string.isRequired,
      pageOfCount: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onPageSelect: PropTypes.func.isRequired,
  collectionCount: PropTypes.number.isRequired,
};

const PagingHeader = injectIntl(PagingHeaderBase);

/**
 * LibraryAuthoringPageHeaderBase
 * Title component for the LibraryAuthoringPageBase.
 */
const LibraryAuthoringPageHeaderBase = ({ intl, library, ...props }) => {
  const [inputIsActive, setIsActive] = useState(false);
  const handleOnBlur = (event) => {
    const newTitle = event.target.value;
    if (newTitle && newTitle !== library.title) {
      props.updateLibrary({ data: { title: newTitle, libraryId: library.id } });
    }
    setIsActive(false);
  };
  const handleClick = () => {
    setIsActive(true);
  };

  return (
    <>
      <h2 className="page-header">
        {inputIsActive
          ? (
            <Input
              autoFocus
              name="title"
              id="title"
              type="text"
              aria-label="Title input"
              defaultValue={library.title}
              onBlur={handleOnBlur}
            />
          )
          : (
            <>
              {library.title}
              <IconButton
                invertColors
                isActive
                iconAs={Edit}
                alt="Edit name button"
                onClick={handleClick}
                className="ml-3"
              />
            </>
          )}
      </h2>
    </>
  );
};

LibraryAuthoringPageHeaderBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
};

const LibraryAuthoringPageHeader = connect(
  selectLibraryEdit,
  {
    updateLibrary,
  },
)(injectIntl(LibraryAuthoringPageHeaderBase));

/**
 * LibraryAuthoringPage
 * Template component for the library Authoring page.
 */
export const LibraryAuthoringPageBase = ({
  intl, library, blockView, showPreviews, setShowPreviews,
  sending, addBlock, hasChanges, errorMessage, successMessage,
  quickAddBehavior, otherTypes, blocks, changeQuery, changeType, changePage,
  paginationOptions, typeOptions, query, type, ...props
}) => {
  const renderComponents = () => (
    blocks.value.data.map((block) => (
      <Col xs={12} key={block.id} className="pb-3">
        <BlockPreviewContainer
          block={block}
          blockView={blockView}
          showPreviews={showPreviews}
          library={library}
        />
      </Col>
    ))
  );

  const renderActionsForCreateComponent = () => (
    <ActionRow className="create-component-row">
      <Button
        variant="outline-primary"
        size="lg"
        disabled={sending}
        onClick={() => addBlock('html')}
        alt="Add text block"
      >
        <Icon src={TextFields} />
        {intl.formatMessage(emptyPageMessages['library.detail.empty.new.text'])}
      </Button>
      <Button
        variant="outline-primary"
        size="lg"
        disabled={sending}
        onClick={() => addBlock('video')}
        alt="Add video block"
      >
        <Icon src={OndemandVideo} />
        {intl.formatMessage(emptyPageMessages['library.detail.empty.new.video'])}
      </Button>
      <Button
        variant="outline-primary"
        size="lg"
        disabled={sending}
        onClick={() => addBlock('problem')}
        alt="Add problem block"
      >
        <Icon src={HelpOutline} />
        {intl.formatMessage(emptyPageMessages['library.detail.empty.new.problem'])}
      </Button>
    </ActionRow>
  );

  return (
    <Container fluid>
      <div className="library-authoring-wrapper">
        <ErrorAlert errorMessage={errorMessage} onClose={props.clearLibraryError} />
        <SuccessAlert successMessage={successMessage} onClose={props.clearLibrarySuccess} />
        <Breadcrumb
          links={[
            { label: intl.formatMessage(commonMessages['library.common.breadcrumbs.studio']), url: getConfig().STUDIO_BASE_URL },
            { label: intl.formatMessage(libraryListMessages['library.list.breadcrumbs.libraries']), url: ROUTES.List.HOME },
          ]}
          activeLabel={intl.formatMessage(messages['library.detail.breadcrumbs.LibraryAuthoring'])}
        />
        <div xs={12} className="wrapper-mast wrapper">
          <header className="mast has-actions">
            <LibraryAuthoringPageHeader library={library} />
            {blocks.value.count !== 0 && (
              <ButtonToggles
                setShowPreviews={setShowPreviews}
                showPreviews={showPreviews}
                sending={sending}
                quickAddBehavior={quickAddBehavior}
                className="py-3"
              />
            )}
          </header>
          {blocks.value.count > 0 && (
            <PagingHeader
              paginationOptions={paginationOptions}
              onPageSelect={(page) => changePage(page)}
              collectionCount={blocks.value.count}
            />
          )}
        </div>
        <div className="wrapper-content wrapper">
          <div className="content">
            <article className="content-fullwidth" role="main">
              {blocks.value.count === 0
                ? (
                  <EmptyPage
                    heading={intl.formatMessage(emptyPageMessages['library.detail.empty.heading'])}
                    body={intl.formatMessage(emptyPageMessages['library.detail.empty.body'])}
                  >
                    {renderActionsForCreateComponent()}
                  </EmptyPage>
                ) : (
                  <>
                    <Row className="mb-4">
                      <LoadGuard
                        loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])}
                        condition={blocks.status !== LOADING_STATUS.LOADING}
                      >
                        {renderComponents}
                      </LoadGuard>
                    </Row>
                    <EmptyPage
                      heading={intl.formatMessage(emptyPageMessages['library.detail.empty.new.component'])}
                    >
                      {renderActionsForCreateComponent()}
                    </EmptyPage>
                    <Pagination
                      className="library-blocks-pagination"
                      paginationLabel="pagination navigation"
                      currentPage={paginationOptions.currentPage}
                      pageCount={paginationOptions.pageCount}
                      buttonLabels={paginationOptions.buttonLabels}
                      onPageSelect={(page) => changePage(page)}
                    />
                  </>
                )}
            </article>
          </div>
        </div>
      </div>
    </Container>
  );
};

LibraryAuthoringPageBase.defaultProps = {
  errorMessage: '',
  successMessage: null,
  blocks: null,
};

LibraryAuthoringPageBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape.isRequired,
  blocks: fetchable(paginated(libraryBlockShape)),
  blockView: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  paginationOptions: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    buttonLabels: PropTypes.shape({
      previous: PropTypes.string.isRequired,
      next: PropTypes.string.isRequired,
      page: PropTypes.string.isRequired,
      currentPage: PropTypes.string.isRequired,
      pageOfCount: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  changeQuery: PropTypes.func.isRequired,
  changeType: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
  setShowPreviews: PropTypes.func.isRequired,
  typeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  sending: PropTypes.bool.isRequired,
  addBlock: PropTypes.func.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  clearLibraryError: PropTypes.func.isRequired,
  clearLibrarySuccess: PropTypes.func.isRequired,
  quickAddBehavior: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  otherTypes: PropTypes.arrayOf(
    PropTypes.shape({
      block_type: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

const LibraryAuthoringPage = injectIntl(LibraryAuthoringPageBase);
export default LibraryAuthoringPage;
