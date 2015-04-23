Predicates
==========


Overview
--------

At the heart of Manner is the concept of a *predicate*: A function taking some
inputs and returning a result indicating whether it considers those inputs as
having passed some criteria. For example, ``equalTo(42)`` constructs a predicate
that only passes if the input is equal to 42.

A predicate does not return ``true`` or ``false`` but a :ref:`status <status>`
value that more richly describes the result by providing the reason for some
input not passing the predicate. However, predicates are usually constructed
from *basic predicates* which do return ``true`` or ``false``. It is strongly
encouraged to make your own and combine existing predicates to better suit your
domain.

Finally, it is important to note that Manner assumes that predicates–and, by
extension, basic predicates–are pure: Given the same inputs they always have the
same output.


Basic predicates
----------------

A basic predicate is a simple function—taking some arguments and returning
``true`` or ``false``—that a predicate can be built on. It's not strictly
required to implement predicates in terms of basic predicates but it can make
testing easier, implementation simpler and provide a better approach to the
reasoning about a predicate's function.

Creating a predicate from a basic predicate is so common that there is a public
helper, ``predicate``, in Manner to do this:

    .. code-block: javascript

       import * as V from "manner/validators";
       let myPredicate = V.predicate(basic_myPredicate, message);


.. _status:

Predicate status
----------------

While a predicate essentially returns only one of two values—valid or
invalid—the result needs to be richer than a simple boolean value. If nothing
else, there needs to be a reason indicating why the input failed to
validate; enter ``Status``.

A status is intended to be constructed only via its static methods, in the case
of predicates there are only two such methods: ``valid()`` and
``invalid(reason)``.


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
