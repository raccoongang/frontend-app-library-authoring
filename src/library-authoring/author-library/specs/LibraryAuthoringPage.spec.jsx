import * as React from 'react';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { waitFor, fireEvent } from '@testing-library/dom';
import {
  ctxRender,
  makeN,
  testSuite,
} from '../../common/specs/helpers';
import {
  blockFactory, blockFactoryLine,
  blockStateFactory,
  libraryFactory,
} from '../../common/specs/factories';
import LibraryAuthoringContainer from '../LibraryAuthoringContainer';
import { LIBRARY_TYPES, LOADING_STATUS, STORE_NAMES } from '../../common/data';
import {
  clearLibrary,
  createBlock,
  fetchLibraryDetail,
  fetchBlockLtiUrl,
  libraryAuthoringActions,
  searchLibrary,
} from '../data';
import { HTML_TYPE, PROBLEM_TYPE, VIDEO_TYPE } from '../../common/specs/constants';
import {
  deleteLibraryBlock, fetchLibraryBlockView, initializeBlock, libraryBlockActions,
} from '../../edit-block/data';
import {
  updateLibrary,
} from '../../configure-library/data';

// Reducing function which is used to take an array of blocks and creates an object with keys that are their ids and
// values which are state for interacting with that block.
const toBlockInfo = (current, value) => ({ ...current, [value.id]: blockStateFactory(value) });

const paginationParams = {
  page: 1,
  page_size: +process.env.LIBRARY_AUTHORING_PAGINATION_PAGE_SIZE,
};

const genState = (library, blocks = []) => (
  {
    storeOptions: {
      preloadedState: {
        [STORE_NAMES.AUTHORING]: {
          library: { value: library, status: LOADING_STATUS.LOADED },
          blocks: {
            status: LOADING_STATUS.LOADED,
            value: {
              data: blocks,
              count: blocks.length,
            },
          },
          ltiUrlClipboard: { value: { blockId: null, lti_url: null }, status: LOADING_STATUS.STANDBY },
        },
        [STORE_NAMES.BLOCKS]: {
          blocks: blocks.reduce(toBlockInfo, {}),
        },
      },
    },
  }
);

const render = (library, ctxSettings) => ctxRender(
  <LibraryAuthoringContainer
    match={{ params: { libraryId: library.id } }}
  />,
  ctxSettings,
);

