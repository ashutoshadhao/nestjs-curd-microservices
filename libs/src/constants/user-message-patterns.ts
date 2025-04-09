/**
 * User service message patterns for consistent use across all services
 */
export const USER_MESSAGE_PATTERNS = {
  CREATE_USER: { cmd: 'create_user' },
  FIND_ALL_USERS: { cmd: 'find_all_users' },
  FIND_ONE_USER: { cmd: 'find_one_user' },
  UPDATE_USER: { cmd: 'update_user' },
  REMOVE_USER: { cmd: 'remove_user' }
};