exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Parse the incoming form data
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { reporter, type, target, reason, link, desc } = payload;

  // Basic validation
  if (!reporter || !type || !desc) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  // Build Discord embed fields
  const fields = [
    {
      name: "👤 Reporter IGN",
      value: reporter || "Unknown",
      inline: true,
    },
    {
      name: "📋 Report Type",
      value: type || "Unknown",
      inline: true,
    },
  ];

  // Only add Target field if it was filled in
  if (target && target.trim() !== "") {
    fields.push({
      name: "🎯 Target",
      value: target,
      inline: true,
    });
  }

  // Only add Reason field if it was selected
  if (reason && reason.trim() !== "") {
    fields.push({
      name: "⚠️ Reason",
      value: reason,
      inline: false,
    });
  }

  // Only add Evidence field if a link was provided
  if (link && link.trim() !== "") {
    fields.push({
      name: "🔗 Evidence",
      value: link,
      inline: false,
    });
  }

  // Always add the description
  fields.push({
    name: "📝 Description",
    value: desc,
    inline: false,
  });

  // Build the Discord message
  const discordPayload = {
    embeds: [
      {
        title: "🚨 New Server Report",
        color: 0xff0000, // Red color
        fields: fields,
        footer: {
          text: "VoidBerry SMP Report System",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  // Send to Discord webhook
  const webhookUrl = process.env.DISCORD_WEBHOOK;

  if (!webhookUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Webhook not configured on server." }),
    };
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Discord rejected the message." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to reach Discord." }),
    };
  }
};
