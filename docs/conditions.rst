Conditions
==========

In complex forms it is often the case that some inputs need to be hidden or
disabled under certain conditions, such as an earlier field having a particular
value, this is what *conditions* in Manner provide.

Conditions in Manner, which are separate from validators, build on bound
predicates and additionally specify resulting *actions*. An action might be
something like "hide fields X, Y and Z" or "enable fields A, B and C" or
possibly even both.

Like validators there is internal state to track and so there are two steps
required to produce a condition that can be checked against a model:

1. Create a conditions definition that can be reused by other code without
   having to worry about shared state:

   .. code-block:: javascript

      import * as P from "manner/predicates";
      import * as C from "manner/conditions";
      let someConditions = C.conditions(
        C.when(P.is('one', P.equalTo(42)),
               C.hide('x', 'y', 'z'),
               C.enable('a', 'b', 'c')));

2. Instantiate a conditions definition, creating an instance for repeated use in
   one particular model:

   .. code-block:: javascript

      let formConditions = C.instantiate(someConditions);
      formConditions(my_model);  // => Condition results

The ultimate result of invoking an instantiated conditions definition is an
``Immutable.Map`` of field names to condition status, which can then be used to
update the state of a form.

It is important to note that conditions will always emit a resulting action, the
success or failure of the bound action dictates what the action will be. For
example, the ``hide`` action will suggest hiding the specified fields on success
and showing them on failure. The result of conflicting actions for a single
field is not well defined.
