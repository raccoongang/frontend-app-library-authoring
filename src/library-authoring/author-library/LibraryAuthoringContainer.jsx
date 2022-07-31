import React, {
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid4 } from 'uuid';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  clearLibrary,
  clearLibraryError,
  clearLibrarySuccess,
  commitLibraryChanges,
  createBlock,
  fetchBlocks,
  fetchLibraryDetail,
  revertLibraryChanges,
  searchLibrary,
} from './data';
import {
  BLOCK_FILTER_ORDER,
  LIBRARY_TYPES,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  fetchable,
  paginated,
} from '../common';
import { LoadingPage } from '../../generic';
import messages from './messages';
import { blockStatesShape } from '../edit-block/data/shapes';
import commonMessages from '../common/messages';
import selectLibraryDetail from '../common/data/selectors';
import LibraryAuthoringPage from './LibraryAuthoringPage';

const deriveTypeOptions = (blockTypes, intl) => {
  let typeOptions = blockTypes.map((typeSpec) => (
    { value: typeSpec.block_type, label: typeSpec.display_name }
  ));
  typeOptions.push({ value: '^', label: intl.formatMessage(messages['library.detail.other_component']) });
  typeOptions = typeOptions.filter((entry) => BLOCK_FILTER_ORDER.includes(entry.value));
  typeOptions.sort((a, b) => {
    const aOrder = BLOCK_FILTER_ORDER.indexOf(a.value);
    const bOrder = BLOCK_FILTER_ORDER.indexOf(b.value);
    if (aOrder === bOrder) {
      // Should never happen, but could cause problems if it did and we didn't indicate they should be treated the same.
      return 0;
    }
    if (BLOCK_FILTER_ORDER.indexOf(a.value) > BLOCK_FILTER_ORDER.indexOf(b.value)) {
      return 1;
    }
    return -1;
  });

  typeOptions.unshift({ value: '', label: intl.formatMessage(messages['library.detail.all_types']) });
  return typeOptions;
};

/**
 * LibraryAuthoringPageContainerBase
 *
 * Container for the Library Authoring page.
 * This is the main page for the authoring tool.
 */
