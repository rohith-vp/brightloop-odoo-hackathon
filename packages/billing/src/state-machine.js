// A table-driven state machine. The table lists, for each state, which actions are
// allowed and which state each action leads to. Anything not in the table is rejected,
// so no caller can jump to a state the table does not allow.

export class InvalidTransitionError extends Error {
  constructor(entity, from, action) {
    super(`Cannot ${action} a ${entity} that is ${String(from).toLowerCase()}.`);
    this.name = 'InvalidTransitionError';
    this.code = 'INVALID_TRANSITION';
    this.entity = entity;
    this.from = from;
    this.action = action;
  }
}

export function createStateMachine(entity, table) {
  // Object.hasOwn stops inherited names such as "constructor" from counting as states or actions.
  const transitionsFrom = (state) => (Object.hasOwn(table, state) ? table[state] : {});
  const canTransition = (from, action) => Object.hasOwn(transitionsFrom(from), action);

  return Object.freeze({
    states: Object.freeze(Object.keys(table)),
    canTransition,
    actionsFrom: (from) => Object.keys(transitionsFrom(from)),
    next(from, action) {
      if (!canTransition(from, action)) {
        throw new InvalidTransitionError(entity, from, action);
      }
      return transitionsFrom(from)[action];
    },
  });
}
