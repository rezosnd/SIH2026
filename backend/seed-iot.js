async function main() {
  try {
    const API = 'https://backend-eight-jade-26.vercel.app';
    
    console.log('Logging in...');
    const loginRes = await fetch(`${API}/auth/dev-login`);
    const loginData = await loginRes.json();
    const token = loginData.access_token;

    console.log('Getting dashboard...');
    const dashRes = await fetch(`${API}/beekeepers/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    
    let hiveId = '';
    if (!dashData.hives || dashData.hives.length === 0) {
      console.log('No hives found for Beekeeper! Creating one...');
      const hiveRes = await fetch(`${API}/hives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ location: 'North Apiary, Sector 1' })
      });
      const hiveData = await hiveRes.json();
      hiveId = hiveData.id;
    } else {
      hiveId = dashData.hives[0].id;
    }
    console.log('Target Hive ID:', hiveId);

    const deviceId = 'ESP32-HIVE-TEST01';
    console.log('Registering Device...');
    await fetch(`${API}/iot/devices/register`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, hiveId }) 
    });

    console.log('Ingesting Sensor Data...');
    const payload = {
      deviceId,
      timestamp: new Date().toISOString(),
      sequence: 123,
      sensors: {
        temperature: parseFloat((Math.random() * (35 - 28) + 28).toFixed(1)), // 28 - 35 C
        humidity: parseFloat((Math.random() * (75 - 50) + 50).toFixed(1)), // 50 - 75 %
        pressure: 1012,
        rain: Math.random() > 0.8,
        uv: parseFloat((Math.random() * 5).toFixed(1)),
        weight: 42.6,
        lm393: null
      }
    };

    const telemetryRes = await fetch(`${API}/iot/hives/${hiveId}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Success!', await telemetryRes.json());
    
  } catch (err) {
    console.error(err);
  }
}

main();
