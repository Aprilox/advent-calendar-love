"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Save,
  MessageSquare,
  Key,
  Heart,
  ThumbsUp,
  Gift,
  Settings,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  saveSettings,
  loadSettings,
  authenticateAdmin,
  updateAdminPassword,
  updateGift,
  deleteGift,
  cleanExtraGifts,
  createMissingGifts, // Nouvelle import
} from "../actions"
import { type Settings as SettingsType, type Gift as GiftType, defaultSettings } from "@/lib/settings"

type PublicSettings = typeof defaultSettings

interface AdminPanelProps {
  settings?: PublicSettings
  onSettingsUpdate?: (settings: PublicSettings) => void
  onClose?: () => void
}

export default function AdminPanel({ settings: propSettings, onSettingsUpdate, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [localSettings, setLocalSettings] = useState<PublicSettings>(propSettings || defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [editingGift, setEditingGift] = useState<GiftType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [numberOfDays, setNumberOfDays] = useState(25)
  const [developmentMode, setDevelopmentMode] = useState(false)
  const [simulatedDate, setSimulatedDate] = useState("")

  // Charger les paramètres au démarrage
  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const loadedSettings = await loadSettings()
        setLocalSettings(loadedSettings)
        setDevelopmentMode(loadedSettings.developmentMode || false)
        setSimulatedDate(loadedSettings.simulatedDate || new Date().toISOString().slice(0, 16))
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      }
    }

    if (!propSettings) {
      loadInitialSettings()
    }
  }, [propSettings])

  const handleLogin = async () => {
    try {
      const isValid = await authenticateAdmin(password)
      if (isValid) {
        setIsAuthenticated(true)
      } else {
        alert("Mot de passe incorrect !")
      }
    } catch (error) {
      alert("Erreur lors de l'authentification !")
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !")
      return
    }

    if (newPassword.length < 4) {
      alert("Le mot de passe doit contenir au moins 4 caractères !")
      return
    }

    try {
      const success = await updateAdminPassword(password, newPassword)
      if (success) {
        alert("Mot de passe changé avec succès !")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert("Erreur lors du changement de mot de passe !")
      }
    } catch (error) {
      alert("Erreur lors du changement de mot de passe !")
    }
  }

  const handleGenerateGifts = async () => {
    const confirmGenerate = confirm(
      `Cela va créer ${numberOfDays} cadeaux vides et remplacer les existants. Êtes-vous sûr?`,
    )

    if (!confirmGenerate) return

    setIsGenerating(true)
    try {
      // Créer les cadeaux vides
      const emptyGifts = []
      for (let i = 1; i <= numberOfDays; i++) {
        emptyGifts.push({
          id: i,
          title: "",
          text: "",
          order: i,
        })
      }

      const updatedSettings = {
        ...localSettings,
        gifts: emptyGifts,
      }

      setLocalSettings(updatedSettings)
      alert(`${numberOfDays} cadeaux générés avec succès !`)
    } catch (error) {
      alert("Erreur lors de la génération des cadeaux !")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditGift = (gift: GiftType) => {
    setEditingGift({ ...gift })
  }

  const handleSaveGift = async () => {
    if (!editingGift) return

    try {
      await updateGift(editingGift.id, editingGift.title, editingGift.text, editingGift.image)

      // Mettre à jour les settings locaux
      const updatedGifts = localSettings.gifts.map((gift) =>
        gift.id === editingGift.id
          ? {
              ...gift,
              title: editingGift.title,
              text: editingGift.text,
              image: editingGift.image || undefined,
            }
          : gift,
      )

      setLocalSettings({ ...localSettings, gifts: updatedGifts })
      setEditingGift(null)
      alert("Cadeau mis à jour avec succès !")
    } catch (error) {
      alert("Erreur lors de la mise à jour !")
      console.error(error)
    }
  }

  const handleDeleteGift = async (giftId: number) => {
    const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer ce cadeau ?")
    if (!confirmDelete) return

    try {
      await deleteGift(giftId)

      // Mettre à jour les settings locaux
      const updatedGifts = localSettings.gifts.filter((g) => g.id !== giftId)
      const updatedLikes = (localSettings.likes || []).filter((like) => like.giftId !== giftId)

      setLocalSettings({
        ...localSettings,
        gifts: updatedGifts,
        likes: updatedLikes,
      })

      alert("Cadeau supprimé avec succès !")
    } catch (error) {
      alert("Erreur lors de la suppression !")
      console.error(error)
    }
  }

  const handleCleanExtraGifts = async () => {
    const extraGifts = localSettings.gifts.filter((g) => g.order > numberOfDays)
    if (extraGifts.length === 0) {
      alert("Aucun cadeau en trop à supprimer !")
      return
    }

    const confirmClean = confirm(
      `Cela va supprimer ${extraGifts.length} cadeau(x) en trop (au-delà du jour ${numberOfDays}). Êtes-vous sûr?`,
    )
    if (!confirmClean) return

    try {
      await cleanExtraGifts(numberOfDays)

      // Mettre à jour les settings locaux
      const updatedGifts = localSettings.gifts.filter((g) => g.order <= numberOfDays)
      const giftIdsToDelete = extraGifts.map((g) => g.id)
      const updatedLikes = (localSettings.likes || []).filter((like) => !giftIdsToDelete.includes(like.giftId))

      setLocalSettings({
        ...localSettings,
        gifts: updatedGifts,
        likes: updatedLikes,
      })

      alert(`${extraGifts.length} cadeau(x) supprimé(s) avec succès !`)
    } catch (error) {
      alert("Erreur lors du nettoyage !")
      console.error(error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const fullSettings: SettingsType = {
        ...localSettings,
        adminPassword: password,
        developmentMode,
        simulatedDate: developmentMode ? simulatedDate : undefined,
      }

      await saveSettings(fullSettings)
      if (onSettingsUpdate) {
        onSettingsUpdate({
          ...localSettings,
          developmentMode,
          simulatedDate: developmentMode ? simulatedDate : undefined,
        })
      }
      alert("Paramètres sauvegardés avec succès !")
    } catch (error) {
      alert("Erreur lors de la sauvegarde !")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDateChange = (date: string) => {
    setLocalSettings({
      ...localSettings,
      christmasDate: date,
    })
  }

  const handleFinalMessageChange = (message: string) => {
    setLocalSettings({
      ...localSettings,
      finalMessage: message,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">Panneau d'Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Entrez le mot de passe"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1 bg-red-600 hover:bg-red-700">
                Se connecter
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedGifts = [...localSettings.gifts].sort((a, b) => a.order - b.order)
  const likedGifts = (localSettings.likes || []).filter((like) => like.liked)
  const extraGifts = sortedGifts.filter((g) => g.order > numberOfDays)
  const missingDays = []
  for (let i = 1; i <= numberOfDays; i++) {
    if (!sortedGifts.find((g) => g.order === i)) {
      missingDays.push(i)
    }
  }

  const handleCreateMissingGifts = async () => {
    if (missingDays.length === 0) {
      alert("Aucun jour manquant à créer !")
      return
    }

    const confirmCreate = confirm(
      `Cela va créer ${missingDays.length} cadeau(x) vide(s) pour les jours manquants (${missingDays.join(", ")}). Êtes-vous sûr?`,
    )
    if (!confirmCreate) return

    try {
      await createMissingGifts(numberOfDays)

      // Recharger les settings
      const updatedSettings = await loadSettings()
      setLocalSettings(updatedSettings)

      alert(`${missingDays.length} cadeau(x) créé(s) avec succès !`)
    } catch (error) {
      alert("Erreur lors de la création des cadeaux manquants !")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-white">Administration du Calendrier</h1>
          <Button onClick={handleSave} disabled={isSaving} className="ml-auto bg-red-600 hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>

        {/* Alerte pour les cadeaux en trop ET manquants */}
        {(extraGifts.length > 0 || missingDays.length > 0) && (
          <Card className="mb-6 bg-orange-900/50 border-orange-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-300 mb-1">Problèmes de configuration détectés</h4>

                  {extraGifts.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-orange-200 mb-2">
                        <strong>{extraGifts.length}</strong> cadeau(x) dépassent la limite de {numberOfDays} jours. Ils
                        sont grisés et ne seront pas visibles.
                      </p>
                      <Button
                        onClick={handleCleanExtraGifts}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 mr-2"
                      >
                        Supprimer les {extraGifts.length} cadeau(x) en trop
                      </Button>
                    </div>
                  )}

                  {missingDays.length > 0 && (
                    <div>
                      <p className="text-sm text-orange-200 mb-2">
                        <strong>{missingDays.length}</strong> jour(s) manquant(s) : {missingDays.join(", ")}
                      </p>
                      <Button onClick={handleCreateMissingGifts} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Créer les {missingDays.length} jour(s) manquant(s)
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques des likes */}
        <Card className="mb-6 bg-green-900/50 border-green-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-300 mb-1">Statistiques des likes</h4>
                <p className="text-sm text-green-200">
                  <strong>{likedGifts.length}</strong> cadeau(x) aimé(s) sur{" "}
                  <strong>{localSettings.gifts.length}</strong> au total.
                  {likedGifts.length > 0 && (
                    <>
                      <br />
                      Dernière activité :{" "}
                      {new Date(
                        Math.max(...likedGifts.map((like) => new Date(like.likedAt).getTime())),
                      ).toLocaleDateString("fr-FR")}{" "}
                      à{" "}
                      {new Date(
                        Math.max(...likedGifts.map((like) => new Date(like.likedAt).getTime())),
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration générale */}
          <div className="space-y-6">
            {/* Configuration du calendrier */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="christmas-date" className="text-gray-300">
                    Date de Noël
                  </Label>
                  <Input
                    id="christmas-date"
                    type="datetime-local"
                    value={localSettings.christmasDate.slice(0, 16)}
                    onChange={(e) => handleDateChange(e.target.value + ":00")}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="number-days" className="text-gray-300">
                    Nombre de jours (1 à 31)
                  </Label>
                  <Input
                    id="number-days"
                    type="number"
                    min="1"
                    max="31"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(Number.parseInt(e.target.value) || 25)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {(extraGifts.length > 0 || missingDays.length > 0) && (
                    <div className="text-xs mt-1">
                      {extraGifts.length > 0 && (
                        <p className="text-orange-400">⚠️ {extraGifts.length} cadeau(x) en trop</p>
                      )}
                      {missingDays.length > 0 && (
                        <p className="text-blue-400">ℹ️ {missingDays.length} jour(s) manquant(s)</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Mode développement */}
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="dev-mode"
                      checked={developmentMode}
                      onChange={(e) => setDevelopmentMode(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="dev-mode" className="text-gray-300">
                      Mode développement
                    </Label>
                  </div>

                  {developmentMode && (
                    <div>
                      <Label htmlFor="simulated-date" className="text-gray-300">
                        Date simulée
                      </Label>
                      <Input
                        id="simulated-date"
                        type="datetime-local"
                        value={simulatedDate}
                        onChange={(e) => setSimulatedDate(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Permet de tester le calendrier à n'importe quelle date
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerateGifts}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? "Génération..." : `Générer ${numberOfDays} cadeaux`}
                </Button>
              </CardContent>
            </Card>

            {/* Changer mot de passe */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Key className="w-5 h-5" />
                  Changer le mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-gray-300">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-gray-300">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button onClick={handlePasswordChange} className="w-full bg-red-600 hover:bg-red-700">
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>

            {/* Message final */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5" />
                  Message de Noël
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="final-message" className="text-gray-300">
                    Message spécial
                  </Label>
                  <Textarea
                    id="final-message"
                    value={localSettings.finalMessage}
                    onChange={(e) => handleFinalMessageChange(e.target.value)}
                    rows={4}
                    placeholder="Message qui s'affichera le jour de Noël..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendrier d'administration */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Calendrier de l'Avent - Administration ({localSettings.gifts.length} cadeaux)
                </CardTitle>
                <p className="text-sm text-gray-400">Cliquez sur une case pour éditer le cadeau</p>
              </CardHeader>
              <CardContent>
                {/* Grille du calendrier */}
                <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3 mb-6">
                  {sortedGifts.map((gift) => {
                    const giftLike = (localSettings.likes || []).find((like) => like.giftId === gift.id)
                    const isLiked = giftLike?.liked || false
                    const isEmpty = !gift.title.trim() || !gift.text.trim()
                    const isOpened = gift.opened
                    const isExtra = gift.order > numberOfDays // Nouveau: détecter les cadeaux en trop

                    return (
                      <Card
                        key={gift.id}
                        className={`
                          aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105 relative
                          ${
                            isExtra
                              ? "bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400 opacity-60"
                              : isLiked
                                ? "bg-gradient-to-br from-green-600 to-green-700 border-green-400 shadow-lg shadow-green-400/30"
                                : isOpened
                                  ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400 shadow-lg shadow-blue-400/30"
                                  : isEmpty
                                    ? "bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500"
                                    : "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 hover:border-red-400"
                          }
                        `}
                        onClick={() => !isExtra && handleEditGift(gift)}
                      >
                        <CardContent className="p-0 h-full flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-center p-2">
                            <div
                              className={`text-lg md:text-xl font-bold mb-1 ${isExtra ? "text-gray-300" : "text-white"}`}
                            >
                              {gift.order}
                            </div>
                            {isEmpty ? (
                              <p className={`text-xs ${isExtra ? "text-gray-400" : "text-yellow-200"}`}>
                                {isExtra ? "En trop" : "Vide"}
                              </p>
                            ) : (
                              <Gift className={`w-4 h-4 mx-auto ${isExtra ? "text-gray-300" : "text-white"}`} />
                            )}
                            {isLiked && !isExtra && (
                              <div className="absolute top-1 right-1">
                                <ThumbsUp className="w-3 h-3 text-green-200" />
                              </div>
                            )}
                            {isOpened && !isExtra && (
                              <div className="absolute top-1 left-1">
                                <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Bouton de suppression pour les cadeaux en trop */}
                          {isExtra && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteGift(gift.id)
                              }}
                              size="sm"
                              variant="outline"
                              className="absolute bottom-1 right-1 p-1 h-6 w-6 border-red-400 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span>Vide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                    <span>Configuré</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Aimé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Ouvert</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded opacity-60"></div>
                    <span>En trop (non visible)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal d'édition */}
        {editingGift && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl bg-gray-800 border-gray-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Éditer le cadeau - Jour {editingGift.order}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gift-title" className="text-gray-300">
                    Titre du cadeau
                  </Label>
                  <Input
                    id="gift-title"
                    value={editingGift.title}
                    onChange={(e) => setEditingGift({ ...editingGift, title: e.target.value })}
                    placeholder="Ex: Premier cadeau, Surprise spéciale..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="gift-text" className="text-gray-300">
                    Description du cadeau
                  </Label>
                  <Textarea
                    id="gift-text"
                    value={editingGift.text}
                    onChange={(e) => setEditingGift({ ...editingGift, text: e.target.value })}
                    placeholder="Décrivez le cadeau..."
                    rows={4}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="gift-image" className="text-gray-300">
                    URL de l'image (optionnel)
                  </Label>
                  <Input
                    id="gift-image"
                    value={editingGift.image || ""}
                    onChange={(e) => setEditingGift({ ...editingGift, image: e.target.value })}
                    placeholder="https://..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                {editingGift.image && (
                  <div>
                    <img
                      src={editingGift.image || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-w-md mx-auto rounded border border-gray-600 object-contain max-h-48"
                    />
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSaveGift} className="flex-1 bg-green-600 hover:bg-green-700">
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={() => setEditingGift(null)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
