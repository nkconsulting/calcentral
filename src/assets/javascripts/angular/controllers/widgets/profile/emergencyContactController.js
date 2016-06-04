'use strict';

var angular = require('angular');
var _ = require('lodash');

/**
 * Emergency Contact controller
 */
angular.module('calcentral.controllers').controller('EmergencyContactController', function(apiService, profileFactory, $scope) {

  angular.extend($scope, {
    currentObject: {},
    emptyObject: {
      country: 'USA',
      primaryContact: 'N',
      sameAddressEmpl: 'N',
      samePhoneEmpl: 'N'
    },
    errorMessage: '',
    isLoading: true,
    isSaving: false,
    items: {
      content: [],
      editorEnabled: false
    }
  });

  // DEBUG - REMOVE BEFORE COMMITTING
  var inspect = function(item) {
    console.info(item);
    return;
  };

  /**
   * Emergency contact editor controls.
   */

  // Helper function that returns a safe default (empty string) for Campus
  // Solutions APIs if a value is specifically `null` or `undefined`.
  var sanitizeContactData = function(value) {
    return _.isNil(value) ? '' : value;
  };

  var actionCompleted = function(data) {
    apiService.profile.actionCompleted($scope, data, loadInformation);
  };

  var deleteCompleted = function(data) {
    $scope.isDeleting = false;
    actionCompleted(data);
  };

  var saveCompleted = function(data) {
    $scope.isSaving = false;
    actionCompleted(data);
  };

  $scope.closeEditor = function() {
    apiService.profile.closeEditor($scope);
  };

  $scope.cancelEdit = function() {
    $scope.isSaving = false;
    $scope.closeEditor();
  };

  $scope.deleteContact = function(item) {
    return apiService.profile.delete($scope, profileFactory.deleteEmergencyContact, {
      contactName: item.contactName
    }).then(deleteCompleted);
  };

  $scope.saveContact = function(item) {
    // Take only the first phone in the list. Any others are handled
    // individually by the inner `emergencyPhone` scope.
    var phone = item.emergencyPhones[0];

    apiService.profile.save($scope, profileFactory.postEmergencyContact, {
      // Let Campus Solutions growl about any required field errors.
      contactName: item.contactName,
      isPrimaryContact: item.primaryContact,
      relationship: item.relationship,
      isSameAddressEmpl: item.sameAddressEmpl,
      isSamePhoneEmpl: item.samePhoneEmpl,
      // Allow these items to be empty strings.
      addrField1: sanitizeContactData(item.addrField1),
      addrField2: sanitizeContactData(item.addrField2),
      addrField3: sanitizeContactData(item.addrField3),
      address1: sanitizeContactData(item.address1),
      address2: sanitizeContactData(item.address2),
      address3: sanitizeContactData(item.address3),
      address4: sanitizeContactData(item.address4),
      addressType: sanitizeContactData(item.addressType),
      city: sanitizeContactData(item.city),
      country: sanitizeContactData(item.country),
      county: sanitizeContactData(item.county),
      emailAddr: sanitizeContactData(item.emailAddr),
      geoCode: sanitizeContactData(item.geoCode),
      houseType: sanitizeContactData(item.houseType),
      inCityLimit: sanitizeContactData(item.inCityLimit),
      num1: sanitizeContactData(item.num1),
      num2: sanitizeContactData(item.num2),
      phone: sanitizeContactData(phone.phone),
      phoneType: sanitizeContactData(phone.phoneType),
      extension: sanitizeContactData(phone.extension),
      postal: sanitizeContactData(item.postal),
      state: sanitizeContactData(item.state)
    }).then(saveCompleted);
  };

  $scope.showAdd = function() {
    apiService.profile.showAdd($scope, $scope.emptyObject);
  };

  $scope.showEdit = function(item) {
    apiService.profile.showEdit($scope, item);
  };

  /**
   * Emergency Phone editor is an inner controller in that is initialized by the
   * EmergencyContactController. Defined as an inner scope, emergencyPhone, on
   * the parent or EmergencyContact scope, we can pass it to the
   * `profileService` methods for safely updating the phone editor state.
   */
  angular.extend($scope, {
    emergencyPhone: {
      currentObject: {},
      emptyObject: {
        phone: '',
        phoneType: '',
        extension: '',
        countryCode: ''
      },
      errorMessage: '',
      isLoading: true,
      isSaving: false,
      items: {
        content: [],
        editorEnabled: false
      },
      phoneTypes: {
        // Map phoneTypes to match Campus Solutions emergency phoneTypes.
        'BUSN': 'Business',
        'CAMP': 'Campus',
        'HOME': 'Home/Permanent',
        'INTL': 'International',
        'LOCL': 'Local',
        'CELL': 'Mobile',
        'OTR': 'Other'
      }
    }
  });

  var emergencyPhoneActionCompleted = function(data) {
    apiService.profile.actionCompleted($scope.emergencyPhone, data, loadInformation);
  };

  var emergencyPhoneDeleteCompleted = function(data) {
    $scope.emergencyPhone.isDeleting = false;
    emergencyPhoneActionCompleted(data);
  };

  var emergencyPhoneSaveCompleted = function(data) {
    $scope.emergencyPhone.isSaving = false;
    emergencyPhoneActionCompleted(data);
  };

  $scope.emergencyPhone.cancelEdit = function(item) {
    if (item) {
      item.isModifying = false;
    }
    $scope.emergencyPhone.isSaving = false;
    $scope.emergencyPhone.closeEditor();
  };

  $scope.emergencyPhone.closeEditor = function() {
    apiService.profile.closeEditor($scope.emergencyPhone);
  };

  $scope.emergencyPhone.deletePhone = function(item) {
    inspect(item)
    return apiService.profile.delete($scope, profileFactory.deleteEmergencyPhone, {
      contactName: item.contactName,
      phoneType: item.phoneType
    }).then(emergencyPhoneDeleteCompleted);
  };

  $scope.emergencyPhone.savePhone = function(item) {
    return apiService.profile.save($scope, profileFactory.postEmergencyPhone, {
      // Let Campus Solutions growl about any required field errors.
      contactName: item.contactName,
      phone: item.phone,
      phoneType: item.phoneType,
      // Allow these items to be empty strings.
      extension: sanitizeContactData(item.extension),
      countryCode: sanitizeContactData(item.countryCode)
    }).then(emergencyPhoneSaveCompleted);
  };

  $scope.emergencyPhone.showAdd = function() {
    apiService.profile.showAdd($scope.emergencyPhone, $scope.emergencyPhone.emptyObject);
  };

  $scope.emergencyPhone.showEdit = function(item) {
    apiService.profile.showEdit($scope.emergencyPhone, item);
  };

  /**
   * Processes each emergencyContact for any emergencyPhones listed, creates a
   * flattened one-dimensional array of all phone objects, associates the
   * contactName with each phone for later use by post and delete, and assigns
   * the flat array to the inner `emergencyPhone` scope's contents.
   * @param {Array} emergencyContacts The user's emergencyContacts list.
   */
  var parseEmergencyPhones = function(emergencyContacts) {
    var phones = _.map(emergencyContacts, function(contact) {
      if (_.isEmpty(contact.emergencyPhones)) {
        // Provide an empty phone to display, if no emergency phones have been
        // added yet. This keeps scopes in sync.
        contact.emergencyPhones = [angular.copy($scope.emergencyPhone.emptyObject)];
      }

      _.each(contact.emergencyPhones, function(phone) {
        phone.contactName = contact.contactName;
      });

      return contact.emergencyPhones;
    });

    $scope.emergencyPhone.items.content = _.flattenDeep(phones);
    $scope.emergencyPhone.isLoading = false;
  };

  /**
   * Sequence of functions for loading emergencyContact and emergencyPhone data.
   */
  var getEmergencyContacts = profileFactory.getEmergencyContacts;

  var parseEmergencyContacts = function(data) {
    var emergencyContacts = _.get(data, 'data.feed.students.student.emergencyContacts.emergencyContact') || [];

    parseEmergencyPhones(emergencyContacts);

    _(emergencyContacts).each(function(emergencyContact) {
      fixFormattedAddress(emergencyContact);
    });

    $scope.items.content = emergencyContacts;
  };

  var fixFormattedAddress = function(emergencyContact) {
    var formattedAddress = emergencyContact.formattedAddress || '';

    emergencyContact.formattedAddress = apiService.profile.fixFormattedAddress(formattedAddress);
  };

  var getTypesRelationship = profileFactory.getTypesRelationship;

  var parseTypesRelationship = function(data) {
    var relationshipTypes = apiService.profile.filterTypes(_.get(data, 'data.feed.xlatvalues.values'), $scope.items);

    $scope.relationshipTypes = sortRelationshipTypes(relationshipTypes);
  };

  /**
   * Sort relationshipTypes array in ascending order by description (text
   * displayed in select element), while pushing options representing "Other
   * Relative" (`R`), and generic "Other" (`O`) to the end of the sorted array.
   * @return {Array} The sorted array of relationship types.
   */
  var sortRelationshipTypes = function(types) {
    var RE_RELATIONSHIP_OTHER = /^(O|R)$/;

    return types.sort(function(a, b) {
      var left = a.fieldvalue;
      var right = b.fieldvalue;

      if (RE_RELATIONSHIP_OTHER.test(left)) {
        return 1;
      } else if (RE_RELATIONSHIP_OTHER.test(right)) {
        return -1;
      } else {
        return a.xlatlongname > b.xlatlongname;
      }
    });
  };

  var getCountries = profileFactory.getCountries;

  var parseCountries = function(data) {
    $scope.countries = _.sortBy(_.filter(_.get(data, 'data.feed.countries'), {
      hasAddressFields: true
    }), 'descr');
  };

  var countryWatch = function(country) {
    if (!country) {
      return;
    }

    $scope.currentObject.whileAddressFieldsLoading = true;

    profileFactory.getAddressFields({
      country: country
    })
    .then(parseAddressFields)
    .then(function() {
      // Get the states for specified country (if available)
      return profileFactory.getStates({
        country: country
      });
    })
    .then(parseStates)
    .then(function() {
      $scope.currentObject.whileAddressFieldsLoading = false;
    });
  };

  var parseAddressFields = function(data) {
    $scope.currentObject.addressFields = _.get(data, 'data.feed.labels');
  };

  var parseStates = function(data) {
    $scope.states = _.sortBy(_.get(data, 'data.feed.states'), 'descr');
  };

  /**
   * We need to watch when the country changes, if so, load the address fields
   * dynamically depending on the country.
   */
  var countryWatcher;

  var startCountryWatcher = function() {
    countryWatcher = $scope.$watch('currentObject.data.country', countryWatch);
  };

  var loadInformation = function() {
    // If we were previously watching a country, we need to remove that
    if (countryWatcher) {
      countryWatcher();
    }

    getEmergencyContacts({
      refreshCache: true
    })
    .then(parseEmergencyContacts)
    .then(getTypesRelationship)
    .then(parseTypesRelationship)
    .then(getCountries)
    .then(parseCountries)
    .then(startCountryWatcher)
    .then(function() {
      $scope.isLoading = false;
    });
  };

  loadInformation();
});
