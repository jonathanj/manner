.. _async:

Asynchronicity
==============

The documentation about the results of most aspects of Manner will talk about
them as though they're synchronous, in an attempt to simplify the explanation of
Manner's operations.

Under the hood Manner will assume that any predicate may potentially return an
asynchronous result. The nature of asynchronous results means that this
assumption has to propagate throughout the library, the results of both
:ref:`validators` and :ref:`conditions` are ``Promise``\ s that only resolve
when all their predicates have resolved.

XXX: Talk about pending result state that doesn't exist yet.
