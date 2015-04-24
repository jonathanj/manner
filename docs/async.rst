.. _async:

Asynchronicity
==============

Documentation thus far about the results of various aspects of Manner have been
intentionally vague mostly to simplify the understanding of Manner's
operations.

Under the hood Manner bound predicates assume that their predicate may
potentially return an asynchronous result. The nature of asynchronous actions
means that this assumption has to propagate throughout the library, the results
of both validators and conditions are ``Promise``\ s that only resolve when all
their bound predicates have resolved.

XXX: Talk about pending result state that doesn't exist yet.


Long-running predicates
-----------------------

XXX: Talk about the field-level callback that doesn't exist yet.
