class InputError extends Error {
  constructor(userMessage, ...params) {
    super(...params);

    this.name = 'InputError';
    this.userMessage = userMessage;
  }
}

module.exports = InputError;
