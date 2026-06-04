import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CurriculumProvider } from "./context/CurriculumContext";
import { SchoolProfileProvider } from "./context/SchoolProfileContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAppAuth } from "./hooks/useAppAuth";
import { useAppData } from "./hooks/useAppData";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { LandingPage } from "./components/organisms/LandingPage";
import { AuthenticatedApp } from "./components/organisms/AuthenticatedApp";
import { ErrorBoundary } from "./components/atoms/ErrorBoundary";

export default function RootApp() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <SchoolProfileProvider>
            <CurriculumProvider>
              <App />
              <Toaster position="bottom-right" />
            </CurriculumProvider>
          </SchoolProfileProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  const { user, authLoading } = useAppAuth();
  const appData = useAppData(user);
  const navigation = useAppNavigation();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (authLoading) return null;
  if (!user) return <LandingPage />;

  return (
    <AuthenticatedApp 
        appData={appData} 
        navigation={navigation} 
        showSplash={showSplash} 
    />
  );
}
