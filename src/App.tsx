import React, { useState } from 'react';
import { Input, Button, Alert } from 'antd';
import { variant } from './const.ts'
import './style.css'

// Буквы русского алфавита
const russianLetters = "абвгдежзийклмнопрстуфхцчшщъыьэюя".split('');
// Буквы английского алфавита
const englishLetters = "abcdefghijklmnopqrstuvwxyz".split('');

// Частоты букв в русском языке для анализа
const lettersFrequency = {
    'а': 0.062,
    'б': 0.014,
    'в': 0.036,
    'г': 0.013,
    'д': 0.025,
    'е': 0.072,
    'ж': 0.007,
    'з': 0.016,
    'и': 0.062,
    'й': 0.010,
    'к': 0.028,
    'л': 0.035,
    'м': 0.026,
    'н': 0.053,
    'о': 0.090,
    'п': 0.023,
    'р': 0.040,
    'с': 0.045,
    'т': 0.053,
    'у': 0.021,
    'ф': 0.002,
    'х': 0.009,
    'ц': 0.003,
    'ч': 0.012,
    'ш': 0.006,
    'щ': 0.003,
    'ъ': 0.014,
    'ы': 0.016,
    'ь': 0.014,
    'э': 0.003,
    'ю': 0.006,
    'я': 0.018
};

interface IState {

    /**
     * Состояние для введенного текста
     */
    inputText: string;

    /**
     *  Состояние для ключа шифрования/расшифрования
     */
    key: string;

    /**
     * Состояние для результата операции
     */
    outputText: string;

    /**
     * Состояние для оцененного ключа при взломе
     */
    hackKey: string;

    /**
     * Состояние для ошибок
     */
    error: string;

    /**
     * Состояние для ошибок ключа
     */
    keyError: string;
}

type IStateName = keyof IState;
type IStateValue = IState[IStateName];

const generateEmptyValue = (): IState => ({
    outputText: '',
    inputText: '',
    keyError: '',
    hackKey: '',
    error: '',
    key: ''
})

