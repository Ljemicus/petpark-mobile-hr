#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const clientPath = path.join(root, 'lib/api/client.ts');
const bookingApiPath = path.join(root, 'lib/api/booking-requests.ts');

const client = fs.readFileSync(clientPath, 'utf8');
const bookingApi = fs.readFileSync(bookingApiPath, 'utf8');

const failures = [];

if (!client.includes('supabase.auth.getSession()')) {
  failures.push('lib/api/client.ts does not read Supabase session');
}

if (!client.includes('authorization: `Bearer ${token}`')) {
  failures.push('lib/api/client.ts does not attach Authorization Bearer token');
}

const requiredEndpoints = [
  '/api/booking-requests/owner',
  '/api/booking-requests/provider',
  '/api/booking-requests/${encodeURIComponent(id)}/withdraw',
  '/api/booking-requests/${encodeURIComponent(id)}/status',
  '/api/booking-requests/${encodeURIComponent(id)}/messages',
];

for (const endpoint of requiredEndpoints) {
  if (!bookingApi.includes(endpoint)) failures.push(`missing endpoint ${endpoint}`);
}

const petParkApiCalls = [...bookingApi.matchAll(/petParkApi<[^>]+>\(([^;]+?)\);/gs)];
const bookingRequestCalls = petParkApiCalls.filter((match) => match[1].includes('/api/booking-requests'));

if (bookingRequestCalls.length !== 6) {
  failures.push(`expected 6 booking-request petParkApi calls, found ${bookingRequestCalls.length}`);
}

for (const call of bookingRequestCalls) {
  if (!call[1].includes('auth: true')) {
    failures.push(`booking-request call missing auth:true: ${call[1].replace(/\s+/g, ' ').trim()}`);
  }
}

if (failures.length) {
  console.error('Booking request Bearer contract check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Booking request Bearer contract check passed.');
console.log(`Verified ${bookingRequestCalls.length} booking-request API calls use auth:true and petParkApi attaches Authorization: Bearer <token>.`);
