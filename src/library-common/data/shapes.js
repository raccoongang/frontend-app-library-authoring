import PropTypes from 'prop-types';

export const libraryShape = PropTypes.shape({
  id: PropTypes.string,
  org: PropTypes.string,
  slug: PropTypes.string,
  bundle_uuid: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  version: PropTypes.number,
  has_unpublished_changes: PropTypes.bool,
  has_unpublished_deletes: PropTypes.bool,
});

