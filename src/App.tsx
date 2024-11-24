import React, { useState } from 'react';
import { Button, Input, message, Space, Typography } from 'antd';

const { Title } = Typography;

const App: React.FC = () => {
    const alphabetCyrillic: string = 'abcdefghijklmnopqrstuvwxyzабвгдежзийклмнопрстуфхцчшщъыьэюяё';
    const alphabetLatin: string = 'abcdefghijklmnopqrstuvwxyz';
    const [messageApi, contextHolder] = message.useMessage();
    const [text, setText] = useState<string>('');
    const [shift, setShift] = useState<number>(0);
    const [result, setResult] = useState<string>('');
    const groupSize: number = 5;

    /**
     * Обрабатывает изменение значения сдвига.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения.
     */
    const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newShift: number = parseInt(e.target.value, 10);
        if (!isNaN(newShift)) {
            setShift(newShift < 0 ? 0 : newShift > 32 ? 32 : newShift);
        } else {
            messageApi.open({
                type: "error",
                content: 'Введите корректное значение ключа',
            });
        }
    };

    /**
     * Обрабатывает изменение текста.
     * Удаляет все небуквенные символы и приводит текст к нижнему регистру.
     * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения.
     */
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newText: string = e.target.value
            .replace(/ё/g, 'е')
            .replace(/[^a-zA-Zа-яА-Я]/g, '')
            .toLocaleLowerCase();
        setText(newText);
    };

    /**
     * Шифрует текст с использованием шифра Цезаря.
     */
    const handleEncrypt = (): void => {
        const encryptedText: string = caesarCipher(text, shift, true);
        setResult(formatOutput(encryptedText));
    };

    /**
     * Расшифровывает текст с использованием шифра Цезаря.
     */
    const handleDecrypt = (): void => {
        const decryptedText: string = caesarCipher(result, shift, false);
        setText(decryptedText);
        setResult('');
    };

    /**
     * Выполняет шифрование или расшифрование текста с использованием шифра Цезаря.
     * @param {string} text - Исходный текст.
     * @param {number} shift - Значение сдвига.
     * @param {boolean} encrypt - Флаг, указывающий, нужно ли шифровать (true) или расшифровывать (false).
     * @returns {string} - Зашифрованный или расшифрованный текст.
     */
    const caesarCipher = (text: string, shift: number, encrypt: boolean): string => {
        const alphabet: string = alphabetCyrillic.includes(text[0]) ? alphabetCyrillic : alphabetLatin;

        const normalizedShift: number = alphabet === alphabetCyrillic ? shift % 33 : shift % 27;
        let result: string = '';

        for (let i = 0; i < text.length; i++) {
            const index: number = alphabet.indexOf(text[i]);
            if (index !== -1) {
                const newIndex: number = (index + (encrypt ? normalizedShift : -normalizedShift + alphabet.length)) % alphabet.length;
                result += alphabet[newIndex];
            }
        }

        return result;
    };

    /**
     * Форматирует выходной текст, разбивая его на группы по 5 символов.
     * @param {string} output - Исходный текст.
     * @returns {string} - Отформатированный текст.
     */
    const formatOutput = (output: string): string => {
        return output.match(/.{1,5}/g)?.join(' ') || '';
    };

    /**
     * Очищает текст, сдвиг и результат.
     */
    const handleClear = (): void => {
        setText('');
        setShift(0);
        setResult('');
    };

    /**
     * Взлом зашифрованного русскоязычного текста методом наименьших квадратов.
     * * @param {string} encryptedText - Зашифрованный текст.
     * @returns {number} - Предполагаемый сдвиг.
     */
    const crackCaesarCipher = (encryptedText: string): number => {
        const frequency: { [key: string]: number } = {};
        for (const char of encryptedText) {
            if (/[а-яё]/i.test(char)) {
                frequency[char] = (frequency[char] || 0) + 1;
            }
        }
        // Находим букву с максимальной частотой
        const maxChar: string = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
        // Предполагаем, что буква 'е' наиболее частая в русском языке
        return (alphabetCyrillic.indexOf(maxChar) - alphabetCyrillic.indexOf('е') + 33) % 33;
    };

    return (
        <div style={{ padding: 24 }}>
            {contextHolder}
            <Title level={3}>Шифр Цезаря</Title>
            <Space direction="vertical" style={{ display: 'flex' }}>
                <Input.Group compact>
                    <Input.TextArea
                        style={{ width: 'calc(100% - 100px)' }}
                        placeholder="Введите текст"
                        value={text}
                        onChange={handleTextChange}
                    />
                    <Input style={{ width: 100 }}
                           type="number"
                           placeholder="Сдвиг"
                           value={shift}
                           onChange={handleShiftChange}
                    />
                </Input.Group>
                <Space>
                    <Button type="primary" onClick={handleEncrypt}>
                        Зашифровать
                    </Button>
                    <Button type="primary" onClick={handleDecrypt}>
                        Расшифровать
                    </Button>
                    <Button onClick={handleClear}>Очистить</Button>
                </Space>
                <Input.Group compact>
                    <Input
                        style={{ width: 'calc(100% - 100px)' }}
                        placeholder="Результат"
                        value={result}
                        disabled
                    />
                    <Input
                        style={{ width: 100 }}
                        type="number"
                        placeholder="Группы по 5"
                        value={groupSize}
                        disabled
                    />
                </Input.Group>
                <Button onClick={() => {
                    const crackedShift: number = crackCaesarCipher(result);
                    messageApi.open({
                        type: "info",
                        content:`Предполагаемый сдвиг: ${crackedShift}`,
                    });
                }}>
                    Взломать шифр
                </Button>
            </Space>
        </div>
    );
};

export default App;
