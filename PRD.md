# Product Requirements Document (PRD) - KiddyAssess

## 1. Product Overview
KiddyAssess is a specialized web application designed for kindergarten teachers to manage student assessments and generate progress reports efficiently. It leverages Gemini AI to transform indicator scores into professional narratives.

## 2. Target Audience
Kindergarten (TK) and Early Childhood (PAUD) teachers who need to generate high-quality end-of-semester reports.

## 3. Core Features & Functional Requirements

### 3.1. Assessment Management
- Track development across 3 core aspects defined in `ASPECTS` constants:
  1. **Nilai Agama dan Moral**
  2. **Fisik Motorik**
  3. **Kognitif**
- 20 indicators per aspect with a 4-point scale:
  - **BB** (Belum Berkembang)
  - **MB** (Mulai Berkembang)
  - **BSH** (Sesuai Harapan)
  - **BSB** (Sangat Baik)

### 3.2. Evidence & Documentation
- Upload documentation photos for each development aspect.
- Display up to 3 evidence photos per aspect in the final report with specific layouts.

### 3.3. AI Narrative Engine
- Integrated with **Gemini 3.1 Flash Lite** for generating progress narratives.
- Narratives are automatically justified and formatted to maintain professional aesthetics.
- Supports independent narrative generation per aspect.

### 3.4. Professional PDF Generator
- **Structure**: 1 page dedicated to 1 aspect (Total 3 pages per student report).
- **Margins**: Optimized for print (Horizontal: 18-22mm, Vertical: 25-30mm).
- **Branding**: Supports custom school logo (base64 encoded for stability), school name, and signatures.
- **Quality**: 3.0x scale capture for high-fidelity text and image reproduction in exports.
- **Page Breaks**: Strictly avoids page breaks within an aspect to keep the 1-page-per-aspect rule.

## 4. Design Guidelines
- **UI Identity**: "Weather App" style - clean, informative, using glassmorphism and modern icons (Lucide).
- **Typography**: Professional sans-serif with strong hierarchy.
- **Avoidance**: No emojis or default generic icons; custom-tailored visual assets.

## 5. Technical Specification
- **Frontend**: React 19 + Tailwind CSS 4.
- **Backend/API**: Express.js proxy for Gemini API.
- **Storage**: Dexie.js (IndexedDB) for offline-first local data.
- **PDF Core**: html2canvas + jsPDF.

## 6. Resolved Bugs (Bug Hunter Phase)
- **PDF Image Loss**: Fixed by pre-converting all assets (logo & evidence) to Base64 before capture.
- **Margin Issues**: Corrected tight margins to meet standard A4/F4 printing requirements.
- **SDK Compatibility**: Updated server-side Gemini implementation to match the latest `@google/genai` patterns.
- **State Stability**: Replaced dangerous data clearing with `bulkPut` for persistent storage updates.
- **Text Overflow**: Implemented `maxHeight` on narratives to ensure content stays within the physical page boundary.
