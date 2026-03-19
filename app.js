import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdl86udPxoJ_QCnzImRISzTtwrGfwSLoE",
  authDomain: "period-tracker-2-cefd6.firebaseapp.com",
  projectId: "period-tracker-2-cefd6",
  storageBucket: "period-tracker-2-cefd6.firebasestorage.app",
  messagingSenderId: "673916371105",
  appId: "1:673916371105:web:6a97ba870d5724c965b0e0",
  measurementId: "G-D8QDQ3PYWH",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const STORAGE_KEY = "concepimento-companion-state";

const defaultState = {
  profile: {
    displayName: "",
    age: 32,
    goal: "concepimento",
    theme: "apricot",
    cycleLength: 28,
    periodLength: 5,
    lastPeriodDate: "",
    monthsTrying: 0,
    irregularCycles: false,
    pelvicPain: false,
    pelvicInfection: false,
    googleConnected: false,
    googleEmail: "",
    uid: "",
    onboardingCompleted: false,
    lastSavedAt: "",
  },
  biomarkers: {
    sensation: "moist",
    mucus: "stretchy",
    spinnbarkeit: "yes",
    cervixHeight: "high",
    cervixTexture: "soft",
    cervixOpen: "open",
  },
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(raw);
    return {
      profile: { ...defaultState.profile, ...(parsed.profile || {}) },
      biomarkers: { ...defaultState.biomarkers, ...(parsed.biomarkers || {}) },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

const state = loadState();

const authScreen = document.querySelector("#authScreen");
const onboardingScreen = document.querySelector("#onboardingScreen");
const authStatus = document.querySelector("#authStatus");
const onboardingStatus = document.querySelector("#onboardingStatus");
const googleConnectButton = document.querySelector("#googleConnectButton");
const logoutButton = document.querySelector("#logoutButton");
const onboardingForm = document.querySelector("#onboardingForm");
const biomarkerForm = document.querySelector("#biomarkerForm");
const saveDataButton = document.querySelector("#saveDataButton");
const mobileSaveButton = document.querySelector("#mobileSaveButton");
const editProfileButton = document.querySelector("#editProfileButton");

const displayNameInput = document.querySelector("#displayNameInput");
const ageInput = document.querySelector("#ageInput");
const cycleLengthInput = document.querySelector("#cycleLengthInput");
const periodLengthInput = document.querySelector("#periodLengthInput");
const lastPeriodInput = document.querySelector("#lastPeriodInput");
const monthsTryingInput = document.querySelector("#monthsTryingInput");
const goalInput = document.querySelector("#goalInput");
const themeInput = document.querySelector("#themeInput");
const irregularCyclesInput = document.querySelector("#irregularCyclesInput");
const pelvicPainInput = document.querySelector("#pelvicPainInput");
const pelvicInfectionInput = document.querySelector("#pelvicInfectionInput");

const sensationInput = document.querySelector("#sensationInput");
const mucusInput = document.querySelector("#mucusInput");
const spinnbarkeitInput = document.querySelector("#spinnbarkeitInput");
const cervixHeightInput = document.querySelector("#cervixHeightInput");
const cervixTextureInput = document.querySelector("#cervixTextureInput");
const cervixOpenInput = document.querySelector("#cervixOpenInput");

const profileGreeting = document.querySelector("#profileGreeting");
const syncBadge = document.querySelector("#syncBadge");
const accountSummary = document.querySelector("#accountSummary");
const saveStatus = document.querySelector("#saveStatus");
const heroTitle = document.querySelector("#heroTitle");
const heroDescription = document.querySelector("#heroDescription");
const lastPeriodValue = document.querySelector("#lastPeriodValue");
const cycleValue = document.querySelector("#cycleValue");
const lastSyncValue = document.querySelector("#lastSyncValue");
const statusRing = document.querySelector("#statusRing");
const statusLabel = document.querySelector("#statusLabel");
const fertilityHeadline = document.querySelector("#fertilityHeadline");
const fertilitySummary = document.querySelector("#fertilitySummary");
const ovulationCountdown = document.querySelector("#ovulationCountdown");
const countdownText = document.querySelector("#countdownText");
const fecundabilityValue = document.querySelector("#fecundabilityValue");
const fecundabilityText = document.querySelector("#fecundabilityText");
const peakDayValue = document.querySelector("#peakDayValue");
const peakDayText = document.querySelector("#peakDayText");
const billingsTitle = document.querySelector("#billingsTitle");
const billingsSummary = document.querySelector("#billingsSummary");
const supportAlert = document.querySelector("#supportAlert");
const peakCaption = document.querySelector("#peakCaption");
const rule35Text = document.querySelector("#rule35Text");
const symptomText = document.querySelector("#symptomText");
const profileClinicalText = document.querySelector("#profileClinicalText");

function isFileProtocol() {
  return window.location.protocol === "file:";
}

function formatDate(value) {
  if (!value) return "Da impostare";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "Non ancora";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function goalLabel(value) {
  const labels = {
    concepimento: "concepimento",
    monitoraggio: "monitoraggio del ciclo",
    preconception: "preparazione preconcezionale",
  };
  return labels[value] || "concepimento";
}

function getAgeBand(age) {
  if (age <= 24) return "20-24";
  if (age <= 29) return "25-29";
  if (age <= 34) return "30-34";
  if (age <= 39) return "35-39";
  return "40+";
}

function getFecundability(age) {
  if (age <= 24) return { value: "~25%", text: "Fascia 20-24 anni: fecondabilita mensile mediamente piu favorevole." };
  if (age <= 29) return { value: "~20-25%", text: "Fascia 25-29 anni: aspettative ancora buone con timing corretto." };
  if (age <= 34) return { value: "~15-20%", text: "Fascia 30-34 anni: stima orientativa utile per contestualizzare i tentativi." };
  if (age <= 39) return { value: "~10-15%", text: "Fascia 35-39 anni: timing e consulto precoce diventano piu rilevanti." };
  return { value: "<10%", text: "Oltre i 40 anni e utile confrontarsi presto con lo specialista." };
}

function getRule35Message(age, monthsTrying) {
  if (age >= 35 && monthsTrying >= 6) {
    return "Hai 35 anni o piu e almeno 6 mesi di tentativi mirati: e appropriato suggerire una valutazione specialistica.";
  }
  if (age < 35 && monthsTrying >= 12) {
    return "Hai meno di 35 anni e almeno 12 mesi di tentativi mirati: e appropriato proporre un consulto medico.";
  }
  if (age >= 35) {
    return "Per utenti di 35 anni o piu l'alert scatta dopo 6 mesi di rapporti mirati senza concepimento.";
  }
  return "Per utenti sotto i 35 anni si suggerisce valutazione dopo 12 mesi di rapporti mirati senza concepimento.";
}

function getSymptomMessage(profile) {
  const alerts = [];
  if (profile.irregularCycles) alerts.push("cicli irregolari");
  if (profile.pelvicPain) alerts.push("dolore pelvico cronico");
  if (profile.pelvicInfection) alerts.push("pregresse infezioni pelviche");
  if (!alerts.length) {
    return "Nessun segnale di allarme immediato selezionato. Continua il monitoraggio e rivaluta se compaiono nuovi sintomi.";
  }
  return `Sono presenti segnali di attenzione (${alerts.join(", ")}): l'app dovrebbe suggerire una visita ginecologica tempestiva.`;
}

function getCountdown(profile) {
  if (!profile.lastPeriodDate || !profile.cycleLength) {
    return { title: "Da stimare", text: "Inserisci una data recente di mestruazione per stimare meglio l'ovulazione." };
  }

  const lastPeriod = new Date(profile.lastPeriodDate);
  const ovulationDay = profile.cycleLength - 14;
  const target = new Date(lastPeriod);
  target.setDate(lastPeriod.getDate() + ovulationDay);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays > 1) {
    return { title: `~${diffDays} giorni`, text: "Stima basata sul tuo ciclo medio e sulla data dell'ultima mestruazione." };
  }
  if (diffDays >= 0) {
    return { title: "0-1 giorno", text: "La finestra piu fertile potrebbe essere attiva ora o molto vicina." };
  }
  return { title: "Fase post-ovulatoria", text: "La stima suggerisce che l'ovulazione di questo ciclo possa essere gia avvenuta." };
}

function evaluateFertility() {
  const fertileMucus = ["stretchy", "eggwhite"].includes(state.biomarkers.mucus);
  const wetSensation = ["wet", "lubricative"].includes(state.biomarkers.sensation);
  const showReady =
    state.biomarkers.cervixHeight === "high" &&
    state.biomarkers.cervixTexture === "soft" &&
    state.biomarkers.cervixOpen === "open";

  if (
    state.biomarkers.sensation === "lubricative" &&
    state.biomarkers.mucus === "eggwhite" &&
    state.biomarkers.spinnbarkeit === "yes" &&
    showReady
  ) {
    return {
      status: "peak",
      label: "Massima fertilita",
      headline: "Possibile giorno del picco",
      summary: "Lubrificazione massima, muco chiara d'uovo e cervice SHOW compatibili con picco fertile.",
      billingsTitle: "Possibile Giorno del Picco",
      billingsSummary: "Questo potrebbe essere l'ultimo giorno di massima lubrificazione secondo il Metodo Billings.",
      peakValue: "Oggi o domani",
      peakText: "Segna e conferma nei prossimi giorni se la sensazione fertile termina.",
      caption: "Il picco viene suggerito quando lubrificazione e muco fertile raggiungono il massimo.",
    };
  }

  if ((fertileMucus || wetSensation) && showReady) {
    return {
      status: "high",
      label: "Alta fertilita",
      headline: "Finestra fertile attiva",
      summary: "Muco estrogenico e cervice fertile indicano alta probabilita di essere nella finestra fertile.",
      billingsTitle: "Pattern estrogenico presente",
      billingsSummary: "Il passaggio da asciutto a umido o bagnato suggerisce avvicinamento all'ovulazione.",
      peakValue: "In osservazione",
      peakText: "Monitora se la lubrificazione aumenta nelle prossime 24-48 ore.",
      caption: "L'evoluzione progressiva del muco aiuta a riconoscere il tratto piu fertile del ciclo.",
    };
  }

  return {
    status: "low",
    label: "Bassa fertilita",
    headline: "Fase meno fertile",
    summary: "I segni odierni non suggeriscono un momento di fertilita massima o alta imminenza ovulatoria.",
    billingsTitle: "Pattern non fertile",
    billingsSummary: "Sensazione asciutta o muco non filante rendono meno probabile l'ingresso nella finestra fertile.",
    peakValue: "Non rilevato",
    peakText: "Serve un aumento di lubrificazione per definire un futuro giorno di picco.",
    caption: "I giorni asciutti o con secrezioni non estrogeniche sono tipicamente meno favorevoli alla sopravvivenza spermatica.",
  };
}

function setView(view) {
  document.body.dataset.view = view;
  authScreen.hidden = view !== "auth";
  onboardingScreen.hidden = view !== "onboarding";
}

function persistLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function saveCloud(reason = "manuale") {
  state.profile.lastSavedAt = new Date().toISOString();
  persistLocal();
  saveStatus.textContent = `Salvato ${reason} il ${formatDateTime(state.profile.lastSavedAt)}.`;
  lastSyncValue.textContent = formatDateTime(state.profile.lastSavedAt);

  if (!state.profile.uid) return;

  await setDoc(
    doc(db, "users", state.profile.uid),
    {
      profile: state.profile,
      biomarkers: state.biomarkers,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  saveStatus.textContent = `Sincronizzato su Firebase il ${formatDateTime(state.profile.lastSavedAt)}.`;
}

async function loadCloud(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return;
  const data = snapshot.data();
  state.profile = { ...state.profile, ...(data.profile || {}) };
  state.biomarkers = { ...state.biomarkers, ...(data.biomarkers || {}) };
}

function applyStateToInputs() {
  displayNameInput.value = state.profile.displayName;
  ageInput.value = state.profile.age;
  cycleLengthInput.value = state.profile.cycleLength;
  periodLengthInput.value = state.profile.periodLength;
  lastPeriodInput.value = state.profile.lastPeriodDate;
  monthsTryingInput.value = state.profile.monthsTrying;
  goalInput.value = state.profile.goal;
  themeInput.value = state.profile.theme;
  irregularCyclesInput.checked = state.profile.irregularCycles;
  pelvicPainInput.checked = state.profile.pelvicPain;
  pelvicInfectionInput.checked = state.profile.pelvicInfection;

  sensationInput.value = state.biomarkers.sensation;
  mucusInput.value = state.biomarkers.mucus;
  spinnbarkeitInput.value = state.biomarkers.spinnbarkeit;
  cervixHeightInput.value = state.biomarkers.cervixHeight;
  cervixTextureInput.value = state.biomarkers.cervixTexture;
  cervixOpenInput.value = state.biomarkers.cervixOpen;
}

function collectOnboardingState() {
  state.profile.displayName = displayNameInput.value.trim();
  state.profile.age = Number(ageInput.value || 0);
  state.profile.cycleLength = Number(cycleLengthInput.value || 0);
  state.profile.periodLength = Number(periodLengthInput.value || 0);
  state.profile.lastPeriodDate = lastPeriodInput.value;
  state.profile.monthsTrying = Number(monthsTryingInput.value || 0);
  state.profile.goal = goalInput.value;
  state.profile.theme = themeInput.value;
  state.profile.irregularCycles = irregularCyclesInput.checked;
  state.profile.pelvicPain = pelvicPainInput.checked;
  state.profile.pelvicInfection = pelvicInfectionInput.checked;
  state.profile.onboardingCompleted = true;
}

function collectBiomarkerState() {
  state.biomarkers.sensation = sensationInput.value;
  state.biomarkers.mucus = mucusInput.value;
  state.biomarkers.spinnbarkeit = spinnbarkeitInput.value;
  state.biomarkers.cervixHeight = cervixHeightInput.value;
  state.biomarkers.cervixTexture = cervixTextureInput.value;
  state.biomarkers.cervixOpen = cervixOpenInput.value;
}

function renderApp() {
  document.body.dataset.theme = state.profile.theme || "apricot";

  profileGreeting.textContent = `Ciao, ${state.profile.displayName || "utente"}`;
  syncBadge.textContent = state.profile.googleConnected ? "Google collegato" : "Non collegato";
  accountSummary.textContent = state.profile.googleConnected
    ? `Account Google attivo${state.profile.googleEmail ? `: ${state.profile.googleEmail}` : ""}.`
    : "Accedi con Google per sincronizzare il diario.";

  heroTitle.textContent = `${state.profile.displayName || "Tu"}, ecco il tuo quadro fertile di oggi.`;
  heroDescription.textContent = `Focus su ${goalLabel(state.profile.goal)}, con stime personalizzate usando eta, ciclo medio, ultima mestruazione e segnali di attenzione.`;

  lastPeriodValue.textContent = formatDate(state.profile.lastPeriodDate);
  cycleValue.textContent = `${state.profile.cycleLength || "--"} giorni`;
  lastSyncValue.textContent = formatDateTime(state.profile.lastSavedAt);

  const countdown = getCountdown(state.profile);
  ovulationCountdown.textContent = countdown.title;
  countdownText.textContent = countdown.text;

  const fecundability = getFecundability(state.profile.age);
  fecundabilityValue.textContent = fecundability.value;
  fecundabilityText.textContent = fecundability.text;

  const fertility = evaluateFertility();
  statusRing.className = `status-ring ${fertility.status === "high" ? "" : fertility.status}`.trim();
  statusLabel.textContent = fertility.label;
  fertilityHeadline.textContent = fertility.headline;
  fertilitySummary.textContent = fertility.summary;
  billingsTitle.textContent = fertility.billingsTitle;
  billingsSummary.textContent = fertility.billingsSummary;
  peakDayValue.textContent = fertility.peakValue;
  peakDayText.textContent = fertility.peakText;
  peakCaption.textContent = fertility.caption;

  rule35Text.textContent = getRule35Message(state.profile.age, state.profile.monthsTrying);
  symptomText.textContent = getSymptomMessage(state.profile);
  profileClinicalText.textContent = `Profilo attuale: ${getAgeBand(state.profile.age)} anni, ciclo medio ${state.profile.cycleLength} giorni, mestruazione media ${state.profile.periodLength} giorni.`;

  const urgent = state.profile.irregularCycles || state.profile.pelvicPain || state.profile.pelvicInfection;
  const thresholdReached =
    (state.profile.age >= 35 && state.profile.monthsTrying >= 6) ||
    (state.profile.age < 35 && state.profile.monthsTrying >= 12);

  if (urgent) {
    supportAlert.className = "alert-box danger";
    supportAlert.textContent = "Segnali di allarme presenti: e consigliabile una visita medica senza attendere altri mesi.";
  } else if (thresholdReached) {
    supportAlert.className = "alert-box warning";
    supportAlert.textContent = getRule35Message(state.profile.age, state.profile.monthsTrying);
  } else {
    supportAlert.className = "alert-box";
    supportAlert.textContent = "Nessun alert specialistico immediato. Continua monitoraggio e stile di vita preconcezionale.";
  }
}

function validateOnboarding() {
  if (!displayNameInput.value.trim()) return "Inserisci il nome visualizzato.";
  if (!ageInput.value) return "Inserisci la tua eta.";
  if (!cycleLengthInput.value) return "Inserisci la lunghezza media del ciclo.";
  if (!periodLengthInput.value) return "Inserisci la durata media della mestruazione.";
  if (!lastPeriodInput.value) return "Inserisci la data dell'ultima mestruazione.";
  return "";
}

googleConnectButton.addEventListener("click", async () => {
  if (isFileProtocol()) {
    authStatus.textContent =
      "Apri l'app da http://localhost o da un dominio autorizzato Firebase: il login Google non funziona da file://.";
    return;
  }

  authStatus.textContent = "Accesso in corso...";
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    authStatus.textContent = getAuthErrorMessage(error);
  }
});

logoutButton.addEventListener("click", async () => {
  await signOut(auth);
});

onboardingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = validateOnboarding();
  if (error) {
    onboardingStatus.textContent = error;
    return;
  }

  collectOnboardingState();
  renderApp();

  try {
    await saveCloud("onboarding");
    onboardingStatus.textContent = "Profilo iniziale salvato.";
    setView("app");
  } catch {
    onboardingStatus.textContent = "Profilo salvato localmente, ma la sincronizzazione cloud non e riuscita.";
    setView("app");
  }
});

biomarkerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  collectBiomarkerState();
  renderApp();

  try {
    await saveCloud("osservazioni");
  } catch {
    saveStatus.textContent = "Osservazioni salvate localmente, ma il cloud non e raggiungibile.";
  }
});

