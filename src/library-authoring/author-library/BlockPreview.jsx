import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Button,
  Card,
  IconButton,
  Icon,
} from '@edx/paragon';
import { Delete } from '@edx/paragon/icons';
import { v4 as uuid4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faEdit } from '@fortawesome/free-regular-svg-icons';
import { connect } from 'react-redux';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Link } from 'react-router-dom';
import { LibraryBlock } from '../edit-block/LibraryBlock';
import { fetchBlockLtiUrl } from './data';
import {
  BLOCK_TYPE_EDIT_DENYLIST,
  getXBlockHandlerUrl,
  libraryBlockShape,
  libraryShape,
  LOADING_STATUS,
  ROUTES,
  XBLOCK_VIEW_SYSTEM,
  fetchable,
} from '../common';
import { LoadingPage } from '../../generic';
import messages from './messages';
import {
  deleteLibraryBlock,
  fetchLibraryBlockMetadata,
  fetchLibraryBlockView,
  initializeBlock,
} from '../edit-block/data';
import { blockStatesShape, blockViewShape } from '../edit-block/data/shapes';
import commonMessages from '../common/messages';
import selectLibraryDetail from '../common/data/selectors';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');
const getHandlerUrl = async (blockId) => getXBlockHandlerUrl(blockId, XBLOCK_VIEW_SYSTEM.Studio, 'handler_name');
/**
 * BlockPreviewBase
 * Template component for BlockPreview cards, which are used to display
 * components and render controls for them in a library listing.
 */
const BlockPreviewBase = ({
  intl, block, view, canEdit, showPreviews, showDeleteModal,
  setShowDeleteModal, library, previewKey, editView, isLtiUrlGenerating,
  ...props
}) => (
  <>
    <Card className="block-preview">
      <Card.Header
        title={block.display_name}
        className={showPreviews ? 'bottom-not-rounded' : ''}
        actions={(
          <ActionRow>
            {library.allow_lti && (
              <Button
                disabled={isLtiUrlGenerating}
                size="sm"
                className="mr-1"
                onClick={() => { props.fetchBlockLtiUrl({ blockId: block.id }); }}
              >
                <FontAwesomeIcon icon={faClipboard} className="pr-1" />
                {intl.formatMessage(messages['library.detail.block.copy_lti_url'])}
              </Button>
            )}
            <Link to={editView}>
              <Button size="sm">
                <FontAwesomeIcon icon={faEdit} className="pr-1" />
                {intl.formatMessage(messages['library.detail.block.edit'])}
              </Button>
            </Link>
            <IconButton
              isActive
              aria-label={intl.formatMessage(messages['library.detail.block.delete'])}
              src={Delete}
              iconAs={Icon}
              alt={intl.formatMessage(messages['library.detail.block.delete'])}
              onClick={() => setShowDeleteModal(true)}
              className="bg-light-200"
              invertColors
            />
          </ActionRow>
        )}
      />
      <div hidden={!showPreviews}>
        <Card.Divider />
        <Card.Body>
          <LibraryBlock
            getHandlerUrl={getHandlerUrl}
            view={view}
            key={previewKey}
          />
        </Card.Body>
      </div>
    </Card>
    <AlertModal
      isOpen={showDeleteModal}
      title={intl.formatMessage(messages['library.detail.block.delete.modal.title'])}
      footerNode={(
        <ActionRow>
          <Button
            size="md"
            variant="tertiary"
            onClick={() => setShowDeleteModal(false)}
          >
            {intl.formatMessage(commonMessages['library.common.forms.button.cancel'])}
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={() => props.deleteLibraryBlock({ blockId: block.id })}
          >
            {intl.formatMessage(commonMessages['library.common.forms.button.yes'])}
          </Button>
        </ActionRow>
      )}
    >
      {intl.formatMessage(messages['library.detail.block.delete.modal.body'])}
    </AlertModal>
  </>
);

BlockPreviewBase.propTypes = {
  intl: intlShape.isRequired,
  block: libraryBlockShape.isRequired,
  library: libraryShape.isRequired,
  view: fetchable(blockViewShape).isRequired,
  canEdit: PropTypes.bool.isRequired,
  editView: PropTypes.string.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  showDeleteModal: PropTypes.bool.isRequired,
  setShowDeleteModal: PropTypes.func.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  previewKey: PropTypes.string.isRequired,
  fetchBlockLtiUrl: PropTypes.func.isRequired,
  isLtiUrlGenerating: PropTypes.bool,
};

BlockPreviewBase.defaultProps = {
  isLtiUrlGenerating: false,
};

const BlockPreview = injectIntl(BlockPreviewBase);

