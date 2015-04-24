Conditions
==========


Overview
--------

In complex forms it is often the case that some inputs need to be hidden or
disabled under certain conditions, such as an earlier field having a particular
value, this is what *conditions* in Manner provide.

Conditions in Manner, which are separate from :ref:`validators`, build on bound
predicates and additionally specify resulting *actions*. An action might be
something like "hide fields X, Y and Z" or "enable fields A, B and C" or
possibly even both.

.. note::

   Internally conditions keep track of pending predicate results and a cache of
   results for the previous inputs, which means they need an extra layer of
   indirection if they are to be used with multiple models.


Condition actions
-----------------

*Condition actions* are the way a condition acts on the result of a bound
predicate, multiple condition actions may occur for a single
condition. Available actions are: ``hide``, ``show``, ``disable`` and
``enable``.

.. note::

   Conditions will always emit a resulting action, the result of the bound
   predicate will dictate what the result of an action will be: The ``hide``
   action will suggest hiding the bound fields on success and showing them on
   failure, and vice versa for ``show``; likewise the ``disable`` action will
   suggest disabling the bound fields on success and enabling them on failure,
   and vice versa for ``enable``.

   The result of conflicting actions for a single field is not well defined.


Creating a condition
--------------------

Conditions are only marginally more complex than validators to construct, in
addition to containing a bound predicate they must also specify actions; the
``when`` function assists in this regard. Still, this is only a short two-step
process:

1. Create a conditions definition that can be reused, read as: When ``one`` is
   equal to 42 then hide ``x``, ``y`` and ``z``, and enable ``a``, ``b`` and
   ``c``:

   .. code-block:: javascript

      import * as P from "manner/predicates";
      import * as C from "manner/conditions";
      let someConditions = C.conditions(
        C.when(P.is('one', P.equalTo(42)),
               // Hide "x", "y" and "z" fields on valid input.
               C.hide('x', 'y', 'z'),
               // Enable "a", "b" and "c" fields on valid input.
               C.enable('a', 'b', 'c')));

2. Instantiate a conditions definition, creating an instance with its own state
   suitable for repeated use with one particular model:

   .. code-block:: javascript

      let formConditions = C.instantiate(someConditions);
      formConditions(my_model);  // => Condition results

The ultimate result of invoking an instantiated conditions definition is an
``Immutable.Map`` of field names to :ref:`condition status <condition status>`,
which can then be used to update the state of a form.


.. _condition status:

Condition status
----------------

The results of a condition are more complex than those of a predicate because
there are three possible states: ``hidden``, ``disabled`` and
``normal``. Conditions have a separate ``Status`` to predicates for two main
reasons:

1. There is an additional state;

2. Every state constructor accepts an optional message, which may be useful when
   describing why something is available or unavailable in a user interface
