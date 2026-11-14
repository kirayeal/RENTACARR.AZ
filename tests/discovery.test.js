import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyCriteria,matchesCriteria,toggleCompared} from '../src/discovery.js';
const car={company:true,fuel:'Hibrid',transmission:'Avtomat',seats:7,deposit:0};
test('rental criteria combine owner, fuel, gearbox, minimum seats and a confirmed zero deposit',()=>{
 assert.equal(matchesCriteria(car,emptyCriteria),true);
 const criteria={owner:'company',fuel:'Hibrid',transmission:'Avtomat',seats:'7',noDeposit:true};
 assert.equal(matchesCriteria(car,criteria),true);
 for(const alternative of [{company:false},{fuel:'Dizel'},{transmission:'Mexaniki'},{seats:5},{deposit:200},{deposit:null},{deposit:undefined}]) assert.equal(matchesCriteria({...car,...alternative},criteria),false);
 assert.equal(matchesCriteria({...car,company:false},{...emptyCriteria,owner:'person'}),true);
 assert.equal(matchesCriteria({...car,seats:9},criteria),true);
});
test('comparison normalizes numeric ids, removes an existing selection and enforces the three-car limit',()=>{
 let ids=[];for(const id of [1,'2',3])ids=toggleCompared(ids,id);
 assert.deepEqual(ids,['1','2','3']);
 assert.deepEqual(toggleCompared(ids,4),ids);
 assert.deepEqual(toggleCompared(ids,2),['1','3']);
 assert.deepEqual(toggleCompared(toggleCompared(ids,1),4),['2','3','4']);
});
