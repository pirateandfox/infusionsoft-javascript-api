# Infusionsoft Javascript API

A promise-driven, fluent-style Node.js wrapper for the XML-RPC [Infusionsoft API](https://developer.infusionsoft.com/docs/xml-rpc).

Extended from Bvalosek's awesome but largely abandoned [Infusionsoft API](https://github.com/bvalosek/infusionsoft-api)

Updated to work from the current Oauth token system, not the legacy App Id / Key pair.

## Usage

Install via `npm`:

```
$ npm install infusionsoft-javascript-api
```

Set it up by providing a valid Oauth token to instantiate DataContext:

```javascript
var api = require('infusionsoft-api');

var infusionsoft = new api.DataContext('VALID_AUTH_TOKEN');
```

Then, work your Infusionsoft magic:
```javascript 
infusionsoft.Contacts
    .where(Contact.FirstName, 'Brandon')
    .like(Contact.LastName, 'V%')
    .select(Contact.Id, Contact.Email)
    .orderByDescending('LastName')
    .take(100)
    .toArray()
    .done(function(result) {
        console.log(result);
    });
```

You can also use API Services directly:

```javascript
infusionsoft.ContactService
    .findByEmail('brandon@aol.com', ['Id', 'FirstName', 'LastName']);
```

Very cool.

## Promises

All asynchronous methods return a [Promise](https://github.com/kriskowal/q)
that represents the eventual value that will be returned.

Promises are glorious and make writing heavily asynchronous code much less
awful than it would otherwise be.

See the **More Examples** section to see them in action.

## More Examples

All examples use `infusionsoft` as an instantiated DataContext with your Oauth Token. ie:

```javascript
var infusionsoft = new api.DataContext('MY_OAUTH_TOKEN');
```

### Get monthly revenue from a particular month

```javascript
infusionsoft.Payments
    .like(Payment.PayDate, '2013-06%')
    .sum(function(x) { return x.PayAmt; })
    .done(function(total) {
        console.log('total revenue: ' + total);
    });
```

### Login a user and get their info

And an example of using the `fail` method to catch any problems.

```javascript
infusionsoft.DataService
    .authenticateUser('user@email.com', 'md5-hash-of-password')
    .then(function(userId) {
        return infusionsoft.Users.where(User.Id, userId).first();
    })
    .then(function(user) {
        console.log('Hello ' + user.FirstName + ' ' + user.LastName);
    })
    .fail(function(err) {
        console.log('uh oh: ' + err);
    });
```

### Get all invoices for a specific month, grouped by product

Uses [underscore](http://underscorejs.org/).

```javascript
infusionsoft.Invoices
    .like(Invoice.DateCreated, '2013-08%')
    .groupBy(function(x) { return x.ProductSold; })
    .done(function(result) {
        _(result).each(function(invoices, productId) {
            console.log(productId, invoices.length);
        });
    });
```

Same as above, but use the `spread` function to wait on 2 promises to get the
corresponding product names. The API hits for querying both the `Product` table
and the `Invoice` table will actually fire off at the same time.

Hashtag asynchronous.

```javascript
var products = infusionsoft.Products.toArray();
var invoices = infusionsoft.Invoices
    .like(Invoice.DateCreated, '2013-08%')
    .groupBy(function(x) { return x.ProductSold; });

Q.spread([products, invoices], function(products, invoices) {
   _(invoices).each(function(invoices, productId)  {
        var productName = _(products)
            .find(function(x) { return x.Id == productId; })
            .ProductName;

        console.log(productName, invoices.length);
   });
});
```

### From an email address, get a contact's tags

```javascript
sdk.Contacts
    .where(Contact.Email, 'some@email.com')
    .first()
    .then(function(contact) {
        return sdk.ContactGroupAssigns
            .where(ContactGroupAssign.ContactId, contact.Id)
            .toArray();
    })
    .then(function(cgas) {
        cgas.forEach(function(group) {
            console.log(group.ContactGroup, group.DateCreated);
        });
    });
```

### Get the full Product Category Name for all subscription plans

Okay, take a deep breath. We can do (inner) joins. We fake it though... the
`inner` part of the join has to be loaded entirely and then we do a `O(n^2)`
iteration to make it, but we can still do it. If the `inner` is cheap, this
isn't too bad. Especially when the SDK will handle loading, paging, waiting,
etc... all for you.

Syntax (stolen from C#'s LINQ):

### `join` (`innerQueryable`, `outerKey`, `innerKey`, `selectorFn`)

Let's do this:


```javascript
var pc    = infusionsoft.ProductCategories;
var pca   = infusionsoft.ProductCategoryAssigns;
var plans = infusionsoft.SubscriptionPlans;

// Join the categories onto itself for creating the full category name
// (category parent name + category name)
var categories = pc
    .join(pc, 'ParentId', 'Id', function(pc, parent) {
        return {
            Id: pc.Id,
            Name: parent.CategoryDisplayName + ' ' + pc.CategoryDisplayName
        }; });

var subPlans = plans

    // Join the sub plan (which only has product Id) onto the PCA table to get
    // the product category ID
    .join(pca, 'ProductId', 'ProductId', function(plan, pca) {
        plan.ProductCategoryId = pca.ProductCategoryId;
        return plan;
    })


    // Join our categories object we made above onto the projection from the
    // most recent join to get the full category name + subscription plan Id
    .join(categories, 'ProductCategoryId', 'Id', function(plan, category) {
        return { planId: plan.Id, category: category.Name }; });

subPlans.toArray().done(function(d) { console.log(d); });
```

What happens magically behind the scenes is pretty nice. When we call
`toArray()` at the end, we first query the SubscriptionPlan table (aliased as
`plans`). It then knows we need to join the `ProductCategoryAssign` table on
there, so it fetches that (which may be more than one page). It finally gets
the `ProductCategory` table (in its entirety), and joins them all up.

The syntax looks nasty, but that is somewhat unavoidable with a `join`
function.


## License
Copyright (c) 2013, Brandon Valosek
Modified work Copyright 2018 Justin Handley

**Infusionsoft Javascript API** is released under the MIT license.

