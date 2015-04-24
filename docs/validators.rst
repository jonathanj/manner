.. _validators:

Validators
==========


Overview
--------

If a bound predicate is a way to check a single predicate against some fields,
then a *validator* is a way to check many bound predicates against a model.

.. note::

   Internally validators keep track of pending predicate results and a cache of
   results for the previous inputs, which means they need an extra layer of
   indirection if they are to be used with multiple models.


Creating a validator
--------------------

Since validators are simply a list of bound predicates, creating one is a short
two-step process:

1. Create a validators definition that can be reused:

   .. code-block:: javascript

      import * as P from "manner/predicates";
      import * as V from "manner/validators";
      let someValidators = V.validators(
        P.is('one', P.equalTo(42)),
        P.is('two', P.notNull()));

2. Instantiate a validators definition, creating an instance with its own state
   suitable for repeated use with one particular model:

   .. code-block:: javascript

      let formValidator = V.instantiate(someValidators);
      formValidator(my_model);  // => Validation results

The ultimate result of invoking an instantiated validator definition is an
``Immutable.Map`` of field names to :ref:`predicate status <predicate status>`,
which can then be used to update the state of a form, perhaps indicating which
fields failed to validate.
