import { httpError } from "./http.js";
export function cleanListing(input) {
  const text = (name, max = 100) => {
    if (
      typeof input[name] !== "string" ||
      !input[name].trim() ||
      input[name].length > max
    )
      throw httpError(400, "Elan məlumatlarını düzgün doldurun.");
    return input[name].trim();
  };
  const num = (key, min, max) => {
    const defaults = { deposit: 0, mileage: 250, minAge: 18, experience: 0 };
    const n = Number(input[key] ?? defaults[key]);
    if (!Number.isFinite(n) || n < min || n > max)
      throw httpError(400, "Qiymət və şərtlər düzgün deyil.");
    return n;
  };
  const brand = text("brand", 60),
    model = text("model", 60),
    image = String(input.image || "");
  if (image && image !== "/photos/journey.jpg" && !/^https:\/\//i.test(image))
    throw httpError(400, "Real fotonun HTTPS ünvanını daxil edin.");
  return {
    brand,
    model,
    name: `${brand} ${model}`,
    year: num("year", 1980, new Date().getFullYear() + 1),
    price: num("price", 1, 10000),
    city: text("city", 60),
    type: text("type", 60),
    fuel: text("fuel", 30),
    transmission: text("transmission", 30),
    seats: num("seats", 1, 50),
    deposit: num("deposit", 0, 100000),
    mileage: num("mileage", 1, 10000),
    minAge: num("minAge", 18, 80),
    experience: num("experience", 0, 60),
    description: String(input.description || "").slice(0, 2000),
    terms: String(input.terms || "").slice(0, 2000),
    image: image || "/photos/journey.jpg",
  };
}
