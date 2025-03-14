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

const App: React.FC = () => {
    const [inputText, setInputText] = useState<string>(''); // Состояние для введенного текста
    const [key, setKey] = useState<string>(''); // Состояние для ключа шифрования/расшифрования
    const [outputText, setOutputText] = useState<string>(''); // Состояние для результата операции
    const [hackKey, setHackKey] = useState<string>(''); // Состояние для оцененного ключа при взломе
    const [error, setError] = useState<string>(''); // Состояние для ошибок
    const [keyError, setKeyError] = useState<string>(''); // Состояние для ошибок ключа

    // Функция для очистки текста: замена ё на е, удаление небуквенных символов, приведение к нижнему регистру
    const clearText = (text: string): string => {
        return text
            .replace(/[ёЁ]/g, 'е') // Заменяем ё на е
            .replace(/[^а-яА-Яa-zA-Z]/g, '') // Убираем все небуквенные символы
            .toLowerCase(); // Приводим к нижнему регистру
    };

    // Обработчик изменения текста в поле ввода
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setInputText(e.target.value);
    };

    // Функция для валидации ключа
    const validateKey = (key: string): boolean => {
        if (!/^\d+$/.test(key) && key.length) {
            setKeyError('Ключ должен быть целым числом!');
            return false;
        }
        setKeyError('');
        return true;
    }

    // Функция для шифрования или расшифрования текста
    const encryptOrDecrypt = (isEncryption: boolean): void => {
        if (!inputText.trim()) {
            setError('Текст не должен быть пустым!'); // Устанавливаем ошибку, если текст пустой
            return;
        }
        if (!key.length) {
            setError('Ключ не должен быть пустым!');
            return;
        }
        if (!validateKey(key)) return; // Проверяем валидность ключа перед выполнением операции
        const cleanedText = clearText(inputText); // Берем очищенный текст
        const formatKey = Number(key);
        const offset = ((formatKey % 33) + 33) % 33;
        if (offset === -1) {
            return;
        }
        let result = ''; // Переменная для хранения результата

        // Проходим по каждому символу текста
        for (let i = 0; i < cleanedText.length; i++) {
            const char = cleanedText[i]; // Берем текущий символ
            const isRussian = russianLetters.includes(char); // Проверяем, является ли символ русским
            const isEnglish = englishLetters.includes(char); // Проверяем, является ли символ английским
            const usedDict = isRussian ? russianLetters : isEnglish ? englishLetters : []; // Выбор алфавита
            const dictionaryLength = usedDict.length; // Длина алфавита

            // Если символ принадлежит выбранному алфавиту
            if (usedDict.length > 0) {
                const elementIndex = usedDict.indexOf(char); // Находим индекс символа в алфавите
                let newIndex;
                if (isEncryption) {
                    // Шифрование: сдвигаем индекс по алфавиту
                    newIndex = (elementIndex + offset) % dictionaryLength;
                } else {
                    // Расшифрование: сдвигаем индекс обратно
                    newIndex = (elementIndex - offset + dictionaryLength) % dictionaryLength;
                }
                result += usedDict[newIndex]; // Добавляем зашифрованный/расшифрованный символ к результату
            } else {
                result += char; // Если символ не буква, добавляем его без изменений
            }
            if ((i + 1) % 5 === 0) {
                result += ' '; // Добавляем пробел каждые 5 символов
            }
        }

        setOutputText(result.trim()); // Устанавливаем результат
        setError(''); // Сбрасываем ошибки
    };

// Функция для взлома шифра
    const hackCipher = (): void => {
        const cleanedText = clearText(inputText); // Берем очищенный текст
        if (!cleanedText.trim()) {
            setError('Текст слишком короткий для взлома!'); // Устанавливаем ошибку, если текст пустой
            return;
        }

        // Проверяем на наличие английских букв
        if (englishLetters.some(letter => cleanedText.includes(letter))) {
            setError('Нельзя взламывать текст, содержащий английские буквы!'); // Если английская буква найдена, устанавливаем ошибку
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

        // Подсчитываем частоту букв в введенном тексте
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

        setHackKey(estimatedKey.toString()); // Устанавливаем оцененный ключ

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

        setOutputText(result.trim()); // Устанавливаем результат
    };

    // Функция для очистки полей ввода
    const clearFields = () => {
        setInputText(''); // Очищаем текст ввода
        setKey(''); // Очищаем ключ
        setOutputText(''); // Очищаем результат
        setHackKey(''); // Очищаем оцененный ключ
        setError(''); // Сбрасываем ошибки
        setKeyError(''); // Сбрасываем ошибки ключа
    };

    // Обработчик изменения ключа
    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setKey(e.target.value);
        validateKey(e.target.value); // Проверяем валидность ключа при изменении
    }

    return (
        <div style={{ padding: '20px' }}>
            <h3>Варианты:</h3>
            <div className='container'>
                {variant.map((val) => (
                    <Button onClick={() => setInputText(val.text)}>{val.key}</Button>
                ))}
            </div>
            <h1>Шифр Цезаря</h1>
            {error && <Alert message={error} type="error" showIcon />}
            <Input.TextArea
                rows={4}
                value={inputText}
                onChange={handleInputChange}
                placeholder="Введите текст"
                style={{ marginBottom: '10px' }}
            />
            {keyError && <Alert message={keyError} type="error" showIcon />}
            <Input
                value={key}
                onChange={handleKeyChange}
                placeholder="Введите ключ"
                style={{ marginBottom: '10px' }}
            />
            <div className='container'>
                <Button disabled={!!keyError} type="primary" onClick={() => encryptOrDecrypt(true)}>Зашифровать</Button>
                <Button disabled={!!keyError} onClick={() => encryptOrDecrypt(false)}>Расшифровать</Button>
                <Button onClick={hackCipher}>Взломать</Button>
                <Button onClick={clearFields}>Очистить</Button>
            </div>
            <h3>Результат:</h3>
            <Input.TextArea
                rows={4}
                value={outputText}
                readOnly
                style={{ marginBottom: '10px' }}
            />
            <h3>Оценённый ключ:</h3>
            <Input value={hackKey} readOnly />
        </div>
    );
};

export default App;