export const LibraryAuthoringPageContainerBase = ({
  intl, library, blockStates, blocks, ...props
}) => {
  const { libraryId } = props.match.params;
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  const pageSize = +process.env.LIBRARY_AUTHORING_PAGINATION_PAGE_SIZE;
  const lastPage = Math.ceil(blocks.value.count / pageSize) || 1;
  const paginationParams = {
    page,
    page_size: pageSize,
  };

  // On mount.
  useEffect(() => {
    if (library?.id !== libraryId) {
      props.clearLibrary().then(() => {
        props.fetchLibraryDetail({ libraryId });
        props.fetchBlocks({ libraryId, paginationParams });
      });
    }
  }, []);

  const normalizeTypes = () => {
    let types;
    if (type === '^' && library) {
      types = library.blockTypes.map((entry) => entry.block_type);
      types = types.filter((entry) => !BLOCK_FILTER_ORDER.includes(entry));
      if (types.length === 0) {
        // We're asking for 'other components', but there are no other components. Hand the API something that should
        // return nothing.
        types = ['^'];
      }
    } else if (type === '') {
      types = [];
    } else {
      types = [type];
    }

    return types;
  };

  // Refresh page on query, type, or page changes.
  useEffect(() => {
    if (!sending) {
      props.searchLibrary({
        libraryId, paginationParams, query, types: normalizeTypes(),
      });
    }
  }, [query, type, page]);

  const changeQuery = (newQuery) => {
    setPage(1);
    setQuery(newQuery);
  };

  const changeType = (newType) => {
    setPage(1);
    setType(newType);
  };

  const changePage = (newPage) => {
    setPage(newPage);
  };

  const selectPreviousPage = () => {
    const previousPage = page - 1;
    setPage(previousPage);
  };

  // Keep track of the number of components on the page, if there are none left on the current page,
  // go to the previous one or first page
  useEffect(() => {
    const blockOnCurrentPage = blocks.value.data.length;
    const blockTotal = blocks.value.count;

    if (blockOnCurrentPage === 0) {
      if (lastPage === 1) {
        changePage(1);
        props.searchLibrary({
          libraryId, paginationParams, query, types: normalizeTypes(),
        });
      } else {
        selectPreviousPage();
      }
    } else if (blockTotal % pageSize === 0 && lastPage === 1) {
      changePage(1);
      props.searchLibrary({
        libraryId, paginationParams, query, types: normalizeTypes(),
      });
    }
  }, [blocks.value.count]);

  // If we end up needing this across components, or we end up needing more settings like this, we'll have to create
  // another redux slice for 'common' settings which hydrates from localStorage.
  let initialPreviewState = localStorage.getItem('showPreviews');
  initialPreviewState = initialPreviewState ? JSON.parse(initialPreviewState) : true;
  const [showPreviews, baseSetShowPreviews] = useState(initialPreviewState);
  const setShowPreviews = (value) => {
    localStorage.setItem('showPreviews', value);
    baseSetShowPreviews(value);
  };

  // We need the library to be loaded for what follows.  We can't put this further up because it would change the order
  // of the useState/useEffect hooks on subsequent renders.
  if (!library || !blocks) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }

  const addBlock = (blockType) => {
    let nextPage = lastPage;
    if (blocks.value.count && blocks.value.count % pageSize === 0) {
      nextPage += 1;
    }
    setSending(true);
    setPage(nextPage);
    props.createBlock({
      libraryId,
      data: {
        block_type: blockType,
        definition_id: `${uuid4()}`,
      },
      paginationParams: {
        ...paginationParams,
        page: nextPage,
      },
      query,
      types: normalizeTypes(),
    }).finally(() => {
      setSending(false);
    });
  };

  const preSelected = ['video', 'html', 'problem'];
  const otherTypes = (library
    && library.blockTypes.filter((blockSpec) => !preSelected.includes(blockSpec.block_type))
  ) || [];

  const typeOptions = deriveTypeOptions(library.blockTypes, intl);

  const hasChanges = library.has_unpublished_changes || library.has_unpublished_deletes;
  const blockView = (block) => {
    if (blockStates[block.id]) {
      return blockStates[block.id].view;
    }
    return { value: null, status: LOADING_STATUS.STANDBY };
  };

  const quickAddBehavior = () => {
    if (library.type === LIBRARY_TYPES.COMPLEX) {
      document.querySelector('.create-component-row').scrollIntoView({ behavior: 'smooth' });
    } else {
      addBlock(library.type);
    }
  };

  const paginationOptions = {
    currentPage: paginationParams.page,
    pageCount: lastPage,
    buttonLabels: {
      previous: intl.formatMessage(commonMessages['library.common.pagination.labels.previous']),
      next: intl.formatMessage(commonMessages['library.common.pagination.labels.next']),
      page: intl.formatMessage(commonMessages['library.common.pagination.labels.page']),
      currentPage: intl.formatMessage(commonMessages['library.common.pagination.labels.currentPage']),
      pageOfCount: intl.formatMessage(commonMessages['library.common.pagination.labels.pageOfCount']),
    },
  };

  return (
    <LibraryAuthoringPage
      blockStates={blockStates}
      blockView={blockView}
      library={library}
      showPreviews={showPreviews}
      setShowPreviews={setShowPreviews}
      sending={sending}
      addBlock={addBlock}
      hasChanges={hasChanges}
      quickAddBehavior={quickAddBehavior}
      typeOptions={typeOptions}
      paginationOptions={paginationOptions}
      changeQuery={changeQuery}
      changeType={changeType}
      changePage={changePage}
      query={query}
      type={type}
      otherTypes={otherTypes}
      blocks={blocks}
      {...props}
    />
  );
};

LibraryAuthoringPageContainerBase.defaultProps = {
  library: null,
  errorMessage: null,
  successMessage: null,
};

LibraryAuthoringPageContainerBase.propTypes = {
  intl: intlShape.isRequired,
  library: libraryShape,
  fetchLibraryDetail: PropTypes.func.isRequired,
  fetchBlocks: PropTypes.func.isRequired,
  searchLibrary: PropTypes.func.isRequired,
  blockStates: blockStatesShape.isRequired,
  blocks: fetchable(paginated(libraryBlockShape)).isRequired,
  createBlock: PropTypes.func.isRequired,
  clearLibrary: PropTypes.func.isRequired,
  commitLibraryChanges: PropTypes.func.isRequired,
  revertLibraryChanges: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      libraryId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const LibraryAuthoringPageContainer = connect(
  selectLibraryDetail,
  {
    clearLibraryError,
    clearLibrarySuccess,
    clearLibrary,
    createBlock,
    commitLibraryChanges,
    revertLibraryChanges,
    fetchLibraryDetail,
    fetchBlocks,
    searchLibrary,
  },
)(injectIntl(LibraryAuthoringPageContainerBase));

export default LibraryAuthoringPageContainer;
