import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { logger, getUniqueId } from './utils/index.js';
import { HTTP_STATUS } from './constants.js';

const http = express();
http.use(bodyParser.json());
http.use(cors());
http.listen('3333', () => console.info('Server started at PORT: 3333'));

const originalUrlsMap = {};
const shortUrlsMap = {};

http.get('/shortUrl/:id', (req, res) => {
    const requestedShortUrl = req.params.id;

    try {
        if (!requestedShortUrl) {
            res.status(HTTP_STATUS.BAD_REQUEST)
                .json({
                    status: HTTP_STATUS.BAD_REQUEST,
                    message: 'short url id / token is missing',
                });
        }
        logger.info(`GET request with id : ${requestedShortUrl}`);

        const originalUrl = shortUrlsMap[requestedShortUrl];
        if (!originalUrl) {
            const errorMessage = `No url found for : ${requestedShortUrl}`;
            logger.error(errorMessage);

            res.status(HTTP_STATUS.BAD_REQUEST)
                .json({
                    status: HTTP_STATUS.BAD_REQUEST,
                    message: errorMessage
                })
        }

        logger.success(`Redirected to ${originalUrl} with shortUrl : ${requestedShortUrl}`);
        res.redirect(HTTP_STATUS.TEMPORARY_REDIRECT, originalUrl);
    }
    catch (error) {
        logger.error(`Something went wrong while fetching shortUrl : ${requestedShortUrl}`);
    }
});

http.post('/createShortUrl', (req, res) => {
    const requestedOriginalUrl = req.body.url;
    try {
        if (!requestedOriginalUrl) {
            const errorMessage = 'Url is mandatory to generate short url';
            logger.error(errorMessage);
            res.status(HTTP_STATUS.BAD_REQUEST)
                .json({ status: HTTP_STATUS.BAD_REQUEST, message: errorMessage });
        }

        const originalUrl = decodeURIComponent(requestedOriginalUrl);
        logger.info(`Request to generate short url with originalUrl : ${originalUrl}`);

        const originalUrlFromMap = originalUrlsMap[originalUrl];
        if (originalUrlFromMap) {
            logger.info(`Cache HIT : ${originalUrlFromMap}`);
            res.send(HTTP_STATUS.SUCCESS)
                .json({
                    status: HTTP_STATUS.SUCCESS,
                    message: originalUrlFromMap
                });
        } else {
            const newShortUrl = getUniqueId();
            if (!shortUrlsMap[newShortUrl]) {
                shortUrlsMap[newShortUrl] = originalUrl;
                originalUrlsMap[originalUrl] = newShortUrl;

                const successMessage = `Short url created for ${originalUrl}`;
                logger.success(successMessage);
                res.status(HTTP_STATUS.SUCCESS)
                    .json({
                        status: HTTP_STATUS.SUCCESS,
                        shortUrl: newShortUrl,
                        message: successMessage
                    });
            }
        }
    }
    catch (error) {
        const requestedUrl = requestedOriginalUrl ? decodeURIComponent(requestedOriginalUrl) : '';
        if (requestedUrl) {
            logger.error(`Something went wrong while creating a short url for ${decodeURIComponent(requestedOriginalUrl)}`);
        }
    }
});