"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Sun,
  Moon,
  Leaf,
  Egg,
  Milk,
  Scissors,
  ShoppingCart,
  Home,
  Shovel,
  Award,
  Save,
  RotateCcw,
  AlertCircle,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Gift,
  Star,
  Sparkles,
  Trophy,
  Map,
  Coins,
} from "lucide-react"

// Типы данных
type Season = "Весна" | "Лето" | "Осень" | "Зима"
type TimeOfDay = "День" | "Ночь"
type Weather = "Солнечно" | "Дождь" | "Снег" | "Гроза" | "Туман"
type CropType =
  | "Пшеница"
  | "Морковь"
  | "Картофель"
  | "Кукуруза"
  | "Помидоры"
  | "Клубника"
  | "Тыква"
  | "Арбуз"
  | "Подсолнух"
type AnimalType = "Курица" | "Корова" | "Овца" | "Свинья" | "Кролик" | "Пчелы"
type ProductType = "Яйца" | "Молоко" | "Шерсть" | "Мясо" | "Мед" | "Кожа"
type ToolType = "Лейка" | "Удобрение" | "Комбайн" | "Трактор" | "Теплица" | "Пугало"
type QuestType = "Урожай" | "Животные" | "Продукты" | "Монеты" | "Уровень"

interface Crop {
  type: CropType
  growthStage: number
  maxGrowthStage: number
  daysToNextStage: number
  plotId: number
  quality: number // 1-5, влияет на цену продажи
  watered: boolean
  fertilized: boolean
}

interface Animal {
  type: AnimalType
  health: number
  hunger: number
  happiness: number // Новый параметр - влияет на производительность
  productionTimer: number
  productionRate: number
  quality: number // 1-5, влияет на качество продуктов
}

interface Plot {
  id: number
  unlocked: boolean
  price: number
  hasCrop: boolean
  crop?: Crop
  fertility: number // 1-5, влияет на скорость роста и качество
  hasProtection: boolean // Защита от погодных условий
}

interface InventoryItem {
  name: string
  quantity: number
  price: number
  sellPrice: number
  type: "seed" | "product" | "tool" | "animal" | "special"
  description: string
  quality?: number // 1-5, влияет на цену продажи
  rarity?: "Обычный" | "Необычный" | "Редкий" | "Эпический" | "Легендарный"
}

interface Quest {
  id: number
  title: string
  description: string
  type: QuestType
  target: string
  amount: number
  progress: number
  reward: {
    coins: number
    experience: number
    items?: { name: string; quantity: number; type: string }[]
  }
  completed: boolean
  timeLimit?: number // В днях, если есть ограничение
}

interface RandomEvent {
  id: number
  title: string
  description: string
  effect: string
  duration: number // В днях
  active: boolean
}

interface GameState {
  coins: number
  gems: number // Премиум валюта
  day: number
  season: Season
  timeOfDay: TimeOfDay
  weather: Weather
  farmLevel: number
  experience: number
  experienceToNextLevel: number
  plots: Plot[]
  inventory: InventoryItem[]
  animals: Animal[]
  messages: string[]
  marketPrices: { [key: string]: number }
  achievements: { [key: string]: boolean }
  quests: Quest[]
  activeEvents: RandomEvent[]
  streak: number // Дни подряд игры
  specialUnlocks: string[] // Разблокированные особые предметы/возможности
  lastSaved: number // Timestamp последнего сохранения
}

// Начальные данные
const initialGameState: GameState = {
  coins: 150,
  gems: 5,
  day: 1,
  season: "Весна",
  timeOfDay: "День",
  weather: "Солнечно",
  farmLevel: 1,
  experience: 0,
  experienceToNextLevel: 100,
  plots: Array.from({ length: 12 }, (_, i) => ({
    id: i,
    unlocked: i < 4,
    price: 50 * (i + 1),
    hasCrop: false,
    fertility: 3,
    hasProtection: false,
  })),
  inventory: [
    {
      name: "Семена пшеницы",
      quantity: 5,
      price: 5,
      sellPrice: 2,
      type: "seed",
      description: "Базовая культура, быстро растет",
      rarity: "Обычный",
    },
    {
      name: "Семена моркови",
      quantity: 3,
      price: 8,
      sellPrice: 3,
      type: "seed",
      description: "Средний срок созревания",
      rarity: "Обычный",
    },
    {
      name: "Лейка",
      quantity: 1,
      price: 15,
      sellPrice: 5,
      type: "tool",
      description: "Ускоряет рост растений",
      rarity: "Обычный",
    },
    {
      name: "Счастливая подкова",
      quantity: 1,
      price: 50,
      sellPrice: 20,
      type: "special",
      description: "Приносит удачу и увеличивает шанс редких находок",
      rarity: "Необычный",
    },
  ],
  animals: [],
  messages: ["Добро пожаловать на вашу ферму! Начните с посадки семян на доступных участках."],
  marketPrices: {
    Пшеница: 10,
    Морковь: 15,
    Картофель: 20,
    Кукуруза: 25,
    Помидоры: 30,
    Клубника: 40,
    Тыква: 35,
    Арбуз: 45,
    Подсолнух: 22,
    Яйца: 5,
    Молоко: 15,
    Шерсть: 25,
    Мясо: 40,
    Мед: 50,
    Кожа: 30,
    Курица: 50,
    Корова: 200,
    Овца: 150,
    Свинья: 180,
    Кролик: 80,
    Пчелы: 250,
    Лейка: 15,
    Удобрение: 30,
    Комбайн: 100,
    Трактор: 500,
    Теплица: 300,
    Пугало: 120,
  },
  achievements: {
    "Первый урожай": false,
    Животновод: false,
    "Богатый фермер": false,
    "Мастер фермы": false,
    Коллекционер: false,
    "Погодный маг": false,
    Счастливчик: false,
    Трудоголик: false,
    "Эксперт по животным": false,
    "Король урожая": false,
  },
  quests: [
    {
      id: 1,
      title: "Первые шаги",
      description: "Соберите 5 единиц пшеницы",
      type: "Урожай",
      target: "Пшеница",
      amount: 5,
      progress: 0,
      reward: {
        coins: 50,
        experience: 20,
        items: [{ name: "Семена картофеля", quantity: 3, type: "seed" }],
      },
      completed: false,
    },
    {
      id: 2,
      title: "Начинающий фермер",
      description: "Достигните 2 уровня фермы",
      type: "Уровень",
      target: "Уровень",
      amount: 2,
      progress: 1,
      reward: {
        coins: 100,
        experience: 30,
        items: [{ name: "Удобрение", quantity: 1, type: "tool" }],
      },
      completed: false,
    },
  ],
  activeEvents: [],
  streak: 0,
  specialUnlocks: [],
  lastSaved: Date.now(),
}

// Данные о культурах
const cropData: {
  [key in CropType]: {
    growthTime: number
    harvestYield: string
    sellPrice: number
    seedPrice: number
    seasonBonus: Season
    minLevel: number
    waterNeed: number // 1-5, насколько важен полив
    fertilizerNeed: number // 1-5, насколько важны удобрения
    rarity: "Обычный" | "Необычный" | "Редкий" | "Эпический" | "Легендарный"
  }
} = {
  Пшеница: {
    growthTime: 3,
    harvestYield: "Пшеница",
    sellPrice: 10,
    seedPrice: 5,
    seasonBonus: "Лето",
    minLevel: 1,
    waterNeed: 2,
    fertilizerNeed: 2,
    rarity: "Обычный",
  },
  Морковь: {
    growthTime: 4,
    harvestYield: "Морковь",
    sellPrice: 15,
    seedPrice: 8,
    seasonBonus: "Весна",
    minLevel: 1,
    waterNeed: 3,
    fertilizerNeed: 2,
    rarity: "Обычный",
  },
  Картофель: {
    growthTime: 5,
    harvestYield: "Картофель",
    sellPrice: 20,
    seedPrice: 10,
    seasonBonus: "Осень",
    minLevel: 2,
    waterNeed: 2,
    fertilizerNeed: 3,
    rarity: "Обычный",
  },
  Кукуруза: {
    growthTime: 6,
    harvestYield: "Кукуруза",
    sellPrice: 25,
    seedPrice: 12,
    seasonBonus: "Лето",
    minLevel: 2,
    waterNeed: 4,
    fertilizerNeed: 3,
    rarity: "Необычный",
  },
  Помидоры: {
    growthTime: 7,
    harvestYield: "Помидоры",
    sellPrice: 30,
    seedPrice: 15,
    seasonBonus: "Лето",
    minLevel: 3,
    waterNeed: 4,
    fertilizerNeed: 4,
    rarity: "Необычный",
  },
  Клубника: {
    growthTime: 8,
    harvestYield: "Клубника",
    sellPrice: 40,
    seedPrice: 20,
    seasonBonus: "Весна",
    minLevel: 3,
    waterNeed: 5,
    fertilizerNeed: 3,
    rarity: "Необычный",
  },
  Тыква: {
    growthTime: 10,
    harvestYield: "Тыква",
    sellPrice: 35,
    seedPrice: 18,
    seasonBonus: "Осень",
    minLevel: 4,
    waterNeed: 3,
    fertilizerNeed: 5,
    rarity: "Редкий",
  },
  Арбуз: {
    growthTime: 12,
    harvestYield: "Арбуз",
    sellPrice: 45,
    seedPrice: 25,
    seasonBonus: "Лето",
    minLevel: 5,
    waterNeed: 5,
    fertilizerNeed: 4,
    rarity: "Редкий",
  },
  Подсолнух: {
    growthTime: 9,
    harvestYield: "Подсолнух",
    sellPrice: 22,
    seedPrice: 14,
    seasonBonus: "Лето",
    minLevel: 4,
    waterNeed: 3,
    fertilizerNeed: 2,
    rarity: "Необычный",
  },
}

