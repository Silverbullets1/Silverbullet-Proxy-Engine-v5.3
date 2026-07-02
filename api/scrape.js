const https = require('https');

// --- CONFIGURATION & SOURCES ---
const SOURCES = {
    http: [
        'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
        'https://fastly.jsdelivr.net/gh/proxygenerator1/ProxyGenerator@main/MostStable/http.txt',
        'https://fastly.jsdelivr.net/gh/TheSpeedX/PROXY-List@master/http.txt',
        'https://fastly.jsdelivr.net/gh/monosans/proxy-list@main/proxies/http.txt',
        'https://fastly.jsdelivr.net/gh/roosterkid/openproxylist@main/HTTPS_RAW.txt',
        'https://fastly.jsdelivr.net/gh/prxchk/proxy-list@main/http.txt',
        'https://fastly.jsdelivr.net/gh/Zaeem20/FREE_PROXIES_LIST@master/http.txt',
        'https://fastly.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/http/data.txt',
        'https://fastly.jsdelivr.net/gh/VPSLabCloud/VPSLab-Free-Proxy-List@main/http_all.txt'
    ],
    socks4: [
        'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks4&timeout=10000&country=all',
        'https://fastly.jsdelivr.net/gh/proxygenerator1/ProxyGenerator@main/MostStable/socks4.txt',
        'https://fastly.jsdelivr.net/gh/TheSpeedX/PROXY-List@master/socks4.txt',
        'https://fastly.jsdelivr.net/gh/monosans/proxy-list@main/proxies/socks4.txt',
        'https://fastly.jsdelivr.net/gh/roosterkid/openproxylist@main/SOCKS4_RAW.txt',
        'https://fastly.jsdelivr.net/gh/prxchk/proxy-list@main/socks4.txt',
        'https://fastly.jsdelivr.net/gh/Zaeem20/FREE_PROXIES_LIST@master/socks4.txt',
        'https://fastly.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/socks4/data.txt',
        'https://fastly.jsdelivr.net/gh/VPSLabCloud/VPSLab-Free-Proxy-List@main/socks4_all.txt'
    ],
    socks5: [
        'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all',
        'https://fastly.jsdelivr.net/gh/proxygenerator1/ProxyGenerator@main/MostStable/socks5.txt',
        'https://fastly.jsdelivr.net/gh/TheSpeedX/PROXY-List@master/socks5.txt',
        'https://fastly.jsdelivr.net/gh/monosans/proxy-list@main/proxies/socks5.txt',
        'https://fastly.jsdelivr.net/gh/roosterkid/openproxylist@main/SOCKS5_RAW.txt',
        'https://fastly.jsdelivr.net/gh/prxchk/proxy-list@main/socks5.txt',
        'https://fastly.jsdelivr.net/gh/Zaeem20/FREE_PROXIES_LIST@master/socks5.txt',
        'https://fastly.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/socks5/data.txt',
        'https://fastly.jsdelivr.net/gh/VPSLabCloud/VPSLab-Free-Proxy-List@main/socks5_all.txt'
    ],
    mtproto: [
        'https://fastly.jsdelivr.net/gh/yebekhe/MTProtoCollector@main/proxy/mtproto.txt',
        'https://fastly.jsdelivr.net/gh/hookzof/socks5_list@master/tg/mtproto.txt',
        'https://fastly.jsdelivr.net/gh/mishakorzik/Free-Proxies@main/mtproto.txt',
        'https://fastly.jsdelivr.net/gh/ALIILAPRO/MTProtoProxy@main/mtproto.txt',
        'https://fastly.jsdelivr.net/gh/ts-sf/mtproto-proxy-list@main/mtproto.txt',
        'https://fastly.jsdelivr.net/gh/SlavaBaturin/telegram-mtproto-proxies@master/proxies.txt',
        'https://fastly.jsdelivr.net/gh/whoahaow/rjsxrd@main/MTProto.txt',
        'https://fastly.jsdelivr.net/gh/MustafaBaqer/VestraNet-Nodes@main/protocols/mtproto.txt',
        'https://fastly.jsdelivr.net/gh/Leon406/Sub@master/sub/share/mtp'
    ],
    v2ray: [
        'https://fastly.jsdelivr.net/gh/barry-jelly/Free_Proxy_Daily@master/V2Ray/v2ray.txt',
        'https://fastly.jsdelivr.net/gh/Pawdroid/Free-servers@main/sub',
        'https://fastly.jsdelivr.net/gh/mahdibland/ShadowsocksAggregator@master/Eternity',
        'https://fastly.jsdelivr.net/gh/Leon406/Sub@master/sub/share/v2',
        'https://fastly.jsdelivr.net/gh/mfuu/v2ray@master/v2ray',
        'https://fastly.jsdelivr.net/gh/MatinGhanbari/v2ray-configs@main/subscriptions/v2ray/all_sub.txt'
    ]
};

