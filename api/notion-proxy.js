// api/notion-proxy.js
// Vercel Serverless Function - Notion API CORS 우회용
// 이 파일을 프로젝트 루트의 /api/ 폴더에 넣어주세요

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, body, token } = req.body;

  // 보안: Notion API URL만 허용
  if (!url.startsWith('https://api.notion.com/')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const notionRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await notionRes.json();
    return res.status(notionRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
