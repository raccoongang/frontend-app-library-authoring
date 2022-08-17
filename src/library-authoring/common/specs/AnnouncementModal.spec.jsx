import React from 'react';
import { injectIntl } from '@edx/frontend-platform/i18n';
import * as analytics from '@edx/frontend-platform/analytics';
import { ctxMount } from './helpers';
import AnnouncementModal from '../AnnouncementModal';

const InjectedAnnouncementModal = injectIntl(AnnouncementModal);

jest.mock('@edx/frontend-platform/analytics');
analytics.sendTrackEvent = jest.fn();

describe('common/AnnouncementModal.jsx', () => {
  beforeEach(() => localStorage.reset());

  it('renders component without error', () => {
    const container = ctxMount(<InjectedAnnouncementModal />);
    const modalTitle = container.find('.pgn__modal-title').text();

    expect(modalTitle).toEqual('Library authoring has a new look!');
  });

  it('does not render component with set localStorage value', () => {
    window.localStorage.setItem('showAnnouncement', 'false');
    const container = ctxMount(<InjectedAnnouncementModal />);

    expect(container.find('.pgn__modal-title').length).toEqual(0);
  });

  it('clicks close button and closes component', () => {
    const container = ctxMount(<InjectedAnnouncementModal />);
    const modalCancelBtn = container.find('.btn-tertiary');

    modalCancelBtn.simulate('click');
    expect(localStorage.getItem('showAnnouncement')).toEqual('false');
    expect(container.find('.pgn__modal-title').length).toEqual(0);
  });

  it('clicks learn more button and closes component', () => {
    global.open = jest.fn();
    const container = ctxMount(<InjectedAnnouncementModal />);
    const modalCancelBtn = container.find('.btn-primary');

    modalCancelBtn.simulate('click');
    expect(localStorage.getItem('showAnnouncement')).toEqual('false');
    expect(container.find('.pgn__modal-title').length).toEqual(0);
    expect(global.open).toHaveBeenCalled();
  });
});
