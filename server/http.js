export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });
export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
export function assertOrigin(req) {
  const origin = req.headers.origin;
  const protocol = process.env.VERCEL
    ? "https"
    : String(req.headers["x-forwarded-proto"] || "http").split(",")[0];
  const host = process.env.VERCEL ? req.headers.host : req.headers.host;
  if (!origin || origin !== `${protocol}://${host}`)
    throw httpError(403, "Sorğu mənbəyi təsdiqlənmədi.");
}
export async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 20000) throw httpError(413, "Sorğu çox böyükdür.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    throw httpError(400, "Məlumat formatı düzgün deyil.");
  }
}
export function endpoint(fn) {
  return async (req, res) => {
    try {
      res.setHeader("X-Content-Type-Options", "nosniff");
      await fn(req, res);
    } catch (error) {
      json(res, error.status || 503, {
        error: error.status
          ? error.message
          : "Xidmət hazırda əlçatan deyil. Bir az sonra yenidən yoxlayın.",
      });
    }
  };
}
