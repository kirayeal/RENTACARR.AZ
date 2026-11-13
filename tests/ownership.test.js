import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhone, prepareListing, loadWorkspace} from '../src/ownership.js';
const data={owner:'Baku Rent',phone:'050 123 45 67',ownerKind:'company',ownerEmail:'OWNER@GMAIL.COM',name:'Toyota Camry'};
test('normalizes local contact numbers and rejects invalid numbers',()=>{assert.equal(normalizePhone(data.phone),'+994501234567');assert.throws(()=>normalizePhone('123'));});
test('phone and email do not automatically merge or grant access',()=>{const first=prepareListing(data,[]);const second=prepareListing(data,[first.owner]);assert.notEqual(first.owner.id,second.owner.id);assert.equal(first.owner.expectedEmail,'owner@gmail.com');assert.equal(first.owner.accountId,null);});
test('explicit owner selection preserves ownership and contact',()=>{const first=prepareListing(data,[]);const second=prepareListing({...data,ownerId:first.owner.id,phone:'+994551111111'},[first.owner]);assert.equal(second.listing.ownerId,first.owner.id);assert.equal(second.listing.phone,first.owner.phone);assert.throws(()=>prepareListing({...data,ownerId:'missing'},[]));});
test('workspace restores empty catalog and falls back for corrupt data',()=>{const saved={version:1,cars:[],pending:[],owners:[]};assert.deepEqual(loadWorkspace([1],{getItem:()=>JSON.stringify(saved)}),saved);assert.deepEqual(loadWorkspace([1],{getItem:()=>'{bad'}).cars,[1]);});
