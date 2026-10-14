require: slotfilling/slotFilling.sc
    module = sys.zb-common
require: data.js
require: lib.js
theme: /

# ============================================================
#  Начало / служебные состояния
# ============================================================

state: Start
    q!: $regex</start>
    script:
        resetOrder($session);
    a: Здравствуйте! Я бот пиццерии «Онтология», помогу заказать пиццу с доставкой.
    a: Можно сказать всё сразу, например «большую Маргариту на тонком тесте», или по шагам.
    buttons:
        "Меню"
        "Хочу пиццу"
        "Посоветуй вегетарианскую"

state: Hello
    intent!: /Привет
    a: Привет! Скажите «хочу пиццу» или откройте меню.
    buttons:
        "Меню"
        "Хочу пиццу"

state: Bye
    intent!: /Пока
    a: До свидания! Будем рады новому заказу.

state: Reset
    intent!: /Обнуление
    script:
        resetOrder($session);
    a: Заказ сброшен, начнём сначала.
    go!: /Check

state: Menu
    intent!: /Меню
    script:
        $reactions.answer(menuText());
        $reactions.buttons(optionButtons(PIZZAS));

state: Recommend
    intent!: /Посоветуй
    script:
        recommend($session, $parseTree, $reactions);

# ============================================================
#  Состояния, заполняющие параметры заказа
# ============================================================

state: Order
    intent!: /Заказ
    script:
        var got = fillOrder($session, $parseTree);
        $reactions.answer(got.length
            ? "Записал: " + got.join(", ") + "."
            : "Отлично, давайте оформим заказ!");
    go!: /Check

state: ChoosePizza
    intent!: /ВыборПиццы
    script:
        $reactions.answer(onParam($session, $parseTree, "pizza"));
    go!: /Check

state: ChooseSize
    intent!: /ВыборРазмера
    script:
        $reactions.answer(onParam($session, $parseTree, "size"));
    go!: /Check

state: ChooseBase
    intent!: /ВыборОсновы
    script:
        $reactions.answer(onParam($session, $parseTree, "base"));
    go!: /Check

state: AddTopping
    intent!: /Добавка
    script:
        $reactions.answer(onParam($session, $parseTree, "topping"));
    go!: /Check

state: SetAddress
    intent!: /Адрес
    script:
        $reactions.answer(onParam($session, $parseTree, "address"));
    go!: /Check

state: SetPhone
    intent!: /Телефон
    script:
        $reactions.answer(onParam($session, $parseTree, "phone"));
    go!: /Check

state: Change
    intent!: /Изменить
    script:
        if (changeParam($session, $parseTree, $reactions)) {
            $reactions.transition("/Check");
        }

# ============================================================
#  Оценка полноты и вопрос о недостающем параметре
# ============================================================

state: Check
    script:
        var next = nextQuestion($session);
        if (!next) {
            $session.waiting = null;
            $reactions.transition("/Confirm");
        } else {
            $session.waiting = next.field;
            $reactions.answer(next.question);
            if (next.buttons.length) {
                $reactions.buttons(next.buttons);
            }
        }

    # локальный noMatch: адрес/телефон свободным текстом
    state: FreeInput
        event: noMatch
        script:
            var res = takeFreeText($session, $request.query);
            $reactions.answer(res ? res : notUnderstood($session));
        go!: /Check

# ============================================================
#  Подтверждение
# ============================================================

state: Confirm
    script:
        $session.waiting = "confirm";
        $reactions.answer(orderSummary($session));
    a: Всё верно, оформляем?
    buttons:
        "Да"
        "Нет"
        "Хочу поменять размер"
        "Добавь пармезан"

    state: Yes
        intent: /Да
        go!: /Done

    state: No
        intent: /Нет
        a: Что поменять?
        buttons:
            "Поменять пиццу"
            "Поменять размер"
            "Поменять основу"
            "Поменять адрес"

    state: ConfirmNoMatch
        event: noMatch
        a: Ответьте, пожалуйста, «да» или «нет».
        go!: /Confirm

# ============================================================
#  Имитация выполнения заказа
# ============================================================

state: Done
    script:
        $session.lastOrder = orderSummary($session);
        $session.orderId = Math.floor(1000 + Math.random() * 9000);
        $reactions.answer("Заказ №" + $session.orderId + " принят! Готовим, курьер будет примерно через 40 минут.");
    image: https://upload.wikimedia.org/wikipedia/commons/thumb/0/0l/Te_gusta_la_Pizza%3F.jpg/960px-Te_gusta_la_Pizza%3F.jpg
    script:
        resetOrder($session);
    a: Чтобы заказать ещё, скажите «хочу пиццу» или нажмите /start.

# ============================================================
#  Глобальный noMatch
# ============================================================

state: NoMatch
    event!: noMatch
    a: Я не понял: «{{$request.query}}».
    buttons:
        "Меню"
        "Хочу пиццу"