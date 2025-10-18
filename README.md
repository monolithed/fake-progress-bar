### FakeProgressBar

Компонент прогресс-бара с реалистичной анимацией, имитирующей загрузку.<br/>
Поддерживает плавное ускорение и замедление. В конце крадётся как «мышь» до полной остановки в заданной точке. 

![Пример](https://github.com/monolithed/fake-progress-bar/blob/main/cover.png?raw=true)

### Установка

```sh
npm i fake-progress-bar
```

### Пример использования

```tsx
import {FakeProgressBar} from 'fake-progress-bar';

const ProgressBar: React.FunctionComponent = () => {
    const [active, setActive] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [reset, setReset] = useState(false);

    return (
        <>
            <FakeProgressBar active={active}
                             completed={completed}
                             reset={reset}
                             onProgress={(progress) => {
                                 console.log(progress);
                             }}
            />

            <button onClick={() => setActive(true)}>
                Start
            </button>

            <button onClick={() => setCompleted(true)}>
                Complete
            </button>

            <button onClick={() => setReset(true)}>
                Reset
            </button>
        </>
    );
};
```

## Основные Props

| Prop               | Тип           | По умолчанию | Описание                           |
|--------------------|---------------|--------------|------------------------------------|
| active             | boolean       | -            | Активирует анимацию (обязательный) |
| completed          | boolean       | false        | Завершает анимацию на 100%         |
| reset              | boolean       | false        | Сбрасывает в начальное состояние   |
| className          | string        | -            | CSS классы                         |
| style              | CSSProperties | -            | Дополнительные стили               |
| background         | string        | "blue"       | Цвет заливки                       |
| height             | number        | 25           | Высота в пикселях                  |
| startProgressValue | number        | 0            | Начальное значение в %             |
| endProgressValue   | number        | 100          | Конечное значение в %              |
| onProgress         | function      | -            | Колбэк при изменении прогресса     |

## Настройки анимации (Props.animation)

| Параметр           | Тип    | По умолчанию | Описание                          |
|--------------------|--------|--------------|-----------------------------------|
| transitionSpeed    | number | 0.3          | Скорость анимации в секундах      |
| transitionEffect   | string | "ease-out"   | Эффект перехода CSS               |
| stopThreshold      | number | 96           | Порог остановки в %               |
| intervalDelay      | number | 30           | Задержка между обновлениями в мс  |
| incrementSpeed     | number | 0.005        | Скорость в начальной фазе         |
| middlePhaseSpeed   | number | 0.3          | Ускорение в середине              |
| finalPhaseSpeed    | number | 0.002        | Замедление в конце                |
| firstPhaseDuration | number | 70           | Длительность начальной фазы в %   |
| lastPhaseDuration  | number | 40           | Длительность финальной фазы в %   |

### Доступность

Компонент включает ARIA-атрибуты доступности:

* **role="progressbar"**
* **aria-valuenow** - текущее значение прогресса
* **aria-valuemin** - минимальное значение
* **aria-valuemax** - максимальное значение

### Профит

* **Отсутствие внешних зависимостей**
* **Совместимость с CJS и ESM модулями**
* **Высокая кастомизация**
* **~1.3KB после сжатия**

### Контрибьютинг

Мотивируйте себя отправить PR, поддержки нет.

### Лицензия

MIT
