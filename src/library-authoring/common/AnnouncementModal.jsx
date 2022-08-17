import React, { useState } from 'react';

import {
  MarketingModal, ModalDialog, ActionRow, Button,
} from '@edx/paragon';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

import heroImg from './assets/announcementBg.jpg';
import OpenInNew from './assets/OpenInNew';

const AnnouncementModal = ({ intl }) => {
  const [isOpen, toggleOpen] = useState(!localStorage.getItem('showAnnouncement'));

  const closeModal = () => {
    toggleOpen(false);
    localStorage.setItem('showAnnouncement', 'false');
  };

  const handleClose = () => {
    closeModal();
    sendTrackEvent('edx.bi.announcement.dismiss.button.clicked', null);
  };

  const handleLearnMore = () => {
    closeModal();
    sendTrackEvent('edx.bi.announcement.learn_more.button.clicked', null);
    window.open(
      'https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/course_components/libraries.html',
      '_blank',
    );
  };

  return (
    <MarketingModal
      title={intl.formatMessage(messages['announcement.modal.title'])}
      isOpen={isOpen}
      hasCloseButton={false}
      className="announcement-modal"
      heroNode={(
        <ModalDialog.Hero>
          <ModalDialog.Hero.Background backgroundSrc={heroImg} />
        </ModalDialog.Hero>
      )}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={handleClose}>
            {intl.formatMessage(messages['announcement.modal.button.close'])}
          </Button>
          <Button iconAfter={OpenInNew} onClick={handleLearnMore}>
            {intl.formatMessage(messages['announcement.modal.button.learn_more'])}
          </Button>
        </ActionRow>
      )}
    >
      <ModalDialog.Title as="h3">
        {intl.formatMessage(messages['announcement.modal.title'])}
      </ModalDialog.Title>
      <p>{intl.formatMessage(messages['announcement.modal.content'])}</p>
    </MarketingModal>
  );
};

AnnouncementModal.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AnnouncementModal);
