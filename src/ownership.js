// An owner profile exists before a Google account. Listings keep the stable owner ID.
// Phone is contact information only. Google subject IDs must be assigned by a trusted server after verified Google sign-in.
export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const canonical = digits.length === 10 && digits.startsWith('0') ? '994' + digits.slice(1) : digits;
  if (!/^994(?:10|50|51|55|60|70|77|99)\d{7}$/.test(canonical)) {
    throw new Error('Azərbaycan mobil nömrəsini düzgün daxil edin: +994501234567');
  }
  return '+' + canonical;
}
export function prepareListing(data, owners, id = crypto.randomUUID()) {
  const phone = normalizePhone(data.phone);
  const email = String(data.ownerEmail || '').trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-poçt ünvanını düzgün daxil edin.');
  const existing = data.ownerId ? owners.find(owner => owner.id === data.ownerId) : null;
  if (data.ownerId && !existing) throw new Error('Seçilmiş sahib tapılmadı.');
  const owner = existing || {
    id: crypto.randomUUID(), name: data.owner.trim(), phone,
    kind: data.ownerKind === 'company' ? 'company' : 'person',
    expectedEmail: email || null,
    accountId: null, createdAt: new Date().toISOString(),
  };
  return {
    owner,
    listing: {
      ...data, id, ownerId: owner.id, owner: owner.name, phone: owner.phone,
      company: owner.kind === 'company', createdBy: 'admin-demo',
      createdAt: new Date().toISOString(),
    },
  };
}
export function loadWorkspace(seed, storage) {
  try {
    const saved = JSON.parse(storage.getItem('rentacarr.workspace.v1'));
    if (saved?.version === 1 && Array.isArray(saved.cars) && Array.isArray(saved.pending) && Array.isArray(saved.owners)) return saved;
  } catch { /* Missing or invalid local data: use the original catalog. */ }
  return { version: 1, cars: seed, pending: [], owners: [] };
}
