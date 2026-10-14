function newOrder() {
  return {
    pizza: null, size: null, base: null,
    toppings: [], address: null, phone: null
  };
}

function ensureOrder(s) {
  if (!s.order) s.order = newOrder();
  if (!s.order.toppings) s.order.toppings = [];
  return s.order;
}

function resetOrder(s) {
  s.order = newOrder();
  s.waiting = null;
}

function slotRaw(pt, name) {
  if (!pt) return null;
  var v = pt["_" + name];
  return (v === undefined || v === null || v === "") ? null : v;
}

function slotKey(pt, name) {
  var v = slotRaw(pt, name);
  if (v === null) return null;
  if (typeof v === "string") {
    try { v = JSON.parse(v); } catch (e) { return v; }
  }
  if (v && v.value != undefined) return String(v.value);
  return null;
}

function slotText(pt, name) {
  var v = slotRaw(pt, name);
  if (v === null) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (v.value != undefined) return String(v.value);
  if (v.text != undefined) return String(v.text);
  return JSON.stringify(v);
}

function fillOrder(s, pt) {
  var o = ensureOrder(s), got = [], k;
  k = slotKey(pt, "pizza");
  if (k && PIZZAS[k]) { o.pizza = k; got.push("пицца " + PIZZAS[k].ru_name); }
  k = slotKey(pt, "size");
  if (k && SIZES[k]) { o.size = k; got.push("размер " + SIZES[k].ru_name); }
  k = slotKey(pt, "base");
  if (k && BASES[k]) { o.base = k; got.push("основа " + BASES[k].ru_name); }
  k = slotKey(pt, "topping");
  if (k && TOPPINGS[k]) {
    if (o.toppings.indexOf(k) < 0) o.toppings.push(k);
    got.push("добавка " + TOPPINGS[k].ru_name);
  }
  var t = slotText(pt, "address");
  if (t) { o.address = t; got.push("адрес " + t); }
  t = slotText(pt, "phone");
  if (t) { o.phone = t; got.push("телефон " + t); }
  return got;
}

