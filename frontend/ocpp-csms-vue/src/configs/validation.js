export const rules = new (function () {
  this.maxCommentLength = 50;
  this.maxAddressLength = 30;
  this.maxNameLength = 20;
  this.maxCityLength = 20;

  this.maxIdLength = 20;
  this.maxManufacturerLength = 15;
  this.maxSerialNumberLength = 30;
  this.maxModelLength = 15;
  this.maxPasswordLength = 30;

  this.minLength = 3;

  this.common = [
    (value) => {
      return value ? true : "field is required.";
    },
    (value) => {
      if (value?.length < this.minLength) {
        return `Minimum ${this.minLength} characters required`;
      } else {
        return true;
      }
    },
  ];

  this.station = {
    idRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxIdLength) {
          return `Maximum ${this.maxIdLength} characters required`;
        }
        return true;
      },
    ],
    manufacturerRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxManufacturerLength) {
          return `Maximum ${this.maxManufacturerLength} characters required`;
        }
        return true;
      },
    ],
    serialNumberRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxSerialNumberLength) {
          return `Maximum ${this.maxSerialNumberLength} characters required`;
        }
        return true;
      },
    ],
    modelRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxModelLength) {
          return `Maximum ${this.maxModelLength} characters required`;
        }
        return true;
      },
    ],
    passwordRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxPasswordLength) {
          return `Maximum ${this.maxPasswordLength} characters required`;
        }
        return true;
      },
    ],
    commentRules: [
      (value) => {
        if (value?.length > this.maxCommentLength) {
          return `Maximum ${this.maxCommentLength} characters required`;
        }
        return true;
      },
    ],
  };

  this.location = {
    nameRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxNameLength) {
          return `Maximum ${this.maxNameLength} characters required`;
        }
        return true;
      },
    ],
    cityRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxCityLength) {
          return `Maximum ${this.maxCityLength} characters required`;
        }
        return true;
      },
    ],
    addressRules: [
      ...this.common,
      (value) => {
        if (value?.length > this.maxAddressLength) {
          return `Maximum ${this.maxAddressLength} characters required`;
        }
        return true;
      },
    ],
    commentRules: [
      (value) => {
        if (value?.length > this.maxCommentLength) {
          return `Maximum ${this.maxCommentLength} characters required`;
        }
        return true;
      },
    ],
  };
})();
