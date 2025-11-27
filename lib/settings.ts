// Remplacer Quote par Gift et adapter les interfaces
export interface Gift {
  id: number
  text: string
  title: string
  image?: string
  order: number
  opened?: boolean
  openedAt?: string
}

export interface GiftLike {
  giftId: number
  liked: boolean
  likedAt: string
}

export interface Settings {
  christmasDate: string
  gifts: Gift[]
  finalMessage: string
  adminPassword: string
  likes: GiftLike[]
  // Nouveaux champs
  developmentMode: boolean
  simulatedDate?: string
}

// Settings par défaut SANS le mot de passe (sécurité côté client)
export const defaultSettings: Omit<Settings, "adminPassword"> = {
  christmasDate: "2024-12-25T00:00:00",
  gifts: [
    {
      id: 1,
      title: "Premier cadeau",
      text: "Un petit quelque chose pour commencer ce calendrier magique ! 🎁",
      order: 1,
    },
    {
      id: 2,
      title: "Deuxième surprise",
      text: "Une petite attention qui te fera sourire 😊",
      order: 2,
    },
    {
      id: 3,
      title: "Troisième cadeau",
      text: "Quelque chose de spécial rien que pour toi ✨",
      order: 3,
    },
  ],
  finalMessage:
    "Joyeux Noël mon amour ! 🎄 Après tous ces petits cadeaux quotidiens, voici le plus beau : passer Noël avec toi. Tu es mon plus beau cadeau. Je t'aime infiniment. 💖🎅",
  likes: [],
  // Nouveaux champs
  developmentMode: false,
  simulatedDate: undefined,
}

// Settings complets UNIQUEMENT côté serveur
export const serverDefaultSettings: Settings = {
  ...defaultSettings,
  adminPassword: "admin123", // Seulement côté serveur
}
