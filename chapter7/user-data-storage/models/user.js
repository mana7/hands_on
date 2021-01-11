const { v4: uuidv4 } = require('uuid')

class User {
  constructor(config = {}) {
    this.id = config.id;    
    this.familyName = config.familyName
    this.lastName = config.lastName
    this.job = config.job
    this.manager = config.manager
  }

  setId() {
    this.id = uuidv4()
  }

  validate() {
    if (typeof this.id !== 'string' || this.id.length <= 0) {
      throw new Error('id is invalid.');
    }
    if (typeof this.familyName !== 'string' || this.familyName.length <= 0) {
      throw new Error('familyName is invalid.');
    }
    if (typeof this.lastName !== 'string' || this.lastName.length <= 0) {
      throw new Error('lastName is invalid.');
    }
    if (typeof this.job !== 'string' || this.job.length <= 0) {
      throw new Error('job is invalid.');
    }
    if (typeof this.manager !== 'boolean' || this.manager.length <= 0) {
      throw new Error('manager is invalid.');
    }
  }
}

module.exports = User;