const inStandby = ({ blockStates, id, attr }) => blockStates[id][attr].status === LOADING_STATUS.STANDBY;
const needsView = ({ blockStates, id }) => inStandby({ blockStates, id, attr: 'view' });
const needsMeta = ({ blockStates, id }) => inStandby({ blockStates, id, attr: 'metadata' });

/**
 * BlockPreviewContainerBase
 * Container component for the BlockPreview cards.
 * Handles the fetching of the block view and metadata.
 */
const BlockPreviewContainerBase = ({
  intl, block, blockView, blockStates, showPreviews, library, ltiUrlClipboard, ...props
}) => {
  // There are enough events that trigger the effects here that we need to keep track of what we're doing to avoid
  // doing it more than once, or running them when the state can no longer support these actions.
  //
  // This problem feels like there should be some way to generalize it and wrap it to avoid this issue.
  useEffect(() => {
    props.initializeBlock({
      blockId: block.id,
    });
  }, []);
  useEffect(() => {
    if (!blockStates[block.id] || !showPreviews) {
      return;
    }
    if (needsMeta({ blockStates, id: block.id })) {
      props.fetchLibraryBlockMetadata({ blockId: block.id });
    }
    if (needsView({ blockStates, id: block.id })) {
      props.fetchLibraryBlockView({
        blockId: block.id,
        viewSystem: XBLOCK_VIEW_SYSTEM.Studio,
        viewName: 'student_view',
      });
    }
  }, [blockStates[block.id], showPreviews]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Need to force the iframe to be different if navigating away. Otherwise landing on the edit page
  // will show the student view, and navigating back will show the edit view in the block list. React is smart enough
  // to guess these iframes are the same between routes and will try to preserve rather than rerender, but that works
  // against us here. Setting an explicit key prevents it from matching the two.
  const previewKey = useMemo(() => `${uuid4()}`, [block.id]);

  if (blockStates[block.id] === undefined) {
    return <LoadingPage loadingMessage={intl.formatMessage(messages['library.detail.loading.message'])} />;
  }
  const { metadata } = blockStates[block.id];
  const canEdit = metadata !== null && !BLOCK_TYPE_EDIT_DENYLIST.includes(metadata.block_type);
  const editView = canEdit
    ? ROUTES.Block.EDIT_SLUG(library.id, block.id)
    : ROUTES.Detail.HOME_SLUG(library.id, block.id);

  let isLtiUrlGenerating;
  if (library.allow_lti) {
    const isBlockOnClipboard = ltiUrlClipboard.value.blockId === block.id;
    isLtiUrlGenerating = isBlockOnClipboard && ltiUrlClipboard.status === LOADING_STATUS.LOADING;

    if (isBlockOnClipboard && ltiUrlClipboard.status === LOADING_STATUS.LOADED) {
      const clipboard = document.createElement('textarea');
      clipboard.value = getConfig().STUDIO_BASE_URL + ltiUrlClipboard.value.lti_url;
      document.body.appendChild(clipboard);
      clipboard.select();
      document.execCommand('copy');
      document.body.removeChild(clipboard);
    }
  }

  return (
    <BlockPreview
      view={blockView(block)}
      block={block}
      canEdit={canEdit}
      editView={editView}
      showPreviews={showPreviews}
      showDeleteModal={showDeleteModal}
      setShowDeleteModal={setShowDeleteModal}
      deleteLibraryBlock={props.deleteLibraryBlock}
      library={library}
      previewKey={previewKey}
      isLtiUrlGenerating={isLtiUrlGenerating}
      fetchBlockLtiUrl={props.fetchBlockLtiUrl}
    />
  );
};

BlockPreviewContainerBase.defaultProps = {
  blockView: null,
  ltiUrlClipboard: null,
};

BlockPreviewContainerBase.propTypes = {
  intl: intlShape.isRequired,
  block: libraryBlockShape.isRequired,
  blockStates: blockStatesShape.isRequired,
  blockView: PropTypes.func,
  fetchBlockLtiUrl: PropTypes.func.isRequired,
  fetchLibraryBlockView: PropTypes.func.isRequired,
  fetchLibraryBlockMetadata: PropTypes.func.isRequired,
  initializeBlock: PropTypes.func.isRequired,
  showPreviews: PropTypes.bool.isRequired,
  deleteLibraryBlock: PropTypes.func.isRequired,
  library: libraryShape.isRequired,
  ltiUrlClipboard: fetchable(PropTypes.object),
};

const BlockPreviewContainer = connect(
  selectLibraryDetail,
  {
    fetchBlockLtiUrl,
    fetchLibraryBlockView,
    fetchLibraryBlockMetadata,
    initializeBlock,
    deleteLibraryBlock,
  },
)(injectIntl(BlockPreviewContainerBase));

export default BlockPreviewContainer;
