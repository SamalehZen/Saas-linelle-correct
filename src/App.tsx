"use client";

import { useState, useRef } from "react";
import { ArrowRight, Menu, X, Zap, Download, Copy, Upload, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { libelleProcessor, type LibelleResult } from "@/lib/libelle-processor";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<LibelleResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"bulk" | "realtime">("realtime");
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exemples prédéfinis
  const exemples = [
    "6X30G CHIPS LISSE NAT CRF CLAS",
    "1L PET PUR JUS POMME CRF EXTRA",
    "PAPERMATE 4 Magic+ effaceurs fins réécr",
    "Désodorisant 2.5ml 4scent",
    "5 BQ ALU 1,5L PROFONDE",
    "CRF Bio 500g Quinoa rouge",
    "Shampoing L'Oréal 250ML doux"
  ];

  const chargerExemples = () => {
    setInputText(exemples.join('\n'));
  };

  const effacerTout = () => {
    setInputText('');
    setResults([]);
  };

  // Traitement en temps réel
  const handleRealtimeProcess = async () => {
    if (!inputText.trim()) return;
    
    const libelles = inputText.split('\n').filter(line => line.trim());
    if (libelles.length === 0) return;

    setIsProcessing(true);
    setResults([]);

    await libelleProcessor.traiterLibellesAvecStreaming(
      libelles,
      (currentResults) => {
        setResults(currentResults);
      }
    );
    
    setIsProcessing(false);
  };

  // Copier les résultats
  const copyResults = () => {
    const csvContent = ["Libellé Original\tLibellé Corrigé"]
      .concat(results.map(r => `${r.original}\t${r.corrected}`))
      .join('\n');
    navigator.clipboard.writeText(csvContent);
    
    // Afficher le toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Télécharger les résultats
  const downloadResults = () => {
    const csvContent = ["Libellé Original,Libellé Corrigé"]
      .concat(results.map(r => `"${r.original}","${r.corrected}"`))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libelles_corriges.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Gradient background with grain effect */}
      <div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0">
        <div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-purple-600 to-sky-600"></div>
        <div className="h-[10rem] rounded-full w-[90rem] z-1 bg-gradient-to-b blur-[6rem] from-pink-900 to-yellow-400"></div>
        <div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-yellow-600 to-sky-500"></div>
      </div>
      <div className="absolute inset-0 z-0 bg-noise opacity-30"></div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" />
            Résultats copiés dans le presse-papiers !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between px-4 py-4 mt-6">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <Zap className="h-5 w-5" />
            </div>
            <span className="ml-2 text-xl font-bold text-white">L'HyperFix</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <NavItem label="Correction" />
              <NavItem label="Règles" />
              <NavItem label="API" />
              <NavItem label="Support" />
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 md:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">
                    L'HyperFix
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-8 flex flex-col space-y-6">
                <MobileNavItem label="Correction" />
                <MobileNavItem label="Règles" />
                <MobileNavItem label="API" />
                <MobileNavItem label="Support" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">
            Correction de libellés en temps réel
          </span>
          <ArrowRight className="h-4 w-4 text-white" />
        </div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Correction <span className="text-gradient">Intelligente</span> de Libellés d'Articles
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Nettoyez, normalisez et reformatez vos libellés automatiquement selon les règles professionnelles. Streaming en temps réel pour un traitement fluide.
          </p>

          {/* Main Interface */}
          <div className="mx-auto mt-16 max-w-6xl">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Interface de Correction</CardTitle>
                  <div className="flex gap-2">
                    <Badge 
                      variant={activeTab === "realtime" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveTab("realtime")}
                    >
                      Temps Réel
                    </Badge>
                    <Badge 
                      variant={activeTab === "bulk" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveTab("bulk")}
                    >
                      Traitement en Lot
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input Area */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Libellés à corriger (un par ligne)
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={chargerExemples}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Exemples
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importer
                      </Button>
                      {(inputText || results.length > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          onClick={effacerTout}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Effacer
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Collez vos libellés ici, un par ligne...&#10;&#10;Exemples:&#10;• 6X30G CHIPS LISSE NAT CRF CLAS&#10;• 1L PET PUR JUS POMME CRF EXTRA&#10;• PAPERMATE 4 Magic+ effaceurs fins réécr&#10;• Désodorisant 2.5ml 4scent"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[140px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 custom-scrollbar"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setInputText(e.target?.result as string);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>

                {/* Process Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleRealtimeProcess}
                    disabled={!inputText.trim() || isProcessing}
                    className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Zap className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <Zap className="h-5 w-5 mr-2" />
                    )}
                    {isProcessing ? "Correction en cours..." : "Corriger les Libellés"}
                  </Button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Separator className="bg-white/20" />
                    
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Résultats ({results.length} libellés)
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyResults}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadResults}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger CSV
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                      {results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Original</p>
                            <p className="text-white break-words">{result.original}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Corrigé</p>
                            {result.isProcessing ? (
                              <div className="flex items-center text-yellow-400">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="mr-2"
                                >
                                  <Zap className="h-4 w-4" />
                                </motion.div>
                                Traitement...
                              </div>
                            ) : (
                              <p className="text-green-400 break-words font-medium">{result.corrected}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mx-auto mt-20 max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-yellow-400" />}
              title="Traitement Temps Réel"
              description="Correction fluide avec streaming visuel pour un feedback immédiat"
            />
            <FeatureCard
              icon={<Settings className="h-8 w-8 text-blue-400" />}
              title="Règles Professionnelles"
              description="Respect des standards de normalisation des libellés d'articles"
            />
            <FeatureCard
              icon={<Download className="h-8 w-8 text-green-400" />}
              title="Export Multi-Format"
              description="Téléchargement en CSV, TSV et Excel pour intégration facile"
            />
          </div>

          {/* Rules Section */}
          <div className="mx-auto mt-20 max-w-4xl">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center">Règles de Correction Appliquées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Nettoyage</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Suppression des accents et caractères spéciaux
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Conservation des virgules uniquement
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        Normalisation des espaces multiples
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Grammages/Volumes</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Remplacement points par virgules (1.5L → 1,5L)
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Conservation des fractions (1/2L en dernière position)
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Détection formats: KG, G, L, ML, CL
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Structure</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Ordre: MARQUE + PRODUIT + GRAMMAGE
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Marques reconnues: CRF, CARREFOUR, PAPERMATE...
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        Conversion en MAJUSCULES
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Exemples</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-white/5 rounded border border-white/10">
                        <p className="text-gray-400">Avant:</p>
                        <p className="text-white">6X30g chips lissé nat. CRF clas</p>
                        <p className="text-gray-400 mt-1">Après:</p>
                        <p className="text-green-400">CRF CHIPS LISSE NAT CLAS 6X30G</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <footer className="mx-auto mt-20 max-w-4xl text-center pb-10">
            <Separator className="bg-white/20 mb-8" />
            <div className="flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm">
              <div className="flex items-center mb-4 md:mb-0">
                <Zap className="h-4 w-4 mr-2" />
                <span>L'HyperFix - Correction de Libellés Professionnelle</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Powered by Scout AI</span>
                <span>•</span>
                <span>Version 1.0</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  label,
  hasDropdown,
}: {
  label: string;
  hasDropdown?: boolean;
}) {
  return (
    <div className="flex items-center text-sm text-gray-300 hover:text-white cursor-pointer">
      <span>{label}</span>
      {hasDropdown && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </div>
  );
}

function MobileNavItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white">
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {icon}
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
}