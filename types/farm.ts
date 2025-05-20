// Типы и интерфейсы для фермы

export type Season = "Весна" | "Лето" | "Осень" | "Зима"
export type TimeOfDay = "День" | "Ночь"
export type Weather = "Солнечно" | "Дождь" | "Снег" | "Гроза" | "Туман"
export type CropType =
  | "Пшеница"
  | "Морковь"
  | "Картофель"
  | "Кукуруза"
  | "Помидоры"
  | "Клубника"
  | "Тыква"
  | "Арбуз"
  | "Подсолнух"
export type AnimalType = "Курица" | "Корова" | "Овца" | "Свинья" | "Кролик" | "Пчелы"
export type ProductType = "Яйца" | "Молоко" | "Шерсть" | "Мясо" | "Мед" | "Кожа"
export type ToolType = "Лейка" | "Удобрение" | "Комбайн" | "Трактор" | "Теплица" | "Пугало"
export type QuestType = "Урожай" | "Животные" | "Продукты" | "Монеты" | "Уровень"

export interface Crop {
  type: CropType
  growthStage: number
  maxGrowthStage: number
  daysToNextStage: number
  plotId: number
  quality: number // 1-5, влияет на цену продажи
  watered: boolean
  fertilized: boolean
}

export interface Animal {
  type: AnimalType
  health: number
  hunger: number
  happiness: number // влияет на производительность
  productionTimer: number
  productionRate: number
  quality: number // 1-5, влияет на качество продуктов
}

export interface Plot {
  id: number
  unlocked: boolean
  price: number
  hasCrop: boolean
  crop?: Crop
  fertility: number // 1-5
  hasProtection: boolean
}

export interface InventoryItem {
  name: string
  quantity: number
  price: number
  sellPrice: number
  type: "seed" | "product" | "tool" | "animal" | "special"
  description: string
  quality?: number // 1-5
  rarity?: "Обычный" | "Необычный" | "Редкий" | "Эпический" | "Легендарный"
}

export interface Quest {
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
  timeLimit?: number
}

export interface RandomEvent {
  id: number
  title: string
  description: string
  effect: string
  duration: number
  active: boolean
}

export interface GameState {
  coins: number
  gems: number
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
  streak: number
  specialUnlocks: string[]
  lastSaved: number
} 