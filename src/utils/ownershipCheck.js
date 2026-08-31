'use strict';

const { createAppError } = require('./errors');

/**
 * assertOwnership — verifies that a record was
 * affected by an update or delete operation.
 * If rowsAffected is 0, determines whether the record
 * does not exist (404) or the user is not the owner (403).
 *
 * @param {number} rowsAffected - Rows updated/deleted.
 * @param {Function} getRecord - Async function that
 *   fetches the record without userId filter.
 * @param {string} entityName - e.g. 'Map', 'Obstacle'
 * @returns {Promise<void>} Throws if not authorized.
 */
const assertOwnership = async (
  rowsAffected, getRecord, entityName
) => {
  if (rowsAffected > 0) return;

  const record = await getRecord();
  if (!record) {
    throw createAppError(
      'NOT_FOUND',
      `${entityName} not found.`
    );
  }
  throw createAppError(
    'FORBIDDEN',
    `You do not have permission to modify this ${entityName}.`
  );
};

module.exports = { assertOwnership };