testSuite('author-library/LibraryAuthoringContainer.jsx', () => {
  it('render paging header', async () => {
    const { page_size: pageSize } = paginationParams;
    const nBlocks = pageSize * 2;
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), nBlocks);
    await render(library, genState(library, blocks));
    expect(screen.getByText(`Showing 1-${pageSize} out of ${nBlocks} total`)).toBeTruthy();

    const arrowLeftButton = screen.getByRole('button', { name: /Arrow left/i });
    expect(arrowLeftButton).toBeTruthy();
    expect(arrowLeftButton).toBeDisabled();

    const arrowRightButton = screen.getByRole('button', { name: /Arrow right/i });
    expect(arrowRightButton).toBeTruthy();
    expect(arrowRightButton).toBeEnabled();
  });

  it('render the state control button on paging header', async () => {
    const { page_size: pageSize } = paginationParams;
    const nBlocks = pageSize * 3;
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), nBlocks);
    await render(library, genState(library, blocks));
    expect(screen.getByText(`Showing 1-${pageSize} out of ${nBlocks} total`)).toBeTruthy();

    const arrowLeftButton = screen.getByRole('button', { name: /Arrow left/i });
    const arrowRightButton = screen.getByRole('button', { name: /Arrow right/i });

    fireEvent.click(arrowRightButton);
    expect(screen.getByText(`Showing ${pageSize + 1}-${pageSize * 2} out of ${nBlocks} total`)).toBeTruthy();

    fireEvent.click(arrowRightButton);
    expect(screen.getByText(`Showing ${(pageSize * 2) + 1}-${nBlocks} out of ${nBlocks} total`)).toBeTruthy();
    expect(arrowRightButton).toBeDisabled();

    fireEvent.click(arrowLeftButton);
    expect(screen.getByText(`Showing ${pageSize + 1}-${pageSize * 2} out of ${nBlocks} total`)).toBeTruthy();
    expect(arrowRightButton).toBeEnabled();
  });

  it('paginates blocks on library authoring page', async () => {
    const { page_size: pageSize } = paginationParams;
    const nBlocks = pageSize * 2;
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), nBlocks);
    await render(library, genState(library, blocks));

    const secondPage = screen.getByRole('button', { name: /Page 2/i });

    fireEvent.click(secondPage);
    expect(screen.getByText(`Showing ${pageSize + 1}-${nBlocks} out of ${nBlocks} total`)).toBeTruthy();

    expect(searchLibrary.fn).toHaveBeenNthCalledWith(1, {
      libraryId: library.id,
      paginationParams,
      query: '',
      types: [],
    });
  });

  it('Fetches a library when missing', async () => {
    await ctxRender(
      <LibraryAuthoringContainer
        match={{ params: { libraryId: 'testtest' } }}
      />,
    );
    await waitFor(() => expect(clearLibrary.fn).toHaveBeenCalled());
    clearLibrary.calls[0].resolve();
    await waitFor(() => expect(fetchLibraryDetail.fn).toHaveBeenCalledWith({ libraryId: 'testtest' }));
  });

  it('Fetches a library when the current library does not match', async () => {
    await ctxRender(
      <LibraryAuthoringContainer
        match={{ params: { libraryId: 'testtest' } }}
      />,
      genState(libraryFactory()),
    );
    await waitFor(() => expect(clearLibrary.fn).toHaveBeenCalled());
    clearLibrary.calls[0].resolve();
    await waitFor(() => expect(fetchLibraryDetail.fn).toHaveBeenCalledWith({ libraryId: 'testtest' }));
  });

  it('Does not refetch the library if it matches', async () => {
    const library = libraryFactory();
    await render(library, genState(library));
    await process.nextTick(() => {
      expect(clearLibrary.fn).not.toHaveBeenCalled();
    });
  });

  it('Loads blocks', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 2);
    await render(library, genState(library, blocks));
    expect(screen.getByText(blocks[0].display_name)).toBeTruthy();
    expect(screen.getByText(blocks[1].display_name)).toBeTruthy();
  });

  it('Toggles Previews', async () => {
    const library = libraryFactory();
    const blocks = [blockFactory(undefined, { library })];
    await render(library, genState(library, blocks));
    const blockPreview = screen.getByTestId('block-preview');
    expect(blockPreview).toBeTruthy();

    screen.getAllByText('Hide Previews')[0].click();
    expect(blockPreview).not.toBeVisible();
    expect(localStorage.getItem('showPreviews')).toBe('false');
  });

  it('Fetches block information', async () => {
    const library = libraryFactory();
    const blocks = [blockFactory({ id: 'testBlock' }, { library })];
    const storeConfig = genState(library, blocks);
    // Remove the local info about blocks.
    storeConfig.storeOptions.preloadedState[STORE_NAMES.BLOCKS].blocks = {};
    await render(library, storeConfig);
    // There should be no previews because this info hasn't loaded yet.
    await waitFor(() => expect(() => screen.getByTestId('block-preview')).toThrow());
    expect(initializeBlock.fn).toHaveBeenCalledWith({ blockId: 'testBlock' });
    initializeBlock.calls[0].dispatch(libraryBlockActions.libraryEnsureBlock({ blockId: 'testBlock' }));
    await waitFor(() => expect(fetchLibraryBlockView.fn).toHaveBeenCalledWith(
      {
        blockId: 'testBlock', viewName: 'student_view', viewSystem: 'studio',
      },
    ));
    expect(fetchLibraryBlockView.fn).toHaveBeenCalledTimes(1);
  });

  it('Fetches block LTI URL to clipboard', async () => {
    const library = libraryFactory({ allow_lti: true });
    const blocks = makeN(blockFactoryLine([], { library }), 2);

    await render(library, genState(library, blocks));
    expect(screen.getByText(blocks[0].display_name)).toBeTruthy();
    expect(screen.getByText(blocks[1].display_name)).toBeTruthy();

    const copyToClipboardButtons = screen.getAllByText('Copy LTI Url');
    expect(copyToClipboardButtons.length).toBe(2);

    copyToClipboardButtons[0].click();

    await waitFor(() => fetchBlockLtiUrl.calls[0].dispatch(
      libraryAuthoringActions.libraryBlockLtiUrlFetchRequest({ blockId: blocks[0].id }),
    ));

    expect(fetchBlockLtiUrl.fn).toHaveBeenCalledWith({ blockId: blocks[0].id });

    await waitFor(() => fetchBlockLtiUrl.calls[0].dispatch(
      libraryAuthoringActions.libraryAuthoringSuccess({
        value: { blockId: blocks[0], lti_url: 'a' },
        attr: 'ltiUrlClipboard',
      }),
    ));
  });

  it('Copy LTI URL not shown unless it is enabled', async () => {
    const library = libraryFactory();
    const blocks = makeN(blockFactoryLine([], { library }), 2);

    await render(library, genState(library, blocks));
    expect(screen.getByText(blocks[0].display_name)).toBeTruthy();
    expect(screen.getByText(blocks[1].display_name)).toBeTruthy();

    const copyToClipboardButtons = screen.queryAllByAltText('Copy LTI Url');
    expect(copyToClipboardButtons.length).toBe(0);
  });

  [VIDEO_TYPE, PROBLEM_TYPE, HTML_TYPE].forEach((blockDef) => {
    it(`Adds a ${blockDef.display_name} block to a library`, async () => {
      const library = libraryFactory({ type: LIBRARY_TYPES.COMPLEX });
      await render(library, genState(library));
      screen.getByText(blockDef.display_name).click();
      expect(createBlock.fn).toHaveBeenCalledWith({
        libraryId: library.id,
        data: {
          block_type: blockDef.block_type,
          definition_id: expect.any(String),
        },
        query: '',
        types: [],
        paginationParams,
      });
    });
  });

  it('Deletes a block', async () => {
    const library = libraryFactory();
    const block = blockFactory(undefined, { library });
    await render(library, genState(library, [block]));
    fireEvent.click(screen.getByLabelText('Delete'));
    fireEvent.click(await screen.findByText('Yes'));
    await waitFor(
      () => expect(deleteLibraryBlock.fn).toHaveBeenCalledWith({ blockId: block.id }),
    );
  });

  it('Rename library', async () => {
    const library = libraryFactory();
    const block = blockFactory(undefined, { library });
    await render(library, genState(library, [block]));

    const editButton = screen.getByRole('button', { name: /edit name button/i });
    editButton.click();
    const input = await screen.getByRole('textbox', { name: /title input/i });
    fireEvent.change(input, { target: { value: 'New title' } });
    fireEvent.focusOut(input);
    await waitFor(
      () => expect(updateLibrary.fn).toHaveBeenCalledWith({ data: { title: 'New title', libraryId: library.id } }),
    );
  });
});
