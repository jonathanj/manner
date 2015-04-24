Predicates
==========


Overview
--------

At the heart of Manner is the concept of a *predicate*: A function taking some
inputs and returning a result indicating whether it considers those inputs as
valid or invalid. For example, ``equalTo(42)`` constructs a predicate
that only considers input equal to 42 valid.

A predicate does not return ``true`` or ``false`` but a :ref:`status <predicate
status>` value that more richly describes the result by providing the reason for
some input not passing the predicate. However, predicates are usually
constructed from *boolean predicates* which do return ``true`` or ``false``. It is
strongly encouraged to make your own and combine existing predicates to better
suit your domain.

Finally, it is important to note that Manner assumes that predicates—and, by
extension, boolean predicates—are pure: Given the same inputs they always have the
same output.


Boolean predicates
----------------

A boolean predicate is a simple factory that takes some arguments, used to set up
any conditions, and returns a new function that may accept more parameters and
finally returns ``true`` or ``false``. As an example, here is the implementation of
the ``between`` boolean predicate:

.. code-block:: javascript

   /** Between `a` and `b`, inclusively. */
   function between(a, b) {
     return function (v) { return v >= a && v <= b; };
   }

Often predicates are implemented in terms of boolean predicates, while not
strictly required this tends to result in a collection of small composable
functions which means easier testing and greater implementation flexibility.

Creating a predicate from a boolean predicate is so common that there is a public
helper, ``predicate``, in Manner to do this. Here is the implementation of the
``between`` predicate:

.. code-block:: javascript

   import * as P from "manner/predicates";
   import * as PB from "manner/predicates/boolean";
   /** Between `a` and `b`, inclusively. */
   let between = P.predicate(PB.between, a_message);


Bound predicates
----------------

A predicate only takes input as parameters and returns an output, it has no
knowledge of fields and their values. As one might imagine, invoking a predicate
with values from your model is a very common operation and for this reason there
exist *bound predicates*. Bound predicates enable you to describe the
relationship between field names in a model and a predicate, in effect binding
them.

For example, ``is`` binds a single field to a predicate: ``is('one',
equalTo(42))`` produces a bound predicate that, when invoked with an
``Immutable.Map`` of field names to field values, will extract the value for the
field ``one``, pass it to the ``equalTo(42)`` predicate and return the result.


.. _predicate status:

Predicate status
----------------

While a predicate essentially returns only one of two values—valid or
invalid—the result needs to be richer than a simple boolean value. If nothing
else, there needs to be a reason indicating why the input failed to
validate; which is where ``Status`` comes in.

A status is intended to be constructed only via its static methods and in the
case of predicates there are only two such methods: ``valid()`` and
``invalid(reason)``.

In the event that there is more than one status for a field, imagine that a
field is involved in multiple predicates, the statuses are combined to form a
new ``Status``. Since status values are mutually exclusive—there is no sense in
a field being both valid and invalid—combining multiple statuses collapses them
into the one with the highest defined priority: Invalid fields trump valid
fields.


Custom messages
---------------

In the event that a custom message for a predicate is necessary, it's possible
to use ``message`` to wrap an existing predicate with a customized message:

.. note::

   ``message`` always returns an asynchronous result, see :ref:`async`.

.. code-block:: javascript

   import * as P from "manner/predicates";
   let myEqualTo = P.message("Nope", P.equalTo);
   myEqualTo(42)(21).call('message');  // => "Nope"

Or provide a message function to access input arguments or perform
:ref:`i18n`:

.. code-block:: javascript

   import * as P from "manner/predicates";
   function myEqualToMsg(_, args, rest) {
     return args[0] + ' !== ' + rest[0];
   }
   let myEqualTo2 = P.message(myEqualToMsg, P.equalTo);
   myEqualTo(42)(21).call('message')  // => "42 !== 21"
