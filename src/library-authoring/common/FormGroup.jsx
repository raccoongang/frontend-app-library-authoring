import React from 'react';

import { Form } from '@edx/paragon';
import PropTypes from 'prop-types';

const FormGroup = (props) => {
  const handleFocus = (e) => {
    if (props.handleFocus) { props.handleFocus(e); }
  };
  const handleClick = (e) => {
    if (props.handleClick) { props.handleClick(e); }
  };
  const handleOnBlur = (e) => {
    if (props.handleBlur) { props.handleBlur(e); }
  };

  return (
    <Form.Group isInvalid={!!props.errorMessage} className={props.className} >
      <Form.Control
        as={props.as}
        readOnly={props.readOnly}
        name={props.name}
        type={props.type}
        value={props.value}
        aria-invalid={props.errorMessage}
        autoComplete={props.autoComplete ? 'on' : 'off'}
        controlClassName={props.controlClassName}
        trailingElement={props.trailingElement}
        floatingLabel={props.floatingLabel}
        placeholder={props.placeholder}
        onChange={props.handleChange}
        onFocus={handleFocus}
        onBlur={handleOnBlur}
        onClick={handleClick}
      >
        {props.options ? props.options() : null}
      </Form.Control>

      {props.helpText && !props.errorMessage && (
        <Form.Control.Feedback type="default" key="help-text">
          {props.helpText}
        </Form.Control.Feedback>
      )}

      {props.errorMessage && (
        <Form.Control.Feedback type="invalid" key="error" feedback-for={props.name}>
          {props.errorMessage}
        </Form.Control.Feedback>
      )}

      {props.children}
    </Form.Group>
  );
};

FormGroup.defaultProps = {
  as: 'input',
  errorMessage: '',
  borderClass: '',
  autoComplete: null,
  readOnly: false,
  handleBlur: null,
  handleChange: () => {},
  handleFocus: null,
  handleClick: null,
  helpText: '',
  options: null,
  trailingElement: null,
  type: 'text',
  children: null,
  className: '',
};

FormGroup.propTypes = {
  as: PropTypes.string,
  errorMessage: PropTypes.string,
  borderClass: PropTypes.string,
  autoComplete: PropTypes.string,
  readOnly: PropTypes.bool,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  handleFocus: PropTypes.func,
  handleClick: PropTypes.func,
  helpText: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.func,
  trailingElement: PropTypes.element,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  children: PropTypes.element,
  className: PropTypes.string,
};

export default FormGroup;