function onParam(s, pt, field) {
  var got = fillOrder(s, pt);
  if (got.length == 0) {
    return "Не расслышал " + (FIELD_NAMES[field] || "параметр") + ", повторите, пожалуйста.";
  }
  return "Записал: " + got.join(", ") + ".";
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function optionButtons(dict) {
  var res = [];
  for (var k in dict) res.push({ text: dict[k].ru_name });
  return res;
}

function nextQuestion(s) {
  var o = ensureOrder(s), missing = [], i;
  for (i = 0; i < ORDER_FIELDS.length; i++) {
    if (!o[ORDER_FIELDS[i]]) missing.push(ORDER_FIELDS[i]);
  }
  if (missing.length == 0) {
    for (i = 0; i < DELIVERY_FIELDS.length; i++) {
      if (!o[DELIVERY_FIELDS[i]]) { missing.push(DELIVERY_FIELDS[i]); break; }
    }
  }
  if (missing.length == 0) return null;
  var field = pick(missing);
  var buttons = [];
  if (field == "pizza") buttons = optionButtons(PIZZAS);
  if (field == "size") buttons = [
    { text: "маленькая" }, { text: "средняя" }, { text: "большая" }
  ];
  if (field == "base") buttons = [
    { text: "тонкое тесто" }, { text: "толстое тесто" }
  ];
  return { field: field, question: pick(QUESTIONS[field]), buttons: buttons };
}

function takeFreeText(s, q) {
  var o = ensureOrder(s);
  q = String(q || "").trim();
  if (s.waiting == "address" && q.length >= 5) {
    o.address = q;
    return "Записал адрес: " + q + ".";
  }
  if (s.waiting == "phone") {
    var d = q.replace(/\D/g, "");
    if (d.length >= 10 && d.length <= 12) {
      o.phone = d;
      return "Записал телефон: " + d + ".";
    }
  }
  return null;
}

function notUnderstood(s) {
  var f = s.waiting ? FIELD_NAMES[s.waiting] : null;
  return f ? "Не понял. Сейчас мне нужен параметр: " + f + "." : "Не понял, повторите, пожалуйста.";
}

function orderPrice(o) {
  if (!o.pizza || !o.size || !o.base) return 0;
  var p = PIZZAS[o.pizza].price;
  for (var i = 0; i < o.toppings.length; i++) {
    p += TOPPINGS[o.toppings[i]].price;
  }
  p = p * SIZES[o.size].k + BASES[o.base].extra;
  return Math.round(p / 10) * 10;
}

function orderTags(o) {
  var veg = PIZZAS[o.pizza].vegetarian;
  var hot = PIZZAS[o.pizza].spicy;
  for (var i = 0; i < o.toppings.length; i++) {
    var t = TOPPINGS[o.toppings[i]];
    if (t.group === "meat" || t.group === "seafood") veg = false;
    if (t.hot) hot = true;
  }
  var tags = [];
  if (veg) tags.push("вегетарианская");
  if (hot) tags.push("острая");
  return tags;
}

function orderSummary(s) {
  var o = ensureOrder(s);
  var tops = [];
  for (var i = 0; i < o.toppings.length; i++) {
    tops.push(TOPPINGS[o.toppings[i]].ru_name);
  }
  var tags = orderTags(o);
  return "Ваш заказ: пицца «" + PIZZAS[o.pizza].ru_name + "»" +
    (tags.length ? " (" + tags.join(", ") + ")" : "") +
    ", размер " + SIZES[o.size].ru_name +
    ", основа " + BASES[o.base].ru_name +
    (tops.length ? ", добавки: " + tops.join(", ") : "") +
    ". Доставка: " + o.address + ", телефон " + o.phone +
    ", Сумма: " + orderPrice(o) + " ₽.";
}

function changeParam(s, pt, reactions) {
  var o = ensureOrder(s);
  var param = slotKey(pt, "param");
  if (!param || !FIELD_NAMES[param]) {
    reactions.answer("Что поменять: пиццу, размер, основу, адрес или телефон?");
    reactions.buttons([
      { text: "Поменять пиццу" },
      { text: "Поменять размер" },
      { text: "Поменять основу" },
      { text: "Поменять адрес" }
    ]);
    return false;
  }
  o[param] = null;
  fillOrder(s, pt);
  if (o[param]) {
    reactions.answer("Готово, " + FIELD_NAMES[param] + " изменён(а).");
  } else {
    reactions.answer("Хорошо, меняем: " + FIELD_NAMES[param] + ".");
  }
  return true;
}

function menuText() {
  var lines = ["Меню (цена за маленькую, средняя ×1.3, большая ×1.6, толстое тесто +60 ₽):"];
  for (var k in PIZZAS) {
    var p = PIZZAS[k];
    lines.push("• " + p.ru_name + " — " + p.price + " ₽ (" + p.toppings.join(", ") + ")");
  }
  var tops = [];
  for (var t in TOPPINGS) {
    tops.push(TOPPINGS[t].ru_name + " +" + TOPPINGS[t].price);
  }
  lines.push("Добавки: " + tops.join(", ") + ".");
  return lines.join("\n");
}

function recommend(s, pt, reactions) {
  var cat = slotKey(pt, "category");
  var names = {
    vegetarian: "вегетарианские",
    spicy: "острые",
    cheesy: "сырные",
    meat: "мясные",
    light: "низкокалорийные (< 400 ккал)"
  };
  var res = [];
  for (var k in PIZZAS) {
    var p = PIZZAS[k];
    var ok = !cat || (cat == "light" ? p.kcal < 400 : p[cat]);
    if (ok) res.push({ text: p.ru_name });
  }
  if (!res.length) {
    reactions.answer("Таких пицц у нас нет, посмотрите меню.");
    return;
  }
  var list = [];
  for (var i = 0; i < res.length; i++) list.push(res[i].text);
  reactions.answer((cat ? "Подойдут " + names[cat] + ": " : "Советую: ") + list.join(", ") + ".");
  reactions.buttons(res);
}