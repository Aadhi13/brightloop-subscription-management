import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { bootstrapAdmin } from '../src/config/bootstrap.js';
import { User } from '../src/modules/users/user.model.js';
import { Customer } from '../src/modules/customers/customer.model.js';
import { signToken } from '../src/utils/jwt.js';

let server;
let baseUrl;

const uniqueSuffix = Date.now();
const testAdminEmail = `admin-${uniqueSuffix}@test.io`;
const testAdminPassword = 'Admin@Password123!';
let adminCookie = '';

before(async () => {
  await connectDB();
  await bootstrapAdmin();

  // Create dedicated test admin
  const bcryptjs = (await import('bcryptjs')).default;
  const hash = await bcryptjs.hash(testAdminPassword, 10);
  const adminUser = await User.create({
    email: testAdminEmail,
    passwordHash: hash,
    role: 'admin',
    isActive: true,
  });

  // Start ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });

  // Log in as test admin to get admin cookie
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testAdminEmail, password: testAdminPassword }),
  });
  adminCookie = loginRes.headers.get('set-cookie') || '';
});

after(async () => {
  // Cleanup test users and customers created during tests
  await User.deleteMany({ email: { $regex: `.*${uniqueSuffix}.*` } });
  await Customer.deleteMany({ email: { $regex: `.*${uniqueSuffix}.*` } });

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

describe('M1: Authentication and Authorization Tests', () => {
  const customerEmail = `cust-${uniqueSuffix}@test.io`;
  const validPassword = 'Secure@Password123!';
  let customerCookie = '';
  let customerId = '';
  let customerUserId = '';

  test('1. Customer registration works and creates Customer profile with secure cookie', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: validPassword,
        name: 'Jane Customer',
        companyName: 'Acme Corp',
        phone: '+91 9876543210',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.role, 'customer');
    assert.equal(data.data.user.passwordHash, undefined, 'Password hash must never be returned');
    assert.ok(data.data.customer, 'Associated customer profile must be created');
    assert.equal(data.data.customer.name, 'Jane Customer');

    customerCookie = res.headers.get('set-cookie') || '';
    assert.ok(customerCookie.includes('HttpOnly'), 'Cookie must be HttpOnly');
    customerUserId = data.data.user.id;
    customerId = data.data.customer.id;
  });

  test('2. Duplicate email is rejected (including different casing)', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail.toUpperCase(), // Same email in uppercase
        password: validPassword,
        name: 'Duplicate Jane',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'DUPLICATE_EMAIL');
  });

  test('3. Invalid password is rejected (too short, missing uppercase, missing special char)', async () => {
    // Exactly 8 characters (should fail since length must be greater than 8)
    const resShort = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `invalid1-${uniqueSuffix}@test.io`,
        password: 'Pass123!', // 8 chars
        name: 'Test',
      }),
    });
    assert.equal(resShort.status, 422);

    // Missing uppercase
    const resNoUpper = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `invalid2-${uniqueSuffix}@test.io`,
        password: 'secure@password123',
        name: 'Test',
      }),
    });
    assert.equal(resNoUpper.status, 422);

    // Missing special character
    const resNoSpecial = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `invalid3-${uniqueSuffix}@test.io`,
        password: 'SecurePassword123',
        name: 'Test',
      }),
    });
    assert.equal(resNoSpecial.status, 422);
  });

  test('4. Correct login succeeds and sets HttpOnly cookie without token in JSON', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: validPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.token, undefined, 'Token must not be exposed in JSON response');
    const cookie = res.headers.get('set-cookie');
    assert.ok(cookie && cookie.includes('token='), 'Cookie token must be set');
  });

  test('5. Incorrect password fails with generic 401 error', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: 'WrongPassword@123',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'INVALID_CREDENTIALS');
  });

  test('6. Inactive account cannot log in', async () => {
    // Deactivate customer account
    await User.findByIdAndUpdate(customerUserId, { isActive: false });

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: validPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.error.code, 'ACCOUNT_DEACTIVATED');

    // Reactivate for subsequent tests
    await User.findByIdAndUpdate(customerUserId, { isActive: true });
  });

  test('7. Unauthenticated request receives 401', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.error.code, 'UNAUTHORIZED');
  });

  test('8. Customer cannot create staff (receives 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/users/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        email: `staff-attempt-${uniqueSuffix}@test.io`,
        password: 'Staff@Password123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.error.code, 'FORBIDDEN');
  });

  let staffCookie = '';
  const staffEmail = `staff-${uniqueSuffix}@test.io`;
  const staffPassword = 'Staff@Password123!';

  test('9. Admin can create staff', async () => {
    const res = await fetch(`${baseUrl}/users/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        email: staffEmail,
        password: staffPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.role, 'staff');

    // Log in as staff to get staff cookie
    const staffLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: staffEmail, password: staffPassword }),
    });
    staffCookie = staffLoginRes.headers.get('set-cookie') || '';
  });

  test('10. Staff cannot create staff (receives 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/users/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: staffCookie,
      },
      body: JSON.stringify({
        email: `staff-by-staff-${uniqueSuffix}@test.io`,
        password: 'Staff@Password123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.error.code, 'FORBIDDEN');
  });

  test('11. Customer cannot access another customer profile (receives 403)', async () => {
    // Create another customer
    const otherCustomerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `other-${uniqueSuffix}@test.io`,
        password: validPassword,
        name: 'Other Customer',
      }),
    });
    const otherData = await otherCustomerRes.json();
    const otherCustomerId = otherData.data.customer.id;

    // Customer attempts to access other customer profile
    const accessRes = await fetch(`${baseUrl}/customers/${otherCustomerId}`, {
      headers: { Cookie: customerCookie },
    });
    const accessData = await accessRes.json();
    assert.equal(accessRes.status, 403);
    assert.equal(accessData.error.code, 'FORBIDDEN');

    // But customer CAN access own profile
    const ownRes = await fetch(`${baseUrl}/customers/${customerId}`, {
      headers: { Cookie: customerCookie },
    });
    assert.equal(ownRes.status, 200);
  });

  test('12. Logout clears authentication cookie', async () => {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: customerCookie },
    });

    assert.equal(res.status, 200);
    const clearCookie = res.headers.get('set-cookie');
    assert.ok(
      clearCookie && (clearCookie.includes('token=;') || clearCookie.includes('Max-Age=0')),
      'Cookie must be cleared'
    );
  });

  test('13. Expired and invalid JWTs are rejected', async () => {
    // Malformed token
    const resInvalid = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.payload' },
    });
    assert.equal(resInvalid.status, 401);
    const dataInvalid = await resInvalid.json();
    assert.equal(dataInvalid.error.code, 'INVALID_TOKEN');

    // Expired token (create a token expired 1 second ago)
    const jwt = (await import('jsonwebtoken')).default;
    const { env } = await import('../src/config/env.js');
    const expiredToken = jwt.sign(
      { id: customerUserId, role: 'customer' },
      env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const resExpired = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(resExpired.status, 401);
    const dataExpired = await resExpired.json();
    assert.equal(dataExpired.error.code, 'TOKEN_EXPIRED');
  });

  test('14. Password reset token expires and cannot be reused', async () => {
    // Request reset
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail }),
    });
    const forgotData = await forgotRes.json();
    assert.equal(forgotRes.status, 200);
    const resetToken = forgotData.data.devToken;
    assert.ok(resetToken, 'Dev reset token must be returned in test/dev environment');

    // Use token to reset password
    const newPassword = 'BrandNew@Password999!';
    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    const resetData = await resetRes.json();
    assert.equal(resetRes.status, 200);
    assert.equal(resetData.success, true);

    // Reusing the same reset token must fail
    const reuseRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: 'Another@Password123!' }),
    });
    assert.equal(reuseRes.status, 400);
    const reuseData = await reuseRes.json();
    assert.equal(reuseData.error.code, 'INVALID_RESET_TOKEN');

    // Verify login with new password works
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password: newPassword }),
    });
    assert.equal(newLoginRes.status, 200);
  });
});
