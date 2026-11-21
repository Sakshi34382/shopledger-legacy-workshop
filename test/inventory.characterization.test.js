var test = require('node:test');
var assert = require('node:assert/strict');

var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('inventory.check allows selling the exact last sellable DRY-001 unit', function () {
  var products = [{
    id: 6,
    name: 'A2 Gir Cow Ghee 500ml',
    stock: 1,
    reserved: 0
  }];

  var result = inventory.check(products, [{ id: 6, qty: 1 }]);

  assert.deepEqual(result, { ok: true });
});

test('inventory.check allows selling the exact remaining reserved-adjusted SPC-001 quantity', function () {
  var products = [{
    id: 11,
    name: 'Byadgi Kashmiri Chilli Powder 500g',
    stock: 4,
    reserved: 3
  }];

  var result = inventory.check(products, [{ id: 11, qty: 1 }]);

  assert.deepEqual(result, { ok: true });
});

test('cancelling pending order 1007 restores its stock', function () {
  var db = {
    products: [
      { id: 6, name: 'A2 Gir Cow Ghee 500ml', stock: 1, reserved: 0 },
      { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', stock: 22, reserved: 4 }
    ],
    customers: [{
      id: 4,
      name: 'Suresh Deshmukh',
      openingBalance: 1200,
      totalBilled: 1407,
      totalSettled: 1000
    }],
    orders: [{
      id: 1007,
      status: 'pending',
      customerId: 4,
      paymentMode: 'khata',
      total: 1407,
      items: [
        { id: 6, qty: 2 },
        { id: 4, qty: 2 }
      ]
    }]
  };

  var result = orders.cancel(db, 1007, 'characterization test');

  assert.equal(result.ok, true);
  assert.equal(db.orders[0].status, 'cancelled');
  assert.deepEqual(db.products, [
    { id: 6, name: 'A2 Gir Cow Ghee 500ml', stock: 3, reserved: 0 },
    { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', stock: 24, reserved: 4 }
  ]);
});
