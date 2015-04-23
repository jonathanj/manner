Introduction
============

Manner Core is a JavaScript library for managing various aspects of a schema,
such as validity. It is heavily geared towards complex web forms but uses
standard data structures and is not reliant on the DOM at all.

As such Manner Core does not actually validate forms or provide any components,
this is left to the various framework integrations such as `react-manner`_.

We begin with a basic overview of the concepts in Manner.

.. _react-manner: http://example.com/


Predicates
----------

At the heart of Manner is the concept of a *predicate*: A function taking some
inputs and returning a result indicating whether it considers those inputs as
passing some criteria; for example ``equalTo(42)`` constructs a predicate that
only passes if the input is equal to 42. A predicate does not simply return
``true`` or ``false`` but a *status* value that more richly describes the
result; such as providing the reason for some input not passing the predicate.

However, predicates are usually constructed from *basic predicates* which do
return ``true`` or ``false``. It is strongly encouraged to make your own and
combine existing predicates to better suit your domain.

It is assumed that predicates–and, by extension, basic predicates–are pure:
Given the same inputs they always have the same output.


Models
------

XXX:

Models are simply an ``Immutable.Map`` of field names to field values.


Bound predicates
----------------

A predicate only takes input as parameters and returns an output, it has no
knowledge of models. As you might imagine, invoking a predicate with values from
your model is a very common operation and for this reason there exist *bound
predicates*. Bound predicates enable you to describe the relationship between
field names in a model and a predicate, in effect binding them.

For example, ``is`` binds a single field to a predicate: ``is('one',
equalTo(42))`` produces a bound predicate that, when invoked with an
``Immutable.Map`` of field names to field values, will extract the value for the
field ``one``, pass it to the ``equalTo(42)`` predicate and return the result.


Statuses
--------


Yup. Statuses.


Asynchronicity
--------------

Yup. Promises and stuff.