[saveDataButton, mobileSaveButton].forEach((button) => {
  button.addEventListener("click", async () => {
    collectBiomarkerState();
    renderApp();

    try {
      await saveCloud("manuale");
    } catch {
      saveStatus.textContent = "Salvataggio locale completato, sincronizzazione cloud non riuscita.";
    }
  });
});

editProfileButton.addEventListener("click", () => {
  applyStateToInputs();
  onboardingStatus.textContent = "Aggiorna i dati personali che influenzano i calcoli e salva di nuovo.";
  setView("onboarding");
});

document.querySelectorAll("#biomarkerForm select").forEach((field) => {
  field.addEventListener("change", () => {
    collectBiomarkerState();
    renderApp();
  });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    state.profile = { ...defaultState.profile };
    state.biomarkers = { ...defaultState.biomarkers };
    persistLocal();
    authStatus.textContent = "Nessuna sessione attiva.";
    setView("auth");
    return;
  }

  state.profile.googleConnected = true;
  state.profile.googleEmail = user.email || "";
  state.profile.uid = user.uid;
  state.profile.displayName = state.profile.displayName || user.displayName || "";

  try {
    await loadCloud(user.uid);
  } catch {
    authStatus.textContent = "Login riuscito, ma il recupero dati cloud non e andato a buon fine.";
  }

  if (!state.profile.displayName && user.displayName) {
    state.profile.displayName = user.displayName;
  }

  applyStateToInputs();
  renderApp();

  if (state.profile.onboardingCompleted) {
    authStatus.textContent = `Benvenuta, ${state.profile.displayName || "utente"}.`;
    setView("app");
  } else {
    onboardingStatus.textContent = "Completa i dati iniziali per sbloccare la dashboard.";
    setView("onboarding");
  }
});

