import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import OrganizationDropdown from '../OrganizationDropdown';

const initFireEvent = () => {
  const map = {};

  document.addEventListener = jest.fn((event, cb) => {
    map[event] = cb;
  });

  document.removeEventListener = jest.fn(event => {
    delete map[event];
  });

  return map;
};
const props = {
  as: 'input',
  name: 'OrganizationDropdown',
  floatingLabel: 'floatingLabel text',
  options: null,
  handleFocus: null,
  handleChange: null,
  handleBlur: null,
  value: null,
  errorMessage: null,
  errorCode: null,
  readOnly: false,
};
const InjectedOrganizationDropdown = injectIntl(OrganizationDropdown);

describe('common/OrganizationDropdown.jsx', () => {
  it('renders component without error', () => {
    mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...props} />
    </IntlProvider>);
  });

  it('handles element focus', () => {
    const mockHandleFocus = jest.fn();
    const newProps = { ...props, handleFocus: mockHandleFocus };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);
    container.find('input').simulate('focus');

    expect(mockHandleFocus).toHaveBeenCalled();
  });

  it('handles element blur', () => {
    const mockHandleBlur = jest.fn();
    const newProps = { ...props, handleBlur: mockHandleBlur };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);
    container.find('input').simulate('blur');

    expect(mockHandleBlur).toHaveBeenCalled();
  });

  it('renders component with options', () => {
    const newProps = { ...props, options: ['opt1', 'opt2'] };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);

    container.find('input').simulate('click');
    container.update();
    const optionsList = container.find('.dropdown-container').find('button');
    expect(optionsList.length).toEqual(newProps.options.length);
  });

  it('selects option', () => {
    const newProps = { ...props, options: ['opt1', 'opt2'] };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);

    container.find('input').simulate('click');
    container.find('.dropdown-container').find('button').at(0).simulate('click');
    expect(container.find('input').instance().value).toEqual(newProps.options[0]);
  });

  it('toggles options list', () => {
    const newProps = { ...props, options: ['opt1', 'opt2'] };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);

    expect(container.find('.dropdown-container').find('button').length).toEqual(0);
    container.find('button.expand-more').simulate('click');
    expect(container.find('.dropdown-container').find('button').length).toEqual(newProps.options.length);
    container.find('button.expand-less').simulate('click');
    expect(container.find('.dropdown-container').find('button').length).toEqual(0);
  });

  it('shows options list depends on field value', () => {
    const newProps = { ...props, options: ['opt1', 'opt2'] };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);

    container.find('input').simulate('change', { target: { value: '1' } });
    expect(container.find('.dropdown-container').find('button').length).toEqual(1);
  });

  it('closes options list on click outside', () => {
    const fireEvent = initFireEvent();
    const newProps = { ...props, options: ['opt1', 'opt2'] };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);

    container.find('input').simulate('click');
    expect(container.find('.dropdown-container').find('button').length).toEqual(2);
    act(() => { fireEvent.mousedown({ target: document.body }); });
    container.update();
    expect(container.find('.dropdown-container').find('button').length).toEqual(0);
  });

  it('shows empty options list depends on field value', () => {
    const newProps = { ...props, options: ['opt1', 'opt2'] };
    const container = mount(<IntlProvider locale="en">
      <InjectedOrganizationDropdown {...newProps} />
    </IntlProvider>);

    container.find('input').simulate('change', { target: { value: '3' } });
    container.find('input').simulate('focus');
    expect(container.find('.dropdown-container').find('button').length).toEqual(1);
    expect(container.find('.dropdown-container').find('button').at(0).text()).toEqual('No options');
  });
});
