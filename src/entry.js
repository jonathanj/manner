import * as React from "react";
//var React = require('react');
//var Immutable = require('immutable');
console.log('YAY', React);

/*
<Form model={model} validator={validator}>

Validators([
    [['field1',
      'field2'], V.all(V.hasLength, ...)],
    [['field3'], V.all(V.notNull, ...)],
])
 



// Have a predicate for each input? And have one to combine several fields?
Dependencies([
    [{'inputs': ['field1', 'field2'],
      'outputs': ['field3'],
      'funcs': P.any(...)},
     ...],
])
 

Dependencies(
    {'inputs': P.fieldwise.all({'clientType': P.valueIs('company')},
                               {'companyVATVendor': P.valueIs(true)}),


Validators(
      each(['givenNames'], combine(V.hasLength, V.givenNames))
    , together(['naIdNumber'], combine(V.hasLength, V.numeric, V.namibiaID))
    , each(['telephoneHome', 'telephoneWork', 'telephoneCell'], V.hasLength)
    , together(['title', 'idNumber'], V.matchGender)
    , together(['companyType', 'companyRegistrationNumber'],
               combine(companyRegValid, companyTypeMatches))
);


Dependencies(
);
*/


function notNull(message='Required value') {
    return (value) => {
        if (value == null) {
            return message;
        };
    };
}


// XXX: This API won't really work because the fields and the validators are
// not coupled.
Validators([
    // Single field validation, same as `any(field)`?
    ['title', V.notNull()],
    // Any of the fields must pass the validator.
    [any('telephoneHome', 'telephoneWork'), V.hasLength()],
    // Field values are all passed to one validator.
    [collect('title', 'idNumber'), V.matchGender('optional message')]
]);


Validators([
    // Single field validation, same as `all(field)`?
    all(['title'], V.notNull()),
    all(['givenNames'], combine(V.hasLength, V.givenNames)),
    all(['familyName'], combine(V.hasLength, V.isChars("[a-zA-Z\\s\\-']"))),
    // Any of the fields must pass the validator.
    any(['telephoneHome', 'telephoneWork'], V.hasLength()),
    // Field values are all passed to one validator.
    collect(['title', 'idNumber'], V.matchGender('optional message')),
    collect(['companyType', 'companyRegistrationNumber'],
            combine(companyRegValid, companyTypeMatches))
]);


Validators(
    is('title', V.notNull()),
    is('givenName', combine(V.notEmpty(), V.givenNames())),
    is('familyName', combine(V.notEmpty(), V.isChars("..."))),
    any(is('telephoneHome', V.notEmpty()),
        is('telephoneWork', V.notEmpty()),
        is('telephoneCell', V.notEmpty())),
    are(['title', 'idNumber'], V.matchingGender()),
    are(['companyType', 'companyRegistrationNumber'],
        combine(companyRegValid, companyTypeMatches))
);
