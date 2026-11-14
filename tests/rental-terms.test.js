import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanListing } from '../server/validation.js';
const listing = { brand: 'Toyota', model: 'Camry', year: 2023, price: 50, city: 'Bakı', type: 'Sedan', fuel: 'Benzin', transmission: 'Avtomat', seats: 5 };
test('weekly and monthly prices are optional and never inferred from the daily price', () => {
  const result = cleanListing({ ...listing, weeklyPrice: '', monthlyPrice: '' });
  assert.equal(result.weeklyPrice, null);
  assert.equal(result.monthlyPrice, null);
  const priced = cleanListing({ ...listing, weeklyPrice: '300', monthlyPrice: '1200', deposit: '200', experience: '2', terms: 'Təhvil yeri razılaşdırılır.' });
  assert.equal(priced.weeklyPrice, 300);
  assert.equal(priced.monthlyPrice, 1200);
  assert.equal(priced.deposit, 200);
  assert.equal(priced.experience, 2);
  assert.equal(priced.terms, 'Təhvil yeri razılaşdırılır.');
});
test('invalid rental prices and requirements are rejected', () => {
  for (const invalid of [{ weeklyPrice: -1 }, { monthlyPrice: 0 }, { monthlyPrice: 'NaN' }, { weeklyPrice: 70001 }, { deposit: -1 }, { mileage: 0 }, { minAge: 17 }, { experience: -1 }]) {
    assert.throws(() => cleanListing({ ...listing, ...invalid }));
  }
});