// Данные о животных
const animalData: {
  [key in AnimalType]: {
    product: ProductType
    productionRate: number
    feedCost: number
    price: number
    minLevel: number
    happiness: number // Базовый уровень счастья
    rarity: "Обычный" | "Необычный" | "Редкий" | "Эпический" | "Легендарный"
  }
} = {
  Курица: {
    product: "Яйца",
    productionRate: 1,
    feedCost: 2,
    price: 50,
    minLevel: 1,
    happiness: 70,
    rarity: "Обычный",
  },
  Корова: {
    product: "Молоко",
    productionRate: 2,
    feedCost: 5,
    price: 200,
    minLevel: 2,
    happiness: 60,
    rarity: "Обычный",
  },
  Овца: {
    product: "Шерсть",
    productionRate: 3,
    feedCost: 4,
    price: 150,
    minLevel: 3,
    happiness: 65,
    rarity: "Необычный",
  },
  Свинья: {
    product: "Мясо",
    productionRate: 4,
    feedCost: 6,
    price: 180,
    minLevel: 4,
    happiness: 55,
    rarity: "Необычный",
  },
  Кролик: {
    product: "Кожа",
    productionRate: 2,
    feedCost: 3,
    price: 80,
    minLevel: 3,
    happiness: 75,
    rarity: "Редкий",
  },
  Пчелы: {
    product: "Мед",
    productionRate: 3,
    feedCost: 2,
    price: 250,
    minLevel: 5,
    happiness: 80,
    rarity: "Редкий",
  },
}

// Случайные события
const possibleEvents: RandomEvent[] = [
  {
    id: 1,
    title: "Ярмарка",
    description: "В городе проходит ярмарка! Цены на все товары повышены на 20%.",
    effect: "marketBoost",
    duration: 3,
    active: false,
  },
  {
    id: 2,
    title: "Засуха",
    description: "Наступила засуха. Растения растут медленнее без дополнительного полива.",
    effect: "drought",
    duration: 5,
    active: false,
  },
  {
    id: 3,
    title: "Нашествие вредителей",
    description: "Вредители атакуют ваши посевы! Урожайность снижена.",
    effect: "pests",
    duration: 4,
    active: false,
  },
  {
    id: 4,
    title: "Праздник урожая",
    description: "Сегодня праздник урожая! Получайте двойной опыт за все действия.",
    effect: "expBoost",
    duration: 2,
    active: false,
  },
  {
    id: 5,
    title: "Счастливый день",
    description: "Сегодня особенно удачный день! Шанс получить редкие предметы увеличен.",
    effect: "luckyDay",
    duration: 1,
    active: false,
  },
]

// Погодные эффекты
const weatherEffects: {
  [key in Weather]: {
    cropGrowthModifier: number
    animalHappinessModifier: number
    description: string
  }
} = {
  Солнечно: {
    cropGrowthModifier: 1.2,
    animalHappinessModifier: 1.1,
    description: "Идеальная погода для роста растений",
  },
  Дождь: {
    cropGrowthModifier: 1.5,
    animalHappinessModifier: 0.9,
    description: "Растения растут быстрее, но животные менее счастливы",
  },
  Снег: {
    cropGrowthModifier: 0.5,
    animalHappinessModifier: 0.8,
    description: "Растения растут медленнее, животные требуют больше ухода",
  },
  Гроза: {
    cropGrowthModifier: 0.7,
    animalHappinessModifier: 0.7,
    description: "Опасно для растений и пугает животных",
  },
  Туман: {
    cropGrowthModifier: 0.9,
    animalHappinessModifier: 1.0,
    description: "Нейтральное влияние на ферму",
  },
}

