import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Button, Icon, Input, StatefulButton, StatusAlert, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { LIBRARY_TYPES, libraryShape } from '../../library-common';
import { createLibrary } from './data/actions';
import { libraryFormComponentSelector } from './data/selectors';

import messages from './messages';

class LibraryForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        title: '',
        org: '',
        slug: '',
        type: LIBRARY_TYPES.COMPLEX,
      },
    };
  }

  onValueChange = (event) => {
    const data = {...this.state.data, [event.target.name]: event.target.value};
    this.setState({data});
  }

  onCancel = () => {
    this.props.cancel();
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.createLibrary({data: this.state.data});
  }

  hasFieldError = (fieldName) => {
    const { error } = this.props;

    if (error && 
        error.hasOwnProperty('fieldErrors') &&
        error.fieldErrors.hasOwnProperty(fieldName)) {
      return true;
    }

    return false;
  }

  getFieldError = (fieldName) => {
    if (this.hasFieldError(fieldName)) {
      return this.props.error.fieldErrors[fieldName];
    }

    return null;
  }

  formIsValid = () => {
    const { data } = this.state;

    if (data.title && data.org && data.slug) {
      return true;
    }

    return false;
  }

  getSubmitButtonState = () => {
    let state;
    if (this.props.submitting) {
      state = 'pending';
    } else if (this.formIsValid()) {
      state = 'enabled';
    } else {
      state = 'disabled';
    }

    return state;
  }

  componentDidUpdate(prevProps) {
    /* Redirect on submission success. */
    const { library, submitted } = this.props;
    if (submitted && submitted !== prevProps.submitted && library) {
      if (library.type === LIBRARY_TYPES.COMPLEX) {
        this.props.history.push(library.url);
      } else if (library.type === LIBRARY_TYPES.LEGACY) {
        window.location.href = library.url;
      }
    }
  }

  render() {
    const { intl, error } = this.props;
    const { data } = this.state;

    return (
      <form onSubmit={this.onSubmit} className="form-create">
        <h3 className="title">{intl.formatMessage(messages['library.form.create.library'])}</h3>
        <fieldset>
          {error && error.message &&
          <StatusAlert
            alertType="danger"
            dialog={error.message}
            onClose={() => {}}
            open
          />
          }
          <ol className="list-input">
            <li className="field">
              <ValidationFormGroup
                for="title"
                helpText={intl.formatMessage(messages['library.form.title.help'])}
                invalid={this.hasFieldError("title")}
                invalidMessage={this.getFieldError("title")}
                className="mb-0 mr-2">
                <label className="h6 d-block" htmlFor="title">
                  {intl.formatMessage(messages['library.form.title.label'])}
                </label>
                <Input
                  name="title"
                  id="title"
                  type="text"
                  placeholder={intl.formatMessage(messages['library.form.title.placeholder'])}
                  defaultValue={data.title}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
            <li className="field">
              <ValidationFormGroup
                for="org"
                helpText={intl.formatMessage(messages['library.form.org.help'])}
                invalid={this.hasFieldError("org")}
                invalidMessage={this.getFieldError("org")}
                className="mb-0 mr-2">
                <label className="h6 d-block" htmlFor="org">
                  {intl.formatMessage(messages['library.form.org.label'])}
                </label>
                <Input
                  name="org"
                  id="org"
                  type="text"
                  placeholder={intl.formatMessage(messages['library.form.org.placeholder'])}
                  value={data.org}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
            <li className="field">
              <ValidationFormGroup
                for="slug"
                helpText={intl.formatMessage(messages['library.form.slug.help'])}
                invalid={this.hasFieldError("slug")}
                invalidMessage={this.getFieldError("slug")}
                className="mb-0 mr-2">
                <label className="h6 d-block" htmlFor="slug">
                  {intl.formatMessage(messages['library.form.slug.label'])}
                </label>
                <Input
                  name="slug"
                  id="slug"
                  type="text"
                  placeholder={intl.formatMessage(messages['library.form.slug.placeholder'])}
                  value={data.slug}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
            <li className="field">
              <ValidationFormGroup
                for="type"
                helpText={intl.formatMessage(messages['library.form.type.help'])}
                invalid={this.hasFieldError("type")}
                invalidMessage={this.getFieldError("type")}
                className="mb-0 mr-2">
                <label className="h6 d-block" htmlFor="type">
                  {intl.formatMessage(messages['library.form.type.label'])}
                </label>
                <Input
                  name="type"
                  id="type"
                  type="select"
                  value={data.type}
                  options={Object.entries(LIBRARY_TYPES).map(([key, value]) => ({
                    value,
                    label: intl.formatMessage(messages[`library.form.type.label.${key}`])
                  }))}
                  onChange={this.onValueChange}
                />
              </ValidationFormGroup>
            </li>
          </ol>
        </fieldset>
        <div className="actions form-group">
          <StatefulButton
            state={this.getSubmitButtonState()}
            labels={{
              disabled: intl.formatMessage(messages['library.form.button.submit']),
              enabled: intl.formatMessage(messages['library.form.button.submit']),
              pending: intl.formatMessage(messages['library.form.button.submitting']),
            }}
            icons={{
              pending: <Icon className="fa fa-spinner fa-spin" />,
            }}
            disabledStates={['disabled', 'pending']}
            className="action btn-primary"
            type="submit"
          />
          <Button
            className="action btn-light"
            onClick={this.props.cancel}
          >
            {intl.formatMessage(messages['library.form.button.cancel'])}
          </Button>
        </div>
      </form>
    );
  }
}

LibraryForm.propTypes = {
  cancel: PropTypes.func.isRequired,
  createLibrary: PropTypes.func.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
    fieldErrors: PropTypes.object,
  }),
  intl: intlShape.isRequired,
  library: libraryShape,
  submitted: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default connect(
  libraryFormComponentSelector,
  {
    createLibrary,
  }
)(injectIntl(withRouter(LibraryForm)));
