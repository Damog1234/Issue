export default async function handler(req, res) {
  const { username } = req.query;
  const guildId = "1237055789441487021"; // GenLayer Guild ID

  try {
    // We scan 10 pages (1000 members) quickly. 
    // MEE6 is faster when we request smaller chunks.
    for (let page = 0; page < 10; page++) {
      const response = await fetch(
        `https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?page=${page}`,
        { next: { revalidate: 60 } }
      );
      const data = await response.json();

      if (!data.players) break;

      const found = data.players.find(
        (p) => p.username.toLowerCase() === username.toLowerCase()
      );

      if (found) {
        return res.status(200).json({
          username: found.username,
          level: found.level,
          message_xp: found.message_xp,
          rank: found.rank,
          id: found.id,
          avatar: found.avatar
        });
      }
    }
    return res.status(404).json({ error: "User not found in top 1000" });
  } catch (err) {
    return res.status(500).json({ error: "MEE6 API is lagging. Try again." });
  }
}
