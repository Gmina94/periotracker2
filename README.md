# Concepimento Companion

Prototype web app for fertility awareness, preconception wellness, and support-oriented reproductive health tracking.

This project was designed as a front-end concept for a conception support app that helps users:

- identify the fertile window
- log cervical mucus observations using Billings-inspired inputs
- track cervical changes using the SHOW model
- view simple analytics for mucus patterns, BBT, and hormone trends
- follow preconception lifestyle guidance
- receive support alerts based on age, months trying, and warning signs

## Project Structure

- `index.html`: main app layout and all dashboard sections
- `styles.css`: visual system, responsive layout, cards, charts, and UI styling
- `app.js`: client-side interaction logic for fertility state, rule-of-35 alerts, and personalized messaging

## Included Sections

### Dashboard

- real-time fertility status
- ovulation countdown
- age-based monthly fecundability estimate
- automatic peak day messaging

### Logger

- vulvar sensation input
- cervical mucus appearance input
- spinnbarkeit tracking
- cervix position, texture, and openness
- irregular cycles / pelvic pain / pelvic infection flags

### Analytics

- cervical mucus progression chart
- BBT shift visualization
- estimated hormone trend bands

### Lifestyle & Wellness

- folic acid checklist
- sleep and exercise reminders
- Mediterranean diet guidance
- toxin risk reminders

### Diagnostic Support

- rule of 35 logic
- symptom-based early referral suggestions
- medical export concept area

## Clinical Positioning

This is an educational/demo prototype and not a medical device. It is intended to support awareness and conversation, not replace professional medical advice.

## How to Run

Because this is a static front-end project, you can open `index.html` directly in a browser.

If you prefer serving it locally:

```bash
cd "/Users/gelsominanardo/Desktop/Period tracker v2"
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Next Possible Improvements

- migrate to React or Vite
- persist user data in local storage or a backend
- add true cycle history and BBT charting
- generate PDF medical summaries
- add multilingual support
- connect notifications and recurring reminders

