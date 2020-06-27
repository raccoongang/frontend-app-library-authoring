import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import { APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe } from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import configureStore from './data/configureStore';
import { LibraryHeader } from './library-header';
import { LibraryListPage } from './library-list';
import { LibraryDetailPage } from './library-detail';
import { NotFoundPage } from './library-common';
import './index.scss';
import './assets/favicon.ico';

mergeConfig({
  CMS_BASE_URL: process.env.CMS_BASE_URL,
  BLOCKSTORE_COLLECTION_UUID: process.env.BLOCKSTORE_COLLECTION_UUID,
});

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <div className="wrapper">
        <LibraryHeader />
        <main>
          <Switch>
            <Route exact path="/" component={LibraryListPage} />
            <Route path="/library/:libraryId" component={LibraryDetailPage} />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </main>
        <Footer />
      </div>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [
    appMessages,
    footerMessages,
  ],
  requireAuthenticatedUser: true,
});