function getAuthErrorMessage(error) {
  const code = error?.code || "";
  const rawMessage = error?.message || "";

  if (code === "auth/unauthorized-domain") {
    return "Dominio non autorizzato in Firebase. Aggiungi il dominio attuale tra gli Authorized domains.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Provider Google non attivo in Firebase Authentication. Abilitalo nella console Firebase.";
  }

  if (code === "auth/popup-blocked") {
    return "Il browser ha bloccato il popup di Google. Consenti i popup per questo sito e riprova.";
  }

  if (code === "auth/cancelled-popup-request") {
    return "Richiesta popup annullata. Chiudi eventuali popup aperti e riprova con un solo tocco sul pulsante Google.";
  }

  if (code === "auth/popup-closed-by-user") {
    return "La finestra di accesso e stata chiusa prima del completamento.";
  }

  if (code === "auth/operation-not-supported-in-this-environment") {
    return "Questo browser o contesto non supporta il login popup Firebase. Prova da Chrome, Safari o Firefox aperti normalmente.";
  }

  if (code === "auth/web-storage-unsupported") {
    return "Il browser sta bloccando il web storage necessario per il login Firebase.";
  }

  if (code === "auth/network-request-failed") {
    return "Errore di rete durante il login Google. Controlla connessione e configurazione Firebase.";
  }

  const details = code ? ` (${code})` : "";
  const suffix = rawMessage ? ` Dettaglio: ${rawMessage}` : "";
  return `Accesso Google non riuscito${details}. Controlla provider Google, popup e dominio autorizzato.${suffix}`;
}

if (isFileProtocol()) {
  authStatus.textContent =
    "Questa pagina e aperta come file locale. Per usare Google login avviala con un server locale, ad esempio http://localhost:8000.";
}
