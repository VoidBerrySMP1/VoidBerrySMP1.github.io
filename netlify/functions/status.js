exports.handler = async function(event, context) {
  const API_URL = "https://api.mcsrvstat.us/2/cross-movies.gl.at.ply.gg:20991";

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.online) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          online: true,
          playerCount: data.players ? data.players.online : 0,
          playerList: (data.players && data.players.list) ? data.players.list : []
        })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          online: false,
          playerCount: 0,
          playerList: []
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch server status." })
    };
  }
};
