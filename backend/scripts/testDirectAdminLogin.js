async function testLogin() {
  const baseUrl = 'http://localhost:5000/api/marketplace';

  const pinRes = await fetch(`${baseUrl}/admin/auth/verify-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: '680019' })
  });
  console.log('PIN Result:', pinRes.status, await pinRes.json());
}

testLogin().catch(console.error);
