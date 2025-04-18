import path from 'node:path';
import { appendFile } from 'node:fs/promises';
import shortid from 'shortid';

const infoLogFilePath = path.resolve('info.txt');
const sucessLogFilePath = path.resolve('success.txt');
const errorLogFilePath = path.resolve('error.txt');

const newLine = '\n\n';

export const logger = {
    info: (message) => {
        const logMessage = `${message}${newLine}`;
        console.log(logMessage);
        appendFile(infoLogFilePath, logMessage, 'utf-8');
    },
    success: (message) => {
        const logMessage = `${message}${newLine}`;
        console.log(logMessage);
        appendFile(sucessLogFilePath, logMessage, 'utf-8');
    },
    error: (message) => {
        const logMessage = `${message}${newLine}`;
        console.log(logMessage);
        appendFile(errorLogFilePath, logMessage, 'utf-8');
    },
}

export const getUniqueId = () => shortid();