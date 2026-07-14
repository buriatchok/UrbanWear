const URBANWEAR_PROFILES_KEY = "urbanwear-profiles";

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(URBANWEAR_PROFILES_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function createDefaultProfile(session = {}) {
  const nameParts = String(session.name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    email: session.email || "",
    phone: "",
    city: "",
    address: "",
    deliveryComment: "",
    useAsDefault: false,
    autofillPersonalData: false,
    defaultAddressEnabled: false,
    defaultPaymentEnabled: false,
  };
}

function getProfile(session) {
  if (!session?.email) return createDefaultProfile(session);
  const saved = getProfiles()[session.email.toLowerCase()] || {};
  return { ...createDefaultProfile(session), ...saved };
}

function saveProfile(session, profile) {
  if (!session?.email) return profile;
  const profiles = getProfiles();
  profiles[session.email.toLowerCase()] = { ...createDefaultProfile(session), ...profile };
  localStorage.setItem(URBANWEAR_PROFILES_KEY, JSON.stringify(profiles));
  if (window.UrbanWearAuth?.getCustomerToken()) {
    window.UrbanWearStore.api("/api/account/profile", {
      method: "PATCH",
      headers: window.UrbanWearAuth.customerHeaders(),
      body: JSON.stringify({
        name: [profile.firstName, profile.lastName].filter(Boolean).join(" "),
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        delivery_comment: profile.deliveryComment,
        preferences: {
          useAsDefault: Boolean(profile.useAsDefault),
          autofillPersonalData: Boolean(profile.autofillPersonalData),
          defaultAddressEnabled: Boolean(profile.defaultAddressEnabled),
          defaultPaymentEnabled: Boolean(profile.defaultPaymentEnabled),
        },
      }),
    }).catch(() => {});
  }
  return profiles[session.email.toLowerCase()];
}

async function syncProfile(session) {
  if (!session?.email || !window.UrbanWearAuth?.getCustomerToken()) return getProfile(session);
  const result = await window.UrbanWearStore.api("/api/account/me", {
    headers: window.UrbanWearAuth.customerHeaders(),
  });
  const nameParts = String(result.name || "").trim().split(/\s+/).filter(Boolean);
  return saveProfile(session, {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    email: result.email || session.email,
    phone: result.profile?.phone || "",
    city: result.profile?.city || "",
    address: result.profile?.address || "",
    deliveryComment: result.profile?.delivery_comment || "",
    ...(result.profile?.preferences || {}),
  });
}

window.UrbanWearProfile = { getProfile, saveProfile, syncProfile, createDefaultProfile };
