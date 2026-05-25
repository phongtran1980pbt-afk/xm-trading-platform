export let timeOffset = 0;
export let isSynced = false;

export async function syncTime() {
    try {
        console.log('Syncing real time from timeapi.io...');
        const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Ho_Chi_Minh');
        if (res.ok) {
            const data = await res.json();
            const realTime = new Date(data.dateTime).getTime();
            timeOffset = realTime - Date.now();
            isSynced = true;
            console.log(`Synced true time! Offset is ${timeOffset}ms. Real time is: ${new Date(Date.now() + timeOffset).toLocaleString()}`);
        } else {
            console.error('Failed to sync time:', res.status);
        }
    } catch (e) {
        console.error('Time sync error:', e.message);
    }
}

export function getTrueTime() {
    const trueUtc = new Date(Date.now() + timeOffset);
    const tzOffsetMs = new Date().getTimezoneOffset() * 60000;
    // Shift the date so its UTC time matches the Local Time
    // This forces mssql to insert the Local Time into the DATETIME column
    return new Date(trueUtc.getTime() - tzOffsetMs);
}

export function getTrueTimestamp() {
    return Date.now() + timeOffset;
}
