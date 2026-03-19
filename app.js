const form = document.querySelector("#biomarkerForm");
const statusRing = document.querySelector("#statusRing");
const statusLabel = document.querySelector("#statusLabel");
const fertilityHeadline = document.querySelector("#fertilityHeadline");
const fertilitySummary = document.querySelector("#fertilitySummary");
const ovulationCountdown = document.querySelector("#ovulationCountdown");
const billingsTitle = document.querySelector("#billingsTitle");
const billingsSummary = document.querySelector("#billingsSummary");
const supportAlert = document.querySelector("#supportAlert");
const fecundabilityValue = document.querySelector("#fecundabilityValue");
const fecundabilityText = document.querySelector("#fecundabilityText");
const peakDayValue = document.querySelector("#peakDayValue");
const peakDayText = document.querySelector("#peakDayText");
const rule35Text = document.querySelector("#rule35Text");
const symptomText = document.querySelector("#symptomText");
const peakCaption = document.querySelector("#peakCaption");

const ageInput = document.querySelector("#ageInput");
const monthsTryingInput = document.querySelector("#monthsTryingInput");
const sensationInput = document.querySelector("#sensationInput");
const mucusInput = document.querySelector("#mucusInput");
const spinnbarkeitInput = document.querySelector("#spinnbarkeitInput");
const cervixHeightInput = document.querySelector("#cervixHeightInput");
const cervixTextureInput = document.querySelector("#cervixTextureInput");
const cervixOpenInput = document.querySelector("#cervixOpenInput");
const irregularCyclesInput = document.querySelector("#irregularCyclesInput");
const pelvicPainInput = document.querySelector("#pelvicPainInput");
const pelvicInfectionInput = document.querySelector("#pelvicInfectionInput");

function getFecundability(age) {
  if (age <= 24) {
    return {
      value: "~25%",
      text: "Stima orientativa per 20-24 anni: buona fecondabilita mensile in assenza di fattori limitanti.",
    };
  }

  if (age <= 29) {
    return {
      value: "~20-25%",
      text: "Stima orientativa per 25-29 anni, utile per contestualizzare tempi e aspettative.",
    };
  }

  if (age <= 34) {
    return {
      value: "~15-20%",
      text: "Stima orientativa per 30-34 anni, con probabilita ancora favorevole ma meno elevata.",
    };
  }

  if (age <= 39) {
    return {
      value: "~10-15%",
      text: "Stima orientativa per 35-39 anni: il timing dei rapporti e il consulto precoce diventano piu importanti.",
    };
  }

  return {
    value: "<10%",
    text: "Stima orientativa oltre i 40 anni: e consigliabile pianificare un confronto medico tempestivo.",
  };
}

function evaluateFertility(inputs) {
  const fertileMucus = ["stretchy", "eggwhite"].includes(inputs.mucus);
  const wetSensation = ["wet", "lubricative"].includes(inputs.sensation);
  const showReady = inputs.cervixHigh && inputs.cervixSoft && inputs.cervixOpen;

  if (inputs.sensation === "lubricative" && inputs.mucus === "eggwhite" && inputs.spinnbarkeit && showReady) {
    return {
      status: "peak",
      label: "Massima fertilita",
      headline: "Picco fertile oggi",
      summary:
        "Massima lubrificazione, muco tipo chiara d'uovo e cervice SHOW compatibile con giorno di picco o ovulazione imminente.",
      countdown: "0-1 giorno",
      billingsTitle: "Possibile Giorno del Picco",
      billingsSummary:
        "Secondo il Metodo Billings, questo potrebbe essere l'ultimo giorno di massima lubrificazione. Confermare con il pattern dei prossimi giorni.",
      peakValue: "Oggi o domani",
      peakText: "Segna questo giorno come possibile ultimo giorno di massima lubrificazione.",
      caption:
        "Il picco viene suggerito quando la lubrificazione raggiunge il massimo con muco chiaro, elastico e cervice fertile.",
    };
  }

  if ((fertileMucus || wetSensation) && showReady) {
    return {
      status: "high",
      label: "Alta fertilita",
      headline: "Giorno fertile attivo",
      summary:
        "Muco estrogenico e segni cervicali favorevoli indicano alta probabilita di essere nella finestra fertile di 6 giorni.",
      countdown: "~1-2 giorni",
      billingsTitle: "Pattern estrogenico presente",
      billingsSummary:
        "Il passaggio da asciutto a umido o bagnato, insieme a muco filante, suggerisce l'avvicinamento all'ovulazione.",
      peakValue: "In osservazione",
      peakText: "Monitorare se la lubrificazione aumenta ancora nelle prossime 24-48 ore.",
      caption:
        "L'aumento progressivo della qualita del muco aiuta a riconoscere la parte piu fertile del ciclo prima del picco.",
    };
  }

  return {
    status: "low",
    label: "Bassa fertilita",
    headline: "Fase pre o post fertile",
    summary:
      "L'assenza di muco fertile e di una cervice SHOW completa suggerisce una probabilita piu bassa di ovulazione imminente.",
    countdown: ">3 giorni o fase post-ovulatoria",
    billingsTitle: "Pattern non fertile",
    billingsSummary:
      "Sensazione asciutta o muco non filante rendono meno probabile l'ingresso nella finestra fertile, salvo variazioni nei prossimi giorni.",
    peakValue: "Non rilevato",
    peakText: "Serve un aumento di lubrificazione per definire un futuro giorno di picco.",
    caption:
      "I giorni asciutti o con secrezioni non estrogeniche sono tipicamente meno favorevoli alla sopravvivenza spermatica.",
  };
}

