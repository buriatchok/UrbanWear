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
  return profiles[session.email.toLowerCase()];
}

window.UrbanWearProfile = { getProfile, saveProfile, createDefaultProfile };
