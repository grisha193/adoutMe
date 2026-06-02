import React from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import AboutSection from './components/AboutSection.jsx';
import WorkSection from './components/WorkSection.jsx';
import AiSummary from './components/AiSummary.jsx';
import CasesSection from './components/CasesSection.jsx';
import ContactSection from './components/ContactSection.jsx';

function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <AboutSection />
        <WorkSection />
        <AiSummary />
        <CasesSection />
        <ContactSection />
      </main>
    </>
  );
}

export default App;