function getRule35Message(age, monthsTrying) {
  if (age >= 35 && monthsTrying >= 6) {
    return "Hai 35 anni o piu e riferisci almeno 6 mesi di tentativi: e appropriato suggerire una valutazione specialistica.";
  }

  if (age < 35 && monthsTrying >= 12) {
    return "Hai meno di 35 anni e riferisci almeno 12 mesi di tentativi mirati: e appropriato proporre un consulto medico.";
  }

  if (age >= 35) {
    return "Per utenti di 35 anni o piu l'alert scatta dopo 6 mesi di rapporti mirati senza concepimento.";
  }

  return "Per utenti sotto i 35 anni si suggerisce valutazione dopo 12 mesi di rapporti mirati senza concepimento.";
}

function getSymptomMessage(flags) {
  const alerts = [];

  if (flags.irregularCycles) alerts.push("cicli irregolari");
  if (flags.pelvicPain) alerts.push("dolore pelvico cronico");
  if (flags.pelvicInfection) alerts.push("pregresse infezioni pelviche");

  if (alerts.length) {
    return `Sono presenti segnali di attenzione (${alerts.join(", ")}): la app dovrebbe suggerire una visita ginecologica tempestiva.`;
  }

  return "Nessun segnale di allarme immediato selezionato. Continuare comunque a rivalutare in presenza di spotting anomalo o cicli molto irregolari.";
}

function updateUI() {
  const age = Number(ageInput.value || 0);
  const monthsTrying = Number(monthsTryingInput.value || 0);
  const fertility = evaluateFertility({
    sensation: sensationInput.value,
    mucus: mucusInput.value,
    spinnbarkeit: spinnbarkeitInput.value === "yes",
    cervixHigh: cervixHeightInput.value === "high",
    cervixSoft: cervixTextureInput.value === "soft",
    cervixOpen: cervixOpenInput.value === "open",
  });

  const fecundability = getFecundability(age);
  const symptoms = {
    irregularCycles: irregularCyclesInput.checked,
    pelvicPain: pelvicPainInput.checked,
    pelvicInfection: pelvicInfectionInput.checked,
  };

  statusRing.className = `status-ring ${fertility.status === "high" ? "" : fertility.status}`.trim();
  statusLabel.textContent = fertility.label;
  fertilityHeadline.textContent = fertility.headline;
  fertilitySummary.textContent = fertility.summary;
  ovulationCountdown.textContent = fertility.countdown;
  billingsTitle.textContent = fertility.billingsTitle;
  billingsSummary.textContent = fertility.billingsSummary;
  peakDayValue.textContent = fertility.peakValue;
  peakDayText.textContent = fertility.peakText;
  peakCaption.textContent = fertility.caption;

  fecundabilityValue.textContent = fecundability.value;
  fecundabilityText.textContent = fecundability.text;
  rule35Text.textContent = getRule35Message(age, monthsTrying);
  symptomText.textContent = getSymptomMessage(symptoms);

  const urgent = symptoms.irregularCycles || symptoms.pelvicPain || symptoms.pelvicInfection;
  const thresholdReached = (age >= 35 && monthsTrying >= 6) || (age < 35 && monthsTrying >= 12);

  if (urgent) {
    supportAlert.className = "alert-box danger";
    supportAlert.textContent =
      "Segnali di allarme presenti: l'app dovrebbe consigliare una visita medica immediata senza attendere il limite dei mesi di tentativi.";
    return;
  }

  if (thresholdReached) {
    supportAlert.className = "alert-box warning";
    supportAlert.textContent = getRule35Message(age, monthsTrying);
    return;
  }

  supportAlert.className = "alert-box";
  supportAlert.textContent = "Nessun alert specialistico immediato. Continuare monitoraggio e stile di vita preconcezionale.";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateUI();
});

document.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("change", updateUI);
});

updateUI();