// --- UTILITIES ---
function isPublicIp(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN) || parts.some(p => p < 0 || p > 255)) return false;
    if ([0, 10, 127].includes(parts[0])) return false;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
    if (parts[0] === 192 && parts[1] === 168) return false;
    if (parts[0] === 169 && parts[1] === 254) return false;
    return true;
}

function safeB64Decode(data) {
    data = data.trim().replace(/\s/g, '');
    let padding = data.length % 4;
    if (padding) data += '='.repeat(4 - padding);
    try {
        return Buffer.from(data, 'base64').toString('utf-8');
    } catch (e) {
        return "";
    }
}

function fetchUrl(url) {
    return new Promise((resolve) => {
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 6000 
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', () => resolve(''));
    });
}

function parseText(text, category) {
    const matches = [];
    if (category === 'mtproto') {
        const regex = /(?:https:\/\/t\.me\/proxy\?|tg:\/\/proxy\?)?server=([a-zA-Z0-9.-]+)&port=(\d+)&secret=([a-zA-Z0-9_\-%=]+)/gi;
        let match;
        while ((match = regex.exec(text)) !== null) {
            const [_, server, port, secret] = match;
            if (secret.length >= 32 && secret.length <= 34 && !secret.toLowerCase().startsWith('ee')) {
                matches.push(`tg://proxy?server=${server}&port=${port}&secret=${secret}`);
            }
        }
    } else if (category === 'v2ray') {
        let decodedText = text;
        if (/^[a-zA-Z0-9+/=\s\n\r]+$/.test(text.trim()) && text.trim().length > 50) {
            decodedText = safeB64Decode(text);
        }
        const regex = /(?:vmess|vless|trojan|ss):\/\/[a-zA-Z0-9._~:/?#@!$&'()*+,;=%-]+/gi;
        const found = decodedText.match(regex);
        if (found) matches.push(...found);
    } else {
        const regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]{1,5}\b/g;
        const found = text.match(regex);
        if (found) {
            for (const ipStr of found) {
                const [ip, port] = ipStr.split(':');
                if (parseInt(port) <= 65535 && isPublicIp(ip)) {
                    matches.push(ipStr);
                }
            }
        }
    }
    return matches;
}

// --- VERCEL SERVERLESS HANDLER ---
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const params = req.body;
        const startTime = Date.now();

        const options = { '1': Object.keys(SOURCES), '2': ['http'], '3': ['socks4'], '4': ['socks5'], '5': ['mtproto'], '6': ['v2ray'], 'all': Object.keys(SOURCES), 'http': ['http'], 'socks4': ['socks4'], 'socks5': ['socks5'], 'mtproto': ['mtproto'], 'v2ray': ['v2ray'] };
        const targets = options[params.choice] || Object.keys(SOURCES);
        
        let masterSet = new Set();
        const breakdownCounts = { http: 0, socks4: 0, socks5: 0, mtproto: 0, v2ray: 0 };
        const fetchPromises = [];

        for (const cat of targets) {
            for (const url of SOURCES[cat]) {
                fetchPromises.push((async () => {
                    const html = await fetchUrl(url);
                    const proxies = parseText(html, cat);
                    for (const p of proxies) {
                        if (!masterSet.has(p)) {
                            masterSet.add(p);
                            breakdownCounts[cat]++;
                        }
                    }
                })());
            }
        }
        
        await Promise.all(fetchPromises);
        let rawArray = Array.from(masterSet);

        // Structural Verification Sweep
        if (params.runChecker && rawArray.length > 0) {
            rawArray = rawArray.filter(proxy => {
                if (proxy.includes('://')) return proxy.length > 15;
                const port = proxy.split(':')[1];
                return port && !isNaN(port) && parseInt(port) > 0;
            });
            for (let k in breakdownCounts) breakdownCounts[k] = 0;
            for (const p of rawArray) {
                if (p.includes('tg://')) breakdownCounts['mtproto']++;
                else if (p.includes('://')) breakdownCounts['v2ray']++;
                else breakdownCounts['http']++;
            }
        }

        rawArray.sort((a, b) => a.localeCompare(b));
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

        return res.status(200).json({
            retainedCount: rawArray.length,
            timeTaken,
            breakdown: breakdownCounts,
            proxies: rawArray
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
