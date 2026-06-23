import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Curated gallery of high-quality product photography
const ARTISANAL_GALLERY = [
  // 1. Cosmétiques & Soins
  {
    id: "cosm_sertum",
    category: "Cosmétique",
    theme: "Sérum ou huile biologique bio (flacon pipette)",
    url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "cosm_cream",
    category: "Cosmétique",
    theme: "Crème hydratante, beurre de karité, pot d'onguent doré",
    url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "cosm_soap",
    category: "Cosmétique",
    theme: "Savon solide artisanal et naturel aux plantes",
    url: "https://images.unsplash.com/photo-1607006342445-310f1400f759?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "cosm_dropper",
    category: "Cosmétique",
    theme: "Ampoule hydratante avec applicateur en verre",
    url: "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80"
  },
  
  // 2. Épices, Aliments & Gourmandises
  {
    id: "food_spices",
    category: "Alimentation",
    theme: "Bocaux d'épices locales, piment en poudre et arômes naturels",
    url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "food_coffee",
    category: "Alimentation",
    theme: "Grains de café torréfiés d'Afrique de luxe",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "food_cacao",
    category: "Alimentation",
    theme: "Tablette de chocolat noir ou fèves de cacao artisanal",
    url: "https://images.unsplash.com/photo-1548907040-4aa42892b5b4?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "food_honey",
    category: "Alimentation",
    theme: "Pot de miel doré et sauvage de forêt équatoriale",
    url: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop&q=80"
  },
  
  // 3. Mode, Tissus & Tradition
  {
    id: "style_wax",
    category: "Mode",
    theme: "Tissu traditionnel africain Wax imprimé multicolore",
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "style_woven",
    category: "Mode",
    theme: "Linge de maison traditionnel ou pagne tissé de luxe",
    url: "https://images.unsplash.com/photo-1590736969955-71cb94801759?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "style_bag_leather",
    category: "Mode",
    theme: "Sac à main ou pochette en vrai cuir artisanal cousu main",
    url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "style_bag_raffia",
    category: "Mode",
    theme: "Panier ou sac en raffia tressé artisanalement",
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"
  },

  // 4. Décoration & Céramique
  {
    id: "deco_pottery",
    category: "Artisanat",
    theme: "Poterie en argile de terre rouge faite main",
    url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "deco_wood",
    category: "Artisanat",
    theme: "Sculpture sur bois précieux ou objets de déco de maison",
    url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=600&auto=format&fit=crop&q=80"
  }
];

// 1. Endpoint: AI Illustration Suggestion powered by Gemini
app.post("/api/gemini/suggest-image", async (req, res) => {
  try {
    const { nom, category, description, boutiqueNom, boutiqueType } = req.body;

    if (!nom) {
      return res.status(400).json({ error: "Le nom de l'article est requis à l'analyse." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("MY_GEMINI_API_KEY")) {
      // Lazy fallback structure if API key is unconfigured or placeholders used
      const matched = ARTISANAL_GALLERY.find(item => 
        nom.toLowerCase().includes(item.category.toLowerCase()) || 
        (category && category.toLowerCase().includes(item.category.toLowerCase()))
      ) || ARTISANAL_GALLERY[0];

      return res.json({
        imageUrl: matched.url,
        matchedTheme: matched.theme,
        unsplashKeywords: `${nom.toLowerCase()} photography`,
        explanationFrench: `Sélection automatique locale (clé d'API Gemini non activée) : correspond au thème "${matched.theme}" pour votre produit.`
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const galleryDataStr = JSON.stringify(ARTISANAL_GALLERY, null, 2);

    const systemPrompt = `Tu es l'intelligence artificielle de validation visuelle de la plateforme Pelou (certification anti-contrefaçon et traçabilité de produits africains).
Analyse l'article d'un partenaire et choisis le meilleur visuel de notre galerie pour l'illustrer, OU génère des mots-clés Unsplash précis de produit de luxe si aucun ne correspond parfaitement.

Voici les informations sur l'article :
- Nom de l'article : "${nom}"
- Catégorie déclarée : "${category || 'Non renseignée'}"
- Description / Composition : "${description || 'Non renseignée'}"
- Distribué par la boutique : "${boutiqueNom || 'Non renseignée'}" de type "${boutiqueType || 'Artisanat'}"

Voici notre catalogue de visuels haute définition officiels :
${galleryDataStr}

Instructions cruciales :
1. Examine les mots-clés et le contexte. Choisis le visuel de la liste ci-dessus qui correspond le mieux pour représenter fièrement ce produit authentique.
2. S'il n'y a pas de correspondance naturelle, renvoie l'URL de l'élément de la galerie qui s'en rapproche le plus, et suggère de magnifiques mots-clés de recherche Unsplash (en anglais, ex: "organic lemongrass essential oil glass dropper bottle") pour de futurs téléchargements.
3. Rédige une explication valorisante en français de 1 à 2 phrases expliquant pourquoi ce visuel illustre parfaitement la traçabilité et l'origine de ce produit.

Retourne UNIQUEMENT un objet JSON valide avec la structure suivante, sans balises de code Markdown ni texte superflu :
{
  "imageUrl": "L'URL de l'image sélectionnée parmi la galerie",
  "matchedTheme": "Le thème ou titre de l'image correspondante",
  "unsplashKeywords": "Des mots-clés de recherche Unsplash optimisés en anglais",
  "explanationFrench": "L'explication professionnelle et valorisante de la certification de l'origine"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text || "{}";
    const cleanJson = JSON.parse(textOutput.trim());

    return res.json(cleanJson);

  } catch (error: any) {
    console.error("Gemini suggestion error:", error);
    return res.status(500).json({ 
      error: "Une erreur est survenue lors de l'appel à l'API Gemini.",
      details: error.message 
    });
  }
});

// Serve Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pelou] Backend listening on port ${PORT}`);
  });
}

start();
