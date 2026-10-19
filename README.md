# MRD Flashcards — German Vocabulary for Meta Ray-Ban Display

A high-performance vocabulary flashcard web app specifically crafted for **Meta Ray-Ban Display** smart glasses and the **Meta Neural Band**, built with Meta's official Wearables UI Toolkit (`@wearables-ui-toolkit/mrbd`).

**Live App**: [https://mrd-flashcards.vercel.app](https://mrd-flashcards.vercel.app)

---

## Features

- **Goethe-Zertifikat Curriculum**: Practice German-to-English vocabulary from authentic Goethe Institute B1 and B2 exam word lists.
- **Intelligent Spaced Reinforcement**:
  - **Swipe Right / Know It**: Marks card as mastered, removing it permanently from future study queues.
  - **Swipe Left / Reveal & Review**:
    - **1st action**: Flips card to show English translation and real-world example sentence.
    - **2nd action**: Re-queues the card 3 positions ahead for immediate retention reinforcement.
- **Multimodal Wearable Controls**:
  - **Meta Neural Band**: Direct wrist-flick / D-pad side-swipe gestures translated to capture-phase `ArrowLeft` / `ArrowRight`.
  - **IMU Sensor Gestures**: Fast hand / device flicks (`devicemotion` lateral acceleration) and tilt angles (`deviceorientation`) for hands-free swipe control.
  - **Pointer Drag**: Desktop mouse and touch swipe fallback.
  - **Pinch / Enter**: Native UI Toolkit button activation.
- **Adaptive 600×600 Additive Display**: Rendered with optimal contrast and transparency tokens for smart eyewear optics.

---

## Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run glasses preview with performance / viewport simulation
npm run preview

# Validate UI Toolkit structure and run test gate
node .agents/skills/ai-glasses-webapp-ui/scripts/validate-ui-toolkit.mjs .
node .agents/skills/ai-glasses-webapp-test/scripts/check-webapp.mjs .
```
