"use server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function searchSpotify(query: string) {
  if (!query) return [];
  const authResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const authData = await authResponse.json();
  const token = authData.access_token;

  if (!token) return [];

  // 2. Search for the Track
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const searchData = await searchResponse.json();

  // 3. Return simplified data
  return searchData.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    image: track.album.images[2]?.url || "",
    preview: track.preview_url,
  }));
}