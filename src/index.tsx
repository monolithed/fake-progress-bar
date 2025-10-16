import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
} from 'react';

type Animation = {
    /**
     * Общая скорость анимации в секундах.
     * Определяет, насколько плавно происходит визуальное изменение ширины прогресс-бара.
     *
     * См. transition-delay
     */
    transitionSpeed?: number;

    /**
     * Эффект перехода для визуального изменения ширины.
     * См. transition-timing-function
     */
    transitionEffect?: string;

    /**
     * Порог остановки в процентах, если задача не завершилась.
     * Прогресс-бар остановится на этом значении, если не получен флаг completed.
     *
     * Значение по молчанию: 96
     */
    stopThreshold?: number;

    /**
     * Задержка между обновлениями анимации в миллисекундах.
     * Определяет частоту тиков внутреннего таймера.
     *
     * Примеры:
     * 30 (~33 FPS) (по умолчанию)
     * 16 (~60 FPS) - более плавная анимация
     * 50 (~20 FPS) - менее ресурсоемкая анимация
     */
    intervalDelay?: number;

    /**
     * Этот параметр определяет, насколько быстро увеличивается внутренний счетчик
     * в начальной фазе анимации.
     * Меньшие значения делают анимацию более плавной в начале, большие значения — более быстрой.
     *
     * Примеры:
     * 0.005 — очень плавный старт (используется по умолчанию).
     * 0.01 — умеренная скорость.
     * 0.02 — быстрый старт
     */
    incrementSpeed?: number;

    /**
     * Ускорение в середине анимации.
     * Скорость внутреннего счетчика после достижения firstPhaseDuration.
     *
     * Примеры:
     * 0.5 - резкое ускорение
     * 0.3 - заметное ускорение (по умолчанию)
     * 0.1 - небольшое ускорение
     */
    middlePhaseSpeed?: number;

    /**
     * Замедление в конце анимации.
     * Скорость внутреннего счетчика после достижения lastPhaseDuration.
     *
     * Значение по молчанию: 0.002
     */
    finalPhaseSpeed?: number;

    /**
     * Длительность начальной фазы в процентах от общего диапазона.
     * Определяет, когда произойдет переключение на middlePhaseSpeed.
     *
     * Примеры:
     * 50 - ускорение в середине
     * 70 - ускорение на 70% диапазона (по умолчанию)
     * 80 - ускорение ближе к концу
     */
    firstPhaseDuration?: number;

    /**
     * Длительность финальной фазы в процентах от общего диапазона.
     * Определяет, когда произойдет переключение на finalPhaseSpeed.
     *
     * Значение по молчанию: 40
     */
    lastPhaseDuration?: number;
};

type Props = {
    /** Активирует анимацию прогресс-бара. */
    active: boolean;

    /** Мгновенно завершает анимацию и устанавливает прогресс в 100%. */
    completed?: boolean;

    /** Сбрасывает прогресс-бар в начальное состояние. */
    reset?: boolean;

    className?: string;
    style?: React.CSSProperties;

    /** Цвет заливки прогресс-бара. */
    background?: string;

    /** Высота прогресс-бара в пикселях. */
    height?: number;

    /** Настройки анимации. */
    animation?: Animation;

    /** Начальное значение прогресс-бара в процентах. */
    startProgressValue?: number;

    /** Конечное значение прогресс-бара в процентах. */
    endProgressValue?: number;

    /** Передает текущее значение прогресса в процентах. */
    onProgress?(progress: number): void;
};

