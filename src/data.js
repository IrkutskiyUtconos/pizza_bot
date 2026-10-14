var PIZZAS = {
  margherita: {
    ru_name: "Маргарита",
    price: 400,
    toppings: ["моцарелла", "томаты"],
    vegetarian: true,
    spicy: false,
    cheesy: true,
    meat: false,
    kcal: 350
  },
  americana: {
    ru_name: "Американа",
    price: 500,
    toppings: ["пепперони", "моцарелла"],
    vegetarian: false,
    spicy: false,
    cheesy: true,
    meat: true,
    kcal: 550
  },
  americana_hot: {
    ru_name: "Американа острая",
    price: 550,
    toppings: ["пепперони", "халапеньо", "моцарелла"],
    vegetarian: false,
    spicy: true,
    cheesy: true,
    meat: true,
    kcal: 600
  },
  soho: {
    ru_name: "Сохо",
    price: 480,
    toppings: ["моцарелла", "грибы", "лук"],
    vegetarian: true,
    spicy: false,
    cheesy: true,
    meat: false,
    kcal: 380
  },
  hot_veggie: {
    ru_name: "Острая вегетарианская",
    price: 520,
    toppings: ["халапеньо", "оливки", "лук"],
    vegetarian: true,
    spicy: true,
    cheesy: false,
    meat: false,
    kcal: 320
  }
};

var SIZES = {
  small:  { ru_name: "маленькая", k: 1.0 },
  medium: { ru_name: "средняя",   k: 1.3 },
  large:  { ru_name: "большая",   k: 1.6 }
};

var BASES = {
  thin: { ru_name: "тонкая хрустящая", extra: 0 },
  deep: { ru_name: "толстая пышная",   extra: 60 }
};

var TOPPINGS = {
  parmesan:   { ru_name: "пармезан",   price: 80,  group: "cheese",   hot: false },
  mozzarella: { ru_name: "моцарелла",  price: 70,  group: "cheese",   hot: false },
  jalapeno:   { ru_name: "халапеньо",  price: 60,  group: "vegetable",hot: true  },
  olives:     { ru_name: "оливки",     price: 50,  group: "vegetable",hot: false },
  mushrooms:  { ru_name: "грибы",      price: 60,  group: "vegetable",hot: false },
  onion:      { ru_name: "лук",        price: 40,  group: "vegetable",hot: false },
  pepperoni:  { ru_name: "пепперони",  price: 90,  group: "meat",     hot: false },
  ham:        { ru_name: "ветчина",    price: 80,  group: "meat",     hot: false },
  prawns:     { ru_name: "креветки",   price: 120, group: "seafood",  hot: false }
};

var FIELD_NAMES = {
  pizza:   "пицца",
  size:    "размер",
  base:    "основа",
  address: "адрес",
  phone:   "телефон"
};

var ORDER_FIELDS = ["pizza", "size", "base"];
var DELIVERY_FIELDS = ["address", "phone"];

var QUESTIONS = {
  pizza: [
    "Какую пиццу хотите?",
    "Какую пиццу заказываем?",
    "Что по пицце?"
  ],
  size: [
    "Какой размер: маленькая, средняя или большая?",
    "Какой размер пиццы?",
    "Размер какой?"
  ],
  base: [
    "Тесто тонкое или толстое?",
    "На какой основе?",
    "Какая основа: тонкая или толстая?"
  ],
  address: [
    "Укажите адрес доставки.",
    "Куда доставить?",
    "Назовите адрес."
  ],
  phone: [
    "Оставьте номер телефона для связи.",
    "Ваш телефон?",
    "Номер телефона, пожалуйста."
  ]
};