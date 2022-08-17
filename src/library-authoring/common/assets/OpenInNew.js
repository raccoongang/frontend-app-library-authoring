/* eslint-disable */
// Transfer icon from the higher version of @edx/paragon.
import * as React from 'react';

function _extends() { _extends = Object.assign || function (target) { for (let i = 1; i < arguments.length; i++) { const source = arguments[i]; for (const key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function SvgOpenInNew(props) {
  return /* #__PURE__ */React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    ...props,
  }, /* #__PURE__ */React.createElement('path', {
    d: 'M19 19H5V5h7V3H3v18h18v-9h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
    fill: 'currentColor',
  }));
}

export default SvgOpenInNew;