const FakeProgressBar: React.FunctionComponent<Props> = ({
    active,
    completed,
    reset,
    className,
    style,
    height = 25,
    onProgress,
    animation = {},
    background = 'blue',
    startProgressValue = 0,
    endProgressValue = 100,
}) => {
    const {
        transitionEffect = 'ease-out',
        stopThreshold = 96,
        transitionSpeed = .3,
        intervalDelay = 30,
        incrementSpeed = .005,
        middlePhaseSpeed = .3,
        finalPhaseSpeed = .002,
        firstPhaseDuration = 70,
        lastPhaseDuration = 40
    }: Animation = animation;

    const [progress, setProgress] = useState<number>(startProgressValue);
    const [currentProgress, setCurrentProgress] = useState<number>(0);
    const [step, setStep] = useState<number>(incrementSpeed);
    const intervalRef = useRef<number | null>(null);

    const stopInterval = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const tick = useCallback(() => {
        setCurrentProgress((prevCurrentProgress) => {
            const newCurrentProgress = prevCurrentProgress + step;
            let newProgress: number;

            // Начинаем медленно с постепенным логарифмическим ростом
            if (newCurrentProgress < 1) {
                newProgress = Math.sqrt(newCurrentProgress) * 10;
            }
            else {
                const progressRange = endProgressValue - startProgressValue;
                const logResult = Math.log(newCurrentProgress + 1) / Math.log(11);

                newProgress = logResult * progressRange;
            }

            const finalProgress = startProgressValue + newProgress;
            const totalRange = endProgressValue - startProgressValue;

            // Нормализуем пороги относительно диапазона прогресса
            const firstPhaseThreshold = startProgressValue +
                (firstPhaseDuration / 100) * totalRange;

            const lastPhaseThreshold = startProgressValue +
                (lastPhaseDuration / 100) * totalRange;

            // Ускоряемся после firstPhaseDuration
            if (finalProgress >= firstPhaseThreshold && step === incrementSpeed) {
                setStep(middlePhaseSpeed);
            }
            // Замедляемся после lastPhaseDuration
            else if (finalProgress >= lastPhaseThreshold && step === middlePhaseSpeed) {
                setStep(finalPhaseSpeed);
            }

            // Если completed не задан, останавливаемся не доходя до конца
            let targetProgress = endProgressValue * (stopThreshold / 100);

            if (completed) {
                targetProgress = endProgressValue;
            }

            if (finalProgress >= targetProgress) {
                stopInterval();
                setProgress(targetProgress);
                return newCurrentProgress;
            }

            setProgress(finalProgress);
            return newCurrentProgress;
        });
    }, [
        step,
        stopInterval,
        stopThreshold,
        completed,
        incrementSpeed,
        middlePhaseSpeed,
        finalPhaseSpeed,
        startProgressValue,
        endProgressValue,
        firstPhaseDuration,
        lastPhaseDuration
    ]);

    useEffect(() => {
        if (active && intervalRef.current === null && progress < endProgressValue) {
            const intervalId = setInterval(tick, intervalDelay);

            intervalRef.current = intervalId as unknown as number;
        }
        else if (!active) {
            stopInterval();
        }

        return () => stopInterval();
    }, [
        active,
        progress,
        intervalDelay,
        endProgressValue,
        tick,
        stopInterval
    ]);

    useEffect(() => {
        if (completed) {
            stopInterval();
            setProgress(endProgressValue);
            setStep(incrementSpeed);
        }
        // eslint-disable-next-line
    }, [completed]);

    useEffect(() => {
        if (reset) {
            stopInterval();
            setProgress(startProgressValue);
            setCurrentProgress(0);
            setStep(incrementSpeed);
        }
        // eslint-disable-next-line
    }, [reset]);

    let width = progress;

    if (progress > endProgressValue) {
        width = endProgressValue;
    }

    onProgress?.(progress);

    return (
        <div role="progressbar"
             aria-valuenow={progress}
             aria-valuemin={startProgressValue}
             aria-valuemax={endProgressValue}
             className={className}
             style={{
                 width: `${width}%`,
                 height: `${height}px`,
                 transition: `width ${transitionSpeed}s ${transitionEffect}`,
                 background,
                 ...style
             }}
        />
    );
};

export {FakeProgressBar};
export type {Props as FakeProgressBarProps};
