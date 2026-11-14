export const emptyCriteria = { owner: 'all', fuel: '', transmission: '', seats: '', noDeposit: false };
export function matchesCriteria(car, criteria) {
  return (criteria.owner === 'all' || (criteria.owner === 'company' ? car.company : !car.company))
    && (!criteria.fuel || car.fuel === criteria.fuel)
    && (!criteria.transmission || car.transmission === criteria.transmission)
    && (!criteria.seats || Number(car.seats) >= Number(criteria.seats))
    && (!criteria.noDeposit || car.deposit === 0);
}
export function toggleCompared(ids, id) {
  const key = String(id);
  if (ids.includes(key)) return ids.filter(value => value !== key);
  if (ids.length >= 3) return ids;
  return [...ids, key];
}
