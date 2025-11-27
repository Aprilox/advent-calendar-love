"use server"

import { promises as fs } from "fs"
import path from "path"
import { type Settings, type GiftLike, serverDefaultSettings } from "@/lib/settings"

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json")

export async function loadSettings(): Promise<Omit<Settings, "adminPassword">> {
  try {
    const dataDir = path.dirname(SETTINGS_FILE)
    await fs.mkdir(dataDir, { recursive: true })

    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // S'assurer que les likes existent
    if (!settings.likes) {
      settings.likes = []
    }

    // Retourner les settings SANS le mot de passe
    const { adminPassword, ...publicSettings } = settings
    return publicSettings
  } catch (error) {
    // Si le fichier n'existe pas, créer avec les paramètres par défaut
    await saveSettings(serverDefaultSettings)
    const { adminPassword, ...publicSettings } = serverDefaultSettings
    return publicSettings
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    // S'assurer que les likes existent avant de sauvegarder
    if (!settings.likes) {
      settings.likes = []
    }

    const dataDir = path.dirname(SETTINGS_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error)
    throw new Error("Impossible de sauvegarder les paramètres")
  }
}

export async function generateEmptyGifts(christmasDate: string): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Calculer le nombre de jours jusqu'à Noël
    const now = new Date()
    const christmas = new Date(christmasDate)
    const daysUntilChristmas = Math.ceil((christmas.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilChristmas <= 0) {
      throw new Error("La date de Noël doit être dans le futur")
    }

    // Créer les cadeaux vides (maximum 25 pour un calendrier de l'Avent)
    const maxGifts = Math.min(daysUntilChristmas, 25)
    const emptyGifts = []
    for (let i = 1; i <= maxGifts; i++) {
      emptyGifts.push({
        id: i,
        title: "",
        text: "",
        order: i,
      })
    }

    // Remplacer tous les cadeaux par les nouveaux cadeaux vides
    settings.gifts = emptyGifts
    settings.christmasDate = christmasDate

    await saveSettings(settings)
  } catch (error) {
    console.error("Erreur lors de la génération des cadeaux:", error)
    throw new Error("Impossible de générer les cadeaux")
  }
}

// Nouvelle fonction pour créer seulement les jours manquants
export async function createMissingGifts(maxDays: number): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Trouver les jours manquants
    const existingOrders = settings.gifts.map((g) => g.order)
    const missingDays = []

    for (let i = 1; i <= maxDays; i++) {
      if (!existingOrders.includes(i)) {
        missingDays.push(i)
      }
    }

    // Créer les cadeaux manquants
    const newGifts = missingDays.map((day) => ({
      id: Math.max(...settings.gifts.map((g) => g.id), 0) + day, // ID unique
      title: "",
      text: "",
      order: day,
    }))

    // Ajouter les nouveaux cadeaux
    settings.gifts = [...settings.gifts, ...newGifts]

    await saveSettings(settings)
  } catch (error) {
    console.error("Erreur lors de la création des cadeaux manquants:", error)
    throw new Error("Impossible de créer les cadeaux manquants")
  }
}

export async function updateGift(id: number, title: string, text: string, image?: string): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    const giftIndex = settings.gifts.findIndex((g) => g.id === id)
    if (giftIndex >= 0) {
      settings.gifts[giftIndex] = {
        ...settings.gifts[giftIndex],
        title,
        text,
        image: image || undefined,
      }
      await saveSettings(settings)
    } else {
      throw new Error("Cadeau non trouvé")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cadeau:", error)
    throw new Error("Impossible de mettre à jour le cadeau")
  }
}

export async function toggleGiftLike(giftId: number): Promise<GiftLike> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Chercher si le like existe déjà
    const existingLikeIndex = settings.likes.findIndex((like) => like.giftId === giftId)

    if (existingLikeIndex >= 0) {
      // Toggle le like existant
      settings.likes[existingLikeIndex].liked = !settings.likes[existingLikeIndex].liked
      settings.likes[existingLikeIndex].likedAt = new Date().toISOString()
    } else {
      // Créer un nouveau like
      settings.likes.push({
        giftId,
        liked: true,
        likedAt: new Date().toISOString(),
      })
    }

    await saveSettings(settings)
    return settings.likes.find((like) => like.giftId === giftId)!
  } catch (error) {
    console.error("Erreur lors du toggle like:", error)
    throw new Error("Impossible de sauvegarder le like")
  }
}

// Nouvelle fonction pour ouvrir un cadeau
export async function openGift(giftId: number): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    const giftIndex = settings.gifts.findIndex((g) => g.id === giftId)
    if (giftIndex >= 0) {
      settings.gifts[giftIndex] = {
        ...settings.gifts[giftIndex],
        opened: true,
        openedAt: new Date().toISOString(),
      }
      await saveSettings(settings)
    }
  } catch (error) {
    console.error("Erreur lors de l'ouverture du cadeau:", error)
    throw new Error("Impossible d'ouvrir le cadeau")
  }
}

// Nouvelle fonction pour supprimer un cadeau
export async function deleteGift(giftId: number): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Supprimer le cadeau
    settings.gifts = settings.gifts.filter((g) => g.id !== giftId)

    // Supprimer aussi les likes associés
    settings.likes = settings.likes.filter((like) => like.giftId !== giftId)

    await saveSettings(settings)
  } catch (error) {
    console.error("Erreur lors de la suppression du cadeau:", error)
    throw new Error("Impossible de supprimer le cadeau")
  }
}

// Nouvelle fonction pour nettoyer les cadeaux en trop
export async function cleanExtraGifts(maxDays: number): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Supprimer tous les cadeaux au-delà de la limite
    const giftsToKeep = settings.gifts.filter((g) => g.order <= maxDays)
    const giftsToDelete = settings.gifts.filter((g) => g.order > maxDays)

    // Supprimer les likes des cadeaux supprimés
    const giftIdsToDelete = giftsToDelete.map((g) => g.id)
    settings.likes = settings.likes.filter((like) => !giftIdsToDelete.includes(like.giftId))

    settings.gifts = giftsToKeep

    await saveSettings(settings)
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error)
    throw new Error("Impossible de nettoyer les cadeaux en trop")
  }
}

export async function authenticateAdmin(password: string): Promise<boolean> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)
    return settings.adminPassword === password
  } catch (error) {
    // Si le fichier n'existe pas, utiliser le mot de passe par défaut
    return password === serverDefaultSettings.adminPassword
  }
}

export async function updateAdminPassword(oldPassword: string, newPassword: string): Promise<boolean> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    if (settings.adminPassword !== oldPassword) {
      return false
    }

    settings.adminPassword = newPassword
    await saveSettings(settings)
    return true
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error)
    return false
  }
}