export default function FarmSimulator() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null)
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("farm")
  const [notification, setNotification] = useState<string | null>(null)
  const [showQuestReward, setShowQuestReward] = useState<Quest | null>(null)
  const [showEventNotification, setShowEventNotification] = useState<RandomEvent | null>(null)

  // Загрузка сохраненной игры при монтировании компонента
  useEffect(() => {
    try {
      const savedGame = localStorage.getItem("farmSimulator")
      if (savedGame) {
        const parsedGame = JSON.parse(savedGame)
        console.log("Загружена сохраненная игра:", parsedGame)
        setGameState(parsedGame)
        showNotification("Игра успешно загружена!")

        // Проверяем, прошел ли день с последнего сохранения
        const lastSaved = parsedGame.lastSaved || Date.now()
        const daysPassed = Math.floor((Date.now() - lastSaved) / (1000 * 60 * 60 * 24))

        if (daysPassed > 0) {
          // Увеличиваем счетчик дней подряд
          setGameState((prev) => ({
            ...prev,
            streak: prev.streak + 1,
            lastSaved: Date.now(),
          }))

          showNotification(
            `Вы играете ${parsedGame.streak + 1} дней подряд! +${Math.min(parsedGame.streak + 1, 10)} монет бонуса`,
          )

          // Даем бонус за серию дней
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              coins: prev.coins + Math.min(prev.streak + 1, 10),
            }))
          }, 2000)
        }
      }
    } catch (e) {
      console.error("Ошибка загрузки сохранения:", e)
      showNotification("Ошибка при загрузке сохранения!")
    }
  }, [])

  // Функция сохранения игры
  const saveGame = () => {
    try {
      const gameStateWithTimestamp = {
        ...gameState,
        lastSaved: Date.now(),
      }
      localStorage.setItem("farmSimulator", JSON.stringify(gameStateWithTimestamp))
      showNotification("Игра успешно сохранена!")
      console.log("Игра сохранена:", gameStateWithTimestamp)
    } catch (error) {
      console.error("Ошибка при сохранении игры:", error)
      showNotification("Ошибка при сохранении игры!")
    }
  }

  // Автосохранение при изменении состояния игры
  useEffect(() => {
    // Пропускаем первый рендер
    if (gameState !== initialGameState) {
      const autoSaveTimeout = setTimeout(() => {
        try {
          const gameStateWithTimestamp = {
            ...gameState,
            lastSaved: Date.now(),
          }
          localStorage.setItem("farmSimulator", JSON.stringify(gameStateWithTimestamp))
          console.log("Автосохранение выполнено")
        } catch (error) {
          console.error("Ошибка при автосохранении:", error)
        }
      }, 5000) // Автосохранение через 5 секунд после последнего изменения

      return () => clearTimeout(autoSaveTimeout)
    }
  }, [gameState])

  // Функция для отображения уведомлений
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // Добавление сообщения в лог
  const addMessage = (message: string) => {
    setGameState((prev) => ({
      ...prev,
      messages: [message, ...prev.messages].slice(0, 20),
    }))
  }

  // Генерация случайного события
  const generateRandomEvent = () => {
    // Шанс события - 10%
    if (Math.random() < 0.1) {
      const availableEvents = possibleEvents.filter(
        (event) => !gameState.activeEvents.some((activeEvent) => activeEvent.id === event.id),
      )

      if (availableEvents.length > 0) {
        const randomEvent = {
          ...availableEvents[Math.floor(Math.random() * availableEvents.length)],
          active: true,
        }

        setGameState((prev) => ({
          ...prev,
          activeEvents: [...prev.activeEvents, randomEvent],
        }))

        setShowEventNotification(randomEvent)
        addMessage(`Событие: ${randomEvent.title}. ${randomEvent.description}`)
      }
    }
  }

  // Генерация погоды
  const generateWeather = () => {
    const weathers: Weather[] = ["Солнечно", "Дождь", "Снег", "Гроза", "Туман"]
    const seasonWeights = {
      Весна: [0.5, 0.3, 0.0, 0.1, 0.1],
      Лето: [0.7, 0.1, 0.0, 0.1, 0.1],
      Осень: [0.3, 0.4, 0.1, 0.1, 0.1],
      Зима: [0.2, 0.0, 0.6, 0.0, 0.2],
    }

    const weights = seasonWeights[gameState.season]
    const random = Math.random()
    let cumulativeWeight = 0

    for (let i = 0; i < weathers.length; i++) {
      cumulativeWeight += weights[i]
      if (random < cumulativeWeight) {
        return weathers[i]
      }
    }

    return "Солнечно" // По умолчанию
  }

  // Проверка достижений
  const checkAchievements = (state: GameState) => {
    const newAchievements = { ...state.achievements }
    let changed = false

    // Проверка достижения "Первый урожай"
    if (
      !newAchievements["Первый урожай"] &&
      state.inventory.some(
        (item) =>
          [
            "Пшеница",
            "Морковь",
            "Картофель",
            "Кукуруза",
            "Помидоры",
            "Клубника",
            "Тыква",
            "Арбуз",
            "Подсолнух",
          ].includes(item.name) && item.quantity > 0,
      )
    ) {
      newAchievements["Первый урожай"] = true
      addMessage("🏆 Достижение разблокировано: Первый урожай!")
      changed = true
    }

    // Проверка достижения "Животновод"
    if (!newAchievements["Животновод"] && state.animals.length >= 3) {
      newAchievements["Животновод"] = true
      addMessage("🏆 Достижение разблокировано: Животновод!")
      changed = true
    }

    // Проверка достижения "Богатый фермер"
    if (!newAchievements["Богатый фермер"] && state.coins >= 1000) {
      newAchievements["Богатый фермер"] = true
      addMessage("🏆 Достижение разблокировано: Богатый фермер!")
      changed = true
    }

    // Проверка достижения "Мастер фермы"
    if (!newAchievements["Мастер фермы"] && state.farmLevel >= 5) {
      newAchievements["Мастер фермы"] = true
      addMessage("🏆 Достижение разблокировано: Мастер фермы!")
      changed = true
    }

    // Проверка достижения "Коллекционер"
    const uniqueCrops = new Set(state.inventory.filter((item) => item.type === "product").map((item) => item.name))
    if (!newAchievements["Коллекционер"] && uniqueCrops.size >= 6) {
      newAchievements["Коллекционер"] = true
      addMessage("🏆 Достижение разблокировано: Коллекционер!")
      changed = true
    }

    // Проверка достижения "Погодный маг"
    if (!newAchievements["Погодный маг"] && state.plots.filter((plot) => plot.hasProtection).length >= 5) {
      newAchievements["Погодный маг"] = true
      addMessage("🏆 Достижение разблокировано: Погодный маг!")
      changed = true
    }

    // Проверка достижения "Счастливчик"
    if (!newAchievements["Счастливчик"] && state.streak >= 7) {
      newAchievements["Счастливчик"] = true
      addMessage("🏆 Достижение разблокировано: Счастливчик!")
      changed = true
    }

    // Проверка достижения "Трудоголик"
    if (!newAchievements["Трудоголик"] && state.day >= 30) {
      newAchievements["Трудоголик"] = true
      addMessage("🏆 Достижение разблокировано: Трудоголик!")
      changed = true
    }

    // Проверка достижения "Эксперт по животным"
    const happyAnimals = state.animals.filter((animal) => animal.happiness >= 90).length
    if (!newAchievements["Эксперт по животным"] && happyAnimals >= 3) {
      newAchievements["Эксперт по животным"] = true
      addMessage("🏆 Достижение разблокировано: Эксперт по животным!")
      changed = true
    }

    // Проверка достижения "Король урожая"
    const highQualityCrops = state.inventory.filter(
      (item) => item.type === "product" && item.quality && item.quality >= 4,
    ).length
    if (!newAchievements["Король урожая"] && highQualityCrops >= 5) {
      newAchievements["Король урожая"] = true
      addMessage("🏆 Достижение разблокировано: Король урожая!")
      changed = true
    }

    if (changed) {
      // Награда за достижение
      const achievementReward = {
        coins: 50,
        gems: 1,
        experience: 20,
      }

      setGameState((prev) => ({
        ...prev,
        achievements: newAchievements,
        coins: prev.coins + achievementReward.coins,
        gems: prev.gems + achievementReward.gems,
        experience: prev.experience + achievementReward.experience,
      }))

      showNotification(
        `Награда за достижение: +${achievementReward.coins} монет, +${achievementReward.gems} кристаллов, +${achievementReward.experience} опыта!`,
      )
    }

    return newAchievements
  }

  // Проверка выполнения квестов
  const checkQuests = (state: GameState, action: string, item?: string, amount = 1) => {
    const newQuests = [...state.quests]
    let questCompleted = false
    let completedQuest: Quest | null = null

    newQuests.forEach((quest) => {
      if (quest.completed) return

      // Проверяем тип квеста и соответствующее действие
      if (
        (quest.type === "Урожай" && action === "harvest" && item === quest.target) ||
        (quest.type === "Животные" && action === "buyAnimal" && item === quest.target) ||
        (quest.type === "Продукты" && action === "produceProduct" && item === quest.target) ||
        (quest.type === "Монеты" && action === "earnCoins" && state.coins >= quest.amount) ||
        (quest.type === "Уровень" && action === "levelUp" && state.farmLevel >= quest.amount)
      ) {
        if (quest.type !== "Монеты" && quest.type !== "Уровень") {
          quest.progress += amount
        } else if (quest.type === "Монеты") {
          quest.progress = state.coins
        } else if (quest.type === "Уровень") {
          quest.progress = state.farmLevel
        }

        // Проверяем, выполнен ли квест
        if (quest.progress >= quest.amount && !quest.completed) {
          quest.completed = true
          questCompleted = true
          completedQuest = quest
          addMessage(`🎯 Квест "${quest.title}" выполнен! Получите награду.`)
        }
      }
    })

    if (questCompleted && completedQuest) {
      setShowQuestReward(completedQuest)
    }

    return newQuests
  }

  // Получение награды за квест
  const claimQuestReward = (questId: number) => {
    setGameState((prev) => {
      const quest = prev.quests.find((q) => q.id === questId)
      if (!quest) return prev

      const newInventory = [...prev.inventory]

      // Добавляем предметы из награды
      if (quest.reward.items) {
        quest.reward.items.forEach((rewardItem) => {
          const existingItemIndex = newInventory.findIndex(
            (item) => item.name === rewardItem.name && item.type === rewardItem.type,
          )

          if (existingItemIndex >= 0) {
            newInventory[existingItemIndex].quantity += rewardItem.quantity
          } else {
            // Создаем новый предмет в инвентаре
            const newItem: InventoryItem = {
              name: rewardItem.name,
              quantity: rewardItem.quantity,
              price: 0,
              sellPrice: 0,
              type: rewardItem.type as any,
              description: `Награда за квест "${quest.title}"`,
              rarity: "Необычный",
            }

            // Устанавливаем цены в зависимости от типа
            if (rewardItem.type === "seed") {
              const cropType = rewardItem.name.replace("Семена ", "") as CropType
              if (cropData[cropType]) {
                newItem.price = cropData[cropType].seedPrice
                newItem.sellPrice = Math.floor(cropData[cropType].seedPrice / 2)
              }
            } else if (rewardItem.type === "tool") {
              newItem.price = prev.marketPrices[rewardItem.name] || 20
              newItem.sellPrice = Math.floor(newItem.price / 3)
            }

            newInventory.push(newItem)
          }
        })
      }

      // Генерируем новый квест взамен выполненного
      const newQuests = prev.quests.map((q) => (q.id === questId ? { ...q } : q))

      // Создаем новый квест
      const questTypes: QuestType[] = ["Урожай", "Животные", "Продукты", "Монеты", "Уровень"]
      const randomType = questTypes[Math.floor(Math.random() * questTypes.length)]

      const newQuest: Quest = {
        id: Math.max(...prev.quests.map((q) => q.id)) + 1,
        title: "",
        description: "",
        type: randomType,
        target: "",
        amount: 0,
        progress: 0,
        reward: {
          coins: 0,
          experience: 0,
        },
        completed: false,
      }

      // Настраиваем квест в зависимости от типа
      switch (randomType) {
        case "Урожай":
          const availableCrops = Object.keys(cropData).filter(
            (crop) => cropData[crop as CropType].minLevel <= prev.farmLevel,
          )
          const randomCrop = availableCrops[Math.floor(Math.random() * availableCrops.length)] as CropType
          newQuest.target = randomCrop
          newQuest.amount = Math.floor(Math.random() * 5) + 3
          newQuest.title = `Фермер-растениевод`
          newQuest.description = `Соберите ${newQuest.amount} единиц ${randomCrop}`
          break

        case "Животные":
          const availableAnimals = Object.keys(animalData).filter(
            (animal) => animalData[animal as AnimalType].minLevel <= prev.farmLevel,
          )
          const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)] as AnimalType
          newQuest.target = randomAnimal
          newQuest.amount = 1
          newQuest.title = `Новый питомец`
          newQuest.description = `Купите ${randomAnimal}`
          break

        case "Продукты":
          const availableProducts: ProductType[] = ["Яйца", "Молоко", "Шерсть", "Мясо", "Мед", "Кожа"]
          const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)]
          newQuest.target = randomProduct
          newQuest.amount = Math.floor(Math.random() * 3) + 2
          newQuest.title = `Производитель`
          newQuest.description = `Получите ${newQuest.amount} единиц ${randomProduct}`
          break

        case "Монеты":
          newQuest.target = "Монеты"
          newQuest.amount = prev.farmLevel * 200 + Math.floor(Math.random() * 100)
          newQuest.progress = prev.coins
          newQuest.title = `Накопитель`
          newQuest.description = `Накопите ${newQuest.amount} монет`
          break

        case "Уровень":
          newQuest.target = "Уровень"
          newQuest.amount = prev.farmLevel + 1
          newQuest.progress = prev.farmLevel
          newQuest.title = `Опытный фермер`
          newQuest.description = `Достигните ${newQuest.amount} уровня фермы`
          break
      }

      // Устанавливаем награду в зависимости от сложности
      const baseReward = prev.farmLevel * 30
      newQuest.reward = {
        coins: baseReward + Math.floor(Math.random() * 50),
        experience: Math.floor(baseReward / 2) + Math.floor(Math.random() * 20),
      }

      // Шанс 30% на дополнительную награду предметом
      if (Math.random() < 0.3) {
        const itemTypes = ["seed", "tool"]
        const randomItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)]

        if (randomItemType === "seed") {
          const availableCrops = Object.keys(cropData).filter(
            (crop) => cropData[crop as CropType].minLevel <= prev.farmLevel + 1,
          )
          const randomCrop = availableCrops[Math.floor(Math.random() * availableCrops.length)] as CropType

          newQuest.reward.items = [
            {
              name: `Семена ${randomCrop}`,
              quantity: Math.floor(Math.random() * 2) + 1,
              type: "seed",
            },
          ]
        } else {
          const tools = ["Лейка", "Удобрение", "Пугало"]
          const randomTool = tools[Math.floor(Math.random() * tools.length)]

          newQuest.reward.items = [
            {
              name: randomTool,
              quantity: 1,
              type: "tool",
            },
          ]
        }
      }

      // Добавляем новый квест
      newQuests.push(newQuest)

      return {
        ...prev,
        coins: prev.coins + quest.reward.coins,
        experience: prev.experience + quest.reward.experience,
        inventory: newInventory,
        quests: newQuests,
      }
    })

    setShowQuestReward(null)
  }

  // Переход к следующему дню
  const nextDay = () => {
    // Генерируем случайное событие
    generateRandomEvent()

    setGameState((prev) => {
      // Обновляем время суток
      const newTimeOfDay: TimeOfDay = prev.timeOfDay === "День" ? "Ночь" : "День"

      // Если наступает новый день
      let newDay = prev.day
      let newSeason = prev.season
      let newWeather = prev.weather

      if (newTimeOfDay === "День") {
        newDay += 1

        // Генерируем новую погоду
        newWeather = generateWeather()
        addMessage(`Погода сегодня: ${newWeather}. ${weatherEffects[newWeather].description}`)

        // Смена сезона каждые 28 дней
        if (newDay % 28 === 0) {
          const seasons: Season[] = ["Весна", "Лето", "Осень", "Зима"]
          const currentIndex = seasons.indexOf(prev.season)
          newSeason = seasons[(currentIndex + 1) % 4]
          addMessage(`🍂 Наступил новый сезон: ${newSeason}!`)
        }
      }

      // Обновляем активные события
      const newActiveEvents = prev.activeEvents
        .map((event) => {
          if (newTimeOfDay === "День") {
            return { ...event, duration: event.duration - 1 }
          }
          return event
        })
        .filter((event) => event.duration > 0)

      // Обновляем рост культур
      const newPlots = [...prev.plots]
      for (let i = 0; i < newPlots.length; i++) {
        if (newPlots[i].hasCrop && newPlots[i].crop) {
          const crop = newPlots[i].crop

          // Проверяем бонус сезона
          let growthMultiplier = cropData[crop.type].seasonBonus === newSeason ? 2 : 1

          // Применяем эффект погоды, если нет защиты
          if (!newPlots[i].hasProtection) {
            growthMultiplier *= weatherEffects[newWeather].cropGrowthModifier
          }

          // Проверяем эффекты активных событий
          if (newActiveEvents.some((event) => event.effect === "drought")) {
            if (!crop.watered) {
              growthMultiplier *= 0.5 // Засуха замедляет рост неполитых растений
            }
          }

          if (newActiveEvents.some((event) => event.effect === "pests")) {
            growthMultiplier *= 0.7 // Вредители снижают скорость роста
          }

          // Учитываем плодородие участка
          growthMultiplier *= 0.8 + newPlots[i].fertility * 0.1

          // Учитываем полив и удобрение
          if (crop.watered) {
            growthMultiplier *= 1.2
            crop.watered = false // Сбрасываем статус полива
          }

          if (crop.fertilized) {
            growthMultiplier *= 1.3
            // Удобрение действует несколько дней
            if (Math.random() < 0.3) {
              crop.fertilized = false
            }
          }

          // Уменьшаем дни до следующей стадии
          crop.daysToNextStage -= growthMultiplier

          // Если достигли следующей стадии роста
          if (crop.daysToNextStage <= 0) {
            crop.growthStage += 1

            // Если культура созрела
            if (crop.growthStage >= crop.maxGrowthStage) {
              addMessage(`🌱 ${crop.type} на участке ${i + 1} созрела и готова к сбору!`)
            } else {
              // Устанавливаем новый таймер для следующей стадии
              crop.daysToNextStage = Math.ceil(cropData[crop.type].growthTime / crop.maxGrowthStage)
            }
          }
        }
      }

      // Обновляем животных
      const newAnimals = [...prev.animals]
      const newInventory = [...prev.inventory]

      for (let i = 0; i < newAnimals.length; i++) {
        const animal = newAnimals[i]

        // Увеличиваем голод
        animal.hunger = Math.min(animal.hunger + 10, 100)

        // Изменяем счастье в зависимости от погоды
        animal.happiness = Math.max(
          0,
          Math.min(100, animal.happiness + (weatherEffects[newWeather].animalHappinessModifier - 1) * 10),
        )

        // Если животное голодное, уменьшаем счастье
        if (animal.hunger > 50) {
          animal.happiness = Math.max(0, animal.happiness - 5)
        }

        // Если животное не голодное, производим продукты
        if (animal.hunger < 70) {
          animal.productionTimer += 1

          // Счастье влияет на скорость производства
          const happinessBonus = animal.happiness >= 80 ? 0.5 : 0

          if (animal.productionTimer >= animal.productionRate - happinessBonus) {
            animal.productionTimer = 0
            const product = animalData[animal.type].product

            // Качество продукта зависит от счастья и здоровья
            const productQuality = Math.max(1, Math.min(5, Math.floor((animal.happiness + animal.health) / 40)))

            // Добавляем продукт в инвентарь
            const productIndex = newInventory.findIndex(
              (item) => item.name === product && item.quality === productQuality,
            )

            if (productIndex >= 0) {
              newInventory[productIndex].quantity += 1
            } else {
              newInventory.push({
                name: product,
                quantity: 1,
                price: 0,
                sellPrice: prev.marketPrices[product] * (0.8 + productQuality * 0.1),
                type: "product",
                description: `Продукт от ${animal.type}`,
                quality: productQuality,
                rarity: productQuality >= 4 ? "Редкий" : productQuality >= 3 ? "Необычный" : "Обычный",
              })
            }

            addMessage(`🐾 ${animal.type} произвела ${product} (качество: ${productQuality})!`)

            // Проверяем выполнение квестов
            checkQuests(prev, "produceProduct", product)
          }
        } else {
          // Если животное голодное, уменьшаем здоровье
          animal.health -= 5
          if (animal.health <= 0) {
            addMessage(`😢 ${animal.type} заболела из-за голода и была продана за полцены!`)
            // Продаем животное за полцены
            const halfPrice = Math.floor(animalData[animal.type].price / 2)
            newAnimals.splice(i, 1)
            i--
            return {
              ...prev,
              coins: prev.coins + halfPrice,
              animals: newAnimals,
              timeOfDay: newTimeOfDay,
              day: newDay,
              season: newSeason,
              weather: newWeather,
              plots: newPlots,
              inventory: newInventory,
              activeEvents: newActiveEvents,
              messages: [
                `😢 ${animal.type} заболела из-за голода и была продана за ${halfPrice} монет!`,
                ...prev.messages,
              ].slice(0, 20),
            }
          }
        }
      }

      // Случайное изменение цен на рынке
      const newMarketPrices = { ...prev.marketPrices }
      Object.keys(newMarketPrices).forEach((item) => {
        const change = Math.random() > 0.5 ? 1 : -1
        const amount = Math.floor(Math.random() * 3) + 1
        newMarketPrices[item] = Math.max(1, newMarketPrices[item] + change * amount)
      })

      // Проверяем эффект ярмарки
      if (newActiveEvents.some((event) => event.effect === "marketBoost")) {
        Object.keys(newMarketPrices).forEach((item) => {
          newMarketPrices[item] = Math.floor(newMarketPrices[item] * 1.2)
        })
      }

      // Обновляем цены продажи в инвентаре
      for (const item of newInventory) {
        if (
          item.type === "product" ||
          [
            "Пшеница",
            "Морковь",
            "Картофель",
            "Кукуруза",
            "Помидоры",
            "Клубника",
            "Тыква",
            "Арбуз",
            "Подсолнух",
          ].includes(item.name)
        ) {
          const basePrice = newMarketPrices[item.name]
          // Учитываем качество продукта
          item.sellPrice = item.quality ? Math.floor(basePrice * (0.8 + item.quality * 0.1)) : basePrice
        }
      }

      return {
        ...prev,
        timeOfDay: newTimeOfDay,
        day: newDay,
        season: newSeason,
        weather: newWeather,
        plots: newPlots,
        animals: newAnimals,
        inventory: newInventory,
        marketPrices: newMarketPrices,
        activeEvents: newActiveEvents,
      }
    })
  }

  // Покупка участка
  const buyPlot = (plotId: number) => {
    const plot = gameState.plots[plotId]

    if (gameState.coins < plot.price) {
      showNotification("Недостаточно монет!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      newPlots[plotId].unlocked = true

      // Случайное плодородие для нового участка
      newPlots[plotId].fertility = Math.floor(Math.random() * 3) + 2 // 2-4

      addMessage(
        `🌱 Вы приобрели участок ${plotId + 1} за ${plot.price} монет! Плодородие: ${newPlots[plotId].fertility}/5`,
      )

      return {
        ...prev,
        coins: prev.coins - plot.price,
        plots: newPlots,
        experience: prev.experience + 10,
      }
    })
  }

  // Улучшение плодородия участка
  const improvePlotFertility = (plotId: number) => {
    const plot = gameState.plots[plotId]
    const cost = 20 * plot.fertility

    if (gameState.coins < cost) {
      showNotification("Недостаточно монет!")
      return
    }

    if (plot.fertility >= 5) {
      showNotification("Плодородие уже максимальное!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      newPlots[plotId].fertility += 1

      addMessage(`🌱 Вы улучшили плодородие участка ${plotId + 1} до ${newPlots[plotId].fertility}/5 за ${cost} монет!`)

      return {
        ...prev,
        coins: prev.coins - cost,
        plots: newPlots,
        experience: prev.experience + 5,
      }
    })
  }

  // Установка защиты от погоды
  const addWeatherProtection = (plotId: number) => {
    const plot = gameState.plots[plotId]
    const cost = 100

    if (gameState.coins < cost) {
      showNotification("Недостаточно монет!")
      return
    }

    if (plot.hasProtection) {
      showNotification("Защита уже установлена!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      newPlots[plotId].hasProtection = true

      addMessage(`🛡️ Вы установили защиту от погоды на участке ${plotId + 1} за ${cost} монет!`)

      return {
        ...prev,
        coins: prev.coins - cost,
        plots: newPlots,
        experience: prev.experience + 15,
      }
    })
  }

  // Посадка семян
  const plantSeed = (plotId: number, seedName: string) => {
    if (!selectedSeed) return

    const seedIndex = gameState.inventory.findIndex((item) => item.name === seedName && item.type === "seed")
    if (seedIndex === -1 || gameState.inventory[seedIndex].quantity <= 0) {
      showNotification("У вас нет этих семян!")
      return
    }

    // Извлекаем название культуры из названия семян
    const cropType = seedName.replace("Семена ", "") as CropType

    // Проверяем, существует ли такой тип культуры в cropData
    if (!cropData[cropType]) {
      showNotification(`Ошибка: неизвестный тип культуры ${cropType}`)
      console.error(`Неизвестный тип культуры: ${cropType}. Доступные типы:`, Object.keys(cropData))
      return
    }

    // Проверяем уровень фермы
    if (gameState.farmLevel < cropData[cropType].minLevel) {
      showNotification(`Для выращивания ${cropType} требуется уровень фермы ${cropData[cropType].minLevel}!`)
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      const newInventory = [...prev.inventory]

      // Уменьшаем количество семян
      newInventory[seedIndex].quantity -= 1
      if (newInventory[seedIndex].quantity <= 0) {
        newInventory.splice(seedIndex, 1)
      }

      // Создаем новую культуру
      const maxGrowthStage = 4 // 4 стадии роста
      const plot = newPlots[plotId]

      // Базовое качество зависит от плодородия участка
      const baseQuality = Math.max(1, Math.min(5, plot.fertility))

      newPlots[plotId].hasCrop = true
      newPlots[plotId].crop = {
        type: cropType,
        growthStage: 0,
        maxGrowthStage: maxGrowthStage,
        daysToNextStage: Math.ceil(cropData[cropType].growthTime / maxGrowthStage),
        plotId: plotId,
        quality: baseQuality,
        watered: false,
        fertilized: false,
      }

      addMessage(`🌱 Вы посадили ${cropType} на участке ${plotId + 1}!`)

      return {
        ...prev,
        plots: newPlots,
        inventory: newInventory,
        experience: prev.experience + 2,
      }
    })

    setSelectedPlot(null)
    setSelectedSeed(null)
  }

  // Полив растения
  const waterCrop = (plotId: number) => {
    const plot = gameState.plots[plotId]
    if (!plot.hasCrop || !plot.crop) {
      showNotification("На этом участке ничего не растет!")
      return
    }

    if (plot.crop.watered) {
      showNotification("Растение уже полито!")
      return
    }

    // Проверяем наличие лейки
    const hasWateringCan = gameState.inventory.some(
      (item) => item.name === "Лейка" && item.type === "tool" && item.quantity > 0,
    )

    if (!hasWateringCan) {
      showNotification("У вас нет лейки!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      newPlots[plotId].crop!.watered = true

      // Шанс повысить качество
      if (Math.random() < 0.1) {
        newPlots[plotId].crop!.quality = Math.min(5, newPlots[plotId].crop!.quality + 1)
        addMessage(
          `✨ Качество ${newPlots[plotId].crop!.type} на участке ${plotId + 1} повысилось до ${newPlots[plotId].crop!.quality}!`,
        )
      }

      addMessage(`💧 Вы полили ${newPlots[plotId].crop!.type} на участке ${plotId + 1}!`)

      return {
        ...prev,
        plots: newPlots,
        experience: prev.experience + 1,
      }
    })
  }

  // Удобрение растения
  const fertilizeCrop = (plotId: number) => {
    const plot = gameState.plots[plotId]
    if (!plot.hasCrop || !plot.crop) {
      showNotification("На этом участке ничего не растет!")
      return
    }

    if (plot.crop.fertilized) {
      showNotification("Растение уже удобрено!")
      return
    }

    // Проверяем наличие удобрения
    const fertilizerIndex = gameState.inventory.findIndex(
      (item) => item.name === "Удобрение" && item.type === "tool" && item.quantity > 0,
    )

    if (fertilizerIndex === -1) {
      showNotification("У вас нет удобрения!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      const newInventory = [...prev.inventory]

      // Уменьшаем количество удобрения
      newInventory[fertilizerIndex].quantity -= 1
      if (newInventory[fertilizerIndex].quantity <= 0) {
        newInventory.splice(fertilizerIndex, 1)
      }

      newPlots[plotId].crop!.fertilized = true

      // Шанс повысить качество
      if (Math.random() < 0.2) {
        newPlots[plotId].crop!.quality = Math.min(5, newPlots[plotId].crop!.quality + 1)
        addMessage(
          `✨ Качество ${newPlots[plotId].crop!.type} на участке ${plotId + 1} повысилось до ${newPlots[plotId].crop!.quality}!`,
        )
      }

      addMessage(`🌿 Вы удобрили ${newPlots[plotId].crop!.type} на участке ${plotId + 1}!`)

      return {
        ...prev,
        plots: newPlots,
        inventory: newInventory,
        experience: prev.experience + 2,
      }
    })
  }

  // Сбор урожая
  const harvestCrop = (plotId: number) => {
    const plot = gameState.plots[plotId]
    if (!plot.hasCrop || !plot.crop || plot.crop.growthStage < plot.crop.maxGrowthStage) {
      showNotification("Урожай еще не созрел!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      const newInventory = [...prev.inventory]

      const crop = newPlots[plotId].crop!
      const cropType = crop.type
      const cropQuality = crop.quality

      // Базовое количество урожая
      let harvestAmount = Math.floor(Math.random() * 2) + 1 // 1-2 единицы урожая

      // Бонус за качество
      harvestAmount += Math.floor(cropQuality / 2)

      // Бонус за сезон
      if (cropData[cropType].seasonBonus === prev.season) {
        harvestAmount += 1
      }

      // Проверяем наличие активных событий
      if (prev.activeEvents.some((event) => event.effect === "pests")) {
        harvestAmount = Math.max(1, harvestAmount - 1) // Вредители уменьшают урожай
      }

      // Проверяем наличие комбайна для бонуса
      const hasHarvester = prev.inventory.some(
        (item) => item.name === "Комбайн" && item.type === "tool" && item.quantity > 0,
      )

      if (hasHarvester) {
        harvestAmount += 1
      }

      // Добавляем урожай в инвентарь
      const cropIndex = newInventory.findIndex((item) => item.name === cropType && item.quality === cropQuality)

      if (cropIndex >= 0) {
        newInventory[cropIndex].quantity += harvestAmount
      } else {
        // Цена продажи зависит от качества
        const sellPrice = Math.floor(prev.marketPrices[cropType] * (0.8 + cropQuality * 0.1))

        newInventory.push({
          name: cropType,
          quantity: harvestAmount,
          price: 0,
          sellPrice: sellPrice,
          type: "product",
          description: `Урожай ${cropType}`,
          quality: cropQuality,
          rarity: cropQuality >= 4 ? "Редкий" : cropQuality >= 3 ? "Необычный" : "Обычный",
        })
      }

      // Очищаем участок
      newPlots[plotId].hasCrop = false
      newPlots[plotId].crop = undefined

      addMessage(`🌾 Вы собрали ${harvestAmount} ${cropType} (качество: ${cropQuality}) с участка ${plotId + 1}!`)

      // Проверяем выполнение квестов
      const newQuests = checkQuests(prev, "harvest", cropType, harvestAmount)

      // Бонус опыта за качество
      const expBonus = cropQuality * 2

      // Проверяем наличие бонуса опыта от события
      const expMultiplier = prev.activeEvents.some((event) => event.effect === "expBoost") ? 2 : 1

      const newState = {
        ...prev,
        plots: newPlots,
        inventory: newInventory,
        experience: prev.experience + (5 + expBonus) * expMultiplier,
        quests: newQuests,
      }

      // Проверяем достижения
      checkAchievements(newState)

      // Проверяем уровень
      if (newState.experience >= newState.experienceToNextLevel) {
        newState.farmLevel += 1
        newState.experience -= newState.experienceToNextLevel
        newState.experienceToNextLevel = Math.floor(newState.experienceToNextLevel * 1.5)
        addMessage(`🎉 Поздравляем! Вы достигли ${newState.farmLevel} уровня фермы!`)

        // Проверяем выполнение квестов по уровню
        checkQuests(newState, "levelUp")

        // Бонус за новый уровень
        newState.coins += newState.farmLevel * 50
        addMessage(`💰 Бонус за новый уровень: ${newState.farmLevel * 50} монет!`)

        // Шанс получить кристалл
        if (Math.random() < 0.5) {
          newState.gems += 1
          addMessage(`💎 Вы получили 1 кристалл за новый уровень!`)
        }
      }

      return newState
    })
  }

  // Покупка товара
  const buyItem = (itemName: string, itemType: "seed" | "tool" | "animal" | "special") => {
    let price = 0

    if (itemType === "seed") {
      const cropType = itemName.replace("Семена ", "") as CropType
      price = cropData[cropType].seedPrice
    } else if (itemType === "animal") {
      const animalType = itemName as AnimalType
      price = animalData[animalType].price
    } else {
      price = gameState.marketPrices[itemName]
    }

    if (gameState.coins < price) {
      showNotification("Недостаточно монет!")
      return
    }

    // Проверяем уровень для покупки
    if (itemType === "seed") {
      const cropType = itemName.replace("Семена ", "") as CropType
      if (gameState.farmLevel < cropData[cropType].minLevel) {
        showNotification(`Для покупки ${itemName} требуется уровень фермы ${cropData[cropType].minLevel}!`)
        return
      }
    } else if (itemType === "animal") {
      const animalType = itemName as AnimalType
      if (gameState.farmLevel < animalData[animalType].minLevel) {
        showNotification(`Для покупки ${itemName} требуется уровень фермы ${animalData[animalType].minLevel}!`)
        return
      }
    }

    setGameState((prev) => {
      const newInventory = [...prev.inventory]
      const newAnimals = [...prev.animals]

      if (itemType === "animal") {
        // Добавляем животное
        const animalType = itemName as AnimalType
        newAnimals.push({
          type: animalType,
          health: 100,
          hunger: 0,
          happiness: animalData[animalType].happiness,
          productionTimer: 0,
          productionRate: animalData[animalType].productionRate,
          quality: 3, // Стандартное качество
        })

        addMessage(`🐾 Вы купили ${animalType} за ${price} монет!`)

        // Проверяем выполнение квестов
        checkQuests(prev, "buyAnimal", animalType)
      } else {
        // Добавляем предмет в инвентарь
        const itemIndex = newInventory.findIndex((item) => item.name === itemName)
        if (itemIndex >= 0) {
          newInventory[itemIndex].quantity += 1
        } else {
          let description = ""
          let sellPrice = 0
          let rarity = "Обычный"

          if (itemType === "seed") {
            const cropType = itemName.replace("Семена ", "") as CropType
            description = `Семена для выращивания ${cropType}`
            sellPrice = Math.floor(price / 2)
            rarity = cropData[cropType].rarity
          } else if (itemType === "tool") {
            description = "Инструмент для ухода за фермой"
            sellPrice = Math.floor(price / 3)
            rarity = price > 100 ? "Редкий" : "Обычный"
          } else if (itemType === "special") {
            description = "Особый предмет с уникальными свойствами"
            sellPrice = Math.floor(price / 4)
            rarity = "Редкий"
          }

          newInventory.push({
            name: itemName,
            quantity: 1,
            price: price,
            sellPrice: sellPrice,
            type: itemType,
            description: description,
            rarity: rarity as any,
          })
        }

        addMessage(`🛒 Вы купили ${itemName} за ${price} монет!`)
      }

      const newState = {
        ...prev,
        coins: prev.coins - price,
        inventory: newInventory,
        animals: newAnimals,
      }

      // Проверяем достижения
      checkAchievements(newState)

      return newState
    })
  }

  // Продажа товара
  const sellItem = (itemName: string, quantity = 1, quality?: number) => {
    const itemIndex = gameState.inventory.findIndex(
      (item) => item.name === itemName && (quality === undefined || item.quality === quality),
    )

    if (itemIndex === -1 || gameState.inventory[itemIndex].quantity < quantity) {
      showNotification("У вас нет этого предмета!")
      return
    }

    const item = gameState.inventory[itemIndex]
    const totalPrice = item.sellPrice * quantity

    // Проверяем наличие бонуса от ярмарки
    const marketBoost = gameState.activeEvents.some((event) => event.effect === "marketBoost") ? 1.2 : 1
    const finalPrice = Math.floor(totalPrice * marketBoost)

    setGameState((prev) => {
      const newInventory = [...prev.inventory]

      newInventory[itemIndex].quantity -= quantity
      if (newInventory[itemIndex].quantity <= 0) {
        newInventory.splice(itemIndex, 1)
      }

      addMessage(
        `💰 Вы продали ${quantity} ${itemName}${quality ? ` (качество: ${quality})` : ""} за ${finalPrice} монет!`,
      )

      // Проверяем выполнение квестов по монетам
      const newQuests = checkQuests(prev, "earnCoins")

      const newState = {
        ...prev,
        coins: prev.coins + finalPrice,
        inventory: newInventory,
        experience: prev.experience + quantity,
        quests: newQuests,
      }

      // Проверяем уровень
      if (newState.experience >= newState.experienceToNextLevel) {
        newState.farmLevel += 1
        newState.experience -= newState.experienceToNextLevel
        newState.experienceToNextLevel = Math.floor(newState.experienceToNextLevel * 1.5)
        addMessage(`🎉 Поздравляем! Вы достигли ${newState.farmLevel} уровня фермы!`)

        // Проверяем выполнение квестов по уровню
        checkQuests(newState, "levelUp")
      }

      return newState
    })
  }

  // Кормление животного
  const feedAnimal = (animalIndex: number) => {
    const animal = gameState.animals[animalIndex]
    const feedCost = animalData[animal.type].feedCost

    if (gameState.coins < feedCost) {
      showNotification("Недостаточно монет для покупки корма!")
      return
    }

    setGameState((prev) => {
      const newAnimals = [...prev.animals]

      newAnimals[animalIndex].hunger = 0

      // Увеличиваем счастье
      newAnimals[animalIndex].happiness = Math.min(100, newAnimals[animalIndex].happiness + 10)

      // Восстанавливаем здоровье
      if (newAnimals[animalIndex].health < 100) {
        newAnimals[animalIndex].health = Math.min(100, newAnimals[animalIndex].health + 10)
      }

      addMessage(`🍽️ Вы покормили ${animal.type} за ${feedCost} монет!`)

      return {
        ...prev,
        coins: prev.coins - feedCost,
        animals: newAnimals,
        experience: prev.experience + 2,
      }
    })
  }

  // Игра с животным (повышает счастье)
  const playWithAnimal = (animalIndex: number) => {
    setGameState((prev) => {
      const newAnimals = [...prev.animals]
      const animal = newAnimals[animalIndex]

      // Значительно увеличиваем счастье
      animal.happiness = Math.min(100, animal.happiness + 20)

      // Шанс повысить качество продукции
      if (Math.random() < 0.1) {
        animal.quality = Math.min(5, animal.quality + 1)
        addMessage(`✨ Качество продукции ${animal.type} повысилось до ${animal.quality}!`)
      }

      addMessage(`❤️ Вы поиграли с ${animal.type}! Счастье повысилось до ${animal.happiness}%`)

      return {
        ...prev,
        animals: newAnimals,
        experience: prev.experience + 3,
      }
    })
  }

  // Использование инструмента
  const useTool = (plotId: number, toolName: string) => {
    const toolIndex = gameState.inventory.findIndex((item) => item.name === toolName && item.type === "tool")
    if (toolIndex === -1 || gameState.inventory[toolIndex].quantity <= 0) {
      showNotification("У вас нет этого инструмента!")
      return
    }

    const plot = gameState.plots[plotId]
    if (!plot.hasCrop || !plot.crop) {
      showNotification("На этом участке ничего не растет!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      const crop = newPlots[plotId].crop!

      if (toolName === "Лейка") {
        // Лейка ускоряет рост
        crop.daysToNextStage = Math.max(1, crop.daysToNextStage - 1)
        crop.watered = true
        addMessage(`💧 Вы полили ${crop.type} на участке ${plotId + 1}!`)
      } else if (toolName === "Удобрение") {
        // Удобрение значительно ускоряет рост
        crop.daysToNextStage = Math.max(1, crop.daysToNextStage - 2)
        crop.fertilized = true
        addMessage(`🌿 Вы удобрили ${crop.type} на участке ${plotId + 1}!`)
      } else if (toolName === "Пугало") {
        // Пугало защищает от вредителей
        newPlots[plotId].hasProtection = true
        addMessage(`🧥 Вы установили пугало на участке ${plotId + 1}!`)
      }

      return {
        ...prev,
        plots: newPlots,
        experience: prev.experience + 1,
      }
    })
  }

  // Использование кристаллов для ускорения роста
  const useGemsToBoostGrowth = (plotId: number) => {
    const plot = gameState.plots[plotId]
    if (!plot.hasCrop || !plot.crop) {
      showNotification("На этом участке ничего не растет!")
      return
    }

    if (gameState.gems < 1) {
      showNotification("Недостаточно кристаллов!")
      return
    }

    setGameState((prev) => {
      const newPlots = [...prev.plots]
      const crop = newPlots[plotId].crop!

      // Мгновенно продвигаем рост на одну стадию
      crop.growthStage += 1

      // Если культура созрела
      if (crop.growthStage >= crop.maxGrowthStage) {
        addMessage(`✨ ${crop.type} на участке ${plotId + 1} мгновенно созрела благодаря магии кристалла!`)
      } else {
        // Устанавливаем новый таймер для следующей стадии
        crop.daysToNextStage = Math.ceil(cropData[crop.type].growthTime / crop.maxGrowthStage)
        addMessage(`✨ ${crop.type} на участке ${plotId + 1} значительно выросла благодаря магии кристалла!`)
      }

      // Повышаем качество
      crop.quality = Math.min(5, crop.quality + 1)
      addMessage(`✨ Качество ${crop.type} повысилось до ${crop.quality}!`)

      return {
        ...prev,
        gems: prev.gems - 1,
        plots: newPlots,
      }
    })
  }

  // Сброс игры
  const resetGame = () => {
    if (confirm("Вы уверены, что хотите начать новую игру? Весь прогресс будет потерян.")) {
      localStorage.removeItem("farmSimulator")
      setGameState(initialGameState)
      setSelectedPlot(null)
      setSelectedSeed(null)
      setActiveTab("farm")
      showNotification("Игра сброшена!")
    }
  }

  // Функция для отладки
  const debugGameState = () => {
    console.log("Текущее состояние игры:", gameState)
    console.log("Доступные типы культур:", Object.keys(cropData))
    console.log("Инвентарь:", gameState.inventory)
    console.log("Активные события:", gameState.activeEvents)
    console.log("Квесты:", gameState.quests)
  }

  // Отображение прогресса роста культуры
  const renderCropProgress = (crop: Crop) => {
    const progress = (crop.growthStage / crop.maxGrowthStage) * 100
    return (
      <div className="mt-1">
        <Progress value={progress} className="h-2" />
        <p className="text-xs mt-1">
          {crop.growthStage < crop.maxGrowthStage
            ? `Рост: ${Math.ceil(crop.daysToNextStage)} дн. до след. стадии`
            : "Готово к сбору!"}
        </p>
        <div className="flex items-center mt-1">
          <p className="text-xs">Качество: {crop.quality}/5</p>
          {crop.watered && <Badge className="ml-1 text-xs bg-blue-100 text-blue-800">Полито</Badge>}
          {crop.fertilized && <Badge className="ml-1 text-xs bg-green-100 text-green-800">Удобрено</Badge>}
        </div>
      </div>
    )
  }

  // Отображение иконки погоды
  const renderWeatherIcon = (weather: Weather) => {
    switch (weather) {
      case "Солнечно":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "Дождь":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case "Снег":
        return <CloudSnow className="h-5 w-5 text-blue-200" />
      case "Гроза":
        return <Zap className="h-5 w-5 text-yellow-600" />
      case "Туман":
        return <Cloud className="h-5 w-5 text-gray-400" />
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />
    }
  }

  // Отображение иконки редкости
  const renderRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "Обычный":
        return <Badge className="bg-gray-100 text-gray-800">Обычный</Badge>
      case "Необычный":
        return <Badge className="bg-green-100 text-green-800">Необычный</Badge>
      case "Редкий":
        return <Badge className="bg-blue-100 text-blue-800">Редкий</Badge>
      case "Эпический":
        return <Badge className="bg-purple-100 text-purple-800">Эпический</Badge>
      case "Легендарный":
        return <Badge className="bg-orange-100 text-orange-800">Легендарный</Badge>
      default:
        return null
    }
  }

  const seedsSection = (
    <div>
      <h3 className="font-medium mb-2">Семена</h3>
      {gameState.inventory.filter((item) => item.type === "seed").length === 0 ? (
        <p className="text-sm text-gray-500">У вас нет семян. Купите их на рынке.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {gameState.inventory
            .filter((item) => item.type === "seed")
            .map((seed, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{seed.name}</p>
                      <p className="text-sm text-gray-500">Количество: {seed.quantity}</p>
                      {seed.rarity && <div className="mt-1">{renderRarityIcon(seed.rarity)}</div>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => sellItem(seed.name)}>
                      Продать за {seed.sellPrice}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )

  const productsSection = (
    <div>
      <h3 className="font-medium mb-2">Урожай и продукты</h3>
      {gameState.inventory.filter((item) => item.type === "product").length === 0 ? (
        <p className="text-sm text-gray-500">У вас нет продуктов. Соберите урожай или получите продукты от животных.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {gameState.inventory
            .filter((item) => item.type === "product")
            .map((product, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Количество: {product.quantity}</p>
                      <p className="text-sm text-green-600">Цена: {product.sellPrice} монет</p>
                      {product.quality && <p className="text-xs text-amber-600">Качество: {product.quality}/5</p>}
                      {product.rarity && <div className="mt-1">{renderRarityIcon(product.rarity)}</div>}
                    </div>
                    <div className="space-y-1">
                      <Button size="sm" onClick={() => sellItem(product.name, 1, product.quality)}>
                        Продать 1
                      </Button>
                      {product.quantity > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sellItem(product.name, product.quantity, product.quality)}
                        >
                          Продать все
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )

  const toolsSection = (
    <div>
      <h3 className="font-medium mb-2">Инструменты</h3>
      {gameState.inventory.filter((item) => item.type === "tool").length === 0 ? (
        <p className="text-sm text-gray-500">У вас нет инструментов. Купите их на рынке.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {gameState.inventory
            .filter((item) => item.type === "tool")
            .map((tool, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-3">
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-gray-500">Количество: {tool.quantity}</p>
                    <p className="text-xs text-gray-500">{tool.description}</p>
                    {tool.rarity && <div className="mt-1">{renderRarityIcon(tool.rarity)}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )

  const specialItemsSection = (
    <div>
      <h3 className="font-medium mb-2">Особые предметы</h3>
      {gameState.inventory.filter((item) => item.type === "special").length === 0 ? (
        <p className="text-sm text-gray-500">У вас нет особых предметов.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {gameState.inventory
            .filter((item) => item.type === "special")
            .map((item, index) => (
              <Card key={index} className="overflow-hidden border-2 border-amber-200">
                <CardContent className="p-3">
                  <div>
                    <p className="font-medium text-amber-700">{item.name}</p>
                    <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                    {item.rarity && <div className="mt-1">{renderRarityIcon(item.rarity)}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      {/* Уведомление */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <Alert className="bg-green-100 border-green-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Уведомление</AlertTitle>
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Уведомление о выполненном квесте */}
      {showQuestReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                Квест выполнен!
              </CardTitle>
              <CardDescription>{showQuestReward.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{showQuestReward.description}</p>
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Награда:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <Coins className="h-4 w-4 text-yellow-500 mr-2" />
                    {showQuestReward.reward.coins} монет
                  </li>
                  <li className="flex items-center">
                    <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
                    {showQuestReward.reward.experience} опыта
                  </li>
                  {showQuestReward.reward.items &&
                    showQuestReward.reward.items.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <Gift className="h-4 w-4 text-green-500 mr-2" />
                        {item.quantity} x {item.name}
                      </li>
                    ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => claimQuestReward(showQuestReward.id)} className="w-full">
                Получить награду
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Уведомление о событии */}
      {showEventNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                Новое событие!
              </CardTitle>
              <CardDescription>{showEventNotification.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{showEventNotification.description}</p>
              <p className="text-sm text-gray-500">Продолжительность: {showEventNotification.duration} дней</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowEventNotification(null)} className="w-full">
                Понятно
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Верхняя панель */}
      <div className="flex justify-between items-center mb-4 bg-white rounded-lg p-4 shadow-md">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium">День {gameState.day}</p>
            <div className="flex items-center gap-1">
              {gameState.timeOfDay === "День" ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm">{gameState.timeOfDay}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Сезон</p>
            <Badge
              variant="outline"
              className={
                gameState.season === "Весна"
                  ? "bg-green-100"
                  : gameState.season === "Лето"
                    ? "bg-yellow-100"
                    : gameState.season === "Осень"
                      ? "bg-orange-100"
                      : "bg-blue-100"
              }
            >
              {gameState.season}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Погода</p>
            <div className="flex items-center">
              {renderWeatherIcon(gameState.weather)}
              <span className="text-sm ml-1">{gameState.weather}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-sm font-medium">Монеты</p>
            <p className="text-xl font-bold text-yellow-600">{gameState.coins}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Кристаллы</p>
            <p className="text-xl font-bold text-purple-600">{gameState.gems}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Уровень фермы: {gameState.farmLevel}</p>
          <div className="flex items-center gap-2">
            <Progress value={(gameState.experience / gameState.experienceToNextLevel) * 100} className="w-24 h-2" />
            <span className="text-xs">
              {gameState.experience}/{gameState.experienceToNextLevel}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={saveGame}>
            <Save className="h-4 w-4 mr-1" />
            Сохранить
          </Button>
          <Button size="sm" variant="outline" onClick={resetGame}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
          <Button size="sm" variant="outline" onClick={debugGameState} className="hidden md:flex">
            Отладка
          </Button>
          <Button size="sm" onClick={nextDay}>
            {gameState.timeOfDay === "День" ? "Вечер" : "Утро"} →
          </Button>
        </div>
      </div>

      {/* Активные события */}
      {gameState.activeEvents.length > 0 && (
        <div className="mb-4 bg-amber-50 rounded-lg p-3 border border-amber-200">
          <h3 className="font-medium text-amber-800 mb-2 flex items-center">
            <Star className="h-5 w-5 text-amber-500 mr-1" />
            Активные события:
          </h3>
          <div className="flex flex-wrap gap-2">
            {gameState.activeEvents.map((event, index) => (
              <Badge key={index} variant="outline" className="bg-amber-100 text-amber-800">
                {event.title} ({event.duration} дн.)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Левая колонка - Лог событий */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Журнал событий</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {gameState.messages.map((message, index) => (
                  <div key={index} className="text-sm p-2 border-b border-gray-100">
                    {message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Правая колонка - Основной игровой интерфейс */}
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="farm">
                <Home className="h-4 w-4 mr-2" />
                Ферма
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Shovel className="h-4 w-4 mr-2" />
                Инвентарь
              </TabsTrigger>
              <TabsTrigger value="market">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Рынок
              </TabsTrigger>
              <TabsTrigger value="quests">
                <Map className="h-4 w-4 mr-2" />
                Квесты
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="h-4 w-4 mr-2" />
                Достижения
              </TabsTrigger>
            </TabsList>

            {/* Вкладка Ферма */}
            <TabsContent value="farm">
              <Card>
                <CardHeader>
                  <CardTitle>Ваша ферма</CardTitle>
                  <CardDescription>Управляйте участками и животными</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Земельные участки */}
                    <div>
                      <h3 className="font-medium mb-3">Земельные участки</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {gameState.plots.map((plot, index) => (
                          <Card
                            key={index}
                            className={`cursor-pointer hover:border-green-500 transition-colors ${
                              selectedPlot === index ? "border-2 border-green-500" : ""
                            } ${plot.hasProtection ? "border-t-4 border-t-blue-400" : ""}`}
                            onClick={() => plot.unlocked && setSelectedPlot(index)}
                          >
                            <CardContent className="p-3">
                              {!plot.unlocked ? (
                                <div className="text-center py-4">
                                  <p className="font-medium">Участок {index + 1}</p>
                                  <p className="text-sm text-gray-500 mb-2">Заблокирован</p>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      buyPlot(index)
                                    }}
                                  >
                                    Купить за {plot.price}
                                  </Button>
                                </div>
                              ) : plot.hasCrop && plot.crop ? (
                                <div className="text-center py-2">
                                  <div className="flex justify-center mb-1">
                                    <Leaf className="h-8 w-8 text-green-500" />
                                  </div>
                                  <p className="font-medium">{plot.crop.type}</p>
                                  {renderCropProgress(plot.crop)}
                                  <div className="flex justify-between mt-2">
                                    {plot.crop.growthStage >= plot.crop.maxGrowthStage ? (
                                      <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          harvestCrop(index)
                                        }}
                                      >
                                        Собрать
                                      </Button>
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            waterCrop(index)
                                          }}
                                          disabled={plot.crop.watered}
                                        >
                                          Полить
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            fertilizeCrop(index)
                                          }}
                                          disabled={plot.crop.fertilized}
                                        >
                                          Удобрить
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  {gameState.gems > 0 && plot.crop.growthStage < plot.crop.maxGrowthStage && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full mt-1 bg-purple-50 text-purple-700 border-purple-200"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        useGemsToBoostGrowth(index)
                                      }}
                                    >
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Ускорить (1 💎)
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="font-medium">Участок {index + 1}</p>
                                  <p className="text-sm text-gray-500">Плодородие: {plot.fertility}/5</p>
                                  <div className="flex justify-between mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        improvePlotFertility(index)
                                      }}
                                      disabled={plot.fertility >= 5}
                                    >
                                      Улучшить ({20 * plot.fertility} 💰)
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        addWeatherProtection(index)
                                      }}
                                      disabled={plot.hasProtection}
                                    >
                                      Защита (100 💰)
                                    </Button>
                                  </div>
                                  {selectedPlot === index && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-xs font-medium">Выберите семена:</p>
                                      <div className="grid grid-cols-2 gap-1">
                                        {gameState.inventory
                                          .filter((item) => item.type === "seed" && item.quantity > 0)
                                          .map((seed, seedIndex) => (
                                            <Button
                                              key={seedIndex}
                                              size="sm"
                                              variant={selectedSeed === seed.name ? "default" : "outline"}
                                              className="w-full text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedSeed(seed.name)
                                              }}
                                            >
                                              {seed.name.replace("Семена ", "")} ({seed.quantity})
                                            </Button>
                                          ))}
                                      </div>
                                      {selectedSeed && (
                                        <Button
                                          size="sm"
                                          className="w-full"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            plantSeed(index, selectedSeed)
                                          }}
                                        >
                                          Посадить
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Животные */}
                    <div>
                      <h3 className="font-medium mb-3">Животные</h3>
                      {gameState.animals.length === 0 ? (
                        <p className="text-sm text-gray-500">У вас пока нет животных. Купите их на рынке.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {gameState.animals.map((animal, index) => (
                            <Card key={index}>
                              <CardContent className="p-3">
                                <div className="text-center">
                                  <p className="font-medium">{animal.type}</p>
                                  <div className="mt-2 space-y-1">
                                    <div>
                                      <p className="text-xs">Здоровье</p>
                                      <Progress
                                        value={animal.health}
                                        className={`h-2 ${animal.health < 30 ? "bg-red-200" : ""}`}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-xs">Голод</p>
                                      <Progress
                                        value={animal.hunger}
                                        className={`h-2 ${animal.hunger > 70 ? "bg-red-200" : ""}`}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-xs">Счастье</p>
                                      <Progress
                                        value={animal.happiness}
                                        className={`h-2 ${
                                          animal.happiness > 80
                                            ? "bg-green-300"
                                            : animal.happiness < 40
                                              ? "bg-red-200"
                                              : ""
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-xs">Производство</p>
                                      <Progress
                                        value={(animal.productionTimer / animal.productionRate) * 100}
                                        className="h-2"
                                      />
                                    </div>
                                    <p className="text-xs text-amber-600 mt-1">Качество: {animal.quality}/5</p>
                                  </div>
                                  <div className="flex justify-between mt-2">
                                    <Button size="sm" onClick={() => feedAnimal(index)}>
                                      Покормить ({animalData[animal.type].feedCost} 💰)
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => playWithAnimal(index)}>
                                      Играть
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка Инвентарь */}
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Инвентарь</CardTitle>
                  <CardDescription>Ваши предметы и продукты</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {seedsSection}
                    <Separator />
                    {productsSection}
                    <Separator />
                    {toolsSection}
                    <Separator />
                    {specialItemsSection}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка Рынок */}
            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Рынок</CardTitle>
                  <CardDescription>Купите семена, животных и инструменты</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="seeds">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="seeds">Семена</TabsTrigger>
                      <TabsTrigger value="animals">Животные</TabsTrigger>
                      <TabsTrigger value="tools">Инструменты</TabsTrigger>
                    </TabsList>

                    <TabsContent value="seeds">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(cropData).map((crop, index) => {
                          const cropType = crop as CropType
                          const isLocked = gameState.farmLevel < cropData[cropType].minLevel

                          return (
                            <Card key={index} className={isLocked ? "opacity-70" : ""}>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <Leaf className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                  <p className="font-medium">Семена {crop}</p>
                                  <div className="mt-1">{renderRarityIcon(cropData[cropType].rarity)}</div>
                                  <p className="text-sm text-gray-500 mb-1">
                                    Цена: {cropData[cropType].seedPrice} монет
                                  </p>
                                  <p className="text-xs text-gray-500 mb-2">
                                    Время роста: {cropData[cropType].growthTime} дней
                                    <br />
                                    Лучший сезон: {cropData[cropType].seasonBonus}
                                    {isLocked && (
                                      <>
                                        <br />
                                        <span className="text-red-500">
                                          Требуется уровень: {cropData[cropType].minLevel}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                  <Button
                                    size="sm"
                                    onClick={() => buyItem(`Семена ${crop}`, "seed")}
                                    disabled={isLocked}
                                  >
                                    Купить
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="animals">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(animalData).map((animal, index) => {
                          const animalType = animal as AnimalType
                          const isLocked = gameState.farmLevel < animalData[animalType].minLevel

                          return (
                            <Card key={index} className={isLocked ? "opacity-70" : ""}>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  {animalType === "Курица" ? (
                                    <Egg className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                                  ) : animalType === "Корова" ? (
                                    <Milk className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                  ) : (
                                    <Scissors className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                                  )}
                                  <p className="font-medium">{animalType}</p>
                                  <div className="mt-1">{renderRarityIcon(animalData[animalType].rarity)}</div>
                                  <p className="text-sm text-gray-500 mb-1">
                                    Цена: {animalData[animalType].price} монет
                                  </p>
                                  <p className="text-xs text-gray-500 mb-2">
                                    Продукт: {animalData[animalType].product}
                                    <br />
                                    Стоимость корма: {animalData[animalType].feedCost} монет
                                    {isLocked && (
                                      <>
                                        <br />
                                        <span className="text-red-500">
                                          Требуется уровень: {animalData[animalType].minLevel}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                  <Button size="sm" onClick={() => buyItem(animalType, "animal")} disabled={isLocked}>
                                    Купить
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="tools">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {["Лейка", "Удобрение", "Комбайн", "Пугало", "Теплица", "Трактор"].map((tool, index) => {
                          const isLocked =
                            (tool === "Комбайн" && gameState.farmLevel < 3) ||
                            (tool === "Теплица" && gameState.farmLevel < 4) ||
                            (tool === "Трактор" && gameState.farmLevel < 5)

                          return (
                            <Card key={index} className={isLocked ? "opacity-70" : ""}>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <Shovel className="h-8 w-8 mx-auto mb-2 text-brown-500" />
                                  <p className="font-medium">{tool}</p>
                                  <p className="text-sm text-gray-500 mb-1">
                                    Цена: {gameState.marketPrices[tool]} монет
                                  </p>
                                  <p className="text-xs text-gray-500 mb-2">
                                    {tool === "Лейка"
                                      ? "Ускоряет рост растений на 1 день"
                                      : tool === "Удобрение"
                                        ? "Ускоряет рост растений на 2 дня"
                                        : tool === "Комбайн"
                                          ? "Увеличивает количество собираемого урожая"
                                          : tool === "Пугало"
                                            ? "Защищает посевы от вредителей"
                                            : tool === "Теплица"
                                              ? "Защищает от неблагоприятной погоды"
                                              : "Значительно увеличивает эффективность фермы"}
                                    {isLocked && (
                                      <>
                                        <br />
                                        <span className="text-red-500">
                                          Требуется уровень:{" "}
                                          {tool === "Комбайн" ? 3 : tool === "Теплица" ? 4 : tool === "Трактор" ? 5 : 1}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                  <Button size="sm" onClick={() => buyItem(tool, "tool")} disabled={isLocked}>
                                    Купить
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="font-medium mb-2">Текущие цены на рынке</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(gameState.marketPrices)
                        .filter(([item]) =>
                          [
                            "Пшеница",
                            "Морковь",
                            "Картофель",
                            "Кукуруза",
                            "Помидоры",
                            "Клубника",
                            "Тыква",
                            "Арбуз",
                            "Подсолнух",
                            "Яйца",
                            "Молоко",
                            "Шерсть",
                            "Мясо",
                            "Мед",
                            "Кожа",
                          ].includes(item),
                        )
                        .map(([item, price], index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <span>{item}</span>
                            <Badge variant="outline">{price} монет</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка Квесты */}
            <TabsContent value="quests">
              <Card>
                <CardHeader>
                  <CardTitle>Квесты</CardTitle>
                  <CardDescription>Выполняйте задания и получайте награды</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gameState.quests.filter((quest) => !quest.completed).length === 0 ? (
                      <p className="text-center text-gray-500 py-4">У вас нет активных квестов</p>
                    ) : (
                      gameState.quests
                        .filter((quest) => !quest.completed)
                        .map((quest, index) => (
                          <Card key={index} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{quest.title}</h3>
                                    <p className="text-sm text-gray-600">{quest.description}</p>
                                  </div>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {quest.type}
                                  </Badge>
                                </div>

                                <Progress value={(quest.progress / quest.amount) * 100} className="h-2 mt-3" />
                                <p className="text-xs text-right mt-1">
                                  Прогресс: {quest.progress}/{quest.amount}
                                </p>

                                <div className="mt-3 bg-amber-50 p-2 rounded-md border border-amber-100">
                                  <p className="text-sm font-medium text-amber-800">Награда:</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm">{quest.reward.coins} монет</span>
                                    <span className="text-sm">{quest.reward.experience} опыта</span>
                                    {quest.reward.items && (
                                      <span className="text-sm">
                                        {quest.reward.items.map((item) => `${item.quantity} ${item.name}`).join(", ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}

                    {gameState.quests.filter((quest) => quest.completed).length > 0 && (
                      <>
                        <h3 className="font-medium mt-6">Выполненные квесты</h3>
                        <div className="space-y-2">
                          {gameState.quests
                            .filter((quest) => quest.completed)
                            .map((quest, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 border rounded bg-gray-50"
                              >
                                <span className="text-gray-500">{quest.title}</span>
                                <Badge variant="outline" className="bg-green-100 text-green-700">
                                  Выполнено
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка Достижения */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Достижения</CardTitle>
                  <CardDescription>Ваши достижения и награды</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(gameState.achievements).map(([achievement, unlocked], index) => (
                      <Card key={index} className={unlocked ? "bg-green-50" : "bg-gray-50"}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{achievement}</p>
                            <p className="text-sm text-gray-500">
                              {achievement === "Первый урожай"
                                ? "Соберите свой первый урожай"
                                : achievement === "Животновод"
                                  ? "Заведите 3 животных"
                                  : achievement === "Богатый фермер"
                                    ? "Накопите 1000 монет"
                                    : achievement === "Мастер фермы"
                                      ? "Достигните 5 уровня фермы"
                                      : achievement === "Коллекционер"
                                        ? "Соберите 6 разных видов культур"
                                        : achievement === "Погодный маг"
                                          ? "Установите защиту от погоды на 5 участках"
                                          : achievement === "Счастливчик"
                                            ? "Играйте 7 дней подряд"
                                            : achievement === "Трудоголик"
                                              ? "Проведите на ферме 30 дней"
                                              : achievement === "Эксперт по животным"
                                                ? "Сделайте 3 животных счастливыми (90%+)"
                                                : "Получите 5 продуктов высокого качества (4+)"}
                            </p>
                          </div>
                          <Badge
                            variant={unlocked ? "default" : "outline"}
                            className={unlocked ? "bg-green-100 text-green-800" : ""}
                          >
                            {unlocked ? "Разблокировано" : "Заблокировано"}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
