/**
 * Processeur de libellés basé sur la logique Python
 * Adapte les règles de traitement des libellés d'articles
 */

export interface LibelleResult {
  original: string;
  corrected: string;
  isProcessing?: boolean;
}

export class LibelleProcessor {
  private marques = ['CRF', 'CARF', 'CARREFOUR', 'PAPERMATE', 'PM', 'SHARPIE', 'ROTRING'];

  /**
   * Supprime les accents et caractères spéciaux, garde seulement les virgules
   */
  private supprimerAccentsEtCaracteresSpeciaux(texte: string): string {
    // Normaliser les caractères Unicode (décomposer les accents)
    const normalise = texte.normalize('NFD');
    // Supprimer les marques diacritiques (accents)
    const sansAccents = normalise.replace(/[\u0300-\u036f]/g, '');
    // Garder seulement les lettres, chiffres, espaces, virgules et quelques caractères autorisés
    const nettoye = sansAccents.replace(/[^A-Za-z0-9\s,./X+-]/g, ' ');
    // Nettoyer les espaces multiples
    return nettoye.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extrait la marque du libellé
   */
  private extraireMarque(texte: string): string | null {
    const texteMajuscule = texte.toUpperCase();
    
    for (const marque of this.marques) {
      const regex = new RegExp(`\\b${marque.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (regex.test(texteMajuscule)) {
        return marque;
      }
    }
    return null;
  }

  /**
   * Extrait le grammage/volume du texte de manière très précise
   */
  private extraireGrammageVolume(texte: string): string[] {
    const texteMajuscule = texte.toUpperCase();
    const grammagesVolumes: string[] = [];
    
    // Pattern 1: Grammages/volumes avec décimales
    const pattern1 = /\b\d+[.,]\d+\s*(?:KG|G|L|ML|CL)\b/g;
    let matches1 = texteMajuscule.match(pattern1);
    if (matches1) {
      for (const match of matches1) {
        const nettoye = match.replace(/(\d+)\.(\d+)/, '$1,$2');
        grammagesVolumes.push(nettoye);
      }
    }
    
    // Pattern 2: Format X multiplicateur avec grammage
    const pattern2 = /\b\d+X\d+[.,]?\d*\s*(?:KG|G|L|ML|CL)\b/g;
    let matches2 = texteMajuscule.match(pattern2);
    if (matches2) {
      for (const match of matches2) {
        const nettoye = match.replace(/(\d+)\.(\d+)/, '$1,$2');
        grammagesVolumes.push(nettoye);
      }
    }
    
    // Pattern 3: Grammages/volumes simples (>=10 pour éviter faux positifs)
    const pattern3 = /\b(?:[1-9]\d{2,}|[1-9]\d)\s*(?:KG|G|L|ML|CL)\b/g;
    let matches3 = texteMajuscule.match(pattern3);
    if (matches3) {
      grammagesVolumes.push(...matches3);
    }
    
    // Pattern 4: Petits grammages/volumes (1-9) avec validation de contexte
    const pattern4 = /(?:^|\s)([1-9])\s*(KG|G|L|ML|CL)\b/g;
    let match4;
    while ((match4 = pattern4.exec(texteMajuscule)) !== null) {
      grammagesVolumes.push(match4[1] + match4[2]);
    }
    
    // Pattern 5: Fractions avec unité
    const pattern5 = /\b\d+\/\d+\s*(?:KG|G|L|ML|CL)\b/g;
    let matches5 = texteMajuscule.match(pattern5);
    if (matches5) {
      grammagesVolumes.push(...matches5);
    }
    
    // Pattern 6: Fractions sans unité
    const pattern6 = /\b\d+\/\d+\b/g;
    let matches6 = texteMajuscule.match(pattern6);
    if (matches6) {
      for (const match of matches6) {
        if (!grammagesVolumes.some(gv => gv.includes(match))) {
          grammagesVolumes.push(match);
        }
      }
    }
    
    // Supprimer les doublons
    return [...new Set(grammagesVolumes)];
  }

  /**
   * Traite un libellé selon les règles définies
   */
  public traiterLibelle(libelleOriginal: string): string {
    if (!libelleOriginal.trim()) return '';

    // Étape 1: Nettoyer les caractères spéciaux
    const nettoye = this.supprimerAccentsEtCaracteresSpeciaux(libelleOriginal);
    
    // Étape 2: Extraire la marque
    const marque = this.extraireMarque(nettoye);
    
    // Étape 3: Extraire grammages/volumes
    const grammagesVolumes = this.extraireGrammageVolume(nettoye);
    
    // Étape 4: Construire le nom du produit (sans marque ni grammage/volume)
    let nomProduit = nettoye;
    
    // Supprimer la marque
    if (marque) {
      const regex = new RegExp(`\\b${marque.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      nomProduit = nomProduit.replace(regex, '');
    }
    
    // Supprimer les grammages/volumes
    for (const gv of grammagesVolumes) {
      const gvAvecPoint = gv.replace(',', '.');
      const regex1 = new RegExp(`\\b${gv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const regex2 = new RegExp(`\\b${gvAvecPoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      nomProduit = nomProduit.replace(regex1, '');
      nomProduit = nomProduit.replace(regex2, '');
    }
    
    nomProduit = nomProduit.replace(/\s+/g, ' ').trim();
    
    // Étape 5: Assembler le libellé final
    const partiesFinales: string[] = [];
    
    if (marque) {
      partiesFinales.push(marque);
    }
    
    if (nomProduit) {
      partiesFinales.push(nomProduit);
    }
    
    partiesFinales.push(...grammagesVolumes);
    
    const libelleFinal = partiesFinales.join(' ').toUpperCase();
    return libelleFinal.replace(/\s+/g, ' ').trim();
  }

  /**
   * Traite une liste de libellés de manière asynchrone pour simuler le streaming
   */
  public async traiterLibellesAvecStreaming(
    libelles: string[],
    onProgress: (results: LibelleResult[], index: number) => void
  ): Promise<LibelleResult[]> {
    const results: LibelleResult[] = libelles.map(libelle => ({
      original: libelle,
      corrected: '',
      isProcessing: false
    }));

    for (let i = 0; i < libelles.length; i++) {
      // Marquer comme en cours de traitement
      results[i].isProcessing = true;
      onProgress([...results], i);

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

      // Traiter le libellé
      results[i].corrected = this.traiterLibelle(libelles[i]);
      results[i].isProcessing = false;
      onProgress([...results], i);
    }

    return results;
  }
}

export const libelleProcessor = new LibelleProcessor();