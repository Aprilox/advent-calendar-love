"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Gift, Calendar, ThumbsUp, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { loadSettings, toggleGiftLike, openGift } from "./actions"
import { type Gift as GiftType, defaultSettings } from "@/lib/settings"

type PublicSettings = typeof defaultSettings

export default function AdventCalendarPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings)
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [openingGiftId, setOpeningGiftId] = useState<number | null>(null)
  const [confettiPosition, setConfettiPosition] = useState<{ x: number; y: number } | null>(null)
  const [buildUpActive, setBuildUpActive] = useState(false)
  const [explosionActive, setExplosionActive] = useState(false)

  // Composant pour les confettis de build-up (petits, progressifs)
  const BuildUpConfetti = ({ giftPosition }: { giftPosition?: { x: number; y: number } }) => {
    const [confettiItems, setConfettiItems] = useState<
      Array<{
        id: number
        x: number
        y: number
        vx: number
        vy: number
        rotation: number
        scale: number
        color: string
        shape: "rectangle" | "circle"
        opacity: number
      }>
    >([])

    useEffect(() => {
      if (!giftPosition) return

      const colors = ["#feca57", "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff6b6b"]
      let confettiCount = 0

      // Ajouter des confettis progressivement
      const buildUpInterval = setInterval(() => {
        if (confettiCount < 30) {
          const newConfetti = Array.from({ length: 3 }).map((_, i) => ({
            id: confettiCount + i,
            x: giftPosition.x + (Math.random() - 0.5) * 100,
            y: giftPosition.y + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1,
            rotation: Math.random() * 360,
            scale: 0.3 + Math.random() * 0.4,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() > 0.5 ? "rectangle" : "circle",
            opacity: 0.8,
          }))

          setConfettiItems((prev) => [...prev, ...newConfetti])
          confettiCount += 3
        }
      }, 100)

      // Animation des confettis de build-up
      const animationInterval = setInterval(() => {
        setConfettiItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            x: item.x + item.vx,
            y: item.y + item.vy,
            vy: item.vy + 0.1,
            rotation: item.rotation + 2,
            opacity: item.opacity * 0.99,
          })),
        )
      }, 50)

      return () => {
        clearInterval(buildUpInterval)
        clearInterval(animationInterval)
      }
    }, [giftPosition])

    return (
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {confettiItems.map((item) => (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: `${item.x}px`,
              top: `${item.y}px`,
              transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
              backgroundColor: item.color,
              opacity: item.opacity,
              width: item.shape === "circle" ? "8px" : "6px",
              height: item.shape === "circle" ? "8px" : "10px",
              borderRadius: item.shape === "circle" ? "50%" : "1px",
              zIndex: 999,
            }}
          />
        ))}
      </div>
    )
  }

  // Composant pour l'explosion finale (massive)
  const ExplosionConfetti = ({ giftPosition }: { giftPosition?: { x: number; y: number } }) => {
    const [confettiItems, setConfettiItems] = useState<
      Array<{
        id: number
        x: number
        y: number
        vx: number
        vy: number
        rotation: number
        rotationSpeed: number
        scale: number
        color: string
        shape: "rectangle" | "circle" | "triangle"
        width: number
        height: number
        opacity: number
      }>
    >([])

    useEffect(() => {
      if (!giftPosition) return

      const colors = [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#96ceb4",
        "#feca57",
        "#ff9ff3",
        "#54a0ff",
        "#5f27cd",
        "#00d2d3",
        "#ff9f43",
        "#ee5a24",
        "#0984e3",
        "#6c5ce7",
        "#a29bfe",
        "#fd79a8",
        "#fdcb6e",
      ]

      const shapes: Array<"rectangle" | "circle" | "triangle"> = ["rectangle", "circle", "triangle"]

      // EXPLOSION MASSIVE ! 150 confettis
      const items = Array.from({ length: 150 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2
        const velocity = 20 + Math.random() * 30 // Vitesses énormes

        return {
          id: i,
          x: giftPosition.x,
          y: giftPosition.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - Math.random() * 15,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 25,
          scale: 0.8 + Math.random() * 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          width: 10 + Math.random() * 15,
          height: 10 + Math.random() * 15,
          opacity: 1,
        }
      })

      setConfettiItems(items)

      // Animation ultra-fluide
      const animationInterval = setInterval(() => {
        setConfettiItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            x: item.x + item.vx,
            y: item.y + item.vy,
            vx: item.vx * 0.98,
            vy: item.vy + 0.6, // Gravité forte
            rotation: item.rotation + item.rotationSpeed,
            scale: item.scale * 0.995,
            opacity: item.opacity * 0.994,
          })),
        )
      }, 16) // 60 FPS

      // Nettoyer après 6 secondes
      const cleanup = setTimeout(() => {
        setConfettiItems([])
        clearInterval(animationInterval)
      }, 6000)

      return () => {
        clearTimeout(cleanup)
        clearInterval(animationInterval)
      }
    }, [giftPosition])

    const renderConfetti = (item: (typeof confettiItems)[0]) => {
      const baseStyle = {
        position: "absolute" as const,
        left: `${item.x}px`,
        top: `${item.y}px`,
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        backgroundColor: item.color,
        opacity: item.opacity,
        pointerEvents: "none" as const,
        zIndex: 1000,
      }

      switch (item.shape) {
        case "rectangle":
          return (
            <div
              key={item.id}
              style={{
                ...baseStyle,
                width: `${item.width}px`,
                height: `${item.height}px`,
                borderRadius: "2px",
              }}
            />
          )
        case "circle":
          return (
            <div
              key={item.id}
              style={{
                ...baseStyle,
                width: `${item.width}px`,
                height: `${item.width}px`,
                borderRadius: "50%",
              }}
            />
          )
        case "triangle":
          return (
            <div
              key={item.id}
              style={{
                ...baseStyle,
                width: 0,
                height: 0,
                backgroundColor: "transparent",
                borderLeft: `${item.width / 2}px solid transparent`,
                borderRight: `${item.width / 2}px solid transparent`,
                borderBottom: `${item.height}px solid ${item.color}`,
              }}
            />
          )
        default:
          return null
      }
    }

    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{confettiItems.map(renderConfetti)}</div>
    )
  }

  // Ajouter une fonction pour obtenir la date actuelle (réelle ou simulée)
  const getCurrentDate = () => {
    if (settings.developmentMode && settings.simulatedDate) {
      return new Date(settings.simulatedDate)
    }
    return new Date()
  }

  // Charger les paramètres au démarrage
  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const loadedSettings = await loadSettings()
        setSettings(loadedSettings)
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialSettings()
  }, [])

  // Calculer le compte à rebours jusqu'à Noël
  useEffect(() => {
    if (isLoading) return

    const timer = setInterval(() => {
      const now = getCurrentDate().getTime()
      const christmasDate = new Date(settings.christmasDate).getTime()
      const distance = christmasDate - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [settings.christmasDate, settings.developmentMode, settings.simulatedDate, isLoading])

  // Vérifier si on peut ouvrir un cadeau aujourd'hui
  const canOpenGift = (giftOrder: number) => {
    const today = getCurrentDate()
    const christmasDate = new Date(settings.christmasDate)

    // Calculer combien de jours il reste jusqu'à Noël
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const christmasDateOnly = new Date(christmasDate.getFullYear(), christmasDate.getMonth(), christmasDate.getDate())
    const daysUntilChristmas = Math.floor((christmasDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

    // On peut ouvrir si on est dans la période du calendrier
    // Jour 1 = dernier jour avant Noël, Jour 2 = avant-dernier, etc.
    return daysUntilChristmas >= 0 && giftOrder <= settings.gifts.length - daysUntilChristmas
  }

  const handleOpenGift = async (gift: GiftType, event: React.MouseEvent) => {
    const isEmpty = !gift.title.trim() || !gift.text.trim()

    // Si le cadeau est vide, ne rien faire
    if (isEmpty) return

    // Si le cadeau est déjà ouvert, l'afficher directement (re-visionnage)
    if (gift.opened) {
      // Recharger les données pour avoir la version la plus récente
      try {
        const freshSettings = await loadSettings()
        const updatedGift = freshSettings.gifts.find((g) => g.id === gift.id)

        if (updatedGift) {
          setSelectedGift(updatedGift)
        } else {
          setSelectedGift(gift) // Fallback sur les données locales
        }
      } catch (error) {
        console.error("Erreur lors du rechargement:", error)
        setSelectedGift(gift) // Fallback sur les données locales
      }
      return
    }

    // Si le cadeau n'est pas encore ouvert, vérifier les permissions
    if (!canOpenGift(gift.order) || isOpening) return

    // Capturer la position de la case cliquée
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    setConfettiPosition({ x: centerX, y: centerY })
    setIsOpening(true)
    setOpeningGiftId(gift.id)

    // PHASE 1: Build-up avec petits confettis
    setBuildUpActive(true)

    try {
      await openGift(gift.id)

      // RECHARGER LES SETTINGS DEPUIS LE SERVEUR pour avoir les données fraîches
      const freshSettings = await loadSettings()
      setSettings(freshSettings)

      // Trouver le cadeau mis à jour avec les données fraîches du serveur
      const updatedGift = freshSettings.gifts.find((g) => g.id === gift.id)

      if (!updatedGift) {
        throw new Error("Cadeau non trouvé après mise à jour")
      }

      // PHASE 2: Après 1.2 secondes, arrêter le build-up et déclencher l'EXPLOSION !
      setTimeout(() => {
        setBuildUpActive(false)
        setExplosionActive(true)

        // PHASE 3: Après l'explosion, afficher le cadeau avec les données fraîches
        setTimeout(() => {
          setSelectedGift({
            ...updatedGift,
            opened: true,
            openedAt: new Date().toISOString(),
          })
          setOpeningGiftId(null)
          setIsOpening(false)
          setExplosionActive(false)
          setConfettiPosition(null)
        }, 300) // Court délai pour voir l'explosion
      }, 1200) // Build-up de 1.2 secondes
    } catch (error) {
      console.error("Erreur lors de l'ouverture:", error)
      setIsOpening(false)
      setOpeningGiftId(null)
      setBuildUpActive(false)
      setExplosionActive(false)
      setConfettiPosition(null)
    }
  }

  const handleLike = async () => {
    if (!selectedGift || isLiking) return

    setIsLiking(true)
    try {
      const updatedLike = await toggleGiftLike(selectedGift.id)

      // Mettre à jour les settings locaux
      const updatedSettings = { ...settings }
      if (!updatedSettings.likes) {
        updatedSettings.likes = []
      }
      const existingLikeIndex = updatedSettings.likes.findIndex((l) => l.giftId === selectedGift.id)

      if (existingLikeIndex >= 0) {
        updatedSettings.likes[existingLikeIndex] = updatedLike
      } else {
        updatedSettings.likes.push(updatedLike)
      }

      setSettings(updatedSettings)
    } catch (error) {
      console.error("Erreur lors du like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const isChristmasDay =
    !isLoading &&
    timeLeft.days <= 0 &&
    timeLeft.hours <= 0 &&
    timeLeft.minutes <= 0 &&
    timeLeft.seconds <= 0 &&
    getCurrentDate().getTime() >= new Date(settings.christmasDate).getTime()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-8 h-8 text-red-400 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-300">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Build-up confettis (petits, progressifs) */}
        {buildUpActive && confettiPosition && <BuildUpConfetti giftPosition={confettiPosition} />}

        {/* Explosion finale (massive) */}
        {explosionActive && confettiPosition && <ExplosionConfetti giftPosition={confettiPosition} />}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gift className="w-8 h-8 text-red-400 animate-bounce" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 to-red-200 bg-clip-text text-transparent">
              Calendrier de l'Avent
            </h1>
            <Sparkles className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
          <p className="text-gray-300 text-lg">🎄 Chaque jour une nouvelle surprise ! 🎅</p>
        </div>

        {settings.developmentMode && (
          <Card className="mb-6 bg-blue-900/50 border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div>
                  <h4 className="font-medium text-blue-300">Mode Développement Activé</h4>
                  <p className="text-sm text-blue-200">
                    Date simulée : {new Date(settings.simulatedDate || new Date()).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(settings.simulatedDate || new Date()).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Countdown to Christmas */}
        {!isChristmasDay && (
          <Card className="mb-12 bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Calendar className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Plus que</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.days}</div>
                  <div className="text-sm text-gray-300 mt-2">jours</div>
                </div>
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.hours}</div>
                  <div className="text-sm text-gray-300 mt-2">heures</div>
                </div>
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-300 mt-2">minutes</div>
                </div>
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.seconds}</div>
                  <div className="text-sm text-gray-300 mt-2">secondes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Christmas Day Message */}
        {isChristmasDay && (
          <Card className="mb-12 bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6">🎄🎅🎁</div>
              <h2 className="text-4xl font-bold text-red-400 mb-6">Joyeux Noël !</h2>
              <div className="p-6 bg-gradient-to-br from-amber-700/80 via-yellow-600/70 to-orange-600/80 rounded-xl border border-amber-500/50 shadow-2xl backdrop-blur-sm">
                <p className="text-lg text-white drop-shadow-lg">{settings.finalMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advent Calendar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4 mb-8">
          {settings.gifts
            .sort((a, b) => a.order - b.order)
            .map((gift) => {
              const canOpen = canOpenGift(gift.order)
              const isOpened = gift.opened
              const isCurrentlyOpening = openingGiftId === gift.id
              const isEmpty = !gift.title.trim() || !gift.text.trim()

              return (
                <Card
                  key={gift.id}
                  className={`
                    aspect-square cursor-pointer transition-all duration-300 transform hover:scale-105
                    ${
                      isOpened
                        ? "bg-gradient-to-br from-red-600 to-red-700 border-red-400 shadow-lg shadow-red-400/50"
                        : canOpen
                          ? "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/50"
                          : "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 opacity-60 cursor-not-allowed"
                    }
                    ${isCurrentlyOpening ? "animate-pulse scale-110 shadow-2xl shadow-yellow-400/50" : ""}
                    ${isEmpty ? "cursor-not-allowed" : ""}
                  `}
                  onClick={(e) => handleOpenGift(gift, e)}
                >
                  <CardContent className="p-0 h-full flex items-center justify-center relative overflow-hidden">
                    {isCurrentlyOpening ? (
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                        <p className="text-xs text-white animate-pulse">
                          {buildUpActive ? "Préparation..." : explosionActive ? "BOOM!" : "Ouverture..."}
                        </p>
                      </div>
                    ) : isOpened ? (
                      <div className="text-center p-2">
                        <Gift className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-xs text-white font-bold">Ouvert !</p>
                        <p className="text-xs text-white">{gift.order}</p>
                        {/* Affichage responsive pour le texte de re-visionnage */}
                        <p className="text-xs text-red-200 mt-1">
                          <span className="hidden sm:inline">👆 Cliquer pour revoir</span>
                          <span className="sm:hidden">👆</span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-white mb-1">{gift.order}</div>
                        {!canOpen && <p className="text-xs text-gray-300">🔒</p>}
                        {isEmpty && canOpen && <p className="text-xs text-gray-300">Vide</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>

        {/* Gift Display Modal */}
        {selectedGift && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl bg-gray-800/90 border-gray-700 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-3xl font-bold text-red-400 mb-2">Jour {selectedGift.order}</h3>
                  <h4 className="text-xl text-white mb-4">{selectedGift.title}</h4>
                  {selectedGift.opened && selectedGift.openedAt && (
                    <p className="text-sm text-gray-400 mb-2">
                      Ouvert le {new Date(selectedGift.openedAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(selectedGift.openedAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                {selectedGift.image && (
                  <div className="mb-6">
                    <img
                      src={selectedGift.image || "/placeholder.svg"}
                      alt="Cadeau"
                      className="w-full max-w-md mx-auto rounded-xl shadow-lg object-contain max-h-64 border border-gray-700"
                    />
                  </div>
                )}

                <div className="text-center mb-6">
                  <p className="text-lg text-gray-200 leading-relaxed">{selectedGift.text}</p>
                </div>

                {/* Like Button */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                      settings.likes?.find((l) => l.giftId === selectedGift.id)?.liked
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {isLiking
                      ? "..."
                      : settings.likes?.find((l) => l.giftId === selectedGift.id)?.liked
                        ? "J'adore ♥"
                        : "J'aime"}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => setSelectedGift(null)}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-2"
                  >
                    Fermer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-300">Fait avec ❤️ pour un Noël magique</p>
          </div>
        </div>
      </div>
    </div>
  )
}