const App: React.FC = () => {
    const [state, setState] = useState<IState>({
        outputText: '',
        inputText: '',
        keyError: '',
        hackKey: '',
        error: '',
        key: ''
    })

    const handleChange = (value: IStateValue, name: IStateName): void => {
        setState((prevState) => ({ ...prevState, [name]: value }));
    }

    // Функция для очистки текста: замена ё на е, удаление небуквенных символов, приведение к нижнему регистру
    const clearText = (text: string): string => {
        return text
            .replace(/[ёЁ]/g, 'е') // Заменяем ё на е
            .replace(/[^а-яА-Яa-zA-Z]/g, '') // Убираем все небуквенные символы
            .toLowerCase(); // Приводим к нижнему регистру
    };

    // Обработчик изменения текста в поле ввода
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        handleChange(e.target.value, 'inputText')
    };

    // Функция для валидации ключа
    const validateKey = (key: string): boolean => {
        // Проверяем, является ли ключ целым числом (включая отрицательные числа)
        if (!/^-?\d+$/.test(key) && key.length) {
            handleChange('Ключ должен быть целым числом!', 'keyError')
            return false;
        }
        handleChange('', 'keyError')
        return true;
    }

    // Функция для шифрования или расшифрования текста
    const encryptOrDecrypt = (isEncryption: boolean): void => {
        if (!state.inputText.trim()) {
            handleChange('Текст не должен быть пустым!', 'error')
            return;
        }
        if (!state.key.length) {
            handleChange('Текст не должен быть пустым!', 'error')
            return;
        }
        if (!validateKey(state.key)) return;

        const cleanedText = clearText(state.inputText);
        const formatKey = Number(state.key);
        let result = '';

        // Проходим по каждому символу текста
        for (let i = 0; i < cleanedText.length; i++) {
            const char = cleanedText[i];
            const isRussian = russianLetters.includes(char);
            const isEnglish = englishLetters.includes(char);
            const usedDict = isRussian ? russianLetters : isEnglish ? englishLetters : [];
            const dictionaryLength = usedDict.length;

            if (usedDict.length > 0) {
                const elementIndex = usedDict.indexOf(char);
                const offset = ((formatKey % dictionaryLength) + dictionaryLength) % dictionaryLength; // Используем длину выбранного алфавита
                let newIndex;

                if (isEncryption) {
                    newIndex = (elementIndex + offset) % dictionaryLength; // Шифрование
                } else {
                    newIndex = (elementIndex - offset + dictionaryLength) % dictionaryLength; // Расшифрование
                }
                result += usedDict[newIndex]; // Добавляем зашифрованный/расшифрованный символ к результату
            } else {
                result += char; // Если символ не буква, добавляем его без изменений
            }
            if ((i + 1) % 5 === 0) {
                result += ' '; // Добавляем пробел каждые 5 символов
            }
        }

        handleChange(result.trim(), 'outputText')
        handleChange('', 'error')
    };

    // Функция для взлома шифра
    const hackCipher = (): void => {
        const cleanedText = clearText(state.inputText); // Берем очищенный текст
        if (!cleanedText.trim()) {
            handleChange('Текст слишком короткий для взлома!', 'error')
            return;
        }

        // Проверяем на наличие английских букв
        if (englishLetters.some(letter => cleanedText.includes(letter))) {
            handleChange('Нельзя взламывать текст, содержащий английские буквы!', 'error')
            return;
        }

        const inputLettersAmount = Object.fromEntries(russianLetters.map(letter => [letter, 0])); // Создаем словарь для подсчета букв
        const messageLength = cleanedText.length; // Сохраняем длину сообщения

        // Подсчитываем количество каждой буквы в тексте
        for (let letter of cleanedText) {
            const smallLetter = letter.toLowerCase(); // Приводим букву к нижнему регистру
            if (inputLettersAmount.hasOwnProperty(smallLetter)) {
                inputLettersAmount[smallLetter]++; // Увеличиваем счетчик для буквы
            }
        }

        // Подсчитываем частоту букв во введенном тексте
        const frequency = russianLetters.map(letter => (inputLettersAmount[letter] / messageLength)); // Считаем частоту
        let minValue = Infinity; // Находим минимальное значение
        let estimatedKey = 0; // Переменная для оцененного ключа

        // Логика для нахождения ключа методом наименьших квадратов
        for (let offset = 0; offset < russianLetters.length; offset++) {
            let sum = 0; // Переменная для суммы квадратов отклонений
            for (let i = 0; i < frequency.length; i++) {
                const currentIndex = (i + offset) % frequency.length; // Определяем текущий индекс
                const expectedFrequency = lettersFrequency[russianLetters[i] as keyof typeof lettersFrequency]; // Ожидаемая частота
                sum += Math.pow(expectedFrequency - frequency[currentIndex], 2); // Сумма квадратов отклонений
            }

            // Если найдено меньшее значение, обновляем оцененный ключ
            if (sum < minValue) {
                minValue = sum; // Обновляем минимальное значение
                estimatedKey = offset; // Обновляем оцененный ключ
            }
        }

        handleChange(estimatedKey.toString(), 'hackKey') // Устанавливаем оцененный ключ

        let result = '';
        // Расшифровка текста с оцененным ключом
        for (let i = 0; i < cleanedText.length; i++) {
            const char = cleanedText[i];
            const elementIndex = russianLetters.indexOf(char); // Находим индекс символа
            if (elementIndex !== -1) {
                const newIndex = (elementIndex - estimatedKey + russianLetters.length) % russianLetters.length; // Рассчитываем новый индекс
                result += russianLetters[newIndex].toLowerCase(); // Добавляем расшифрованный символ к результату
            } else {
                result += char.toLowerCase(); // Если символ не буква, добавляем его без изменений
            }
            if ((i + 1) % 5 === 0) {
                result += ' '; // Добавляем пробел каждые 5 символов
            }
        }

        handleChange(result.trim(), 'outputText') // Устанавливаем результат
    };

    // Функция для очистки полей ввода
    const clearFields = () => {
        setState(generateEmptyValue());
    };

    // Обработчик изменения ключа
    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newKey = e.target.value; // Сохраняем новое значение ключа
        handleChange(newKey, 'key'); // Обновляем состояние ключа
        validateKey(newKey); // Проверяем валидность ключа при изменении
    }

    return (
        <div style={{ padding: '20px' }}>
            <h3>Варианты:</h3>
            <div className='container'>
                {variant.map((val) => (
                    <Button onClick={() => handleChange(val.text, 'inputText')}>{val.key}</Button>
                ))}
            </div>
            <h1>Шифр Цезаря</h1>
            {state.error && <Alert message={state.error} type="error" showIcon />}
            <Input.TextArea
                rows={4}
                value={state.inputText}
                onChange={handleInputChange}
                placeholder="Введите текст"
                style={{ marginBottom: '10px' }}
            />
            {state.keyError && <Alert message={state.keyError} type="error" showIcon />}
            <Input
                value={state.key}
                onChange={handleKeyChange}
                placeholder="Введите ключ"
                style={{ marginBottom: '10px' }}
            />
            <div className='container'>
                <Button disabled={!!state.keyError} type="primary" onClick={() => encryptOrDecrypt(true)}>Зашифровать</Button>
                <Button disabled={!!state.keyError} onClick={() => encryptOrDecrypt(false)}>Расшифровать</Button>
                <Button onClick={hackCipher}>Взломать</Button>
                <Button onClick={clearFields}>Очистить</Button>
            </div>
            <h3>Результат:</h3>
            <Input.TextArea
                rows={4}
                value={state.outputText}
                readOnly
                style={{ marginBottom: '10px' }}
            />
            <h3>Оценённый ключ:</h3>
            <Input value={state.hackKey} readOnly />
        </div>
    );
};

export default App;
